---
name: sdd-implement-spec
description: Implement exactly one SDD spec’s Acceptance checklist; refuse scope creep past Out of scope. Use at the start of every vertical-slice worker assignment.
---

# Skill: sdd-implement-spec

## When to invoke

Every vertical-slice implementer **before** writing app code. Also when amending behavior already covered by a spec.

## Non-negotiables (product locks)

- **No auth** — no login, roles, invite links, or account-gated screens.
- **No modes** — no Practice/Insights or Student/Parent mode switchers; shared family UI only.
- **Session kinds only:** `practice` | `exam_30` | `exam_60`.
- **CSV all-or-nothing** — never partial import.
- Practice feedback **after each item**; exams **end-only**.
- Implement **only** the assigned spec’s Acceptance; do not invent product rules.

## Inputs

| Input | Source |
|---|---|
| Exactly one spec file | `docs/specs/<name>.md` |
| Product locks | `docs/project-context.md` |
| View/function IDs | `docs/functions-and-views.md` |
| Shared types / scaffold APIs | App scaffold from Wave 1 |

## Outputs

| Output | Notes |
|---|---|
| Code implementing Acceptance | No extras beyond Out of scope |
| Acceptance notes | Checklist with pass/fail/gap |
| Bounce requests | Schema changes → Spec steward + Scaffold; do not fork content model |

## Steps

1. **Read** the assigned spec end-to-end (Goal → Acceptance) and `docs/specs/README.md` workflow.
2. **Read** Out of scope; list what you will **not** build.
3. **Map** Acceptance checkboxes to concrete UI/API changes; cite View/Function IDs.
4. **Implement** only those items against shared scaffold APIs.
5. **Verify** each Acceptance item locally (or note blocked + why).
6. **Return** pass/fail matrix; link any gaps. Do not silently “improve” product scope.

## Refs

- `docs/specs/README.md`
- Assigned: `docs/specs/home-and-navigation.md` · `curriculum.md` · `practice-session.md` · `exam-session.md` · `progress.md` · `mistakes-restudy.md` · `question-csv-upload.md` · `content-model.md`
- `docs/agent-operating-model.md` §2.3 (slice ownership)
- Companion: `.cursor/skills/lock-check-product/SKILL.md`
