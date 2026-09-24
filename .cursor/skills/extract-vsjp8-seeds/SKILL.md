---
name: extract-vsjp8-seeds
description: From sources/ PDFs, extract item shapes and answer patterns into topic templates and seed fixtures. Run before any large generate-vsjp8-items batch.
---

# Skill: extract-vsjp8-seeds

## When to invoke

Before any large synthetic generation run. Prefer pilot topics (e.g. M3/T5–T6) first, then expand by module.

## Non-negotiables

- **Leave `sources/` PDF packs untouched** — read only; do not reorganize or mix project docs into PDF folders.
- Generators later must fill **templates only** — extraction must produce grounded shapes, not free-form essays.
- Seeds carry provenance (PDF basename, topic T1–T12, module M1–M6).
- No invented Slovak grammar/idiom “rules” — only patterns attested in materials.
- Licensing N/A for this household project; still treat bank patterns as grounding, not public redistribution briefs.

## Inputs

| Input | Source |
|---|---|
| PDF corpus | `sources/` (read-only) |
| Module/topic map | `docs/materials-structure.md` |
| Content schema | `docs/specs/content-model.md` |
| Output dirs | `content/seeds/`, `content/templates/` |

## Outputs

| Output | Path |
|---|---|
| Seed fixtures | `content/seeds/` (JSON or markdown fixtures per topic) |
| Topic templates | `content/templates/` (`templateId`, slots, deriveCorrectKey, rationalePattern) |
| Extraction notes | Optional under `content/reports/` |

## Steps

1. Read topic/module map in `docs/materials-structure.md` (T1–T12 ↔ M1–M6).
2. For the assigned module/topic, extract from Cielene Ulohy / Riesenia / tests (via PDF text tools):
   - Item **shape** (MCQ A–D, cloze, odd-one-out, sequence, graph-table, conditions, cipher, …)
   - **Worked answer** patterns
   - Attested lexical pairs / allow-lists where applicable
3. Write seed fixtures under `content/seeds/` with provenance (`sourcePdf`, `topic`, `module`, `skillArea`).
4. Lock a template per topic under `content/templates/`: `templateId`, `module`, `topic`, `skillArea`, `itemType`, typed `slots`, `renderStem`, `renderChoices`, `deriveCorrectKey`, `rationalePattern`.
5. Prefer **programmatic deriveCorrectKey** for numeric/logic topics.
6. Do **not** emit candidate CSV here — that is `generate-vsjp8-items`.

## Refs

- `docs/materials-structure.md`
- `docs/agent-operating-model.md` §3.2
- `docs/specs/content-model.md`
- Next: `.cursor/skills/generate-vsjp8-items/SKILL.md`
