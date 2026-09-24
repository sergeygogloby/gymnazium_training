# Spec: Mistakes / restudy queue

## Goal

Give the household a **dedicated Mistakes view** to re-attempt items answered incorrectly (or skipped, if product treats skips as restudy-eligible), without replaying whole past tests. Closes the teach cycle that topic-level gaps alone do not cover.

## Actors

Anonymous household (shared screens; no auth).

## Views

- **V10 Mistakes / restudy**
- Reuses **V03** / **V04** for the re-attempt session and result

## Behaviors

1. **Queue (V10):** list missed items derived from attempt history (incorrect; optionally skipped — product may default to incorrect-only). Show stem preview, module/topic, skill area, **source label** (bank/synthetic), and last-missed date when available.  
2. Empty state: explain that finishing practice/exams with wrong answers fills this list; link to Curriculum / Practice.  
3. **Start restudy:** user starts a practice session scoped to selected items or the whole queue (F16 → F02/F03). Session kind remains **`practice`**; feedback still **after each item** (F05).  
4. After a correct re-attempt, item leaves the active queue (or moves to a “recently cleared” state — keep simple: remove from active Mistakes when answered correctly in a restudy session).  
5. Entry points: primary nav **Mistakes**; links from session result (V04), gaps/suggestions on Results & Progress (V06).  
6. Optional filters on V10: module, topic, **VŠP \| VJS** (F17), source type — same tagging model (F12).  
7. No separate “parent mistakes” or Insights mode.

## Data

- Read: attempt history (per-item outcomes) + content catalog.  
- Write: new practice attempt records when restudy session runs (F06, F07).

## Out of scope

- Full spaced-repetition scheduler (P2)  
- Exam-mode restudy under a clock (restudy is untimed practice)  
- Auth-partitioned mistake lists per child

## Acceptance

- [ ] After at least one incorrect practice/exam answer, Mistakes shows that item (or a clear queue entry).  
- [ ] User can start a re-attempt session from Mistakes without login.  
- [ ] Re-attempt session uses per-item feedback and source labels.  
- [ ] Correct re-attempt clears (or dequeues) the item from the active Mistakes list.  
- [ ] Reachable from primary nav and from Results / session-result links.  
- [ ] Empty state is clear when no mistakes exist.
