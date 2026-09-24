import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  ActiveSession,
  AppStoreState,
  Attempt,
  AttemptAnswer,
  ContentItem,
  FlagRecord,
} from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(SERVER_ROOT, '..');

export function defaultDbPath(): string {
  const fromEnv = process.env.GYM_DB_PATH;
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(REPO_ROOT, 'data', 'gymnazium.sqlite');
}

export function openDb(dbPath = defaultDbPath()): Database.Database {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  migrate(db);
  return db;
}

export function migrate(db: Database.Database): void {
  const schemaPath = path.join(SERVER_ROOT, 'sql', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(sql);
  const row = db
    .prepare('SELECT id FROM schema_migrations WHERE id = 1')
    .get() as { id: number } | undefined;
  if (!row) {
    db.prepare('INSERT INTO schema_migrations (id) VALUES (1)').run();
  }
}

function emptyState(): AppStoreState {
  return {
    catalog: [],
    attempts: [],
    flags: [],
    activeSession: null,
    seenHelp: false,
  };
}

function rowToQuestion(r: Record<string, unknown>): ContentItem {
  let choices: string[] | undefined;
  if (typeof r.choices_json === 'string' && r.choices_json.length > 0) {
    choices = JSON.parse(r.choices_json) as string[];
  }
  return {
    id: String(r.id),
    stem: String(r.stem),
    choices,
    correctKey: String(r.correct_key),
    rationale: String(r.rationale),
    module: r.module as ContentItem['module'],
    topic: r.topic as ContentItem['topic'],
    skillArea: r.skill_area as ContentItem['skillArea'],
    sourceType: r.source_type as ContentItem['sourceType'],
    locale: r.locale ? String(r.locale) : 'sk',
    published: Number(r.published) === 1,
  };
}

export function loadState(db: Database.Database): AppStoreState {
  const catalog = (
    db.prepare('SELECT * FROM questions ORDER BY id').all() as Record<
      string,
      unknown
    >[]
  ).map(rowToQuestion);

  const attemptRows = db
    .prepare('SELECT * FROM attempts ORDER BY started_at ASC')
    .all() as Record<string, unknown>[];

  const answerStmt = db.prepare(
    'SELECT * FROM attempt_answers WHERE attempt_id = ? ORDER BY seq ASC',
  );

  const attempts: Attempt[] = attemptRows.map((a) => {
    const answers = (
      answerStmt.all(a.id) as Record<string, unknown>[]
    ).map(
      (ans): AttemptAnswer => ({
        itemId: String(ans.item_id),
        outcome: ans.outcome as AttemptAnswer['outcome'],
        givenAnswer:
          ans.given_answer == null ? undefined : String(ans.given_answer),
        module: ans.module as AttemptAnswer['module'],
        topic: ans.topic as AttemptAnswer['topic'],
        skillArea: ans.skill_area as AttemptAnswer['skillArea'],
        sourceType: ans.source_type as AttemptAnswer['sourceType'],
      }),
    );
    return {
      id: String(a.id),
      sessionKind: a.session_kind as Attempt['sessionKind'],
      startedAt: String(a.started_at),
      endedAt: a.ended_at == null ? undefined : String(a.ended_at),
      module: a.module == null ? undefined : (a.module as Attempt['module']),
      topic: a.topic == null ? undefined : (a.topic as Attempt['topic']),
      mistakesScoped: Number(a.mistakes_scoped) === 1,
      answers,
      scoreCorrect:
        a.score_correct == null ? undefined : Number(a.score_correct),
      scoreTotal: a.score_total == null ? undefined : Number(a.score_total),
      durationMs: a.duration_ms == null ? undefined : Number(a.duration_ms),
    };
  });

  const flags = (
    db.prepare('SELECT * FROM flags ORDER BY created_at ASC').all() as Record<
      string,
      unknown
    >[]
  ).map(
    (f): FlagRecord => ({
      id: String(f.id),
      itemId: String(f.item_id),
      createdAt: String(f.created_at),
      note: f.note == null ? undefined : String(f.note),
      resolved: Number(f.resolved) === 1,
    }),
  );

  const seenRow = db
    .prepare(`SELECT value_json FROM app_meta WHERE key = 'seenHelp'`)
    .get() as { value_json: string } | undefined;
  const activeRow = db
    .prepare(`SELECT value_json FROM app_meta WHERE key = 'activeSession'`)
    .get() as { value_json: string } | undefined;

  let seenHelp = false;
  if (seenRow) {
    try {
      seenHelp = Boolean(JSON.parse(seenRow.value_json));
    } catch {
      seenHelp = false;
    }
  }

  let activeSession: ActiveSession | null = null;
  if (activeRow) {
    try {
      activeSession = JSON.parse(activeRow.value_json) as ActiveSession | null;
    } catch {
      activeSession = null;
    }
  }

  return { catalog, attempts, flags, activeSession, seenHelp };
}

export function saveState(db: Database.Database, state: AppStoreState): void {
  const tx = db.transaction((s: AppStoreState) => {
    db.exec('DELETE FROM attempt_answers');
    db.exec('DELETE FROM attempts');
    db.exec('DELETE FROM questions');
    db.exec('DELETE FROM flags');
    db.exec(`DELETE FROM app_meta WHERE key IN ('seenHelp','activeSession')`);

    const insertQ = db.prepare(`
      INSERT INTO questions (
        id, stem, choices_json, correct_key, rationale,
        module, topic, skill_area, source_type, locale, published, updated_at
      ) VALUES (
        @id, @stem, @choices_json, @correct_key, @rationale,
        @module, @topic, @skill_area, @source_type, @locale, @published, datetime('now')
      )
    `);

    for (const item of s.catalog) {
      insertQ.run({
        id: item.id,
        stem: item.stem,
        choices_json: item.choices ? JSON.stringify(item.choices) : null,
        correct_key: item.correctKey,
        rationale: item.rationale,
        module: item.module,
        topic: item.topic,
        skill_area: item.skillArea,
        source_type: item.sourceType,
        locale: item.locale ?? 'sk',
        published: item.published ? 1 : 0,
      });
    }

    const insertA = db.prepare(`
      INSERT INTO attempts (
        id, session_kind, started_at, ended_at, module, topic,
        mistakes_scoped, score_correct, score_total, duration_ms
      ) VALUES (
        @id, @session_kind, @started_at, @ended_at, @module, @topic,
        @mistakes_scoped, @score_correct, @score_total, @duration_ms
      )
    `);
    const insertAns = db.prepare(`
      INSERT INTO attempt_answers (
        attempt_id, seq, item_id, outcome, given_answer,
        module, topic, skill_area, source_type
      ) VALUES (
        @attempt_id, @seq, @item_id, @outcome, @given_answer,
        @module, @topic, @skill_area, @source_type
      )
    `);

    for (const attempt of s.attempts) {
      insertA.run({
        id: attempt.id,
        session_kind: attempt.sessionKind,
        started_at: attempt.startedAt,
        ended_at: attempt.endedAt ?? null,
        module: attempt.module ?? null,
        topic: attempt.topic ?? null,
        mistakes_scoped: attempt.mistakesScoped ? 1 : 0,
        score_correct: attempt.scoreCorrect ?? null,
        score_total: attempt.scoreTotal ?? null,
        duration_ms: attempt.durationMs ?? null,
      });
      attempt.answers.forEach((ans, seq) => {
        insertAns.run({
          attempt_id: attempt.id,
          seq,
          item_id: ans.itemId,
          outcome: ans.outcome,
          given_answer: ans.givenAnswer ?? null,
          module: ans.module,
          topic: ans.topic,
          skill_area: ans.skillArea,
          source_type: ans.sourceType,
        });
      });
    }

    const insertF = db.prepare(`
      INSERT INTO flags (id, item_id, created_at, note, resolved)
      VALUES (@id, @item_id, @created_at, @note, @resolved)
    `);
    for (const flag of s.flags) {
      insertF.run({
        id: flag.id,
        item_id: flag.itemId,
        created_at: flag.createdAt,
        note: flag.note ?? null,
        resolved: flag.resolved ? 1 : 0,
      });
    }

    const upsertMeta = db.prepare(`
      INSERT INTO app_meta (key, value_json) VALUES (@key, @value_json)
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json
    `);
    upsertMeta.run({
      key: 'seenHelp',
      value_json: JSON.stringify(Boolean(s.seenHelp)),
    });
    upsertMeta.run({
      key: 'activeSession',
      value_json: JSON.stringify(s.activeSession),
    });
  });

  tx(state);
}

export function dbStats(db: Database.Database): {
  questions: number;
  published: number;
  attempts: number;
  answers: number;
  flags: number;
} {
  const questions = (
    db.prepare('SELECT COUNT(*) AS n FROM questions').get() as { n: number }
  ).n;
  const published = (
    db
      .prepare('SELECT COUNT(*) AS n FROM questions WHERE published = 1')
      .get() as { n: number }
  ).n;
  const attempts = (
    db.prepare('SELECT COUNT(*) AS n FROM attempts').get() as { n: number }
  ).n;
  const answers = (
    db.prepare('SELECT COUNT(*) AS n FROM attempt_answers').get() as {
      n: number;
    }
  ).n;
  const flags = (
    db.prepare('SELECT COUNT(*) AS n FROM flags').get() as { n: number }
  ).n;
  return { questions, published, attempts, answers, flags };
}

export { emptyState };
