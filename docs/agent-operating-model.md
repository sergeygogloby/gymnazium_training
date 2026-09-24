# Agent operating model — fast MVP + high-quality synthetic content

**Status:** working plan for multi-agent implementation  
**Canonical location:** in-repo under [`docs/`](./) (this tree). Project store copies under `/cursor/stores/self/docs/` stay in sync with the same content. Skills live at `.cursor/skills/<skill-name>/SKILL.md`.  
**Related:** [project-context.md](./project-context.md) · [functions-and-views.md](./functions-and-views.md) · [specs/README.md](./specs/README.md) · [materials-structure.md](./materials-structure.md) · [skills-backlog.md](./skills-backlog.md)

**Locks (do not reopen in agent prompts):** no auth · LAN shared UI · no Practice/Insights modes · practice + `exam_30`/`exam_60` · Mistakes P0 · CSV **all-or-nothing** · SDD · M1–M6 / VŠP+VJS · licensing N/A.

---

## 1. Goals

| Goal | Target |
|---|---|
| **Speed of implementation** | Ship the MVP ship bar ([functions-and-views.md](./functions-and-views.md)) by parallelizing **independent vertical slices** (spec → code → verify) with a thin coordinator, not a single serial agent. |
| **Volume of synthetic items** | Reach **thousands** of tagged items (bank seeds + synthetic) via CSV batches that match F22 / [content-model.md](./specs/content-model.md). |
| **Near-zero hallucination** | No batch is “published” (`published=true` eligible for sessions) until it passes the **generator QA gate** (structural + answer-key + critic + sample human spot-check). Prefer reject/rewrite over soft-fail. |

Speed without the QA gate is a false win: wrong keys and invented Slovak “rules” poison Mistakes, reports, and exam readiness.

---

## 2. Agent roles

Workers are **CreateAgent** (or equivalent Project workers) with a clear owner artifact. Subagents (`explore`, `computerUse`, `videoReview`, `generalPurpose` / Task) are **tools inside a role**, not competing coordinators.

### 2.1 Role catalog

| Role | Owns | Inputs | Outputs | Parallel? |
|---|---|---|---|---|
| **Project coordinator** | Scope, waves, merges, blockers; assigns workers; updates `notes.md` | User intent, docs, worker returns | Assignments, decisions, ship checklist | Sequential orchestration; fans out work |
| **Spec steward** | Spec completeness & cross-links under `docs/specs/` | Locked product docs | Spec amendments, acceptance checklists | Parallel **across** non-overlapping specs; sequential when amending shared content-model |
| **Scaffold engineer** | App skeleton, routing, shared store, content catalog loader, CSV parser stub | Specs index, content-model | Runnable shell: nav + empty views + schema types | **Blocks** vertical slices until green |
| **Vertical-slice implementer** | One view/spec end-to-end (e.g. practice-session) | One spec + shared APIs from scaffold | Code + acceptance notes | **Parallel** after scaffold; one agent per non-overlapping slice |
| **Content seed extractor** | Grounding corpus from `sources/` PDFs (patterns, stems, keys) | materials-structure, Cielene PDFs | Seed JSON/templates per topic T1–T12 | Parallel **by module** (M1–M6) after template schema locked |
| **Synthetic generator** | Produce candidate CSV rows only | Templates + seeds + constrained schema | `candidates/*.csv` (unpublished) | Parallel **by topic or module**; never writes `published=true` |
| **Structural validator** | Schema/CSV lint against F22 | Candidate CSV | Pass/fail + per-row errors | Parallel per batch; gate before critic |
| **Answer-key verifier** | Re-solve / independently check `correctKey` | Candidate rows + solver rules / gold seeds | Verified or reject list | Parallel per batch; **must** run before critic |
| **Critic / adversarial QA** | Second-pass: unsolvable stems, mismatched rationale, invented rules, duplicate near-clones | Verified candidates | Keep / revise / discard; issue notes | Sequential **after** verifier for that batch |
| **Importer agent** | Drive V11 / CLI import path; all-or-nothing | Gate-passed CSV | Catalog write + import report | Sequential per file; never bypass gate |
| **QA / acceptance agent** | Spec Acceptance checklists on running app | Spec + local URL | Pass/fail matrix; bug list | Parallel by view after slices merge |
| **UI polish agent** | Copy (SK), nav clarity, labels F18, Help V08 | Locked UI constraints | Small UI PRs | After core slices green; can parallelize with content pipeline |
| **Repo explorer** (`explore` subagent) | Fast codebase / docs search | Question | Paths + short answers | Anytime, nested under other roles |
| **Manual tester** (`computerUse`) | Browser acceptance, screenshots | Running app + checklist | Evidence artifacts | After deployable build |
| **Demo reviewer** (`videoReview`) | Sanity-check recorded demos | Recording path | Confirmed / gaps | Optional polish |

