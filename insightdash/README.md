# InsightDash

AI-powered analytics dashboard. MERN stack, local-first, optional cloud worker.

## Stack

- **Server**: Node.js, Express, TypeScript, Mongoose, JWT (HTTP-only cookie), bcrypt, multer, papaparse, pdfmake, zod
- **Client**: React + Vite + TypeScript, Tailwind, Recharts, Axios, React Router
- **DB**: MongoDB (local via Docker or Atlas)

## Prerequisites

- Node.js 20+
- Docker (or a local MongoDB / Atlas URI)

## Run locally

```bash
# 1. Mongo
docker compose up -d mongo

# 2. Server
cd server
cp .env.example .env
npm install
npm run dev          # http://localhost:5000

# 3. Client (new terminal)
cd client
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

Sign up → log in → upload a CSV or JSON file → open the dataset → view stats, charts, filters, and export CSV/PDF.

## Cloud toggle

Default: `USE_CLOUD_ANALYSIS=false` runs the analyzer in-process (`server/src/workers/analysisWorker.ts`).

To use a cloud function instead:

```env
USE_CLOUD_ANALYSIS=true
CLOUD_ANALYSIS_URL=https://your-lambda-or-cloud-fn.example.com/analyze
CLOUD_ANALYSIS_TOKEN=optional-shared-secret
```

The same logic in `server/src/utils/stats.ts` can be deployed as a Lambda / Cloud Function — see `server/src/services/cloudAnalysis.ts` for the handler stub.

## API

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Log in (sets cookie) |
| POST | `/api/auth/logout` | Log out |
| GET  | `/api/auth/me` | Current user |
| POST | `/api/datasets/upload` | Upload CSV/JSON (multipart `file`) |
| GET  | `/api/datasets` | List datasets for user |
| GET  | `/api/datasets/:id` | Dataset metadata |
| GET  | `/api/datasets/:id/insights` | Computed insights (poll until `completed`) |
| GET  | `/api/datasets/:id/rows?limit&offset` | Paginated raw rows |
| GET  | `/api/exports/:id/csv` | Download original CSV |
| GET  | `/api/exports/:id/pdf` | PDF report |

## Notes

- Raw parsed rows are cached on disk under `server/uploads/<datasetId>.json` to keep MongoDB lean.
- This project is **not** runnable inside the Lovable preview — it targets a regular Node host. Clone it out and run locally.