# Gate report — `pilot-t5-synth-20260924`

- Rows: **40** (T5 / M3 / VSP / `sourceType=synthetic` / `published=false`)
- Candidate gate (lint+verify+critic): **PASS**
- Publish decision: **DO_NOT_PUBLISH**

## Checklist

- [PASS] `structural_lint_100` — rows=40 errors=0
- [PASS] `answer_key_verify_100` — pass=40 fail=0 needs=0
- [PASS] `critic_residual_below_threshold` — critical=0 minor%=0.0 verdict=PASS
- [PENDING/FAIL] `human_spot_check_signed_off` — PENDING — first pilot batches need human ≥2% or ≥20 sample
- [PASS] `all_or_nothing_import` — dry-run only; wouldWrite=all; catalog write deferred
- [PENDING/FAIL] `smoke_practice_serves_synthetic` — Deferred — published=false until publish gate
- [PASS] `gate_report_archived` — verify + critic + gate JSON/MD archived under content/reports/

## Template counts

- `t5.lcm-gears.mcq`: 12
- `t5.numeric-word-problem.mcq`: 16
- `t5.percent-composition.mcq`: 12

## Pipeline

1. extract-vsjp8-seeds (existing T5 templates/seeds; PDFs untouched)
2. generate-vsjp8-items → `tools/generate-t5-pilot-batch` (programmatic keys only)
3. validate-questions-csv (all-or-nothing)
4. verify-answer-keys (independent solvers)
5. critic-synthetic-batch (separate adversarial tool)
6. csv-import-qa gate (this report) — **no** `published=true`

## Refs

- `content/candidates/pilot-t5-synth-20260924_M3_T5.csv`
- `content/reports/pilot-t5-synth-20260924_verify.json`
- `content/reports/pilot-t5-synth-20260924_critic.json`
- `content/reports/pilot-t5-synth-20260924_gate.json`

