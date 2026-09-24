#!/usr/bin/env tsx
/**
 * Set published=1 on every question in local SQLite.
 *
 * Usage: npx tsx server/src/publishAll.ts
 */

import { dbStats, openDb } from './db.js';

const db = openDb();
const before = dbStats(db);
const result = db.prepare('UPDATE questions SET published = 1, updated_at = datetime(\'now\')').run();
const after = dbStats(db);
db.close();

console.log(
  JSON.stringify(
    {
      ok: true,
      changed: result.changes,
      before,
      after,
    },
    null,
    2,
  ),
);
