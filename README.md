# Hiring Intelligence

A recruitment-agency screening tool. The agency ingests candidate resumes in bulk
on behalf of client companies; the system parses each resume, runs an ATS
completeness check, scores every candidate against every open job, and hands each
client a ranked shortlist.

There is no candidate-facing side and no chatbot. Two roles: **agency admin** and
**client-company recruiter**.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Demo accounts (password `password123` for both):

| Role | Email |
|------|-------|
| Agency admin | `ishwari@hiringintelligence.io` |
| Client recruiter (Northwind Logistics) | `rajesh.iyer@northwind.example` |

## How the data works

There is no server yet. A browser-local database (`src/db/`, stored in
`localStorage`) is seeded on first load with 3 client companies, 8 jobs and 52
synthetic candidates. As admin, use **Resume Ingestion** to drop more resumes
(`.txt`/`.csv`/`.json` are parsed for real; `.pdf`/`.docx` are stored and
ATS-flagged) or load the bundled sample batch. **Reset local database** on that
screen restores the seed.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — roles, data model, screening pipeline, frontend layout
- [`docs/BACKEND_SPEC.md`](docs/BACKEND_SPEC.md) — Spring Boot + PostgreSQL implementation brief (schema, endpoints, auth, scoring)

## Stack

React 19, Vite, Tailwind v4, React Router, Recharts. `npm run build`, `npm run lint`.
