# Spec: Content model

## Goal

Ensure every practice item carries tags needed for routing and shared Results & Progress, allow minimal publish/hide and bad-item handling without an auth system, and accept **CSV-uploaded** items into the same bank as bank/synthetic tagged content.

## Actors

- Household: consumes tagged items; may flag bad items.  
- Operator (same LAN / deployer): publish/hide and **CSV upload** via config or simple admin-less surface — **no user accounts**.

## Views

Cross-cutting (feeds V02–V06, V10). Flag UI: **V09**. Upload UI: **V11** — see [question-csv-upload.md](./question-csv-upload.md). (V07 retired — do not depend on a separate Insights view.)

## Behaviors

1. Every item has: **module** (M1–M6), **topic** (T1–T12 map), **skill area** (VŠP | VJS), **source type** (bank | synthetic), stable **id**, stem, answer data (choices or free answer + correct key), rationale. Optional: locale.  
2. Session building and progress/gaps filters use these tags only (F12). **VŠP/VJS filter** (F17) and **source labels** (F18) read the same fields.  
3. Hidden/unpublished items are not served in new sessions (F14).  
4. Flagged items enter a local queue for operator review; resolution can hide or fix offline.  
5. **CSV import (F22):** uploaded rows validate against the schema. **All-or-nothing (locked):** if any row fails, reject the whole file (no partial import). Only when every row passes do rows enter the **same content catalog** as existing bank/synthetic items. See [question-csv-upload.md](./question-csv-upload.md) for columns and validation.

### CSV column sketch (canonical)

| Column | Required | Notes |
|---|---|---|
| `id` | optional | If omitted, system assigns a stable id; if present, upsert/replace by id |
| `stem` | yes | Question text |
| `choices` | conditional | For MCQ: delimited options (e.g. `A\|B\|C\|D` or JSON array). Omit for free-answer |
| `correctKey` | yes | Choice letter/index or free-answer key |
| `rationale` | yes | Short explanation shown after practice items |
| `module` | yes | M1–M6 |
| `topic` | yes | Curriculum topic id/code aligned to materials map |
| `skillArea` | yes | `VSP` or `VJS` (normalize VŠP→VSP in data if needed) |
| `sourceType` | yes | `bank` \| `synthetic` |
| `locale` | optional | Default SK |
| `published` | optional | `true`/`false` — hide/publish flag if already in model |

## Data

- Content catalog (files or DB) with required tags — includes CSV-imported rows.  
- Flag records: item id, timestamp, optional note.  
- No per-user ownership fields required for MVP.

## Out of scope

- Teacher/tutor seats (P2)  
- Auth-gated CMS  
- Partial CSV import (any bad row → whole file rejected; see [question-csv-upload.md](./question-csv-upload.md))

## Acceptance

- [ ] New session only serves items with complete tags.  
- [ ] Progress and gaps can group by module and topic; filters can use skillArea and sourceType.  
- [ ] Hiding an item prevents it from appearing in new sessions.  
- [ ] Flag flow works without logging in.  
- [ ] CSV-imported items with valid tags are served like other bank/synthetic items.  
- [ ] A CSV with any invalid row imports nothing (all-or-nothing).
