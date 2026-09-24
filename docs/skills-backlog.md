# Skills backlog — gymnazium_training

**Status:** implemented under `.cursor/skills/<skill-name>/SKILL.md`  
**Related:** [agent-operating-model.md](./agent-operating-model.md) · [specs/README.md](./specs/README.md)

Agents **read the matching skill first**, then run its checklist. One line each.

| Skill | Purpose |
|---|---|
| `sdd-implement-spec` | Implement exactly one SDD spec’s Acceptance; no scope creep past Out of scope. |
| `scaffold-lan-mvp` | Bootstrap no-auth LAN app shell, shared nav, sessionKind store, content schema types. |
| `lock-check-product` | Refuse auth, Practice/Insights modes, partial CSV import, or mixed practice/exam rollups. |
| `extract-vsjp8-seeds` | From `sources/` PDFs, extract item shapes and answer patterns into topic templates + seeds. |
| `generate-vsjp8-items` | Fill constrained VŠP/VJS templates into F22 candidate CSV (`sourceType=synthetic`, unpublished). |
| `verify-answer-keys` | Independently re-check `correctKey` and rationale consistency; fail batch on key errors. |
| `critic-synthetic-batch` | Second-pass reject unsolvable stems, invented SK rules, tag lies, and near-duplicates. |
| `csv-import-qa` | Lint F22 schema, enforce all-or-nothing, dry-run import, and publish-gate checklist. |
| `acceptance-computeruse` | Drive browser against a view’s Acceptance list; capture pass/fail evidence. |
| `session-kind-qa` | Verify practice after-each feedback vs exam end-only and distinct `sessionKind` reporting. |
| `mistakes-queue-qa` | Verify Mistakes restudy queue build, re-attempt, and return to Results & Progress. |
| `content-tag-audit` | Audit catalog rows for M1–M6 / topic / VSP\|VJS / bank\|synthetic completeness. |

**Invoke order (content):** `extract-vsjp8-seeds` → `generate-vsjp8-items` → `verify-answer-keys` → `critic-synthetic-batch` → `csv-import-qa`.

**Invoke order (app slice):** `lock-check-product` → `sdd-implement-spec` → `acceptance-computeruse` (plus `session-kind-qa` / `mistakes-queue-qa` when relevant).
