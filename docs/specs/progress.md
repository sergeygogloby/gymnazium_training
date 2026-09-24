# Spec: Results & Progress (shared)

## Goal

Show the household how prep is going **together**: past sessions, accuracy/completion by **module and topic**, weak-topic gaps, 1–3 next-practice suggestions, **light streak / study calendar**, and **effort vs accuracy** — on the **same** Results & Progress screens (not a separate Insights mode).

**Reporting rule (locked):** **Practice** and **timed exams (30 / 60)** appear **separately** (filters or sections). Do not mix exam sessions into the same undifferentiated progress rollups as casual practice.

**Absorbs:** former standalone Insights behaviors (ex-V07). History remains **V05**; aggregate + gaps + suggestions + streak/effort live on **V06**.

## Actors

Anonymous household (parent and child look at the same screens). Cannot edit past answers from these views; may start a suggested practice session, Mistakes restudy, or an exam (write path = session specs).

## Views

- **V05 Session history**
- **V06 Results & Progress** (progress + gaps + suggestions + recent-activity + streak/calendar + effort vs accuracy; Practice \| Exams)
- **V07** retired — do not implement a separate Insights screen

## Behaviors

1. **History (V05):** list past sessions with date, module (and topic if set), score, duration, and **session kind** (`practice` / `exam_30` / `exam_60`); newest first. Support filter or tabs: **Practice** \| **Exams** (optionally 30 vs 60). Empty state explains that finishing a practice or exam session creates history.  
2. **Progress (V06):** for each M1–M6 (and topics when drilled), show simple completion and accuracy derived from attempts (F09) — **with practice rollups and exam rollups kept separate** (sections or filter), so daily drills do not inflate or obscure exam readiness. Optional drill-down or secondary cue by **VŠP \| VJS** when useful (same tags as F17).  
3. **Recent activity (V06):** last sessions, scores, time spent (F08) — kinds labeled; same data as history, summarized on the overview.  
4. **Gaps (V06):** highlight lowest-accuracy topics from attempt data (F10); default to **practice**-based gaps for “what to drill next” unless the UI is explicitly in an Exams section. Suggestions may link to **Mistakes** (F16 / V10).  
5. **Suggestions (V06):** 1–3 concrete next actions (e.g. finish M3 set, retry Mistakes, or take a 30/60 exam) (F11); actions can start practice, Mistakes, or exam sessions.  
6. **Exams section / filter:** show 30- and 60-minute exam scores and trends apart from practice so families can judge exam readiness.  
7. **Light streak / study calendar (F21):** show a simple consistency cue (e.g. days practiced this week / recent calendar marks from attempt timestamps). No badges, hearts, or social streaks.  
8. **Effort vs accuracy (F21):** surface a light distinction between **little/no practice** (low session count / time) vs **practiced but stuck** (sessions done, accuracy still low on a topic). Fair advice — not a complex analytics suite.  
9. Opening a history row may show session-level detail already stored (no re-grading required), including kind label.  
10. Empty state when no attempts: prompt to start practice or an exam from Curriculum — not to “link a child account.”  
11. No filter by “child account”; one shared household history. No Practice/Insights mode chrome.

## Data

- Read: attempt history (with `sessionKind`) and derived aggregates (F07–F11, F15, F21).  
- Write: none on these views (starting a suggested session uses practice, Mistakes, or exam write paths).

## Out of scope

- Separate Insights / parent-only screen (rejected)  
- Heavy gamification / badges / leaderboards  
- Compare to Okt–Mar plan calendar as a pacing engine (P2)  
- Per-user progress partitions  
- Weekly email summary (P1)  
- Multi-child household (P2)  
- Collapsing all session kinds into one unlabeled mastery total as the only view  
- Time-per-question / QPM heatmaps

## Acceptance

- [ ] After at least one practice and one exam session, History lists both with score, module, and kind.  
- [ ] User can filter or section by Practice vs Exams (30/60).  
- [ ] Practice progress rollups do not silently include exam attempts (and vice versa), or both are shown with clear labels — never one mixed unlabeled total as the only signal.  
- [ ] Progress reflects module/topic accuracy from stored attempts within the selected kind/section.  
- [ ] With sample attempts, shows at least one weak topic and 1–3 suggestions on Results & Progress.  
- [ ] Suggestion can start a practice session (and optionally Mistakes or an exam).  
- [ ] Light streak or study-calendar cue appears when there is dated activity (and a clear empty/low state when not).  
- [ ] Effort vs accuracy cue distinguishes “didn’t practice” from “practiced but stuck” on at least one sample dataset.  
- [ ] Views work with zero attempts (clear empty states; no account/invite language).  
- [ ] Accessible without login from primary nav; no separate Insights mode.  
- [ ] These views do not allow changing stored answers.
