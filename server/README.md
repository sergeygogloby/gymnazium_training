# Local API + SQLite (LAN single-instance)

Persists **questions** (catalog) and **results** (attempts + answers) in a local
SQLite file so the household shares one database on the LAN — not browser
`localStorage`.

## Engine

| | |
|---|---|
| DBMS | **SQLite 3** via `better-sqlite3` |
| File | `data/gymnazium.sqlite` (gitignored; override with `GYM_DB_PATH`) |
| Port | `8787` (`PORT` env) |

## Schema

See [`sql/schema.sql`](./sql/schema.sql):

- `questions` — F22 catalog rows
- `attempts` / `attempt_answers` — session results
- `flags` — bad-item queue
- `app_meta` — `seenHelp`, `activeSession` JSON

## Run

```bash
# from repo root (installs server deps if needed)
npm run publish-all
npm run init-db
npm run t5-critical-path

# or explicitly
cd server && npm install && npm run publish-all
cd server && npm run dev

# app (separate terminal) — Vite proxies /api → :8787
cd app && npm install && npm run dev
```

Or from root: `npm run dev` (concurrent).

## API

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | engine + counts |
| GET | `/api/state` | full AppStoreState |
| PUT | `/api/state` | replace full state (SPA write-through) |
| GET | `/api/questions` | catalog only |
| GET | `/api/attempts` | attempts only |

No auth (locked LAN ops).

## T5 critical path (import → smoke → publish)

```bash
cd server && npm run t5-critical-path
```

Imports `content/candidates/pilot-t5-synth-20260924_M3_T5.csv` into SQLite,
runs practice smoke, then flips `published=true` and writes `content/published/`
+ gate/smoke reports.

## Publish all questions in SQLite

```bash
cd server && npm run publish-all   # UPDATE questions SET published=1
```
