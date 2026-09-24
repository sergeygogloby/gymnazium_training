# Product feature list — bilingválne gymnázium (VŠP + VJS) training

**Audience:** decision-making (scope / MVP cut)  
**Related:** [materials-structure.md](./materials-structure.md) · [project-context.md](./project-context.md) · [functions-and-views.md](./functions-and-views.md) · [competitive-feature-gap.md](./competitive-feature-gap.md)  
**Target:** Slovakia, 8./9. ročník → **5-ročné bilingválne** entrance (VŠP + VJS), curriculum M1–M6 from Cielene VSJP8 pack  
**Non-goals for v1:** full 4-ročné SJL+MAT track; 8-ročné (5. ročník); heavy school LMS / teacher classroom tooling; **accounts / login / invite-based family linking**; **Practice vs Insights modes** (locked — see Decision below)

> **Decision (locked):** No authorization or accounts. App runs on a **local family network**. **No modes** — parent and child look at the **same** practice results, progress, gaps, and suggestions **together** on shared screens. The tool supports **both** untimed task-by-task practice **and** timed exams (**30 min** / **60 min**); reports show them **separately**. Practice feedback = **after each item**; exams = **end-only**. Gaps 1–4 from competitive research (mistakes queue, VŠP/VJS filter, bank/synthetic labels, light streak + effort-vs-accuracy) and **CSV question upload** are **P0/MVP**. See [project-context.md](./project-context.md).

---

## Product framing

A webapp where an **8./9. ročník student** trains for **bilingual gymnázium** aptitude exams through **untimed practice** (item-by-item, **feedback after each item**) and **timed exams (30 / 60 min)** built from **existing Cielene / real-exam items** plus **synthetic variants**, sees **answers and explanations**, and builds skill by **module (M1–M6)** and **topic**. A **parent** sits with the learner (or opens the same app on the LAN) and sees **progress, weak topics, streak/calendar, effort vs accuracy, and what to practice next on those same Results & Progress screens**—with **practice vs exam results kept separate**—not a linked parent view or separate Insights mode, and without grading PDFs. **Mistakes restudy**, **VŠP \| VJS filters**, and **bank/synthetic labels** are first-class. Light **ops** keeps content usable (ingest keys, flag bad items, **CSV upload** of new questions)—not as a classroom product and not behind user accounts.

---

## Priority legend

| Priority | Meaning |
|---|---|
| **P0 Must** | Required for a usable first product (student can train; household can see that training) |
| **P1 Should** | Strongly improves retention / trust / exam realism; plan for soon after MVP |
| **P2 Could** | Valuable later; skip if it delays ship |

---

## Dependency note (shared results)

Progress, gaps, and suggestions are **derived**, not separate data entry. Every “parent-facing” capability below assumes:

1. Someone completes sessions with **scored answers** (correct / incorrect / skipped) tagged by **module, topic, skill area (VŠP vs VJS), source type (bank vs synthetic)**.  
2. Results are stored per attempt with **timestamps** and **session kind** (`practice` \| `exam_30` \| `exam_60`).  
3. The household reads the **same attempt history** on the **same screens**—no parallel “parent homework” workflow and no Insights mode in v1.  
4. **Reports split practice from exams:** filters or sections (Practice \| Exams 30/60) so exam readiness is not mixed into casual-practice rollups.

If practice logging is incomplete, gap/suggestion features cannot ship honestly.

---

## Student features

### P0 — Must

