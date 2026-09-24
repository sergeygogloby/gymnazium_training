import cors from 'cors';
import express from 'express';
import {
  dbStats,
  defaultDbPath,
  emptyState,
  loadState,
  openDb,
  saveState,
} from './db.js';
import type { AppStoreState } from './types.js';

const PORT = Number(process.env.PORT || 8787);
const dbPath = defaultDbPath();
const db = openDb(dbPath);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    dbPath,
    engine: 'sqlite',
    stats: dbStats(db),
  });
});

/** Full household state — questions + attempts/results + flags + session meta. */
app.get('/api/state', (_req, res) => {
  res.json(loadState(db));
});

/**
 * Replace full state (source of truth write).
 * Used by the SPA after every mutation so LAN clients share one SQLite file.
 */
app.put('/api/state', (req, res) => {
  const body = req.body as Partial<AppStoreState> | null;
  if (!body || typeof body !== 'object') {
    res.status(400).json({ ok: false, error: 'body must be AppStoreState JSON' });
    return;
  }
  const next: AppStoreState = {
    ...emptyState(),
    catalog: Array.isArray(body.catalog) ? body.catalog : [],
    attempts: Array.isArray(body.attempts) ? body.attempts : [],
    flags: Array.isArray(body.flags) ? body.flags : [],
    activeSession: body.activeSession ?? null,
    seenHelp: Boolean(body.seenHelp),
  };
  saveState(db, next);
  res.json({ ok: true, stats: dbStats(db) });
});

app.get('/api/questions', (_req, res) => {
  res.json({ items: loadState(db).catalog });
});

app.get('/api/attempts', (_req, res) => {
  res.json({ attempts: loadState(db).attempts });
});

app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(
    `[gymnazium-server] SQLite at ${dbPath} — listening on http://0.0.0.0:${PORT}`,
  );
});
