#!/usr/bin/env tsx
/**
 * Set published=1 on every question in local SQLite.
 *
 * Usage: npx tsx server/src/publishAll.ts
 *
 * If the DB has no questions yet, import a CSV first, e.g.:
 *   npm run import-csv -- ../content/published/pilot-t5-synth-20260924_M3_T5.csv
 */

import { dbStats, openDb } from './db.js';

const db = openDb();
const before = dbStats(db);

if (before.questions === 0) {
  db.close();
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: 'database_empty',
        hint: 'publish-all only flips flags. Import questions first:',
        command:
          'npm run import-csv -- ../content/published/pilot-t5-synth-20260924_M3_T5.csv',
        orFromRoot:
          'npm run import-csv -- content/published/pilot-t5-synth-20260924_M3_T5.csv',
      },
      null,
      2,
    ),
  );
  process.exit(1);
}

const result = db
  .prepare(
    "UPDATE questions SET published = 1, updated_at = datetime('now')",
  )
  .run();
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
