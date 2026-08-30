# Backend Specification — Spring Boot + PostgreSQL

This is the implementation brief for the real backend. The React frontend already
runs against a browser-local database of the same shape (`src/db/`); swapping in
this backend means pointing `src/api/*` at HTTP instead of `src/db/queries.js`.

Target stack: **Java 17/21, Spring Boot 3.x, Spring Web, Spring Data JPA, Spring
Security + JWT, PostgreSQL 15+, Flyway** for migrations. Layered:
`Controller → Service → Repository`.

---

## 1. Database schema (Flyway `V1__init.sql`)

```sql
CREATE TABLE companies (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name           TEXT NOT NULL,
    industry       TEXT,
    location       TEXT,
    contact_name   TEXT,
    contact_email  TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email          TEXT NOT NULL UNIQUE,
    password_hash  TEXT NOT NULL,                 -- BCrypt
    name           TEXT NOT NULL,
    role           TEXT NOT NULL CHECK (role IN ('ADMIN','RECRUITER')),
    company_id     UUID REFERENCES companies(id) ON DELETE CASCADE,   -- NULL for ADMIN
    title          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT recruiter_has_company
        CHECK (role = 'ADMIN' OR company_id IS NOT NULL)
);

CREATE TABLE jobs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id      UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    min_experience  INT NOT NULL DEFAULT 0,
    max_experience  INT NOT NULL DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','CLOSED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_jobs_company ON jobs(company_id);

CREATE TABLE candidates (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name              TEXT NOT NULL,
    email             TEXT,
    phone             TEXT,
    skills            TEXT[] NOT NULL DEFAULT '{}',
    experience_years  INT NOT NULL DEFAULT 0,
    education         TEXT,
    resume_summary    TEXT,
    raw_text          TEXT,
    source_file       TEXT,
    category          TEXT,
    ats_score         INT NOT NULL DEFAULT 0,
    ats_flags         TEXT[] NOT NULL DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- optional: store the original file
CREATE TABLE resume_files (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id  UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    filename      TEXT NOT NULL,
    content_type  TEXT,
    bytes         BYTEA
);

CREATE TABLE matches (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id          UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id    UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    match_score     INT NOT NULL,
    matched_skills  TEXT[] NOT NULL DEFAULT '{}',
    missing_skills  TEXT[] NOT NULL DEFAULT '{}',
    explanation     TEXT,
    rank            INT,
    status          TEXT NOT NULL DEFAULT 'REVIEW' CHECK (status IN ('SHORTLISTED','REVIEW','REJECTED')),
    status_locked   BOOLEAN NOT NULL DEFAULT FALSE,   -- recruiter overrode it
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (job_id, candidate_id)
);
CREATE INDEX idx_matches_job ON matches(job_id);
CREATE INDEX idx_matches_candidate ON matches(candidate_id);
```

`TEXT[]` columns map to `List<String>` with Hibernate 6's native array support
(`@JdbcTypeCode(SqlTypes.ARRAY)`), or use a `jsonb` column if preferred.

## 2. JPA entities

One `@Entity` per table: `Company`, `User`, `Job`, `Candidate`, `ResumeFile`,
`Match`. Repositories extend `JpaRepository`:

- `UserRepository.findByEmail(String)`
- `JobRepository.findByCompanyId(UUID)`, `findByStatus(String)`
- `MatchRepository.findByJobId(UUID)`, `findByCandidateId(UUID)`,
  `findByJobIdAndCandidateId(UUID, UUID)`, `deleteByJobId(UUID)`

## 3. Authentication

- `POST /api/auth/login` `{ email, password }` → `{ token, id, name, email, role, companyId, title }`
- JWT signed HS256, 12 h expiry, claims: `sub=userId`, `role`, `companyId`.
- `BCryptPasswordEncoder` for `password_hash`.
- `SecurityFilterChain`: `/api/auth/**` public; everything else authenticated.
- Method security: `@PreAuthorize("hasRole('ADMIN')")` on admin-only endpoints.
- A `@PreAuthorize` helper / service check must enforce that a `RECRUITER` only
  ever touches rows where `job.company_id == principal.companyId`.

No registration endpoint — the agency seeds client company users (or add an
admin-only `POST /api/companies/{id}/users`).

## 4. REST API

All paths prefixed `/api`. `→` shows the response body shape.

### Companies (ADMIN only)
| Method | Path | Body | Response |
|--------|------|------|----------|
| GET | `/companies` | | `[{ ...company, openJobs, totalJobs, shortlistedCandidates }]` |
| GET | `/companies/{id}` | | `company` |
| POST | `/companies` | `{ name, industry?, location?, contactName?, contactEmail? }` | `company` |

