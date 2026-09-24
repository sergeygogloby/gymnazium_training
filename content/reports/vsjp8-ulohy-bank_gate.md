# Gate checklist — `vsjp8-ulohy-bank` (post reject/rewrite)

- Rows: **336** letter-key-only
- Candidate: `content/bank/vsjp8-ulohy-bank.csv`
- Publish decision: **HOLD** (`published=false` until import/smoke)

## Checklist

- [x] **structural lint** — `vsjp8-ulohy-bank_verify.json` lintOk=true; 336 rows
- [x] **gold Riesenia verify** — verify ok=true; passed=336 failed=0 (official Riesenia letter keys)
- [x] **restated rejected** — no `bank-cielene-b*` / `c*` / `d*`; no `exam-x4` / `exam-x7` / `evan` ids (prior audit: `vsjp8-ulohy-bank_key-audit.json`)
- [x] **spot-check** — signed off; sampleSize=22 confirmed=22 wrong=0 (`vsjp8-ulohy-bank_spot-check.json`)
- [x] **import published=false** — CSV all rows `published=false` (ready for unpublished import)

## Artifacts

- Bank CSV: `content/bank/vsjp8-ulohy-bank.csv`
- Verify: `content/reports/vsjp8-ulohy-bank_verify.json`
- Prior reject audit: `content/reports/vsjp8-ulohy-bank_key-audit.json`
- Spot-check: `content/reports/vsjp8-ulohy-bank_spot-check.json`
