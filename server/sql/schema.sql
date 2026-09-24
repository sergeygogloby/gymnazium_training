-- gymnazium_training local SQLite schema (LAN single-instance)
-- Persist questions (catalog) and session results (attempts + answers).
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  stem TEXT NOT NULL,
  choices_json TEXT,              -- JSON array of strings; NULL = free-answer
  correct_key TEXT NOT NULL,
  rationale TEXT NOT NULL,
  module TEXT NOT NULL CHECK (module IN ('M1','M2','M3','M4','M5','M6')),
  topic TEXT NOT NULL CHECK (topic IN (
    'T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'
  )),
  skill_area TEXT NOT NULL CHECK (skill_area IN ('VSP','VJS')),
  source_type TEXT NOT NULL CHECK (source_type IN ('bank','synthetic')),
  locale TEXT NOT NULL DEFAULT 'sk',
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_questions_module_topic
  ON questions(module, topic);
CREATE INDEX IF NOT EXISTS idx_questions_published
  ON questions(published);
CREATE INDEX IF NOT EXISTS idx_questions_skill
  ON questions(skill_area);
CREATE INDEX IF NOT EXISTS idx_questions_source
  ON questions(source_type);

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  session_kind TEXT NOT NULL CHECK (session_kind IN ('practice','exam_30','exam_60')),
  started_at TEXT NOT NULL,
  ended_at TEXT,
  module TEXT,
  topic TEXT,
  mistakes_scoped INTEGER NOT NULL DEFAULT 0 CHECK (mistakes_scoped IN (0, 1)),
  score_correct INTEGER,
  score_total INTEGER,
  duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_attempts_kind_started
  ON attempts(session_kind, started_at);

CREATE TABLE IF NOT EXISTS attempt_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  attempt_id TEXT NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL,
  item_id TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('correct','incorrect','skipped')),
  given_answer TEXT,
  module TEXT NOT NULL,
  topic TEXT NOT NULL,
  skill_area TEXT NOT NULL,
  source_type TEXT NOT NULL,
  UNIQUE (attempt_id, seq)
);

CREATE INDEX IF NOT EXISTS idx_attempt_answers_item
  ON attempt_answers(item_id);

CREATE TABLE IF NOT EXISTS flags (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  note TEXT,
  resolved INTEGER NOT NULL DEFAULT 0 CHECK (resolved IN (0, 1))
);

-- App-level KV (seenHelp, activeSession JSON, etc.)
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL
);
