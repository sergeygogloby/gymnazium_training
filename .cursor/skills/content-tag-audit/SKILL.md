---
name: content-tag-audit
description: Audit catalog rows for M1–M6 / topic / VSP|VJS / bank|synthetic completeness so sessions and reports can filter honestly.
---

# Skill: content-tag-audit

## When to invoke

Before large practice/exam QA, after CSV imports, and periodically on the content catalog. Complements structural lint in `csv-import-qa`.

## Non-negotiables

- Every served item needs complete tags (F12): **module** M1–M6, **topic** (T1–T12 map), **skillArea** `VSP`|`VJS`, **sourceType** `bank`|`synthetic`, stable id, stem, correctKey, rationale.
- Incomplete tags → not eligible for new sessions (same spirit as publish/hide).
- Tag lies (wrong topic vs stem) are defects — escalate to critic/content ops; do not “fix” by guessing.
- No auth CMS required; audit can be script + report under `content/reports/`.

## Inputs

| Input | Source |
|---|---|
| Content catalog | App DB/files and/or `content/published/`, bank fixtures |
| Schema | `docs/specs/content-model.md` |
| Topic map | `docs/materials-structure.md` |

## Outputs

| Output | Path / notes |
|---|---|
| Audit report | `content/reports/tag-audit-{date}.json` or markdown |
| Incomplete / invalid rows | ids + missing/invalid fields |
| Coverage summary | Counts per module, topic, skillArea, sourceType |

## Steps

1. Load all catalog rows (including CSV-imported).
2. Validate required fields and enums against content-model / F22.
3. Check topic codes align to materials map (T1–T12 ↔ M1–M6).
4. Flag `published=true` rows that would fail session serve rules.
5. Summarize coverage gaps (empty topics, missing VJS, etc.).
6. Return report; do not silently rewrite keys — bounce bad synthetic rows to revise queue.

## Refs

- `docs/specs/content-model.md`
- `docs/specs/question-csv-upload.md`
- `docs/materials-structure.md`
- `docs/functions-and-views.md` F12, F17, F18
- Related: `.cursor/skills/csv-import-qa/SKILL.md`
