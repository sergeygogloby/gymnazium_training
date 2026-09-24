---
name: session-kind-qa
description: Verify practice after-each feedback vs exam end-only scoring and distinct sessionKind reporting (practice | exam_30 | exam_60). Use with acceptance-computeruse on session and progress views.
---

# Skill: session-kind-qa

## When to invoke

After practice and exam slices are runnable; also when Progress (V05/V06) claims Practice \| Exams separation.

## Non-negotiables

- `sessionKind` ∈ {`practice`, `exam_30`, `exam_60`} — not modes/roles.
- Practice: correct answer + rationale **after each item**.
- Exams: **no** mid-run answer key; score at end; timer 30 or 60.
- Results & Progress **separates** practice from exams — no single unlabeled mixed rollup as the only signal.
- No auth required to run sessions or view history.

## Inputs

| Input | Source |
|---|---|
| Specs | `docs/specs/practice-session.md`, `exam-session.md`, `progress.md` |
| Running app | Local URL |
| Sample content | Tagged items in catalog |

## Outputs

| Output | Notes |
|---|---|
| Kind matrix | practice / exam_30 / exam_60 behaviors checked |
| Reporting check | History filters/sections; progress separation |
| Failures | Spec Acceptance item ids |

## Steps

1. Start **practice**: confirm untimed, after-each feedback, `Practice` label on result, history kind = practice.
2. Start **exam_30** and **exam_60**: countdown matches; no key mid-run; end score; labeled results.
3. Open V05/V06: filter or section **Practice \| Exams**; confirm kinds labeled; practice rollups do not silently include exams (and vice versa).
4. Confirm bank/synthetic labels visible without revealing exam keys mid-run.
5. Fail any mode-switcher or mixed-only progress UI.

## Refs

- `docs/specs/practice-session.md`
- `docs/specs/exam-session.md`
- `docs/specs/progress.md`
- `docs/functions-and-views.md` Session kinds
- Companion: `.cursor/skills/acceptance-computeruse/SKILL.md`
