# Competitive feature gap — preparation & insights for MVP

**Status:** research from public marketing / help / product pages (not app reverse-engineering)  
**Compared against locked MVP:** [project-context.md](./project-context.md) · [feature-list.md](./feature-list.md) · [functions-and-views.md](./functions-and-views.md)  
**Locks honored:** no auth; local LAN; no parent/student modes; practice + timed exams (30/60) with separate reports; bilingual VŠP+VJS Slovakia 8./9.

> **MVP acceptance note (locked):** Recommended additions **gaps 1–4** from §6 are now **accepted into P0/MVP** — (1) wrong-answers restudy queue (F16), (2) practice feedback default = after each item, (3) VŠP\|VJS filter + bank/synthetic labels (F17, F18), (4) light streak/calendar + effort-vs-accuracy (F21). Plus **CSV question upload (F22)**. See project-context / feature-list / functions-and-views / specs. This research file is otherwise unchanged.

---

## 1. Method & tools reviewed

**Method:** Read public sites, shops, FAQs, and help centers for products that either (a) prepare Slovak/Czech learners for gymnázium / aptitude entrance exams, or (b) embody the practice → mock → feedback → progress → family-visibility loop. Feature claims below are taken from those pages only. No private product access; no inventing capabilities beyond documented marketing copy.

**Tools reviewed (~8):**

