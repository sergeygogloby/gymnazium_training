---
name: generate-vsjp8-items
description: Fill constrained VŠP/VJS templates into F22 candidate CSV rows (sourceType=synthetic, unpublished). Never set published=true; never act as own critic.
---

# Skill: generate-vsjp8-items

## When to invoke

Each content batch after templates/seeds exist for that topic. Parallel by module or topic once templates are locked.

## Non-negotiables

- **Template grounding only** — fill slots; do not invent new item types mid-batch.
- **Generator ≠ critic** — do not self-approve; hand off to `verify-answer-keys` then `critic-synthetic-batch`.
- **Never write `published=true`** — candidates are unpublished until the full publish gate.
- Emit F22 columns; `sourceType=synthetic`; prefer `published=false`.
- Prefer **deterministic deriveCorrectKey** over LLM-chosen keys when a solver exists.
- Batch size **100–250** rows; reject unconstrained “write a VŠP question” prompts.
- Product locks: no auth assumptions; CSV later is all-or-nothing.

## Inputs

| Input | Source |
|---|---|
| Templates | `content/templates/` |
| Seeds | `content/seeds/` |
| F22 schema | `docs/specs/question-csv-upload.md` · `docs/specs/content-model.md` |
| Batch params | module, topic, `batchId` |

## Outputs

| Output | Path |
|---|---|
| Candidate CSV | `content/candidates/{batchId}_M{n}_T{nn}.csv` |
| Provenance sidecar (optional) | Same stem + `templateId`, `seedId`, `batchId` |
| Do **not** write | `content/published/` or `published=true` |

## Steps

1. Confirm template + seeds for the topic; abort if missing (`extract-vsjp8-seeds` first).
2. Fill slots only within allow-lists / typed ranges; paraphrase stems only inside template constraints.
3. Set `correctKey` from `deriveCorrectKey` when available; LLM never sole authority for keys with a solver.
4. Emit exact F22 columns: `stem`, `choices` (if MCQ), `correctKey`, `rationale`, `module`, `topic`, `skillArea` (`VSP`|`VJS`), `sourceType=synthetic`, `published=false`; stable `id` = `{templateId}-{hash(slots)}`.
5. Write CSV under `content/candidates/` only.
6. Stop. Do **not** run critic in the same turn. Point next agent to `verify-answer-keys`.

## Refs

- `docs/agent-operating-model.md` §3 (pipeline + publish gate)
- `docs/specs/content-model.md`
- `docs/specs/question-csv-upload.md`
- Prior: `.cursor/skills/extract-vsjp8-seeds/SKILL.md`
- Next: `.cursor/skills/verify-answer-keys/SKILL.md`
