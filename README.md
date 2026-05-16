# RankPilot

AI SEO audits and daily Google rank tracking. A real browser (Browserbase + Playwright) renders the page, Gemini scores it against a strict schema, and a scheduler checks keyword positions every morning.

Redesign of the GreatStack "SEO Rank Tracker" course project: light product-first UI with GSAP motion, TypeScript on both sides, plan limits enforced, serverless-ready cron.

## Structure

```
client/   React 19 · Vite · Tailwind 4 · GSAP          → see client/README.md
server/   Express 5 · Mongoose · TypeScript (run by Node) → below
```

## Run with Docker (recommended)

Requirements: Docker Desktop, plus Browserbase and Gemini API keys (those two are external services and cannot be containerized).

```bash
./scripts/setup-env.sh          # creates .env and generates JWT_SECRET
# edit .env: BROWSERBASE_API_KEY and GEMINI_API_KEY
docker compose up --build       # web on http://localhost:8080, API on :5050, Mongo inside
```

MongoDB runs in a container with a persistent volume; no Atlas account needed. The server is a long-running process, so the daily rank check runs inside it at 06:00.

Development with hot reload on both sides:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
# web on http://localhost:5173
```

Useful commands:

```bash
docker compose logs -f server   # follow API logs
docker compose down             # stop, keep data
docker compose down -v          # stop and wipe the database
```

## Run without Docker

Requirements: Node ≥ 22.18 (runs `.ts` natively), a MongoDB URI, Browserbase and Gemini API keys.

```bash
# API
cd server
cp .env.example .env        # fill JWT_SECRET, MONGODB_URI, BROWSERBASE_API_KEY, GEMINI_API_KEY
npm install
npm run dev                 # http://localhost:5050, restarts on change

# Web
cd client
cp .env.example .env        # VITE_BACKEND_URL=http://localhost:5050
npm install
npm run dev                 # http://localhost:5173
```

The server refuses to start and lists the missing variables if `.env` is incomplete.

## API

All routes except register/login require `Authorization: Bearer <jwt>`.

| Method | Route | Notes |
|---|---|---|
| POST | `/api/auth/register` `/login` | returns `{ token, user }`, never the hash |
| GET | `/api/auth/user` | includes `analysisCount` used today |
| POST | `/api/analysis/analyze` | starts a background job; `429` when the free quota (5/day) is spent |
| GET | `/api/analysis/list?page&limit` | paginated summaries |
| GET / DELETE | `/api/analysis/:id` | full report / delete |
| POST | `/api/rank/add` | starts the first check |
| GET | `/api/rank/list` `/api/rank/:id` | list (no history) / detail with history |
| POST | `/api/rank/:id/refresh` | `409` if a check is already running |
| PUT | `/api/rank/:id/toggle` | pause or resume |
| DELETE | `/api/rank/:id` | |
| GET | `/api/cron/rank-check` | scheduler trigger, needs `Authorization: Bearer $CRON_SECRET` |

## Scheduling rank checks

- **Long-running host** (Railway, Render, a VPS): `npm start` runs node-cron in-process at 06:00.
- **Vercel**: `api/index.ts` serves the app as a function and `vercel.json` schedules `/api/cron/rank-check` daily. Set `CRON_SECRET` in the project env. Each check opens a cloud browser and scans up to five Google pages, so with many keywords the 300 s function limit will be hit; prefer a long-running host or an external scheduler calling `npm run cron:rank`.

## Costs to keep in mind

Every analysis and every rank check opens a Browserbase session (billed per minute) and one Gemini request. The free plan limit exists for that reason.

## Scripts

| Where | Script | Does |
|---|---|---|
| server | `npm run dev` | watch mode |
| server | `npm run typecheck` | `tsc --noEmit` |
| server | `npm run cron:rank` | one-off rank check of all active keywords |
| client | `npm run build` | type-check + bundle |
| client | `npm run lint` | eslint |
