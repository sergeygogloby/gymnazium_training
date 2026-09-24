# Content tools

CLI helpers for the VSJP8 content pipeline. Run from the **repo root** (or this worktree root).

**Locks (do not violate):**
- CSV import is **all-or-nothing** — any invalid row → exit non-zero, zero catalog writes.
- Never flip `published=true` from these tools.
- No auth. These are local/LAN ops scripts.

## `validate-questions-csv`

F22 structural lint against [docs/specs/question-csv-upload.md](../docs/specs/question-csv-upload.md) / [content-model.md](../docs/specs/content-model.md).

```bash
python3 tools/validate-questions-csv content/candidates/fixtures/valid-sample.csv
python3 tools/validate-questions-csv content/candidates/fixtures/invalid-*.csv --json
```

| Exit | Meaning |
|---|---|
| `0` | Every row valid (`wouldWrite = rowCount`) |
| `1` | Any error → reject whole file (`wouldWrite = 0`) |

Required columns: `stem`, `correctKey`, `rationale`, `module` (M1–M6), `topic` (T1–T12), `skillArea` (`VSP`\|`VJS`), `sourceType` (`bank`\|`synthetic`). Optional: `id`, `choices`, `locale`, `published`.

## `verify-answer-keys`

Independent answer-key check **after** structural lint, **before** critic. Scaffold + a few easy T5 numeric solvers; remaining rows are `needsIndependentCheck`.

```bash
python3 tools/verify-answer-keys content/candidates/some-batch.csv --batch-id some-batch
# report → content/reports/some-batch_verify.json
python3 tools/verify-answer-keys path.csv --dry-run
```

| Exit | Meaning |
|---|---|
| `0` | Lint ok, every row solver-checked and passed |
| `1` | Lint failed or solver found a wrong `correctKey` |
| `2` | No known key mismatches, but some rows still need independent check |

Does **not** publish. High fail rate → scrap/revise the batch (all-or-nothing spirit).

## Agent invoke order

1. `extract-vsjp8-seeds` → `content/seeds/`, `content/templates/`
2. `generate-vsjp8-items` → `content/candidates/*.csv` (`published=false`)
3. **`validate-questions-csv`**
4. **`verify-answer-keys`**
5. `critic-synthetic-batch`
6. `csv-import-qa` publish gate (human sample, smoke) — only then `published=true`

## Fixtures

Invalid/empty CSV samples for lint tests live in `content/candidates/fixtures/`.

## Shared library

`tools/lib/f22_schema.py` — column enums, choice parsing, `lint_csv_path` / `lint_csv_text`.
