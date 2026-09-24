---
name: critic-synthetic-batch
description: Second-pass reject unsolvable stems, invented SK rules, tag lies, and near-duplicates. Separate agent from generator; runs after verify-answer-keys; never publishes.
---

# Skill: critic-synthetic-batch

## When to invoke

After `verify-answer-keys` for a batch; before `csv-import-qa` / import. **Never** the same agent turn as generation.

## Non-negotiables

- **Generator ≠ critic** — adversarial second pass; different prompt/agent.
- Start thresholds: **0 critical**, **&lt;2% minor** residual issues — else reject/rewrite batch.
- Catch: unsolvable/underdetermined stems; invented Slovak rules/idioms; tag lies (wrong topic/skillArea); mismatched rationale (if verify missed); near-duplicate spam.
- Must cite grounding (template/seed id) when judging lexical claims.
- Do **not** set `published=true` or bypass human spot-check.
- Prefer reject/rewrite over soft-fail.

## Inputs

| Input | Source |
|---|---|
| Verified candidates | `content/candidates/` + verify report |
| Templates / seeds | `content/templates/`, `content/seeds/` |
| Published bank (for dup check) | `content/published/` + existing catalog when available |

## Outputs

| Output | Path |
|---|---|
| Critic report | `content/reports/{batchId}_critic.json` |
| Keep / revise / discard | Per-row decisions |
| Issue notes | Critical vs minor |

## Steps

1. Confirm verify report exists and keys passed for retained rows.
2. Solvability pass: missing numeric data, ambiguous stems → critical reject.
3. Grounding pass: invented rules / unattested lexicon → critical reject.
4. Tag pass: module/topic/`skillArea` must match template allow-list.
5. Near-dup fingerprint vs published + within-batch clones → reject spam.
6. Compute residual rates; if above threshold → scrap or send to revise queue.
7. Write critic report; hand to human spot-check then `csv-import-qa`.

## Refs

- `docs/agent-operating-model.md` §3.1, §3.3, §8
- `docs/specs/content-model.md`
- Prior: `.cursor/skills/verify-answer-keys/SKILL.md`
- Next: `.cursor/skills/csv-import-qa/SKILL.md`
