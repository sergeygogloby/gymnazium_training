# Acceptance: Results & Progress (`docs/specs/progress.md`)

Branch: `feat/results-progress` · Base: `origin/main` (PR #7)

## Out of scope (not built)

- Separate Insights / parent-only screen
- Badges / leaderboards / heavy gamification
- Per-user progress partitions / multi-child
- Weekly email, Okt–Mar pacing engine
- Mixed unlabeled practice+exam mastery total
- Time-per-question / QPM heatmaps

## Lock-check

| Lock | Status |
|---|---|
| No auth | Pass — empty states point to Curriculum/Practice, not accounts |
| No modes | Pass — Practice \| Exams are reporting sections/filters, not app modes |
| Separate reporting | Pass — `filterAttemptsBySection` + UI sections; tests assert no silent merge |
| Session kinds | Pass — `practice` / `exam_30` / `exam_60` only |
| Views read-only | Pass — no answer mutation on V05/V06 |

## Acceptance checklist

| # | Criterion | Status | Evidence |
|---|---|---|---|
| 1 | History lists practice + exam with score, module, kind | **Pass** | `HistoryPage` + kind filter; module via `attemptModuleLabel` |
| 2 | Filter/section Practice vs Exams (30/60) | **Pass** | V05 filter radios; V06 section + exam subfilter |
| 3 | Practice rollups not silently mixed | **Pass** | `progress.test.ts` separate accuracy; labeled sections only |
| 4 | Module/topic accuracy from stored attempts in section | **Pass** | `computeProgress` / F09 table on V06 |
| 5 | Weak topic + 1–3 suggestions with sample data | **Pass** | `computeGaps` / `computeSuggestions` + tests |
| 6 | Suggestion can start practice (and Mistakes/exam) | **Pass** | Suggestion buttons → `startSession` / `/chyby` |
| 7 | Light streak/calendar with empty state | **Pass** | `computeStreak` + 14-day calendar |
| 8 | Effort vs accuracy: didn’t practice vs stuck | **Pass** | `computeEffortVsAccuracy` test cases |
| 9 | Zero attempts: clear empty states, no invite language | **Pass** | V05/V06 empty notices |
| 10 | Accessible from primary nav; no Insights mode | **Pass** | AppNav `/vysledky`; no V07 route |
| 11 | Views cannot change stored answers | **Pass** | Read-only; detail links only |

## Tests

- `npm test` — 43 passed (incl. 6 in `progress.test.ts`)
- `npm run build` — ok
