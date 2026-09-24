# Gate report — `pilot-t5-synth-20260924`

- Rows: **40**
- Publish decision: **PUBLISH**
- Smoke: **PASS**

## Checklist

- [PASS] `structural_lint_100` — rows=40 errors=0
- [PASS] `answer_key_verify_100` — pass=40 fail=0 needs=0
- [PASS] `critic_residual_below_threshold` — critical=0 minor%=0.0 verdict=PASS
- [PASS] `human_spot_check_signed_off` — SIGNED OFF 2026-09-24 — human spot-check confirmed by project owner (merge #12)
- [PASS] `all_or_nothing_import` — imported to SQLite created=40 updated=0 rows=40
- [PASS] `smoke_practice_serves_synthetic` — PASS — eligible synthetic practice + feedback + filters
- [PASS] `gate_report_archived` — verify + critic + gate JSON/MD archived under content/reports/

## Artifacts

- Candidate: `content/candidates/pilot-t5-synth-20260924_M3_T5.csv`
- Published: `content/published/pilot-t5-synth-20260924_M3_T5.csv`
- Smoke: `content/reports/pilot-t5-synth-20260924_smoke.json`

