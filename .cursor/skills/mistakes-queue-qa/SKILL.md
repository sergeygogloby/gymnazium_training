---
name: mistakes-queue-qa
description: Verify Mistakes restudy queue build, re-attempt with per-item feedback, dequeue on correct, and return links to Results & Progress. P0 path F16/V10.
---

# Skill: mistakes-queue-qa

## When to invoke

After Mistakes slice (F16/V10) merges and attempt history can produce incorrect items. Pair with `acceptance-computeruse`.

## Non-negotiables

- Mistakes is **P0** — dedicated queue, not topic gaps alone.
- Restudy sessions are **`practice`** (untimed, after-each feedback) — not a timed exam kind.
- No auth; no parent-only mistakes list.
- Correct re-attempt clears/dequeues active Mistakes entry.
- Reachable from primary nav and from Results / session-result links.
- Source labels (bank/synthetic) visible on queue/session items.

## Inputs

| Input | Source |
|---|---|
| Spec | `docs/specs/mistakes-restudy.md` |
| Running app | Local URL |
| Seed wrongs | At least one incorrect practice or exam answer in history |

## Outputs

| Output | Notes |
|---|---|
| Acceptance matrix | From mistakes-restudy.md |
| Evidence | Queue filled → restudy → cleared |
| Bugs | Empty-state / dequeue failures |

## Steps

1. Ensure history has ≥1 incorrect item; open **Mistakes (V10)** — item appears (or clear queue entry).
2. Confirm empty state copy when wiping data / fresh store.
3. Start re-attempt: session is practice; feedback after each item; labels visible.
4. Answer correctly → item leaves active queue.
5. Confirm entry from nav, V04, and V06 suggestions/gaps links.
6. Optional filters (module/topic/VŠP|VJS/source) respect F12 tags if implemented.

## Refs

- `docs/specs/mistakes-restudy.md`
- `docs/specs/practice-session.md`
- `docs/specs/progress.md`
- `docs/functions-and-views.md` F16, V10
- Companion: `.cursor/skills/acceptance-computeruse/SKILL.md`
