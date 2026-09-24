# Acceptance: Mistakes / restudy (`docs/specs/mistakes-restudy.md`)

Branch: `feat/mistakes-restudy` · Base: `origin/main` (PR #7)

## Out of scope (not built)

- Full spaced-repetition scheduler (P2)
- Exam-mode restudy under a clock (restudy is untimed `practice`)
- Auth-partitioned mistake lists per child
- Full Results & Progress rollups (owned by progress slice; this PR only adds Mistakes entry cues on V06 stub)

## Lock-check

| Lock | Status |
|---|---|
| No auth | Pass — no login; empty state → Curriculum / Practice |
| No modes | Pass — no Practice/Insights switcher; restudy is not a nav mode |
| Session kinds | Pass — restudy uses `practice` + `mistakesScoped`; no fourth timed kind |
| Feedback rules | Pass — reuses V03 after-each practice feedback |
| CSV all-or-nothing | Pass — untouched |

## Acceptance checklist

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | After ≥1 incorrect practice/exam answer, Mistakes shows item | **Pass** | `buildMistakesQueue` + `mistakesQueue.test.ts` (practice + exam_30) |
| 2 | Start re-attempt from Mistakes without login | **Pass** | `MistakesPage` → `startSession('practice', { mistakesScoped, itemIds })` |
| 3 | Re-attempt uses per-item feedback + source labels | **Pass** | Reuses `PracticeSessionBody` (V03); labels on queue + session |
| 4 | Correct re-attempt clears active Mistakes entry | **Pass** | Queue drops when later `correct` ≥ last `incorrect`; store tests for scoped start |
| 5 | Reachable from primary nav + Results / session-result | **Pass** | AppNav `/chyby`; V04 cue + link; V06 Mistakes section |
| 6 | Empty state clear when no mistakes | **Pass** | `data-testid="mistakes-empty"` + Curriculum/Practice links |

## Tests

- `npm test` — 45 pass (incl. 6 mistakesQueue + 2 store scoped-start cases)
- `npm run build` — ok

## Merge note

`feat/results-progress` (PR #8) rewrites `ResultsPage.tsx`. Keep a Mistakes entry (suggestion / link to `/chyby`) when stacking.
