# Seed & template JSON schema (pilot)

Grounded shapes for VSJP8 generators. **Not** F22 CSV — generators later emit CSV from these templates.

Live household content is **`published: true`** / `publishedDefault: true` so items are session-eligible. New synthetic batches may still enter the gate as unpublished until smoke; this tree’s current stock is published.

See also: [docs/specs/content-model.md](../docs/specs/content-model.md), skill `extract-vsjp8-seeds`.

## Template (`content/templates/*.json`)

| Field | Required | Notes |
|---|---|---|
| `templateId` | yes | Stable id, e.g. `t5.lcm-gears.mcq` |
| `module` | yes | `M1`–`M6` |
| `topic` | yes | `T1`–`T12` |
| `skillArea` | yes | `VSP` \| `VJS` |
| `itemType` | yes | `mcq` \| `cloze` \| `free` \| … |
| `slots` | yes | Typed generation parameters |
| `renderStem` | yes | Stem pattern / mustache-like sketch |
| `renderChoices` | yes | How A–D (or free) are built |
| `deriveCorrectKey` | yes | Prefer `mode: programmatic` for numeric/logic |
| `rationalePattern` | yes | How explanations should look |
| `provenance.sourcePdfs` | yes | Basename(s) under `sources/` (read-only) |
| `publishedDefault` | yes | `true` for live stock (session-eligible) |

## Seed (`content/seeds/{tN}/*.json`)

| Field | Required | Notes |
|---|---|---|
| `seedId` | yes | Unique fixture id |
| `templateId` | yes | Links to a template |
| `module` / `topic` / `skillArea` | yes | Must match template |
| `sourceType` | yes | Pilot uses `bank` (attested from PDF) |
| `published` | yes | `true` for live stock |
| `provenance` | yes | `sourcePdf`, optional `solutionPdf`, `itemIndex`, `folder` |
| `stem` | yes | Attested stem text (may be lightly cleaned for OCR) |
| `choices` | conditional | Array of option texts (without `A.` prefix preferred) |
| `correctKey` | yes | `A`–`D` (or free key) from Riesenia / theory sheet |
| `rationale` | yes | From solutions where available |
| `slots` | recommended | Concrete slot fill used by deriveCorrectKey |
| `shapeNotes` | optional | Item-shape summary for generators |
| `attestedCues` | optional | Lexical/discourse cues only if present in materials |

## Pilot inventory (this branch)

| Topic | Templates | Seeds |
|---|---|---|
| T5 numeric/logic (M3) | 3 | 5 |
| T1 cloze / sentence order (M1) | 2 | 4 |

**Do not** free-form invent thousands of synthetic items here — fill templates later via `generate-vsjp8-items`.
