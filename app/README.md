# Gymnázium tréning — LAN MVP (Wave 1)

Vite + React + TypeScript shell: shared nav, `sessionKind` store, content types, CSV validate stub.

## Run locally

```bash
cd app
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`). Dev server binds `host: true` for LAN access.

```bash
npm test      # CSV validator unit tests
npm run build # typecheck + production build
```

## Product locks (do not break)

- No auth / accounts
- No Practice vs Insights modes
- CSV import is **all-or-nothing**
- Session kinds: `practice` | `exam_30` | `exam_60`
- Practice vs exam reporting stays separate
- Slovak UI primary
