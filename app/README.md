# Gymnázium tréning — LAN app (CSV upload slice)

Vite + React + TypeScript. Wave 2 **V11** CSV upload on the Wave 1 scaffold.

## Run locally

```bash
cd app
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`). Dev server binds `host: true` for LAN access.

```bash
npm test      # F22 validator + catalog eligibility
npm run build # typecheck + production build
```

## Test CSV upload (V11)

1. Open **Nahrať CSV** (`/nahrat`) — no login.
2. Upload a **valid** fixture:

   ```text
   content/candidates/fixtures/valid-ops-published.csv
   ```

   Expect: success summary with created counts; catalog table shows tags;
   `ops-syn-01` labeled **syntetická**; `ops-hidden-01` has `published=nie`.

3. Go to **Cvičenie** → start practice. Session preview lists only
   `published=true` items (hidden row excluded). Synthetic label visible.

4. Upload an **invalid** fixture (e.g. `invalid-enums.csv` or
   `invalid-mcq.csv`). Expect: rejection, per-row errors, **catalog unchanged**.

5. Optional CLI parity (repo root):

   ```bash
   python3 tools/validate-questions-csv content/candidates/fixtures/valid-ops-published.csv
   python3 tools/validate-questions-csv content/candidates/fixtures/invalid-enums.csv
   ```

Pilot sample with `published=false` only:
`content/candidates/fixtures/valid-sample.csv` (imports but stays out of sessions).

## Product locks (do not break)

- No auth / accounts
- No Practice vs Insights modes
- CSV import is **all-or-nothing**
- Session kinds: `practice` | `exam_30` | `exam_60`
- Practice vs exam reporting stays separate
- Slovak UI primary
- `published=false` never served in new sessions
