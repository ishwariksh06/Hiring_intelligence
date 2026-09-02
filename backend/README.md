# Hiring Intelligence — Backend

Java **Spring Boot 3.3** service that implements the screening pipeline and REST API
described in [`../docs/BACKEND_SPEC.md`](../docs/BACKEND_SPEC.md). It replaces the old
browser-local mock database (`src/db/*.js`, now deleted).

Layered `Controller → Service → Repository`, built on the servlet stack
(`DispatcherServlet` + a `OncePerRequestFilter` for JWT auth).

## Stack

| Concern | Choice |
|---|---|
| Language / runtime | Java 17 |
| Framework | Spring Boot 3.3 (Web MVC, Data JPA, Security) |
| Auth | JWT (HS256, 12 h), BCrypt password hashes |
| ORM | Hibernate 6 / Spring Data JPA, `ddl-auto=update` |
| Database (default) | **H2 in file mode** — `backend/data/hiring-intelligence.mv.db`, persists across restarts, zero install |
| Database (optional) | PostgreSQL 15+ via the `postgres` Spring profile |
| Build | Maven (wrapper included: `./mvnw`) |

`List<String>` columns (skills, ATS flags, matched/missing skills) are stored as JSON
text through a JPA `AttributeConverter`, so the same schema runs on H2 and PostgreSQL.

## Run

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

- API: `http://localhost:8090/api`
- H2 console: `http://localhost:8090/h2-console`
  (JDBC URL `jdbc:h2:file:./data/hiring-intelligence`, user `sa`, empty password)

On first start an empty database is seeded with 1 admin, 3 client companies + 1
recruiter each, 8 jobs and 52 synthetic candidates, then the screening pipeline runs
to produce the `matches` table. Seeding is skipped once data exists. The admin
"Reset local database" button on the Ingest screen calls `POST /api/admin/reset`,
which wipes every table and re-seeds.

Demo accounts (password `password123`):

| Role | Email |
|---|---|
| Agency admin | `ishwari@hiringintelligence.io` |
| Client recruiter (Northwind Logistics) | `rajesh.iyer@northwind.example` |
| Client recruiter (Lumen Retail) | `sara.thomas@lumenretail.example` |
| Client recruiter (Atlas Analytics) | `vivek.menon@atlasanalytics.example` |

## PostgreSQL

```bash
createdb hiring_intelligence
SPRING_PROFILES_ACTIVE=postgres \
  DB_URL=jdbc:postgresql://localhost:5432/hiring_intelligence \
  DB_USER=postgres DB_PASSWORD=postgres \
  ./mvnw spring-boot:run
```

## Configuration

| Env var | Default | Purpose |
|---|---|---|
| `APP_JWT_SECRET` | dev value | HS256 signing key (set a long random string in prod) |
| `APP_CORS_ORIGINS` | `http://localhost:5173,http://localhost:4173` | allowed browser origins |
| `SPRING_PROFILES_ACTIVE` | *(none)* | set to `postgres` for PostgreSQL |
| `app.seed.enabled` | `true` | set `false` to disable first-run seeding |

## Build a jar

```bash
./mvnw clean package
java -jar target/hiring-intelligence-backend-1.0.0.jar
```

## REST API

All paths are under `/api`. `/api/auth/**` is public; everything else needs a
`Authorization: Bearer <token>` header. See `docs/BACKEND_SPEC.md` §4 for the full
table. Admin-only: `/companies/**`, `/candidates` (pool), `/resumes`, `/admin/reset`.
