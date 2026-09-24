# Spec: Question CSV upload

## Goal

Allow household/ops to **upload new questions from a CSV file** (especially synthesized stock) from time to time **without a code deploy**, so the shared LAN app’s content bank can grow. **No auth** — simple admin-less upload UI (or documented config path) on the shared app. Document clearly that this is a trusted-LAN ops surface, not a public internet admin.

## Actors

- Operator / household adult on the LAN (same open app; no login).  
- Learners consume uploaded items via normal practice/exam flows.

## Views

- **V11 Upload questions (CSV)**  
- Help (V08) documents that Upload is for trusted LAN ops

## Behaviors

1. User opens **Upload questions** from ops entry / Help / Home light link. Copy states: open on trusted home LAN; anyone on the LAN can upload — use carefully.  
2. User selects a CSV file and submits.  
3. System validates **every** row against the content schema ([content-model.md](./content-model.md)) **before** any write.  
4. **All-or-nothing (locked):** if **any** row fails validation, **reject the whole file** — do **not** import valid rows partially. Surface clear **per-row** errors (missing required field, invalid `module` / `skillArea` / `sourceType`, empty stem, missing `correctKey`, malformed `choices`, etc.) so the operator can fix the file and re-upload.  
5. Only when **all** rows pass: rows enter the **same content catalog** as existing bank/synthetic items (F22 → F12). They are immediately eligible for sessions unless `published=false`.  
6. Optional **publish/hide** column maps to F14. Operator can hide bad imports without redeploy.  
7. Upsert: if `id` is present and already exists, update that item; if omitted, create with a new stable id.  
8. Success summary: counts created / updated. On failure: zero rows written; list of row errors.  
9. No authentication gate.

### Expected columns

| Column | Required | Notes |
|---|---|---|
| `id` | optional | Upsert key when present |
| `stem` | yes | Question text |
| `choices` | conditional | MCQ options (`A\|B\|C\|D` or equivalent); omit for free-answer |
| `correctKey` | yes | Correct choice or free-answer key |
| `rationale` | yes | Shown after each practice item |
| `module` | yes | M1–M6 |
| `topic` | yes | Topic code from curriculum map |
| `skillArea` | yes | `VSP` \| `VJS` |
| `sourceType` | yes | `bank` \| `synthetic` (synthesized stock typically `synthetic`) |
| `locale` | optional | Default SK |
| `published` | optional | Hide/publish flag |

## Data

- Write: content catalog rows (local / single-instance).  
- Read: existing ids for upsert; schema validation rules.

## Out of scope

- Auth / role-gated CMS  
- Image/media binary upload in v1 (text CSV only)  
- Automatic LLM generation inside the upload screen (upload is for already-authored CSV)  
- Cloud multi-tenant import

## Acceptance

- [ ] Upload a valid CSV without login; items appear in a new practice session with correct tags and labels.  
- [ ] A file with any invalid row writes **nothing**; UI shows clear per-row errors (row identity + reason).  
- [ ] `sourceType=synthetic` items show the synthetic label in practice UI.  
- [ ] `published=false` (or hide) keeps items out of new sessions.  
- [ ] Help/copy states this is a LAN/ops upload, not account-secured admin.  
- [ ] Regenerating/adding stock does not require a code deploy.
