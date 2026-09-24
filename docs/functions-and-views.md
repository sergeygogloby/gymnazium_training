# Functions and views — MVP inventory

**Status:** aligned with no-auth / **no-modes** decision, **practice + timed exams**, and **MVP expansions** (mistakes restudy, VŠP/VJS filter, source labels, streak/effort, CSV upload) — [project-context.md](./project-context.md)  
**Source MVP cut:** [feature-list.md](./feature-list.md)  
**Curriculum:** M1–M6 / 12 topics — [materials-structure.md](./materials-structure.md)  
**Specs:** [specs/](./specs/)

One open app on the local network. Parent and child use the **same** screens and shared data store. No Practice vs Insights modes. Exam is a **session kind**, not a mode/role.

---

## Shared family UI (not modes)

| Area | Intent | Typical views |
|---|---|---|
| **Practice (write path)** | Untimed, item-by-item training; **feedback after each item**; generates attempt data | Curriculum → Practice session → Session result |
| **Timed exam (write path)** | Fixed **30 min** or **60 min** exam; same shared screens; end-only score | Start exam → Exam session → Session result (exam) |
| **Mistakes / restudy (write path)** | Re-attempt missed items from a dedicated queue | Mistakes → Practice session (mistakes-scoped) → Session result |
| **Results & progress (read on same screens)** | History, mastery, gaps, suggestions, streak/calendar, effort vs accuracy — **practice vs exams shown separately** | Results & Progress (filters/sections: Practice \| Exams 30/60) |
| **Ops (LAN, no auth)** | Publish/hide, flag queue, **CSV question upload** | Upload questions (+ config/hide as needed) |

Home exposes plain navigation (Curriculum / Practice / Mistakes / Results & Progress; ops Upload reachable from Help or a light Ops entry). Exam start lives under Practice / Curriculum entry points as a session-kind choice — not a separate mode switcher. No login gate, no role switcher.

---

## Session kinds

| Kind | Duration | Scoring / feedback | Persist as |
|---|---|---|---|
| **`practice`** | Untimed | **After each item:** correct answer + short rationale (locked) | `sessionKind=practice` |
| **`exam_30`** | Fixed **30 minutes** | Score at end; no per-item answer key during the clock | `sessionKind=exam_30` |
| **`exam_60`** | Fixed **60 minutes** | Score at end; no per-item answer key during the clock | `sessionKind=exam_60` |

Reports must not roll these into one undifferentiated progress aggregate: practice drills and exam readiness stay distinguishable. Mistakes restudy sessions are still `practice` (or tagged as practice with a mistakes source) — they are not a fourth timed kind.

---

## Functions (what the system does)

IDs are stable for specs and implementation.

| ID | Function | MVP | Notes |
|---|---|---|---|
| **F01** | Browse curriculum (M1–M6, topics) | P0 | Sequence from VSJP8 map |
| **F02** | Start practice session (module/topic or recommended) | P0 | Untimed; `sessionKind=practice` |
| **F03** | Serve session items (bank + synthetic) | P0 | Tagged content; used by practice and exams |
| **F04** | Capture answers (correct / incorrect / skipped) | P0 | Per item |
| **F05** | Immediate feedback + answer key | P0 | **Practice:** after **each item** (locked). Exams defer until end (F15) |
| **F06** | Score and close session | P0 | Persist attempt for any session kind |
| **F07** | Persist attempt history (local / single instance) | P0 | Timestamps, **session kind** (`practice` / `exam_30` / `exam_60`), tags — **no account** |
| **F08** | List session history | P0 | Date, module, score, duration, **session kind**; filterable by Practice \| Exams |
| **F09** | Compute progress by module & topic | P0 | Accuracy / completion — **separate practice vs exam rollups** (or clearly labeled sections) |
| **F10** | Compute gap / weak-topic report | P0 | Derived from attempts; shown on Results & Progress; prefer practice-based gaps for next drills unless UI says otherwise |
| **F11** | Suggest next practice (1–3 actions) | P0 | Same Results & Progress screens + optional Curriculum default; may point at Mistakes |
| **F12** | Content tagging model | P0 | Module, topic, VŠP/VJS, bank/synthetic |
| **F13** | Flag bad item (local queue) | P0 | Minimal; no auth admin login |
| **F14** | Publish / hide content | P0 | Ops/config; may be file-level for v1; also settable via CSV upload flags |
| **F15** | Timed exam session (30 min / 60 min) | P0 | Fixed duration; score at end; same shared UI as practice; distinct reporting |
| **F16** | Review wrong-answers / mistakes restudy queue | **P0** | Dedicated Mistakes view; re-attempt missed items |
| **F17** | VŠP vs VJS filter | **P0** | Practice / Curriculum filter |
| **F18** | Source label (bank vs synthetic) in UI | **P0** | Visible on items / session UI; tags still F12 |
| **F19** | Weekly summary | P1 | Deferred (no email accounts) |
| **F20** | Grade-year preference (8./9.) | Deferred as account field | Optional local setting later; not required to practice |
| **F21** | Light streak / study calendar + effort vs accuracy | **P0** | On Results & Progress; keep light — no badges |
| **F22** | CSV question import / upload | **P0** | LAN ops upload UI or config path; validate all rows; **all-or-nothing** (any bad row → reject whole file); add to same tagged bank |

