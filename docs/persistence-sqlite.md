# Persistence — local SQLite

**Status:** active (LAN single-instance)  
**Engine:** SQLite 3 via Node `better-sqlite3`  
**File:** `data/gymnazium.sqlite` (gitignored; `GYM_DB_PATH` override)  
**API:** `server/` on port **8787** — see [server/README.md](../server/README.md)

## Why not localStorage

Household progress must be **shared on the LAN**. Browser storage is per-device.
The SPA hydrates from `GET /api/state` and write-throughs via `PUT /api/state`.

## Tables

| Table | Holds |
|---|---|
| `questions` | Catalog / CSV-imported items (F12/F14/F22) |
| `attempts` | Session headers (`practice` / `exam_30` / `exam_60`) |
| `attempt_answers` | Per-item outcomes (results) |
| `flags` | Bad-item reports (F13) |
| `app_meta` | `seenHelp`, `activeSession` JSON |

Canonical DDL: [`server/sql/schema.sql`](../server/sql/schema.sql).

## Locks

- No auth on the API (trusted LAN).
- CSV import remains all-or-nothing in the SPA before any catalog upsert.
- Practice ≠ exam rollups unchanged (reporting layer).
