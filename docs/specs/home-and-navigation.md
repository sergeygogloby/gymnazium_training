# Spec: Home and navigation

## Goal

Give the household a clear entry: this app is **bilingválne VŠP+VJS** prep, with plain navigation to **Curriculum**, **Practice**, **Mistakes**, and **Results & Progress** — shared screens, no login, **no modes**. Practice vs timed exams are **session kinds**, not nav modes. Light **Upload (ops)** entry for CSV question import on the trusted LAN.

**Formerly:** `home-and-modes.md` (Practice vs Insights modes — **removed**).

## Actors

Anonymous household on the local network. No accounts, roles, or mode switchers.

## Views

- **V01 Home**
- **V08 Onboarding / help** (reachable from Home)

## Behaviors

1. First viewport shows product name / brand, one short line that this is prep for **5-ročné bilingválne (VŠP + VJS)** for 8./9. ročník, and primary nav toward **Curriculum** / **Practice** / **Mistakes** / **Results & Progress** (exact labels may vary; must not present “Practice mode” vs “Insights mode”).
2. Curriculum → V02. Practice entry → start path via V02 or straight into a recommended session; from start flows the user can choose **untimed practice** or **timed exam (30 / 60)** as session kind. Mistakes → V10. Results & Progress → V06 (history via V05) with practice vs exam reporting, streak/effort. Upload → V11 (ops; may sit under Help or a light secondary nav — not a “mode”).
3. Help explains: practice shows feedback **after each item**; timed exams score at end (kinds: practice, exam 30, exam 60); Mistakes re-serves wrong answers; Results & Progress shows the same history **with practice and exams separated** (progress, gaps, suggestions, streak/calendar, effort vs accuracy) for parent and child **together**; CSV upload is a **trusted-LAN ops** way to add questions without deploy; app is open on the LAN.
4. No login, invite, “link parent,” or Student/Parent mode toggle appear.

## Data

None required beyond optional local “seen help” flag.

## Out of scope

- Accounts, grade-year account setup, secure family linking  
- Multi-child switcher  
- Separate Insights / parent mode  
- A top-level “Exam mode” parallel to Practice/Insights (exams are session kinds under the same nav)  
- English UI (P2)

## Acceptance

- [ ] Home loads without authentication.  
- [ ] Curriculum, Practice, Mistakes, and Results & Progress are reachable from Home without a mode switcher.  
- [ ] Upload (CSV) is reachable as a documented ops/LAN entry (Home secondary, Help, or clear ops link).  
- [ ] Copy states VŠP+VJS bilingual positioning (not generic 4-ročné).  
- [ ] Help (or start copy) mentions practice vs timed exams (30/60), per-item practice feedback, Mistakes, and LAN CSV upload without introducing modes.  
- [ ] No invite-code, login, or Practice/Insights mode UI.