### Jobs
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/jobs` | both | ADMIN → all; RECRUITER → own company only. `→ [{ ...job, companyName, applicantCount, shortlistedCount }]` |
| GET | `/jobs/{id}` | both (scoped) | single decorated job |
| POST | `/jobs` | both | ADMIN must pass `companyId`; RECRUITER uses own. Triggers re-score. |
| PUT | `/jobs/{id}` | both (scoped) | Triggers re-score. |
| GET | `/jobs/{id}/candidates` | both (scoped) | ranked list: `[{ candidateId, name, email, experienceYears, skills, atsScore, matchScore, matchedSkills, missingSkills, explanation, status }]` |
| PATCH | `/jobs/{id}/candidates/{candidateId}` | both (scoped) | `{ status: 'SHORTLISTED'\|'REVIEW'\|'REJECTED' }` → sets `status`, `status_locked = (status != 'REVIEW')` |

### Candidates
| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/candidates` | ADMIN | full pool `[{ ...candidate, matchCount, bestMatchScore }]` |
| GET | `/candidates/{id}` | both | RECRUITER only if candidate matches one of their jobs. `→ { ...candidate, matches:[{...match, jobTitle, companyName}], interviewQuestions:[...] }` |

### Ingestion (ADMIN only)
| Method | Path | Body | Notes |
|--------|------|------|-------|
| POST | `/resumes` | `multipart/form-data` files **or** `application/json` `[{ rawText?, name?, email?, skills?, ... }]` | Parse → ATS check → insert candidates → re-score every OPEN job. `→ [{ id, name, skills, experienceYears, education, atsScore, atsFlags, sourceFile }]` |

### Analytics (`?` scoped by role)
| Method | Path | Response |
|--------|------|----------|
| GET | `/analytics/skills` | `[{ skill, count }]` (top 10 in scoped candidate pool) |
| GET | `/analytics/funnel` | `[{ stage, count }]` — Ingested, Matched (≥30), Strong match (≥55), Shortlisted, Rejected |
| GET | `/analytics/skill-gap` | `[{ skill, required, available }]` |
| GET | `/analytics/trend` | `[{ month, ingested, shortlisted }]` |
| GET | `/dashboard/summary` | `{ openJobs, candidatesScreened, shortlisted, avgMatchScore, companies?, recentJobs:[...] }` |

## 5. Screening service (port of `src/db/screening.js`)

```
skillCoverage   = matchedRequiredSkills.size / requiredSkills.size        // 0..1
experienceFit(y, lo, hi):
    if lo <= y <= hi         -> 1.0
    if y < lo                -> max(0, 1 - (lo - y) / max(lo, 2))
    if y > hi                -> max(0, 1 - (y - hi) / max(hi, 3))
matchScore      = round(skillCoverage * 70 + experienceFit * 30)          // 0..100

ATS score (0..100, additive):
    email present            +20
    phone present            +10
    >= 3 known skills        +30
    experienceYears > 0      +20
    education present        +10
    rawText length >= 200    +10
    passed = score >= 60

shortlist for a job:
    order matches by matchScore desc, assign rank
    status = (matchScore >= 55 AND rank <= 10) ? SHORTLISTED : REVIEW
    but keep any row with status_locked = true unchanged
```

**Re-score triggers:** create/update a job → re-score that job; ingest resumes →
re-score every OPEN job. Wrap re-score in a `@Transactional` service method that
`deleteByJobId` + `saveAll`, preserving `status_locked` rows.

**Skill extraction:** port `SKILL_DICTIONARY` from `src/db/skills.js` (canonical
label + alias list). Lowercase the resume text, pad with spaces, match ` alias `
longest-first. The real AI extraction (OpenAI/Gemini) from the project brief can
replace `parseResumeText` later — keep the same output contract.

## 6. Seed data

Port `src/db/seed.js`: 1 admin user (`ishwari@hiringintelligence.io` /
`password123`), 3 companies + 1 recruiter each, 8 jobs, ~52 synthetic candidates.
Use a Flyway `V2__seed.sql` or a `CommandLineRunner` guarded on empty tables. For
a richer pool, load the Kaggle "Updated Resume Dataset"
(`gauravduttakiit/resume-dataset`) CSV through the ingestion endpoint.

## 7. Config

```
spring.datasource.url=jdbc:postgresql://localhost:5432/hiring_intelligence
spring.jpa.hibernate.ddl-auto=validate
spring.flyway.enabled=true
app.jwt.secret=${JWT_SECRET}
app.jwt.expiration=PT12H
app.cors.allowed-origins=http://localhost:5173
```

Frontend switch: set `VITE_API_BASE_URL` and replace the bodies of `src/api/*.js`
with `axiosClient` calls (the file `src/api/axiosClient.js` already exists and
attaches the bearer token).