### Explicitly out of MVP (auth-related — deferred)

| Former idea | Status |
|---|---|
| Account / login | **Deferred** — no auth |
| Secure student ↔ parent link / invite | **Deferred** — shared open screens on LAN |
| Multi-child household accounts | **Deferred** |
| Shareable snapshot requiring “no full account access” | Revisit as optional export later; not gated |
| Practice vs Insights **modes** / parallel parent UI | **Rejected** — unified screens |

---

## Views (screens / pages)

| ID | View | Purpose | Status |
|---|---|---|---|
| **V01** | **Home** | Brand + nav to Curriculum / Practice / Mistakes / Results & Progress; short product positioning; light link to Upload / Help | Active |
| **V02** | **Curriculum** | Browse M1–M6 and topics; **VŠP \| VJS filter**; start **practice** or **timed exam** (session kind) | Active |
| **V03** | **Practice / exam session** | Answer items one-by-one; practice per-item feedback or exam timer; **source labels** visible | Active (shared shell; behavior by session kind) |
| **V04** | **Session result** | Score, breakdown, link to retry / Mistakes / next suggestion; label practice vs exam 30/60 | Active |
| **V05** | **Session history** | Past sessions list with kind; under Results & Progress | Active |
| **V06** | **Results & Progress** | Mastery, gaps, suggestions, recent activity, **streak/calendar**, **effort vs accuracy** — with **Practice \| Exams (30/60)** sections or filters | Active (expanded) |
| **V07** | ~~Insights~~ | Former standalone Insights overview | **Retired** — merged into **V06** |
| **V08** | **Onboarding / help** (light) | How practice vs timed exams work; per-item practice feedback; Mistakes; CSV upload is ops/LAN; shared results; VŠP+VJS positioning | Active |
| **V09** | **Item flag confirmation** | Confirm “report bad item” after flag | Active |
| **V10** | **Mistakes / restudy** | Queue of missed items; start re-attempt session | **Active (P0)** |
| **V11** | **Upload questions (CSV)** | Ops-style, no-auth CSV import; **all-or-nothing** validation; per-row errors on reject; publish/hide if present | **Active (P0)** |

### View ID renames / merges

| Former | Now |
|---|---|
| V01 “choose Practice or Insights” | V01 plain nav (no modes); includes Mistakes + light Upload entry |
| V06 Progress | **V06 Results & Progress** (same ID; absorbs gaps + suggestions + overview + streak/effort; **practice vs exam reporting**) |
| V07 Insights | **Retired** → content lives on V06 (and V05 for history drill-down) |
| V08 “practice vs insights modes” copy | V08 explains shared screens / practice vs exam session kinds / Mistakes / ops upload |

No extra views for exams: same V03/V04 shell; session kind drives timer, feedback timing, and result labeling. Mistakes reuses V03/V04 with a mistakes-scoped item set.

---

## View → functions map

| View | Uses |
|---|---|
| **V01 Home** | Navigation only (+ optional F11 teaser; link to V10 / V11) |
| **V02 Curriculum** | F01, F02, F11 (recommended entry), F12, **F15**, **F17**, **F18** |
| **V03 Practice / exam session** | F02, F03, F04, F05 (practice), F12, F13, **F15**, **F18** (labels); mistakes-scoped starts via F16 |
| **V04 Session result** | F06, F07, F09, F11 (link to F16 / V10) |
| **V05 Session history** | F07, F08 (kind-aware list / filter) |
| **V06 Results & Progress** | F07, F08, F09, F10, F11, **F21** (practice vs exam sections/filters) |
| **V07** | — (retired; do not implement) |
| **V08 Onboarding / help** | Copy only (documents Mistakes + LAN CSV upload) |
| **V09 Item flag** | F13 |
| **V10 Mistakes / restudy** | F16, F02–F07 (re-attempt), F12, F18 |
| **V11 Upload questions** | F22, F12, F14 |

---

## Suggested primary nav

```
Home
├── Curriculum   → VŠP|VJS filter; start practice | start exam (30 / 60)
├── Practice     → (session → result)  [practice or exam kind; source labels]
├── Mistakes     → restudy queue → re-attempt session
├── Results & Progress
│   ├── Practice   (progress | gaps + suggestions | history | streak | effort vs accuracy)
│   └── Exams      (30 min | 60 min — scores / readiness apart from drills)
└── Upload (ops) → CSV question import   [LAN / household ops; no auth — document clearly]
```

Single shared progress store. Practice and exams both write attempts with distinct `sessionKind`. Results & Progress reads the same history but **surfaces practice and exams separately**. Mistakes feeds practice re-attempts. CSV upload writes into the same content bank. No separate Insights branch.

---

## MVP ship bar (revised, no auth, no modes)

Ship when a household can: **open Curriculum (optionally filter VŠP/VJS) → run a scored practice session with after-each-item feedback and visible bank/synthetic labels, and a timed exam (30 or 60) → re-attempt mistakes from Mistakes → open Results & Progress and see practice vs exam outcomes separately**, plus gaps, next suggestions, **light streak/calendar**, and **effort vs accuracy** from local history — **and ops can CSV-upload new questions without a deploy** — **together on shared screens**, **without accounts, invite links, or Practice/Insights modes**.
