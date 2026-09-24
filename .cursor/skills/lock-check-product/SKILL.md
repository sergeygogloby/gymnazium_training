---
name: lock-check-product
description: Refuse auth, Practice/Insights modes, partial CSV import, or mixed practice/exam rollups. Use on coordinator PR review and before accepting worker returns.
---

# Skill: lock-check-product

## When to invoke

- Coordinator review of PRs / worker returns.
- Before merging any slice.
- When a worker proposes “just a small” auth, mode, or partial-import shortcut.

## Non-negotiables (hard refuse)

Reject the change if it introduces any of:

| Lock | Refuse |
|---|---|
| **No auth** | Login, signup, invite codes, roles, multi-child accounts, secure parent link |
| **No modes** | Practice vs Insights mode switcher; Student/Parent parallel UI; “Exam mode” as a nav mode |
| **CSV all-or-nothing** | Importing valid rows while skipping invalid ones; soft-fail partial catalog writes |
| **Separate reporting** | Mixing `exam_30`/`exam_60` into undifferentiated practice progress totals as the only signal |
| **Session kinds** | Replacing kinds with modes/roles; inventing extra timed lengths beyond 30/60 without spec amendment |
| **Feedback rules** | End-only practice feedback; mid-exam answer keys |

## Inputs

| Input | Source |
|---|---|
| Diff / worker summary | PR or agent return |
| Locks | `docs/project-context.md` Decisions |
| Specs | `docs/specs/*.md` Out of scope |

## Outputs

| Output | Notes |
|---|---|
| Pass / refuse | Short list of violated locks with file refs |
| Required fix | Point to the owning spec — do not invent new product |

## Steps

1. Scan for auth UI, invite flows, role gates, or per-user ownership fields → **refuse**.
2. Scan for mode switchers or parallel Insights/parent chrome → **refuse**.
3. Scan CSV import path: any “import good rows” / continue-on-error → **refuse**.
4. Scan progress rollups: unlabeled mixed practice+exam totals as sole mastery signal → **refuse**.
5. Confirm practice = after-each feedback; exams = end-only.
6. If clean: **pass**. If not: refuse with lock name + doc link; do not “compromise.”

## Refs

- `docs/project-context.md`
- `docs/agent-operating-model.md` §8–§9
- `docs/specs/README.md` (Locked block)
- `docs/specs/question-csv-upload.md`
- `docs/specs/progress.md`
