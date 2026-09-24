# Project context — gymnazium_training

**Status:** locked decisions for MVP scoping  
**Canonical location:** in-repo under [`docs/`](./) (this tree). Project store copies under `/cursor/stores/self/docs/` stay in sync with the same content.  
**Related:** [feature-list.md](./feature-list.md) · [materials-structure.md](./materials-structure.md) · [functions-and-views.md](./functions-and-views.md) · [specs/](./specs/) · [competitive-feature-gap.md](./competitive-feature-gap.md) · [agent-operating-model.md](./agent-operating-model.md) · [skills-backlog.md](./skills-backlog.md)

---

## Goal

A **local-network webapp** that helps an **8./9. ročník** learner prepare for **5-ročné bilingválne gymnázium** entrance exams (**VŠP + VJS**) using the Cielene VSJP8 curriculum mapped to modules **M1–M6**.

The product supports, in **one shared app** (parent and child look together):

1. **Practice** — untimed, item-by-item training with **feedback after each item** and attempt write path.  
2. **Timed exams** — fixed **30 min** and **60 min** session kinds (same shared screens; not a mode/role); **end-only** scoring/feedback.  
3. **Results & progress** — history, module/topic progress, weak topics, next-practice suggestions, **light streak/calendar**, and **effort vs accuracy** on the **same screens** as outcomes (not a separate Insights mode). Practice and exams appear **separately** in reports (not mixed into one undifferentiated rollup).  
4. **Mistakes / restudy** — dedicated queue to re-attempt missed items.  
5. **Content ops** — publish/hide, flag bad items, and **CSV upload** of new questions (esp. synthetic) without a code deploy.

No Student vs Parent modes, parallel navigations, or role-gated screens.

---

## Constraints (locked)

| Constraint | Detail |
|---|---|
| **No authorization / accounts** | No login, parent invite links, roles, or secure family linking. Generic open views are enough. |
| **Local family network** | App is used at home on a trusted LAN. Do not overcomplicate privacy or multi-tenant isolation for v1. |
| **Exam focus** | Bilingual VŠP+VJS only. Not 4-ročné SJL+MAT as primary; not 8-ročné (5. ročník). |
| **Curriculum** | Practice and reports keyed to **M1–M6** and the 12 VSJP8 topics ([materials-structure.md](./materials-structure.md)). |
| **SDD** | Spec-Driven Development: behavior and UI are specified under `docs/specs/` before implementation. |
| **UI language** | Slovak primary. |

---

## Decisions (locked)

1. **Household = anonymous shared device/browser context.** Progress and attempt history live in a **local SQLite** database (single LAN instance via `server/`). Anyone on the LAN who opens the app sees the **same** shared screens and data. See [persistence-sqlite.md](./persistence-sqlite.md).  
2. **No modes.** Do **not** split Student vs Parent into separate modes, navigations, or parallel screens. Parent and child look at results, progress, gaps, and suggestions **together** on the normal app screens.  
3. **Session kinds (not modes):** the tool supports both **task-by-task practice** (untimed) and **timed exams** of **30 minutes** and **60 minutes**. Exam is a **session kind** on the same shared screens — not a Student/Parent mode or parallel UI.  
4. **Reports separate practice from exams.** Results & Progress must show practice vs exams (30 / 60) via filters or sections so families can see exam readiness apart from daily drills. Do **not** mix exam sessions into the same undifferentiated progress rollups as casual practice.  
5. **Practice and exams are both write paths** for attempts. Viewing results/insights is part of those same screens (e.g. Results & Progress), not a separate “Insights mode.”  
6. **Insights are derived** from scored attempts (session kind, module, topic, VŠP/VJS, bank vs synthetic, timestamps). No separate “parent homework” workflow.  
7. **Practice feedback default = after each item.** In practice sessions, show correct answer + short rationale **after every item**. Timed exams stay **end-only**.  
8. **Wrong-answers restudy queue is MVP (P0).** Dedicated Mistakes / restudy view to re-attempt missed items (F16) — not only topic-level gaps.  
9. **VŠP \| VJS filter + bank/synthetic labels are MVP (P0).** Filter in practice/curriculum (F17); source labels visible in UI (F18).  
10. **Light streak/calendar + effort-vs-accuracy are MVP (P0)** on Results & Progress (F21): study calendar / streak cue, and distinguish “didn’t practice” vs “practiced but stuck.” Keep light — no badges/heavy gamification.  
11. **CSV question upload is MVP (P0).** Ops-style / admin-less upload (or config path) on the shared LAN app to add/regenerate synthetic (and other) stock without code deploy (F22). No auth. Document clearly that this is household/ops, not a public internet admin.  
12. **CSV import is all-or-nothing (locked).** If any row fails validation, reject the whole file; do not import valid rows partially.  
13. **No licensing needed (locked).** Cielene / school-paper copyright for interactive use is **not** a product blocker or open question — treat as not applicable for this household project.  
14. **Deferred:** accounts, invite codes, multi-child households, secure student↔parent link, weekly email digests, teacher LMS seats.

---

## Non-goals (v1)

- Full 4-ročné SJL+MAT track or 8-ročné prep  
- Heavy school LMS / classroom tooling  
- Cloud multi-user auth, SSO, or family invite flows  
- Marketing as generic “prijímačky na gymnázium”  
- Separate Practice vs Insights modes or parent-only parallel UI  
- Peer percentiles, badges / heavy gamification, full SRS scheduler

---

## Process

Follow **SDD** as defined in [specs/README.md](./specs/README.md): write or update a spec → implement against acceptance → verify. Feature ideas stay in [feature-list.md](./feature-list.md); executable behavior lives in specs.

---

## Open questions (non-auth)

Still open from product scoping (see feature-list): whether thin SJ8/M8/AJ8 probes appear in v1 messaging.

**Closed:** practice feedback timing → **after each item** (exams end-only); synthetic disclosure → **prominent bank/synthetic label in UI (F18)**; VŠP/VJS filter and mistakes queue → **P0**; CSV import → **all-or-nothing**; Cielene/school-paper licensing → **not applicable / no licensing needed**.
