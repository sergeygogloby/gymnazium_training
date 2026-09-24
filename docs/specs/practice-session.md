# Spec: Practice session

## Goal

Run a scored **untimed** practice session (`sessionKind=practice`): serve tagged items, capture answers, show **feedback after each item**, persist the attempt, and show a session result. Distinct from timed exams — see [exam-session.md](./exam-session.md). Mistakes-scoped starts: [mistakes-restudy.md](./mistakes-restudy.md).

## Actors

Anonymous household (shared app; practice is one attempt **write path** alongside exams).

## Views

- **V03 Practice / exam session** (practice behavior)
- **V04 Session result**
- **V09 Item flag confirmation** (optional path)

## Behaviors

1. Session starts from Curriculum, Recommended, or Mistakes with a defined item set for the chosen module/topic (or mistakes queue); user chooses **Practice** (untimed), not a timed exam duration.  
2. Optional **VŠP \| VJS filter** (F17) applies when starting from Curriculum / Practice entry — session items respect the filter.  
3. Items shown one-by-one; user can answer or skip. No countdown clock.  
4. **After each item (locked):** show correct answer and short rationale (F05). Do not defer practice feedback to session end.  
5. **Source label (F18):** each item shows **bank** or **synthetic** (and skill area when useful) so the household knows the provenance.  
6. On finish: compute score, persist attempt with timestamp, **`sessionKind=practice`**, module/topic tags, per-item outcomes, duration (F06, F07).  
7. Session result shows score, brief breakdown, clear **Practice** label, links to History / Results & Progress / Mistakes / suggested next (F11).  
8. User may flag a bad item (F13); confirm on V09; store a local flag record — no admin login required for the flag action.

## Data

- Read: item bank + synthetic variants with tags (module, topic, VŠP/VJS, source type) — including CSV-imported items ([question-csv-upload.md](./question-csv-upload.md)).  
- Write: attempt record (`sessionKind=practice`) and optional item-flag records in **local / single-instance** storage (no user id).

## Out of scope

- Timed exam sessions (F15 — see [exam-session.md](./exam-session.md))  
- Account-bound history sync across devices  
- Parent invite / read-only account  
- Separate Insights mode after session (use shared Results & Progress)  
- End-of-session-only practice feedback (rejected — default is per-item)

## Acceptance

- [ ] Complete a practice session without any login.  
- [ ] Each answered item has correct/incorrect/skipped stored with tags.  
- [ ] Feedback shows answer key **after each item** (not only at session end).  
- [ ] Bank vs synthetic (and VŠP/VJS when filtered) is visible on items.  
- [ ] Attempt appears in session history after close with kind = practice.  
- [ ] Flagging an item records a local report without admin auth.  
- [ ] Practice attempts are distinguishable from exam attempts in storage and UI.