### 2.2 Waves (recommended)

```
Wave 0  Spec freeze & schema lock
Wave 1  Scaffold (app shell + content model + CSV validate stub)
Wave 2  Vertical slices by view/spec (parallel)
Wave 3  Content pipeline (seed → generate → QA → import)  [starts mid-Wave 2 once schema APIs exist]
Wave 4  Cross-cutting QA + Mistakes/Reports hardening
Wave 5  Polish (SK copy, Help, streak visuals light) + publish first synthetic batches
```

| Wave | Parallel | Sequential gate |
|---|---|---|
| **0** | Spec steward can close remaining acceptance wording; content-model column enums locked | No app code until F22 columns + enums frozen |
| **1** | Single scaffold engineer (or 1 + explore helper) | Vertical slices wait for: router, store, item schema, CSV validator library |
| **2** | One implementer per slice (see §7 tracks) | Shared file conflicts coordinated; content-model owned by scaffold |
| **3** | Generators by M1–M6; validators/critics per batch | No `published=true` until full QA gate; importer after critic |
| **4** | computerUse per critical path | Ship bar checklist is sequential sign-off by coordinator |
| **5** | Polish ∥ more content batches | Human spot-check sample required for first N batches |

### 2.3 Vertical-slice ownership (Wave 2)

| Worker | Spec | Views / functions |
|---|---|---|
| Slice A | [home-and-navigation.md](./specs/home-and-navigation.md) | V01, V08 |
| Slice B | [curriculum.md](./specs/curriculum.md) | V02, F01, F17, F15 start |
| Slice C | [practice-session.md](./specs/practice-session.md) | V03/V04/V09 practice path, F02–F07, F05 after-each |
| Slice D | [exam-session.md](./specs/exam-session.md) | Same shell; timer; end-only; `exam_30`/`exam_60` |
| Slice E | [progress.md](./specs/progress.md) | V05/V06, F08–F11, F21; Practice \| Exams split |
| Slice F | [mistakes-restudy.md](./specs/mistakes-restudy.md) | V10, F16 |
| Slice G | [question-csv-upload.md](./specs/question-csv-upload.md) | V11, F22 all-or-nothing |

**Rule:** Slice agents implement **only** their spec Acceptance. Shared types live in scaffold; if a slice needs a schema change, bounce to Spec steward + Scaffold — do not fork the content model.

---

## 3. Synthetic generation pipeline (critical)

### 3.1 What “no hallucinations” means here

Not generic LLM honesty — **item correctness for Slovenská VŠP/VJS prep**:

| Failure mode | Example | Gate that catches it |
|---|---|---|
| **Wrong `correctKey`** | Distractor marked correct | Answer-key verifier (independent re-solve) |
| **Invented Slovak rules** | Fake grammar/idiom “rules”, bogus Latin glosses | Critic + seed grounding (must cite template/seed id) |
| **Unsolvable / underdetermined stem** | Missing data for numeric/logic; ambiguous synonym | Critic solvability check |
| **Mismatched rationale** | Rationale argues for B while `correctKey=A` | Verifier + critic consistency pass |
| **Tag lies** | Topic T5 item tagged T7 / wrong `skillArea` | Structural validate + topic template allow-list |
| **Near-duplicate spam** | Same stem paraphrased 50× | Critic similarity / fingerprint |
| **Unconstrained free invent** | Open-ended “write a VŠP question” with no schema | Forbidden — generators only fill **templates** |

