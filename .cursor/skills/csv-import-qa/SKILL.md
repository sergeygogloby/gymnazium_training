---
name: csv-import-qa
description: Lint F22 schema, enforce all-or-nothing, dry-run import, and publish-gate checklist. Never flip published=true without the full generator QA gate.
---

# Skill: csv-import-qa

## When to invoke

Before V11/CLI catalog write, and again before any `published=true` flip. Applies to synthetic batches and ops CSV uploads.

## Non-negotiables

- **All-or-nothing (locked):** any invalid row → **zero writes**; clear per-row errors.
- Same validator rules as V11 / `docs/specs/question-csv-upload.md`.
- **No `published=true`** until publish gate (§ below) is complete.
- No auth on upload path — LAN ops; document carefully (do not add login).
- Synthetic batches need prior verify + critic + human sample reports.

## Inputs

| Input | Source |
|---|---|
| CSV file | `content/candidates/` or operator upload |
| Gate reports (synthetic) | `content/reports/{batchId}_*.json` |
| Schema | `docs/specs/content-model.md` · `docs/specs/question-csv-upload.md` |

## Outputs

| Output | Notes |
|---|---|
| Lint report | Pass/fail + per-row errors |
| Dry-run result | Would-create / would-update counts; no writes on fail |
| Import (optional) | Catalog write only on full pass; default `published=false` |
| Publish decision | Only after smoke — see gate |

## Steps

1. **Structural lint:** required columns; enums M1–M6, topic, `VSP`/`VJS`, `bank`/`synthetic`; choices parse; non-empty stem/rationale/correctKey.
2. If any row fails → reject whole file; list row id + reason; **stop**.
3. **Synthetic gate check:** require verify + critic reports; human sample signed off (≥2% or ≥20 for first 3 batches).
4. Dry-run import; on success may write catalog with `published=false`.
5. **Publish checklist** (all must hold before `published=true`):
   1. Structural lint 100%
   2. Answer-key verify 100% on retained rows
   3. Critic residual below threshold (0 critical, &lt;2% minor)
   4. Human spot-check signed off
   5. All-or-nothing import succeeded
   6. Smoke: practice serves items with synthetic label + correct feedback + filters
   7. Gate report JSON archived next to CSV
6. Only then move/copy to `content/published/` and flip publish flag.

## Refs

- `docs/specs/question-csv-upload.md`
- `docs/specs/content-model.md`
- `docs/agent-operating-model.md` §3.3, §8
- Prior: `.cursor/skills/critic-synthetic-batch/SKILL.md`