| Feature | Purpose |
|---|---|
| **~~Account + grade year (8./9.)~~ → optional local grade hint** | **Deferred as account.** Optional local setting later; practice must work without any profile. |
| **Curriculum path M1–M6** | Give a clear sequence matching the VSJP8 monthly/topic map so practice is not a flat question dump. |
| **Practice session (untimed)** | Core loop: pick module/topic (or “recommended”), answer items one-by-one, finish a session, see score. Session kind = `practice`. |
| **Timed exam (30 min / 60 min)** | Exam-day readiness on the **same shared screens**: choose fixed **30** or **60** minutes, answer under the clock, **score at end**. Session kinds = `exam_30` / `exam_60` — not a mode/role. |
| **Immediate feedback + answer key (practice)** | In **practice**, after **each item**, show correct answer and short rationale so training teaches. **Exams:** end-only scoring/feedback. **Locked default.** |
| **Existing question bank** | Serve digitized Cielene exercises, author tests, and real-exam items as the trusted baseline content. |
| **Synthetic / variant questions** | Extend scarce item types (esp. VJS coding, foreign-text style) so sessions do not exhaust the finite PDF set too fast. |
| **Session history & results** | List past sessions with date, module, score, duration, and **session kind** so the household can resume a study habit and tell drills from exams. |
| **Progress by module & topic** | Simple mastery/accuracy view across the 12 topics / 6 modules — **practice and exam rollups shown separately** (filters or sections). |
| **Separate practice vs exam reporting** | Results & Progress must not mix timed exams into the same undifferentiated progress totals as casual practice. |
| **Review wrong answers (mistakes / restudy queue)** | Dedicated Mistakes view so weak items get re-attempted without replaying whole tests (F16). |
| **Source label (bank vs synthetic)** | Transparency so learners trust keys and know when an item is AI/generated-style practice (F18). |
| **VŠP vs VJS filter** | Practice / curriculum filter for verbal/quantitative aptitude or language-aptitude blocks when the target school emphasizes one (F17). |

### P1 — Should

| Feature | Purpose |
|---|---|
| **On exam result: simple pace note** | One-line unfinished / time-left cue on exam results only (not QPM charts). |

### P2 — Could

| Feature | Purpose |
|---|---|
| **School checklist (exam type)** | Help families confirm target school uses VŠP+VJS vs SJL+MAT hybrid before over-investing in one path. |
| **Thin SJ8 / M8 / AJ8 probes** | Optional subject probes for hybrid bilingual schools; not the core curriculum. |
| **Offline / printable session sheet** | Export a short paper set for travel or parental oversight without the app open. |
| **Spaced repetition schedule** | Longer-horizon revisit of missed topics beyond simple “recommended next.” |

---

## Parent features

> **Same-screen note:** These are **not** a linked parent view or Insights mode. They appear on the **shared Results & Progress** (and related) screens that the family uses together. Labels below keep “parent” wording only as product intent (household oversight), not as a separate UI role.

### P0 — Must

| Feature | Purpose |
|---|---|
| **~~Insights mode (read-oriented)~~ → Results & Progress sections** | Activity and outcomes without editing answers — **on the same screens** as practice history/progress. **No linked account**, no separate mode. |
| **Progress overview** | At-a-glance completion and accuracy by module (M1–M6) so the household knows if prep is on track — **with practice vs exam distinction**. |
| **Recent activity** | Last sessions, scores, and time spent—proof of practice and exams without nagging for screenshots; kinds labeled. |
| **Gap / weak-topic report** | Highlight lowest-accuracy topics (e.g. graphs, synonyms, šifrovanie) derived from session data (typically practice-driven for drills). |
| **Next-practice suggestions** | 1–3 concrete next actions (“finish M3 quantitative set”, “retry T6 mistakes”) driven by session results. |
| **Exam readiness on Results & Progress** | Timed exam scores (30 / 60) visible apart from daily drills so families can judge exam readiness. |
| **Streak / study calendar (light)** | Lightweight consistency cue for the 6-month prep arc without gamification noise (F21). |
| **Effort vs accuracy** | Distinguish “didn’t practice” from “practiced but stuck” so advice is fair (F21). |

### P1 — Should

| Feature | Purpose |
|---|---|
| **Weekly summary** | Digestible email or in-app weekly rollup (sessions done, trend up/down, top gap). |
| **Shareable progress snapshot** | One-page summary for tutors/grandparents (export/print). Not about account boundaries. |

### P2 — Could

| Feature | Purpose |
|---|---|
| **Goal date (exam day)** | Countdown and pacing hints toward the chosen prijímacie date. |
| **Compare to plan (Okt–Mar)** | Map progress against the original 6-month Cielene plan for families who follow that calendar. |
| **Multi-child household** | **Deferred** (would need identity; conflicts with no-auth MVP). |

