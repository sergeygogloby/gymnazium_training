# Spec: Exam session (timed)

## Goal

Run a scored **timed exam** of fixed **30** or **60** minutes (`sessionKind=exam_30` | `exam_60`): serve tagged items under a countdown, capture answers without mid-exam answer keys, score at end, persist the attempt, and show an exam-labeled session result. Same shared screens as practice — **session kind**, not a mode/role.

## Actors

Anonymous household (shared app; exam is an attempt **write path** alongside practice).

## Views

- **V02 Curriculum** (or Practice entry) — choose exam duration  
- **V03 Practice / exam session** (exam behavior: timer, no mid-item keys)  
- **V04 Session result** (exam-labeled)  
- **V09 Item flag confirmation** (optional; flagging must not reveal the answer key during the exam)

## Behaviors

1. User starts an exam from Curriculum / Practice entry by choosing **30 min** or **60 min** (not untimed practice).  
2. Session runs with a visible countdown for the chosen duration; items one-by-one (or navigable set — keep UX simple); answer or skip. Optional VŠP \| VJS filter from Curriculum applies when the exam is scoped that way (F17).  
3. **No per-item answer key or correctness reveal while the clock is running.** Scoring and feedback happen when the session ends (time up, or user finishes early). **Source labels (F18)** may show bank/synthetic without revealing correctness.  
4. On end: compute score, persist attempt with timestamp, **`sessionKind=exam_30` or `exam_60`**, module/topic tags (if scoped), per-item outcomes, duration used (F06, F07, F15).  
5. Session result shows score, brief breakdown, clear **Exam · 30 min** or **Exam · 60 min** label, links to History / Results & Progress / Mistakes.  
6. Item flag (F13) may be available without revealing the key mid-exam; full review of answers belongs on the result / history / Mistakes path after close.

## Data

- Read: item bank + synthetic variants with tags (module, topic, VŠP/VJS, source type).  
- Write: attempt record with `sessionKind` ∈ {`exam_30`, `exam_60`} in **local / single-instance** storage (no user id).

## Out of scope

- Untimed practice behavior (see [practice-session.md](./practice-session.md))  
- Extra exam lengths beyond 30 and 60 in MVP  
- Separate “Exam mode” or Student/Parent role UI  
- Mixing exam attempts into practice-only progress totals (reporting rules in [progress.md](./progress.md))  
- Account-bound sync / invite flows

## Acceptance

- [ ] Start a 30-minute and a 60-minute exam without login.  
- [ ] Countdown matches the chosen duration; session ends on time-up or early finish.  
- [ ] No answer-key reveal during the timed run.  
- [ ] Score and feedback appear on session result after close.  
- [ ] Attempts persist with `exam_30` / `exam_60` and appear distinctly in history.  
- [ ] Uses the same V03/V04 shells as practice (no parallel exam app/mode chrome).
