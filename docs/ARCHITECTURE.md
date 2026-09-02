# Hiring Intelligence — Architecture

## 1. What this product is

Hiring Intelligence is a **recruitment-agency tool**. It is not a job portal and has
no candidate-facing side.

The agency (operated by Ishwari Kshirsagar) is engaged by client companies to
source and screen candidates on their behalf. The agency ingests resumes in bulk,
the system parses each one, runs an ATS completeness check, and scores every
candidate against every open job. Each client company logs in to see the ranked
shortlist for its own roles.

```
        ┌─────────────────────────────┐
        │   AGENCY ADMIN (Ishwari)     │
        │  - manage client companies  │
        │  - ingest resumes in bulk   │
        │  - see the whole pool + all  │
        │    jobs across all clients  │
        └──────────────┬──────────────┘
                       │ feeds resumes
                       ▼
        ┌─────────────────────────────┐
        │   SCREENING PIPELINE         │
        │  parse → ATS check → match   │
        │  → rank → shortlist          │
        └──────────────┬──────────────┘
                       │ produces shortlists
                       ▼
        ┌─────────────────────────────┐
        │  CLIENT COMPANY (recruiter)  │
        │  - post job descriptions    │
        │  - view shortlist per job   │
        │  - shortlist / reject        │
        │  (only its own data)        │
        └─────────────────────────────┘
```

## 2. Roles

| Role | Who | Can do | Cannot do |
|------|-----|--------|-----------|
| `ADMIN` | The agency operator (Ishwari) | Manage client companies, ingest resumes, run screening, view the full candidate pool, view every job and shortlist across all clients, post jobs for any client | — |
| `RECRUITER` | A user at a client company | Post/edit job descriptions for **their own** company, view the ranked shortlist for their jobs, mark candidates shortlisted/rejected, view analytics scoped to their jobs | See other companies' data, see the raw candidate pool, ingest resumes |

There is **no** `CANDIDATE` role. Candidates never log in and never upload
anything — the agency holds and feeds all resume data.

Rationale: the agency is the data controller. Client companies are consumers of a
finished shortlist, not operators of the pipeline. Keeping ingestion and the pool
admin-only means one client can never see another client's candidates or the
resumes that did not match their roles.

## 3. Data model

| Entity | Key fields | Notes |
|--------|-----------|-------|
| `companies` | name, industry, location, contactName, contactEmail | Client companies the agency screens for |
| `users` | email, password, name, role, companyId, title | `companyId` is null for `ADMIN` |
| `jobs` | companyId, title, description, requiredSkills[], minExperience, maxExperience, status | `status` = OPEN \| CLOSED |
| `candidates` | name, email, phone, skills[], experienceYears, education, resumeSummary, rawText, sourceFile, category, atsScore, atsFlags[] | One row per ingested resume |
| `matches` | jobId, candidateId, matchScore, matchedSkills[], missingSkills[], explanation, status, rank, statusLocked | One row per (candidate × open job). `status` = SHORTLISTED \| REVIEW \| REJECTED |

`matches` is the heart of the product: it is regenerated whenever a job changes
or a resume is ingested. A recruiter's manual SHORTLISTED/REJECTED decision sets
`statusLocked` so re-scoring does not overwrite it.

## 4. Screening pipeline

Implemented in `src/db/screening.js`. Four stages:

1. **Parse** (`parseResumeText`) — pulls name, email, phone, years of experience,
   education and skills out of plain resume text. Skills are matched against a
   ~70-entry canonical dictionary with aliases (`src/db/skills.js`), longest
   alias first so "spring boot" is not shadowed by "spring".
2. **ATS check** (`atsCheck`) — scores resume *completeness* 0–100 (has email,
   has phone, ≥3 recognised skills, experience stated, education present,
   reasonable length). Below 60 the candidate is flagged for manual review but
   still stored and scored.
3. **Match** (`matchCandidateToJob`) — `matchScore = skillCoverage×70 + experienceFit×30`.
   Skill coverage is matched-required-skills ÷ required-skills. Experience fit is
   1.0 inside the job's min–max window and decays outside it. Produces a
   plain-English explanation string.
4. **Shortlist** (`decideShortlist`) — ranks a job's matches by score; the top 10
   scoring ≥55 become `SHORTLISTED`, the rest `REVIEW`.

Interview questions (`generateInterviewQuestions`) are skill-driven templates plus
two generic questions — a lightweight stand-in for the AI generation described in
the project brief.

## 5. Persistence

Persistence is a **Spring Boot + Spring Data JPA** backend (`backend/`), layered
`Controller → Service → Repository`. The screening pipeline of §4 is ported to
`backend/.../screening/` (`SkillDictionary`, `ResumeParser`, `AtsChecker`,
`Matcher`, `ScreeningService`); `DataSeeder` ports `seed.js`.

- **Database:** embedded **H2 in file mode** by default (`backend/data/`, survives
  restarts, no install). The `postgres` Spring profile switches to PostgreSQL 15+.
  `ddl-auto=update` builds the schema; array-typed columns are stored as JSON text
  via a JPA `AttributeConverter` so one mapping works on both engines.
- **Seed:** on first run (empty tables) — 1 admin, 3 client companies + 1 recruiter
  each, 8 jobs, 52 synthetic candidates modelled on Kaggle's "Updated Resume
  Dataset"; then `ScreeningService.rescoreAllOpenJobs()` builds `matches`.
- **Ingest screen** → `POST /api/resumes` (multipart files or a JSON batch). Text
  resumes are parsed for real; binary PDFs/DOCX are stored and ATS-flagged.
- **Reset local database** → `POST /api/admin/reset` wipes every table and re-seeds.

The frontend `src/api/*` modules are thin Axios wrappers over this API; the browser
holds only the JWT and the cached user. See [BACKEND_SPEC.md](./BACKEND_SPEC.md) and
[`../backend/README.md`](../backend/README.md).

## 6. Frontend structure

React 19 + Vite + Tailwind v4, React Router. The `src/api/*` modules are thin Axios
wrappers that call the backend at `VITE_API_BASE_URL` (default
`http://localhost:8080/api`); `axiosClient.js` attaches the bearer token.

```
src/
  api/           Axios wrappers page components call (+ axiosClient, sampleBatch)
  config/        agency branding constant
  context/       AuthContext (+ useScope helper)
  components/    common/, layout/, jobs/, candidates/, analytics/, resume/
  pages/         one file per screen
```

Removed from the original v1: the AI chat assistant, the candidate portal
(upload + application status), and self-serve registration. The Reports screen is
backed by a minimal `reports` table (`GET /api/reports`, `POST /api/reports/generate`).

## 7. Visual language

Neutral slate palette, no gradients anywhere. Tailwind's `indigo-*` ramp is
remapped to slate-blue in `src/index.css` so the whole UI reads as a plain
internal tool.