If any of the above appears in a batch sample at unacceptable rate → **reject whole batch** (same spirit as CSV all-or-nothing: do not partially publish).

### 3.2 Grounding (templates + seeds + constrained schemas)

1. **Extract seeds** from Cielene / real-exam patterns in `sources/` (and mapped M1–M6 / T1–T12 in [materials-structure.md](./materials-structure.md)):
   - Item **shape** (MCQ A–D, cloze, odd-one-out, sequence, graph-table, conditions, cipher, …)
   - **Worked answer** patterns from `Riesenia` / test solutions PDFs
   - Lexical / rule **allow-lists** where applicable (e.g. synonym pairs attested in seeds — not invented)
2. **Lock templates** per topic (JSON Schema or equivalent), e.g.:
   - `templateId`, `module`, `topic`, `skillArea`, `itemType`, `slots` (with types: enum, int range, attested lemma, …), `renderStem`, `renderChoices`, `deriveCorrectKey`, `rationalePattern`
3. **Generator fills slots only** — does not invent new item types mid-batch. Prefer **deterministic deriveCorrectKey** (programmatic) over “LLM picks the answer.”
4. **LLM role (when used):** paraphrase stems within template constraints, propose distractors from allow-lists, or fill lexical slots — **never** sole authority for `correctKey` when a solver exists.
5. Every candidate row carries provenance: `templateId`, `seedId` (optional), `batchId`, `sourceType=synthetic`.

### 3.3 Multi-step QA (required order)

```
generate → structural validate → answer-key verify → second-pass critic → human spot-check sample → import (published=false) → smoke in app → publish flag
```

| Step | Agent | Must pass |
|---|---|---|
| **Generate** | Synthetic generator | Emits F22 columns; `published=false`; provenance fields in sidecar or extended CSV |
| **Structural validate** | Validator + `csv-lint` script | Required columns; enums M1–M6, topic codes, `VSP`/`VJS`, `bank`/`synthetic`; choices parse; non-empty stem/rationale/correctKey |
| **Answer-key verify** | Verifier | Independent check: solver / gold recompute / dual-model agree **or** template-derived key matches payload |
| **Critic** | Critic agent | Solvable, rationale↔key, no invented rules, SK quality, not near-dup of published bank |
| **Human spot-check** | Coordinator or adult | Sample **≥2% or ≥20 items** (whichever larger) per batch for first 3 batches; then ≥1% with escalation if fail |
| **Import** | Importer | All-or-nothing via same validator as V11; catalog write |
| **Publish** | Ops / importer with gate report | Flip `published=true` only after smoke session serves items |

Failed rows → **revise queue** or discard; failed **rate** above threshold → scrap batch.

### 3.4 Batching strategy (thousands)

| Parameter | Recommendation |
|---|---|
| Batch size | **100–250 rows** per CSV (small enough to reject; large enough for throughput) |
| Parallelism | Up to **6 generators** (one per module) or **12** (one per topic) once templates exist |
| Naming | `synthetic/{batchId}_M{n}_T{nn}.csv` + `…_report.json` (gate results) |
| Upsert | Stable `id` = `{templateId}-{hash(slots)}` so regenerations update rather than duplicate |
| Ramp | Pilot 1 topic (e.g. T5) → 1 module → all M1–M6 |
| Target volume | e.g. ~200–400 published per topic over time → **~2.4k–4.8k** across T1–T12 (tune to household need) |
| CSV schema | Exact F22 columns from [question-csv-upload.md](./specs/question-csv-upload.md); extras only in sidecar JSON for QA |

### 3.5 Suggested subagent / worker split for content

| Type | Responsibility |
|---|---|
| **Seed extractor** (explore + PDF/text tooling via shell) | Build template library + seed fixtures |
| **Generator workers** (parallel CreateAgent) | Fill templates → candidate CSV |
| **Validator** (shell scripts; thin agent wrapper) | Structural F22 lint — **deterministic**, not LLM |
| **Verifier** (dedicated agent + solvers) | Answer-key truth |
| **Critic** (separate model/agent; never same prompt as generator) | Adversarial second pass |
| **Importer** | Calls app/CLI; enforces all-or-nothing |
| **computerUse** | After import: practice session shows labels, feedback, tags |