| # | Tool | Why similar | Primary public sources |
|---|---|---|---|
| 1 | **Cielene** (SK) | Same exam target (VŠP+VJS bilingválne); curriculum packs, explained tests, timed “prijímačky nanečisto” | [Services overview](https://cielene.sk/priprava-v-cielene-sluzby-a-produkty/), [VŠP+VJS shop](https://www.cielene.shop/testy-priprava-bilingvalne-gymnazium/priprava-na-bilingvalne-gymnazium-vsp-vsj/), [VSJP8 predplatné](https://www.cielene.shop/produkt/mudre-predplatne-z-vseob-stud-predpokladov-a-jazyk-schopnosti-vsjp8-komplet/), [Hybrid course UX](https://www.cielene.shop/courses/hybridny-kurz-vsjp8-basic-h2a/) |
| 2 | **EXAMINO** (Exam Testing, SK) | Closest digital peer: interactive practice + timed tests for VŠP/VJS + parent visibility | [Home](https://examino.sk/), [FAQ](https://examino.sk/casto-kladene-otazky), [For schools](https://examino.sk/pre-skoly), [Exam.sk overview](https://exam.sk/examino/) |
| 3 | **Freedu** (+ Examino) | Course + mock simulations + family account with sim results & feedback | [Bilingválne](https://freedu.sk/priprava-na-prijimacky/bilingvalne-gymnazium), [FAQ](https://www.freedu.sk/najcastejsie-otazky), [Examino howto](https://wp.freedu.sk/ako-pracovat-s-examino/), [Freedu konto](https://freedu.home.fugosoft.net/blog/rady-pre-rodicov/181-freedu-konto-vsetko-dolezite-o-kurze-na-jednom-mieste) |
| 4 | **Scio** (CZ/SK aptitude) | Timed full mocks, exam-realistic timing/sections, detailed scoring + percentile | [Free prep](https://www.scio.cz/priprava-zdarma), [Online OSP mock](https://www.scio.cz/on-line-test-nsz-osp) |
| 5 | **Khan Academy** | Canonical family-visible progress / activity / mastery reports | [Parent reports](https://support.khanacademy.org/hc/en-us/articles/36120531499789-What-reports-can-I-use-as-a-parent-to-monitor-my-child-s-activity-on-Khan-Academy), [Parent dashboard](https://support.khanacademy.org/hc/en-us/articles/360039664491-What-can-I-do-from-the-Khan-Academy-Parent-Dashboard) |
| 6 | **Quizlet** | Practice mastery buckets + targeted restudy of weak items | [Progress for targeted studying](https://help.quizlet.com/hc/en-us/articles/360048803491-Using-Progress-for-targeted-studying), [Studying overview](https://help.quizlet.com/hc/en-us/articles/360030841732-Studying-on-Quizlet) |
| 7 | **Examin / Exam Edge–class mocks** | Timed CBT-style mocks + domain analytics, weak areas, attempt trends | [Examin](https://www.examin.co.in/), [Exam Edge](https://www.examedge.com/) |
| 8 | **Anki** (insights only) | Local-first review stats / retention — useful contrast for “insights without cloud family roles” | [Anki Manual — Statistics](https://docs.ankiweb.net/stats.html) |

**Out of primary set (noted, not scored as peers):** Duolingo Family Plan / streaks ([help](https://www.duolingo.com/help/family-plan), [blog](https://blog.duolingo.com/plus-family-plan/)) — habit cues only; not aptitude-exam prep. Static PDF banks (e.g. prijimacie.sk) — content, not interactive training+insights products.

---

## 2. Common “successful training” patterns (from public docs)

Across regional and general products, public copy converges on this loop:

| Pattern | What public docs emphasize | Seen strongly in |
|---|---|---|
| **A. Curriculum / topic path** | Sequenced topics / monthly plan — not a flat question dump | Cielene Múdre predplatné; EXAMINO učivo by ročník/téma; Freedu thematic lessons |
| **B. Untimed practice with immediate feedback** | Correct/incorrect right away + explanation so drills teach | EXAMINO “cvičné otázky”; Cielene video/worksheets with riešenie; Quizlet Learn/Progress |
| **C. Timed full mocks, score at end** | Clock, exam-like conditions, feedback deferred until finish | EXAMINO timed tests; Cielene / Freedu simulácie & prijímačky nanečisto; Scio online tests; Examin |
| **D. Explained answer keys** | Rationale, not only right/wrong | Cielene vysvetľujúce riešenia; Exam Edge explanations; Scio solved samples |
| **E. Progress by topic / domain** | Mastery or accuracy broken down by subject area | Khan activity/mastery; Quizlet Not studied / Still learning / Mastered; Exam Edge domain heatmaps; EXAMINO parent “rozsah + úspešnosť” |
| **F. Weak-area identification** | Explicit gaps so next study is targeted | EXAMINO / Freedu “nedostatky”; Examin weak areas; Quizlet still-learning; Anki lapse/retention stats |
| **G. Next action / targeted restudy** | Recommend what to do next; re-drill mistakes | Khan recommend/assign; Quizlet Progress → review subset; Exam Edge review mode; Freedu lecturer recommendations |
| **H. Attempt history & trends** | Past sessions, score over time | Khan activity; Freedu konto sim history; Scio/Examin re-attempts; Anki stats |
| **I. Family-visible oversight** | Parent sees activity without revising answers for the child | EXAMINO rodičovská kontrola; Freedu konto; Khan Parent Dashboard |
| **J. Consistency cue (light)** | Streaks / calendar / badges to sustain months of prep | EXAMINO odznaky; Duolingo streaks (habit analog); Anki daily review counts |
| **K. Peer percentile / ranking** | Compare to cohort | Scio percentile; Cielene / Freedu sim výsledkové listiny |
| **L. Accounts, roles, assignments** | Child vs parent vs teacher logins; homework push | EXAMINO / Freedu / Khan / Quizlet Class Progress |

Patterns **A–I** are the core of “successful training + insights.” **J** helps retention over a 6-month arc. **K–L** are commercial/platform defaults — powerful for multi-family cloud products, weak fit for a trusted LAN household with no auth.

---

## 3. Coverage matrix (pattern → our locked MVP)

Status key: **Have** (P0 locked) · **Partial** (exists but thinner than peers, or open detail) · **Missing** (not in locked list) · **Intentionally out** (rejected / deferred by locks)

| Pattern | Our status | Evidence in our docs | Notes vs peers |
|---|---|---|---|
| A. Curriculum path M1–M6 | **Have** | F01, Curriculum view | Matches Cielene monthly map intent |
| B. Untimed practice + feedback | **Have** | F02–F05; **locked:** after each item | EXAMINO defaults to immediate; we match |
| C. Timed exams 30/60, end scoring | **Have** | F15; separate session kinds | Stronger than PDF-only; on par with EXAMINO/Scio mock idea (without percentile) |
| D. Answer key / rationale | **Have** | Practice feedback; exams at end | Depends on content QA of bank + synthetic |
| E. Progress by module & topic | **Have** | F09; practice vs exam sections | Matches Khan/Quizlet domain breakdown shape |
| F. Gap / weak-topic report | **Have** | F10 on Results & Progress | Same job as EXAMINO “nedostatky” without separate parent app |
| G. Next-practice suggestions | **Have** | F11 (1–3 actions) | On par with “recommend next”; thinner than tutor-written Freedu feedback |
| G2. Dedicated mistakes queue | **Have** (accepted MVP) | F16 → **P0** | Quizlet/Exam Edge treat restudy of wrongs as first-class |
| H. Session history + kinds | **Have** | F07–F08; Practice \| Exams filters | Better than mixed rollups; peers rarely separate drill vs mock this clearly |
| I. Family-visible oversight | **Have** (shared screens) | Locked no modes; V06 | Same *outcome* as EXAMINO parent view; **no** separate parent account (Intentionally out) |
| J. Streak / study calendar | **Have** (accepted MVP, light) | F21 → **P0** on Results & Progress | Peers use badges/streaks; we keep light calendar/streak only |
| K. Peer percentile / ranking | **Intentionally out** | Non-goal for LAN v1 | Needs cohort cloud; Cielene/Scio/Freedu strength we wisely skip |
| L. Auth / parent invite / LMS | **Intentionally out** | Project-context deferred | EXAMINO/Khan require accounts — conflicts with locks |
| VŠP vs VJS practice filter | **Have** (accepted MVP) | F17 → **P0** | Peers separate subjects; filter in practice/curriculum |
| Source transparency (bank vs synthetic) | **Have** (accepted MVP) | F18 → **P0** labels in UI | Trust pattern peers get via “official past papers” branding |
| Effort vs accuracy | **Have** (accepted MVP, light) | F21 → **P0** on Results & Progress | Distinguish didn’t practice vs practiced but stuck |
| Time-per-question / speed analytics | **Missing** | Not listed | Common on Examin/Exam Edge; nice-to-have, not core for family readiness |
| Weekly email digest | **Intentionally out** / deferred P1 | Needs identity/email | Freedu/Khan push digests; LAN can open Results & Progress |
| Full spaced-repetition scheduler | **Intentionally out** (P2) | Feature-list P2 | Anki’s core; overkill for exam-session product |
| Theory / video lessons | **Intentionally out** (content packaging) | We are practice+exam app | Cielene/EXAMINO teach; we assume bank+synthetic + keys |
| Badges / heavy gamification | **Intentionally out** | — | EXAMINO odznaky — noise for household LAN |
| Multi-child / teacher seats | **Intentionally out** | Deferred | Cloud classroom pattern |

---

## 4. Per-tool snapshot (practice / mocks / feedback / progress / parents / gaps)

### Cielene
- **Practice:** Monthly plan, theory, worksheets, author + real tests (mostly PDF/video self-study).  
- **Mocks:** Timed “prijímačky nanečisto”; many in-course tests under time.  
- **Feedback:** Detailed written/video solutions; parent verbal % feedback in courses.  
- **Progress / parents:** Plan adherence + course evaluations; not a continuous app mastery graph.  
- **vs us:** We digitize the *interactive* loop they sell as packs/courses. We lack live lecturers and cohort percentiles — correctly out of scope.  
- **Gap we lack:** none material for an app if content + keys exist.  
- **Wisely skip:** classroom courses, postal packs, psych poradňa.

### EXAMINO
- **Practice:** Immediate-feedback cvičné otázky by topic.  
- **Mocks:** Timed tests; result after finish.  
- **Feedback:** Instant on drills; end on tests; gaps called out.  
- **Progress / parents:** Parent account sees coverage, test success, assigned homework. Badges. Auth required.  
- **vs us:** Feature-shaped twin for VŠP/VJS digital prep. Our shared Results & Progress covers the *oversight job* without parent mode.  
- **Gap we lack (material):** dedicated wrong-answer restudy queue (their practice loop naturally re-serves weak items via topic choice + feedback).  
- **Wisely skip:** parent login, school homework assignment, badges.

### Freedu (+ Examino)
- **Practice + mocks:** Course + Examino + multiple full simulations with answer sheets and time pressure.  
- **Feedback / parents:** Freedu konto — sim scores over time, lecturer written feedback.  
- **vs us:** Human coaching layer. Our suggestions are algorithmic 1–3 actions — enough for solo household training if data is honest.  
- **Wisely skip:** attendance, Teams, tutor seats, percentiles.

### Scio
- **Practice:** Short free samples; paid full past-exam online mocks.  
- **Mocks:** Strict timing, sections, unlimited retakes, **percentile**.  
- **Progress:** Per-test evaluation; not a 6-month household curriculum OS.  
- **vs us:** Validates timed mocks + detailed post-score. Percentile needs population — out for LAN.  
- **Wisely skip:** account-gated paid catalog, peer norms.

### Khan Academy
- **Practice / progress / parents:** Activity minutes, skills practiced/mastered, assignments, parent dashboard.  
- **vs us:** Confirms that family oversight = recent activity + mastery + gaps on readable screens. We already map this to V06 without roles.  
- **Wisely skip:** parent role switcher, assignment push, AI parent tools.

### Quizlet
- **Practice / insights:** Mastery buckets; restudy Still Learning / missed terms.  
- **vs us:** Argues for elevating **mistakes / weak-item restudy** beyond topic-level gaps.  
- **Wisely skip:** Class Progress (teacher LMS).

### Examin / Exam Edge–class
- **Mocks + analytics:** Timer, domain accuracy, time/question, trends, review mode.  
- **vs us:** We have readiness via exam_30/60 history; we do **not** need QPM heatmaps for a family LAN MVP.  
- **Optional later:** light time-spent on exam results only.

### Anki
- **Insights:** Local stats, retention, review history — no parent roles.  
- **vs us:** Reinforces that rich insights can be single-store / no-auth. Full SRS scheduler remains P2.

---

## 5. Verdict

**Yes, with caveats — our locked preparation + insights list is full enough for successful family training.**

Public docs from the closest regional apps (EXAMINO, Cielene, Freedu) and from general mastery/mock products (Khan, Quizlet, Scio, Examin-class) all describe the same successful core: **curriculum path → practice with explanations → timed mocks → topic progress → weak spots → concrete next actions → household can see it**. Our P0 set (**F01–F15**, Results & Progress with practice/exam split, shared screens) covers that core. We are **not** missing a second Insights product or parent portal to be “complete enough.”

**Caveats (do not block the “full enough” call, but affect quality):**
1. **Content + keys** must be real (bank + synthetic QA) — peers win on author/real-exam keys; our features cannot compensate for wrong keys.  
2. **Practice feedback timing** should default toward **per-item** (EXAMINO pattern) unless usability testing says otherwise.  
3. **Wrong-answer restudy** is the one training-loop gap peers treat as first-class while we leave it P1 (gaps/suggestions partially substitute).  
4. No peer percentiles / tutor narrative — acceptable under LAN constraints; exam score history substitutes for “readiness.”

---

## 6. Recommended additions (only if they materially improve outcomes)

Respecting **no-auth / LAN / shared UI**.

| Priority | Addition | Why material | Fit with locks |
|---|---|---|---|
| **P0 (near-MVP) → Accepted MVP** | **Wrong-answers restudy queue** (promote current F16) | Quizlet/Exam Edge/EXAMINO loops close the teach cycle; topic gaps alone don’t re-serve missed *items* | Same screens; filter history by incorrect; no auth |
| **P0 (clarify) → Accepted MVP** | **Default practice feedback = after each item** | Matches EXAMINO “učenie cez okamžitú spätnú väzbu”; exams stay end-only | Already allowed; locked in practice-session spec |
| **P1 → Accepted MVP** | **VŠP \| VJS practice filter** (F17) | Peers sell aptitude blocks separately; bilingual schools may weight one | Curriculum/Practice filter only |
| **P1 → Accepted MVP** | **Prominent bank vs synthetic label** (F18) | Trust substitute for “official past paper” branding | Display tag already in F12 |
| **P1 → Accepted MVP** | **Light streak or study calendar** | Supports Oct–Mar consistency without badges | Local timestamps; no social — F21 |
| **P1 → Accepted MVP** | **Effort vs accuracy on Results** (time spent / sessions vs score) | Helps household distinguish “didn’t practice” vs “stuck” (Khan-ish fairness) | Derived from F07; shared V06 — F21 |
| **P1 (thin)** | **On exam result: simple pace note** (e.g. unfinished / time left) | Mock platforms stress time management; keep to one line, not QPM charts | Exam session result only |

**Do not promote to MVP:** weekly email, goal-date pacing engine, full SRS, printable packs, school checklist, SJ8/M8/AJ8 probes — valuable later, not required for the training+insights loop peers document as essential.

---

## 7. What we should NOT add (overkill for family LAN)

| Skip | Why peers have it | Why we shouldn’t for v1 |
|---|---|---|
| Accounts / parent invite / child profiles | Cloud multi-device identity | Locked; LAN shared store is the trust model |
| Separate Parent / Insights mode | EXAMINO/Khan dashboards | Locked; same screens already deliver oversight |
| Peer percentile / výsledková listina | Scio, Cielene nanečisto, Freedu sims | Needs cohort cloud; vanity for one household |
| Badges / leaderboards / hearts | EXAMINO, Duolingo | Gamification noise; streak calendar is enough if needed |
| Teacher LMS / homework assign | EXAMINO school, Quizlet Class, Freedu | Non-goal; ops flag/hide only |
| Multi-child household accounts | Commercial family plans | Deferred; conflicts with anonymous shared context |
| Heavy CBT chrome (palette, mark-for-review, sections like JEE) | Examin-class | Overbuilt for VŠP+VJS household mocks; timer + end score suffice |
| Full Anki-style SRS | Anki | Different product; recommendations + mistakes queue cover near-term revisit |
| Video theory platform | Cielene video kurz | Content packaging, not our MVP surface |
| Weekly push email / Slack digests | Parent SaaS norm | No accounts; opening V06 is the digest |

---

## 8. Bottom line for the coordinator

Ship the locked P0 list; treat **mistakes restudy + per-item practice feedback default** as the only near-term feature decisions that clearly close a gap peers document as central to learning (not just monitoring). Everything else either we already have, or is correctly deferred/out under no-auth LAN constraints.
