# Gate checklist — `vsjp8-ulohy-bank` (post reject/rewrite)

- Rows: **336** letter-key-only (Mudre Úlohy+Riešenia, Cielene 1–2, EXAM X5/X6/X9 A–D)
- Candidate: `content/bank/vsjp8-ulohy-bank.csv`
- Publish decision: **PUBLISHED** after gold Riesenia verify + independent spot-check

## Checklist

- [x] **structural lint** — F22 PASS; 336 rows (`validate-questions-csv`)
- [x] **answer-key verify** — `vsjp8-ulohy-bank_verify.json` ok=true; pass=336 fail=0 (method `bank.gold_riesenia`)
- [x] **critic (bank path)** — `critic-synthetic-batch` N/A (expects synthetic/M3/T5); bank uses gold Riesenia audit + reject of restated keys instead (`vsjp8-ulohy-bank_key-audit.json` → reject_batch on prior 780-row file)
- [x] **restated rejected** — no `bank-cielene-b*` / `c*` / `d*`; no `exam-x4` / `exam-x7` / `evan` (prior audit found ~40% wrong keys on restated sample)
- [x] **spot-check** — signed off; sampleSize=22 confirmed=22 wrong=0 (`vsjp8-ulohy-bank_spot-check.json`)
- [x] **import** — SQLite: 336 bank + 40 synthetic = 376; bank published=true after gate
- [x] **tag audit** — module↔topic map clean; sourceType=bank; skillArea VSP|VJS only

## Artifacts

- Bank CSV: `content/bank/vsjp8-ulohy-bank.csv`
- Extract report: `content/reports/bank-extract-from-sources.json`
- Verify: `content/reports/vsjp8-ulohy-bank_verify.json`
- Prior reject audit: `content/reports/vsjp8-ulohy-bank_key-audit.json`
- Spot-check: `content/reports/vsjp8-ulohy-bank_spot-check.json`