Generator and Critic **must not** be the same agent turn “checking itself.”

---

## 4. Skills to create or use

Project skills (markdown under a skills root when implemented — see [skills-backlog.md](./skills-backlog.md)). Invoke by **reading the skill first**, then running its checklist.

| Skill | Purpose | When to invoke |
|---|---|---|
| `sdd-implement-spec` | Spec → implement only Acceptance → note gaps | Every vertical-slice worker start |
| `scaffold-lan-mvp` | Bootstrap shared UI, store, sessionKind, no-auth rules | Wave 1 only |
| `extract-vsjp8-seeds` | PDF/pattern → template + seed fixtures per topic | Before any large generate run |
| `generate-vsjp8-items` | Template-constrained synthetic generation → candidate CSV | Each content batch |
| `verify-answer-keys` | Independent key/rationale verification protocol | Every batch after structural lint |
| `critic-synthetic-batch` | Second-pass hallucination / solvability / dup review | After verify; before import |
| `csv-import-qa` | All-or-nothing lint + dry-run import + publish gate checklist | Before V11/CLI write; before `published=true` |
| `acceptance-computeruse` | Map spec Acceptance → browser steps | Wave 4 per view |
| `lock-check-product` | Refuse auth/modes/partial CSV/mixed practice-exam rollups | Coordinator review of PRs / worker returns |

**Existing Cursor subagents (use, don’t reinvent):** `explore` (find files), `computerUse` (manual UI), `videoReview` (demo check), Task/`generalPurpose` for multi-step research inside a role.

---

## 5. Tools

| Tool | Use |
|---|---|
| **CreateAgent / Project workers** | Parallel roles in §2 |
| **Task + explore** | Repo/docs search without loading entire tree |
| **computerUse** | Acceptance on LAN app; screenshots for coordinator |
| **videoReview** | Optional demo verification |
| **Shell** | Run app, tests, validators; PDF text extract where available |
| **Repo scripts (to add)** | `scripts/csv_lint.py` (F22 schema); `scripts/batch_gate.py` (combine lint+verify reports); golden fixtures under `testdata/csv/` |
| **Unit/golden tests** | Parser: valid file imports; one bad row → zero writes; sessionKind persistence; Practice \| Exams filter |
| **Content fixtures** | `content/bank/` (transcribed seeds); `content/synthetic/candidates/`; `content/synthetic/published/` |
| **MCP** | Only if already useful (e.g. GitHub read-only for CI); **do not** invent product MCPs. Factory/subscriptions unused unless coordinator says otherwise |
| **SDD specs** | Source of truth for behavior — agents must link Acceptance, not improvise product rules |

**Deterministic tools beat LLM judgment** for schema and, where possible, answer keys.

---

## 6. Dependencies graph

```
Spec freeze (Wave 0)
    └─► Content schema + F22 columns locked
            ├─► Scaffold (Wave 1)
            │       ├─► Slice A Home/Help
            │       ├─► Slice B Curriculum          ─┐
            │       ├─► Slice C Practice            ─┼─► need item serve API
            │       ├─► Slice D Exam                ─┤
            │       ├─► Slice E Progress            ─┤  (needs attempts from C/D)
            │       ├─► Slice F Mistakes            ─┘  (needs wrong attempts)
            │       └─► Slice G CSV Upload  ◄── same validator as content pipeline
            │
            └─► Seed extract → Templates
                    └─► Generate ∥ (per M/T)
                            └─► Structural validate
                                    └─► Answer-key verify
                                            └─► Critic
                                                    └─► Human sample
                                                            └─► Import (published=false)
                                                                    └─► App smoke (C/D)
                                                                            └─► Publish
```

**Hard blockers**

| Cannot start | Until |
|---|---|
| Vertical slices C–G | Scaffold item schema + session store + router |
| Slice E meaningful data | At least practice attempts writable (Slice C) |
| Slice F | Wrong answers persisted (C/D) |
| Generate at scale | Templates + seed extract for that topic |
| Import publish | Full QA gate report for that batch |
| Ship bar sign-off | Spec Acceptance for V01–V06, V08–V11 + one published synthetic smoke |

