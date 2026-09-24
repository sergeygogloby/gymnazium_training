# Spec: Curriculum

## Goal

Let the learner browse **M1–M6** and their topics, optionally filter by **VŠP \| VJS**, and start an **untimed practice** session or a **timed exam** (30 / 60 min), or a recommended practice session.

## Actors

Anonymous household (shared app; no mode switcher).

## Views

- **V02 Curriculum**

## Behaviors

1. List modules **M1–M6** with short titles aligned to [materials-structure.md](../materials-structure.md).  
2. Expanding / opening a module shows its topics (two per module in the VSJP8 map).  
3. **VŠP \| VJS filter (F17):** user can filter the curriculum / startable content by skill area so practice focuses on aptitude or language blocks when needed. Filter applies to what is offered for practice (and optionally exam scope when exams are module/topic-scoped).  
4. Actions: **Start practice** (untimed) on a module or topic; **Start exam** with fixed **30 min** or **60 min**; optional **Recommended** entry that uses next-practice suggestions (F11) when history exists, otherwise defaults to M1 / first unfinished (recommended defaults to practice unless copy offers an exam).  
5. **Source labels (F18)** are not required on the curriculum list itself but must appear once items are in a session; curriculum may optionally show counts by bank/synthetic.  
6. Session kind is chosen here (or on the Practice entry) — not via a Student/Parent or Practice/Insights mode.  
7. Do not require selecting a grade year or account before starting.

## Data

- Read: curriculum metadata (module, topic, VŠP/VJS tags via F12).  
- Write: none until session start (see [practice-session.md](./practice-session.md) / [exam-session.md](./exam-session.md)).

## Out of scope

- Exam lengths other than 30 and 60 in MVP  
- School checklist (P2)  
- Thin SJ8/M8/AJ8 as primary path (optional later)

## Acceptance

- [ ] All six modules are visible and selectable.  
- [ ] User can filter by VŠP and/or VJS before or while choosing what to practice.  
- [ ] User can start a practice session from a module or topic without logging in.  
- [ ] User can start a 30-minute or 60-minute exam without logging in.  
- [ ] Recommended path works with empty history (sensible default) and with history (uses weak/unfinished signal when available).
