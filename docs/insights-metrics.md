# Insights metrics — DB ↔ Results (V06)

**Lock:** No separate Insights mode. Graphs/tables live on shared **Výsledky a pokrok**.

## Popular tools (what we mirrored lightly)

| Tool | Typical insights | Our V06 mapping |
|---|---|---|
| **Duolingo** | Streak, XP/progress, strength/weak words | Streak calendar, gaps, suggestions (no XP/leagues) |
| **Anki** | Retention, review time, answer buttons, forecast | Outcome mix, study time totals, score trend |
| **Quizlet** | Mastery, heatmaps, session accuracy | Module/topic tables, KPI strip, calendar |
| **Khan Academy** | Skill mastery by unit | Module bars + topic table + VŠP\|VJS split |

Out of scope (product): badges, leaderboards, QPM heatmaps, separate parent Insights.

## Metrics persisted in SQLite

| Table | Fields used for insights |
|---|---|
| `attempts` | `session_kind`, `started_at`, `ended_at`, `score_correct`, `score_total`, `duration_ms`, `module`, `topic` |
| `attempt_answers` | `outcome`, `module`, `topic`, `skill_area`, `source_type`, `item_id` |

Written on every completed session via `PUT /api/state` (`endSession` sets scores + duration).

API rollups: `dbStats().insights` → practice/exam attempt counts, outcome counts, total duration.

## UI graphs & tables (V06)

- KPI cards (sessions, answers, accuracy, time, active days)
- Outcome mix bar (correct / incorrect / skipped)
- Session score trend (SVG line)
- Module accuracy bars + module table
- VŠP \| VJS table
- Topic detail table (accuracy, answers, sessions, time)
- Streak / 14-day calendar, gaps, suggestions, recent activity

Practice and exams stay filtered separately.
