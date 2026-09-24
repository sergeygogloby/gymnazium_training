# Spec-Driven Development (SDD) — gymnazium_training

Specs in this folder define **behavior and UI** before code. Implementation follows acceptance criteria; verification checks those criteria.

**Context:** [../project-context.md](../project-context.md) · [../functions-and-views.md](../functions-and-views.md) · [../feature-list.md](../feature-list.md)

**Locked:** no auth; **no Practice/Insights modes** — shared family screens; **practice + timed exams (30/60)** as session kinds with **separate reporting**; practice feedback **after each item**; Mistakes restudy, VŠP/VJS filter, bank/synthetic labels, light streak/effort, and **CSV question upload** are **P0**; CSV import is **all-or-nothing**; content licensing **not applicable**.

---

## Workflow

```
1. Spec     → write/update a markdown spec (template below)
2. Implement → build only what the spec requires
3. Verify   → check Acceptance; note gaps in the PR / notes
```

Do not implement a major view or capability without a matching spec (or an explicit amendment to an existing one).

---

## Spec template

Every starter and future spec uses this structure:

| Section | Content |
|---|---|
| **Goal** | One outcome the user gets |
| **Actors** | Anonymous household (shared screens) — no accounts, no modes |
| **Views** | View IDs from functions-and-views (V0x) |
| **Behaviors** | Observable steps and rules |
| **Data** | What is read/written; tags; persistence (local / single instance) |
| **Out of scope** | Explicitly deferred (esp. auth, modes) |
| **Acceptance** | Testable checklist |

---

## Index — specs ↔ views / functions

| Spec | Views | Functions | MVP |
|---|---|---|---|
| [home-and-navigation.md](./home-and-navigation.md) | V01, V08 | — (nav + positioning; Mistakes + Upload entry) | P0 |
| [curriculum.md](./curriculum.md) | V02 | F01, F02, F11, F12, F15, F17, F18 | P0 |
| [practice-session.md](./practice-session.md) | V03, V04, V09 | F02–F07, F12, F13, F17, F18 | P0 |
| [exam-session.md](./exam-session.md) | V02, V03, V04, V09 | F03, F04, F06, F07, F12, F13, F15, F18 | P0 |
| [progress.md](./progress.md) | V06, V05 | F07–F11, F15, F21 | P0 |
| [mistakes-restudy.md](./mistakes-restudy.md) | V10, V03, V04 | F16, F02–F07, F12, F17, F18 | P0 |
| [question-csv-upload.md](./question-csv-upload.md) | V11 | F22, F12, F14 | P0 |
| [insights.md](./insights.md) | ~~V07~~ retired → see progress.md | — | Retired |
| [content-model.md](./content-model.md) | (cross-cutting) | F12, F14, F22 | P0 |

**Renames:** `home-and-modes.md` → `home-and-navigation.md`. Former Insights (V07) folded into Results & Progress (V06) in `progress.md`. Timed exams elevated to P0 as session kinds (`exam_30` / `exam_60`). Competitive gaps 1–4 + CSV upload locked into MVP (see [../competitive-feature-gap.md](../competitive-feature-gap.md)).

---

## Naming and location

- One file per major view or capability area: `kebab-case.md` under `docs/specs/`.  
- Link View/Function IDs; do not redefine the product goal in every file — point at project-context.  
- When a feature-list item is deferred, say so under **Out of scope**, do not silently omit.

---

## Verification notes

- Prefer manual acceptance against the checklist on a local run.  
- No auth tests. Treat “open Results & Progress without login” as a required pass.  
- Confirm there is **no** Practice/Insights mode switcher in the UI.  
- Confirm practice and exam attempts are stored with distinct `sessionKind` and that Results & Progress separates Practice \| Exams (30/60).  
- Confirm practice shows feedback **after each item**; exams remain end-only.  
- Confirm Mistakes queue, VŠP/VJS filter, bank/synthetic labels, light streak/effort, and CSV upload meet their acceptance lists.  
- CSV upload is **all-or-nothing** (any invalid row → no import). Content licensing is **not applicable** (closed). Synthetic QA remains a content-ops practice, not a product open Q.
