# Gate report — `pilot-t5-synth-20260924`

- Rows: **40** (T5 / M3 / VSP / `sourceType=synthetic` / `published=false`)
- Candidate gate (lint+verify+critic): **PASS**
- Human spot-check: **SIGNED OFF**
- Publish decision: **DO_NOT_PUBLISH** (smoke still pending)
- Merged to main: PR #12 @ `0b735e1`

## Checklist

- [PASS] `structural_lint_100` — rows=40 errors=0
- [PASS] `answer_key_verify_100` — pass=40 fail=0 needs=0
- [PASS] `critic_residual_below_threshold` — critical=0 minor%=0.0 verdict=PASS
- [PASS] `human_spot_check_signed_off` — SIGNED OFF 2026-09-24 — human spot-check confirmed by project owner (merge #12)
- [PASS] `all_or_nothing_import` — dry-run only; wouldWrite=all; catalog write deferred
- [PENDING/FAIL] `smoke_practice_serves_synthetic` — Deferred — published=false until publish gate
- [PASS] `gate_report_archived` — verify + critic + gate JSON/MD archived under content/reports/

## Template counts

- `t5.lcm-gears.mcq`: 12
- `t5.numeric-word-problem.mcq`: 16
- `t5.percent-composition.mcq`: 12

## Next

1. Import / dry-run into catalog (`published=false`)
2. Practice smoke: synthetic label + correct feedback + filters
3. Only then flip `published=true`

