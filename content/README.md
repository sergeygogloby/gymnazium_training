# Content pipeline

Folders for the synthetic / bank content workflow (see [docs/agent-operating-model.md](../docs/agent-operating-model.md) §3 and [docs/skills-backlog.md](../docs/skills-backlog.md)).

| Path | Purpose |
|---|---|
| `seeds/` | Extracted seeds / fixtures from `sources/` PDFs (per topic templates) |
| `templates/` | Locked item templates (JSON Schema or equivalent) per topic |
| `candidates/` | Candidate CSV batches (current stock `published=true`; new batches may gate as unpublished) |
| `published/` | Gate-passed / live CSV (`published=true`) |
| `reports/` | Gate reports (`*_report.json`: lint, verify, critic, human sample) |

**Invoke order:** `extract-vsjp8-seeds` → `generate-vsjp8-items` → `verify-answer-keys` → `critic-synthetic-batch` → `csv-import-qa`.

**CLI tools:** see [tools/README.md](../tools/README.md) (`validate-questions-csv`, `verify-answer-keys`).

**Seed/template schema:** [SCHEMA.md](./SCHEMA.md).

**Fixtures:** `candidates/fixtures/` — empty/invalid/valid CSV samples for the validator (all-or-nothing).

Do **not** mix PDF packs into these folders — leave `sources/` untouched.
