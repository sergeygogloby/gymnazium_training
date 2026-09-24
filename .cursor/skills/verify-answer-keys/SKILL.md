---
name: verify-answer-keys
description: Independently re-check correctKey and rationale consistency on candidate CSV; fail the batch on key errors. Must run before critic; generator must not self-verify.
---

# Skill: verify-answer-keys

## When to invoke

Every synthetic batch **after** structural F22 lint and **before** `critic-synthetic-batch`. Mandatory — never skip for volume.

## Non-negotiables

- **Independent of generator** — different agent/prompt; do not rubber-stamp generator output.
- **100% key pass** on retained rows (or reject whole batch).
- Fail on: wrong `correctKey`, rationale arguing a different choice, unsolvable numeric stems missing data.
- Prefer solver / template recompute / dual-check over vibes.
- Do **not** set `published=true`.
- Failed keys → revise queue or discard; high fail rate → scrap batch (all-or-nothing spirit).

## Inputs

| Input | Source |
|---|---|
| Candidate CSV | `content/candidates/*.csv` |
| Templates / solvers | `content/templates/` |
| Gold seeds | `content/seeds/` |
| Schema | `docs/specs/content-model.md` |

## Outputs

| Output | Path |
|---|---|
| Verify report | `content/reports/{batchId}_verify.json` |
| Keep / reject lists | Per-row key status |
| Optionally cleaned CSV | Still under `candidates/` with `published=false` |

## Steps

1. Confirm structural lint already passed (or run F22 column/enum checks first).
2. For each row: independently recompute or re-solve `correctKey`; compare to payload.
3. Check rationale ↔ `correctKey` consistency.
4. Mark fails; if any critical key errors remain in the “ship set,” **fail the batch**.
5. Write verify report under `content/reports/`.
6. Hand off survivors to `critic-synthetic-batch` — do not publish.

## Refs

- `docs/agent-operating-model.md` §3.1–§3.3, §8 publish gate
- `docs/specs/content-model.md`
- `docs/specs/question-csv-upload.md`
- Next: `.cursor/skills/critic-synthetic-batch/SKILL.md`
