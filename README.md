# Hiring Intelligence
Team: Ishwari Kshirsagar (53013240102), Pratiksha Kunwar (53013240104), Shreya Pillai (53013240088).
Project documents are stored in the docs file
A recruitment-agency screening tool. The agency ingests candidate resumes in bulk
on behalf of client companies; the system parses each resume, runs an ATS
completeness check, scores every candidate against every open job, and hands each
client a ranked shortlist.

There is no candidate-facing side and no chatbot. Two roles: **agency admin** and
**client-company recruiter**.

## Run it

Two processes: the Java backend and the React dev server.

```bash
# 1. backend  (Java 17 — the Maven wrapper downloads Maven on first run)
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run   → http://localhost:8090

# 2. frontend  (in another terminal, from the repo root)
npm install
cp .env.example .env.local    # points the app at http://localhost:8090/api
npm run dev                   # http://localhost:5173
```

Demo accounts (password `password123`):

| Role | Email |
|------|-------|
| Agency admin | `ishwari@hiringintelligence.io` |
| Client recruiter (Northwind Logistics) | `rajesh.iyer@northwind.example` |
| Client recruiter (Lumen Retail) | `sara.thomas@lumenretail.example` |
| Client recruiter (Atlas Analytics) | `vivek.menon@atlasanalytics.example` |

## How the data works

The frontend talks to a real **Spring Boot + JPA** backend (`backend/`). It uses an
embedded **H2 file database** by default (`backend/data/`, persists across restarts,
no install) and can switch to PostgreSQL with the `postgres` profile.

On first start the backend seeds 3 client companies, 8 jobs and 52 synthetic
candidates, then runs the screening pipeline to build the `matches` table. As admin,
use **Resume Ingestion** to drop more resumes (`.txt`/`.csv`/`.json` are parsed for
real; `.pdf`/`.docx` are stored and ATS-flagged) or load the bundled sample batch.
**Reset local database** wipes every table and re-seeds (`POST /api/admin/reset`).

## Docs

- [`backend/README.md`](backend/README.md) — how to run, configure and build the backend
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — roles, data model, screening pipeline, layout
- [`docs/BACKEND_SPEC.md`](docs/BACKEND_SPEC.md) — the implementation brief the backend follows

## Stack

- **Frontend:** React 19, Vite, Tailwind v4, React Router, Recharts, Axios. `npm run build`, `npm run lint`.
- **Backend:** Java 17, Spring Boot 3.3 (Web MVC, Data JPA, Security/JWT), Hibernate, H2 / PostgreSQL.

## Versions and testing

| Ref | What it is |
|---|---|
| `main` / tag `v2.0` | Final release: React + Spring Boot + Neon PostgreSQL, all test-cycle-1 defects fixed |
| tag `v2.0-beta` | Version 2 before the fixes (state tested in cycle 1) |
| branch `v1` / tag `v1.0` | Version 1: React prototype with mock data |

Live demo: https://hiring-intelligence-eight.vercel.app (backend on Render, database on Neon).

Testing: `cd backend && ./mvnw test` runs 94 tests (unit, white-box, black-box API, security, regression).
The full test plan, results, defect log and screenshots are in
`docs/Hiring_Intelligence_Test_Plan_and_Report.docx` and `docs/test-evidence/`.

Design document and diagrams (WBS, AOA, AON, CPM, PERT, use case, class, ER): `docs/design/`.

Complete project documentation for submission: `docs/Hiring_Intelligence_Project_Documentation.docx`.