**Soft parallelism:** Seed extract and template authoring can run **during** Wave 1 once schema is locked, without waiting for UI.

---

## 7. First 2-week agent schedule

Concrete parallel tracks (calendar-agnostic “Week 1 / Week 2” = two sequential phases).

### Week 1 — foundation + first verticals + pilot content

**Track S — Scaffold (1 agent, sequential critical path)**  
App shell, nav, local store, `sessionKind`, content catalog types, CSV lint library, empty V01–V11 routes.

**Track Spec — Spec steward (0.25)**  
Close Acceptance wording gaps; freeze topic code list T1–T12 ↔ modules.

**Track C — Practice slice** (starts when S exposes session API)  
Untimed practice, after-each feedback, F18 labels, flag V09.

**Track D — Exam slice** (parallel with C after shared V03 shell)  
Timer 30/60, end-only scoring, distinct result labeling.

**Track G — CSV upload** (parallel; shares lint with content)  
V11 UI + all-or-nothing; golden tests.

**Track Seed — Content seed extract (1–2 agents by module)**  
M3/T5+T6 pilot templates first (numeric/data — easier to verify programmatically).

**Track Gen-Pilot — Generator + validator + verifier**  
One topic, ~100 candidates → full gate → import `published=false` → 20-item human sample.

### Week 2 — remaining slices + scale content + QA

**Track B — Curriculum** · **Track E — Progress** · **Track F — Mistakes** · **Track A — Home/Help** (parallel)  
E and F consume attempt data from Week 1.

**Track Gen-Scale**  
Expand templates to all M1–M6; parallel generators; batch size 100–250; still gate every batch.

**Track QA — computerUse acceptance**  
Walk ship bar; Practice \| Exams split; Mistakes restudy; CSV reject path.

**Track Polish**  
SK copy, light streak/effort on V06, Help ops warnings — no new product scope.

**Coordinator daily:** merge conflicts on shared session/content modules; reject any worker that adds auth or modes; publish only gate-green batches.

---

## 8. Risks — quality collapse at scale

| Risk | Mitigation / publish gate |
|---|---|
| Generators optimize for volume, not keys | Cap batch size; **verifier mandatory**; prefer template-derived keys |
| Critic rubber-stamps generator | Separate agent/prompt; sample adversarial items planted in batch |
| Partial CSV / “import the good rows” | Product lock + `csv-import-qa` skill; tests assert zero writes on any bad row |
| Topic drift / wrong skillArea | Template allow-list; structural enum checks |
| Slovak quality / invented idioms | Seed-attested lexicon; critic SK pass; human sample |
| Duplicate flood | Fingerprint stems; critic near-dup threshold |
| Publishing before smoke | Two-phase: import unpublished → practice smoke → then publish |
| UI agents rewrite content model | Scaffold owns schema; lock-check-product skill |
| Parallel slice merge hell | Thin shared APIs; coordinator assigns file ownership |

### Publish gate (non-negotiable checklist)

A synthetic batch may set `published=true` only if:

1. Structural F22 lint **100%** pass (same rules as V11).  
2. Answer-key verify pass rate **100%** on retained rows (failed keys removed **before** import, or whole batch rejected).  
3. Critic residual issue rate below agreed threshold (start: **0 critical**, **&lt;2% minor**).  
4. Human spot-check sample signed off.  
5. Dry-run / real import all-or-nothing succeeded.  
6. Smoke: items appear in practice with **synthetic** label, correct feedback once, correct module/topic filters.  
7. Gate report JSON archived next to the CSV.

Otherwise: rewrite or discard — **do not** drip-publish “mostly fine” items.

---

## 9. Coordinator operating rules (short)

- One coordinator; many workers; no worker invents product locks.  
- Prefer **canonical docs in-repo under `docs/`** (store mirrors stay in sync) and **small focused PRs** in the app repo when coding starts.  
- Content pipeline can outpace UI: stockpile gate-passed unpublished CSV until V11 exists.  
- Measure progress by **Acceptance checkboxes + published verified item counts**, not by agent-hours or token spend.
