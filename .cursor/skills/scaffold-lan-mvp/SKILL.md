---
name: scaffold-lan-mvp
description: Bootstrap the no-auth LAN app shell — shared nav, sessionKind store, content schema types, and CSV validate stub. Wave 1 only; blocks vertical slices until green.
---

# Skill: scaffold-lan-mvp

## When to invoke

**Wave 1 only** — before parallel vertical-slice implementers. Do not re-run as a free-form “improve the architecture” pass mid-Wave 2.

## Non-negotiables (product locks)

- **No auth** — open LAN app; single shared store; no user ids.
- **No modes** — plain nav (Curriculum / Practice / Mistakes / Results & Progress / Upload); no Practice/Insights switcher.
- Session kinds: `practice` | `exam_30` | `exam_60` persisted on attempts.
- Content tags per F12 / `docs/specs/content-model.md` (module, topic, skillArea, sourceType).
- CSV validator stub uses **all-or-nothing** rules from F22.
- Slovak UI primary; licensing N/A.

## Inputs

| Input | Source |
|---|---|
| Specs index | `docs/specs/README.md` |
| Content schema | `docs/specs/content-model.md` |
| CSV columns | `docs/specs/question-csv-upload.md` |
| Nav / views | `docs/specs/home-and-navigation.md` · `docs/functions-and-views.md` |
| Curriculum map | `docs/materials-structure.md` |

## Outputs

| Output | Notes |
|---|---|
| Runnable app shell | Router + empty V01–V11 routes |
| Shared store | Attempts with `sessionKind`; flags queue stub |
| Content catalog types | Item schema matching F12/F22 |
| CSV lint library stub | Reject whole file on any bad row |
| Shared nav | No mode chrome |

## Steps

1. Read `docs/agent-operating-model.md` Wave 1 gate and locks in `docs/project-context.md`.
2. Create app shell with primary nav per `docs/functions-and-views.md` (Home → Curriculum, Practice, Mistakes, Results & Progress, Upload ops).
3. Define item + attempt TypeScript (or equivalent) types from content-model / F22 columns.
4. Persist attempts locally (single-instance) with `sessionKind` and tags — no account fields.
5. Stub CSV validator: required columns + enums (M1–M6, topic, `VSP`/`VJS`, `bank`/`synthetic`); **any failure → no writes**.
6. Wire empty view shells for V01–V11 (V07 retired — do not implement).
7. Smoke: app loads without login; nav has no mode switcher.

## Refs

- `docs/specs/content-model.md`
- `docs/specs/home-and-navigation.md`
- `docs/specs/question-csv-upload.md`
- `docs/functions-and-views.md`
- `docs/agent-operating-model.md` §2.2 Wave 1
- Companion: `.cursor/skills/lock-check-product/SKILL.md`
