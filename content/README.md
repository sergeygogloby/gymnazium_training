# Content pipeline

Folders for the synthetic / bank content workflow (see [docs/agent-operating-model.md](../docs/agent-operating-model.md) §3 and [docs/skills-backlog.md](../docs/skills-backlog.md)).

| Path | Purpose |
|---|---|
| `seeds/` | Extracted seeds / fixtures from `sources/` PDFs (per topic templates) |
| `templates/` | Locked item templates (JSON Schema or equivalent) per topic |
| `candidates/` | Candidate CSV batches (current stock `published=true`; new batches may gate as unpublished) |
| `bank/` | Gate-passed bank extract (`vsjp8-ulohy-bank.csv`) |
| `published/` | Live CSVs (`published=true`): full `catalog-all-376.csv`, bank copy, T5 synthetic |
| `reports/` | Gate reports (`*_report.json`: lint, verify, critic, human sample, csv↔db sync) |

**Live catalog (CSV ≡ SQLite):**

| File | Rows |
|---|---|
| `published/catalog-all-376.csv` | **376** (full catalog) |
| `bank/vsjp8-ulohy-bank.csv` / `published/vsjp8-ulohy-bank.csv` | 336 bank |
| `published/pilot-t5-synth-20260924_M3_T5.csv` | 40 synthetic |

Re-export from DB: `python3 tools/export-catalog-csv`.

**Invoke order:** `extract-vsjp8-seeds` → `generate-vsjp8-items` → `verify-answer-keys` → `critic-synthetic-batch` → `csv-import-qa`.

**CLI tools:** see [tools/README.md](../tools/README.md) (`validate-questions-csv`, `verify-answer-keys`, `extract-bank-from-sources`, `export-catalog-csv`).

**Seed/template schema:** [SCHEMA.md](./SCHEMA.md).

**Fixtures:** `candidates/fixtures/` — empty/invalid/valid CSV samples for the validator (all-or-nothing).

Do **not** mix PDF packs into these folders — leave `sources/` untouched.
