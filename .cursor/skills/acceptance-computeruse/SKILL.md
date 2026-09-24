---
name: acceptance-computeruse
description: Drive a browser against a view’s Acceptance checklist; capture pass/fail evidence. Use in Wave 4 after slices merge on a running LAN app.
---

# Skill: acceptance-computeruse

## When to invoke

Wave 4 (or earlier smoke) when a deployable/local app URL exists. One view/spec at a time preferred.

## Non-negotiables

- Test **Acceptance** from the spec — not improvised UX taste.
- Confirm **no auth** and **no Practice/Insights mode** chrome.
- Practice: feedback **after each item**; exams: **end-only**; kinds labeled.
- Capture evidence (screenshots/notes) for coordinator; do not claim pass without checks.
- Do not add product features during QA.

## Inputs

| Input | Source |
|---|---|
| Spec Acceptance list | `docs/specs/<view-spec>.md` |
| Running app URL | Local LAN / localhost |
| Optional seed data | Attempts / catalog for empty vs filled states |

## Outputs

| Output | Notes |
|---|---|
| Pass/fail matrix | One row per Acceptance checkbox |
| Evidence | Screenshots / short notes under coordinator artifact path |
| Bug list | Repro steps; link to spec item |

## Steps

1. Open the assigned spec; copy Acceptance checkboxes into a checklist.
2. Launch browser (`computerUse`); open app **without** login — fail if gated.
3. Walk each Acceptance step; screenshot failures and ambiguous UI.
4. Explicitly verify locks: no mode switcher; session kinds distinct where relevant.
5. Return matrix + bugs; do not re-scope the product.

## Spec map (common)

| Spec | Views |
|---|---|
| `docs/specs/home-and-navigation.md` | V01, V08 |
| `docs/specs/curriculum.md` | V02 |
| `docs/specs/practice-session.md` | V03, V04, V09 |
| `docs/specs/exam-session.md` | V03, V04 |
| `docs/specs/progress.md` | V05, V06 |
| `docs/specs/mistakes-restudy.md` | V10 |
| `docs/specs/question-csv-upload.md` | V11 |

## Refs

- `docs/specs/README.md` Verification notes
- `docs/functions-and-views.md` MVP ship bar
- Companions: `.cursor/skills/session-kind-qa/SKILL.md`, `.cursor/skills/mistakes-queue-qa/SKILL.md`