---

## Shared features

### P0 — Must

| Feature | Purpose |
|---|---|
| **Slovak UI (primary)** | Match the language of the materials and the exam; English optional later. |
| **~~Secure student ↔ parent link~~** | **Deferred / rejected for MVP.** Household trust = local network; shared open screens. |
| **Content tagging model** | Every item carries module, topic, VŠP/VJS, and bank/synthetic flags—required for both practice routing and shared reports. |

### P1 — Should

| Feature | Purpose |
|---|---|
| **Onboarding: product positioning** | Clear copy that this is **bilingválne VŠP+VJS**, not generic 4-ročné SJL+MAT, to set correct expectations. |
| **Help / how sessions work** | Short explanation of **practice vs timed exams (30/60)**, per-item practice feedback, Mistakes restudy, and how answers and Results & Progress (split reporting) work. |

### P2 — Could

| Feature | Purpose |
|---|---|
| **Bilingual UI (SK/EN)** | Convenience for mixed-language households; content remains Slovak-exam oriented. |

---

## Admin / teacher (optional, minimal)

Only if essential for the product to run. **Not** a classroom LMS. **No auth** — LAN/ops surfaces on the shared app (document clearly).

| Priority | Feature | Purpose |
|---|---|---|
| **P0** | **Content publish / hide** | Take down bad or copyright-sensitive items without redeploying the app. |
| **P0** | **Flag / report bad item** (student-initiated → local ops queue) | Close the loop when a synthetic or digitization error mis-keys an answer. **No admin login** required for the flag action. |
| **P0** | **CSV question upload** | Upload new questions (esp. synthesized) from time to time via CSV — regenerate/add stock without code deploy (F22). Validate all rows; **all-or-nothing** — any bad row rejects the whole file (no partial import); clear per-row errors. Uploaded items enter the same tagged bank (`sourceType` bank \| synthetic). |
| **P1** | **Bulk import metadata polish** | Extra tooling beyond CSV upload when loading large bank corpora. |
| **P2** | **Teacher/tutor read-only seat** | Optional later; household oversight covers v1. |

---

## Suggested MVP cut (decision aid)

Ship when the household can: **open M1–M6 → filter VŠP/VJS → run a scored practice session (feedback after each item) and a timed exam (30 or 60) on bank + synthetic items (labels visible) → re-attempt mistakes from the Mistakes queue → open Results & Progress and see practice vs exam outcomes separately**, plus gaps, next suggestions, **light streak/calendar**, and **effort vs accuracy** from that same local data — **and ops can CSV-upload new questions on the LAN app without a deploy** — **on shared screens, with no accounts and no Practice/Insights modes**. Defer weekly email, school checklist, subject probes, and any auth/invite flows unless they are cheap once the tagging model exists.

---

## Open product questions

1. **Family model:** ~~shared login vs parent invite?~~ ~~Practice vs Insights modes?~~ **Decided:** no auth; **no modes**; shared family screens on the local network.  
2. **Session kinds:** ~~practice only vs timed mocks later?~~ **Decided:** both **practice** (untimed) and **timed exams (30 / 60)** in MVP; reports keep them separate.  
3. **Feedback timing (practice):** ~~per item vs end?~~ **Decided:** **after each item** in practice; exams end-only.  
4. **Synthetic disclosure & trust:** ~~how prominently?~~ **Decided:** prominent **bank vs synthetic** label in UI (F18). Answer-key QA ownership before counting toward “mastery” remains a content ops practice (not a product open Q blocking MVP).  
5. **Copyright / licensing of Cielene & school papers:** ~~what may be digitized into an interactive bank vs remain PDF-only reference?~~ **Decided / not applicable:** no licensing needed for this household project — not a blocker or open Q.  
6. **Hybrid bilingual schools:** do we surface thin SJ8/M8/AJ8 probes in v1 messaging, or keep the product strictly VŠP+VJS until content depth exists?

---

## Blockers for this doc

None. Feature list is product-scope only. Content licensing is closed (N/A). Remaining open Q is thin SJ8/M8/AJ8 probe messaging only.
