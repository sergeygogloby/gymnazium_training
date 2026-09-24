import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { loadState, openDb, saveState, dbStats } from './db.js';
import type { AppStoreState } from './types.js';

const tmpFiles: string[] = [];

afterEach(() => {
  for (const f of tmpFiles.splice(0)) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
    try {
      fs.unlinkSync(`${f}-wal`);
      fs.unlinkSync(`${f}-shm`);
    } catch {
      /* ignore */
    }
  }
});

function tmpDb() {
  const p = path.join(
    os.tmpdir(),
    `gym-test-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`,
  );
  tmpFiles.push(p);
  return openDb(p);
}

describe('sqlite persistence', () => {
  it('creates schema and round-trips questions + attempts', () => {
    const db = tmpDb();
    const state: AppStoreState = {
      catalog: [
        {
          id: 'q1',
          stem: 'Koľko je 2+2?',
          choices: ['3', '4', '5', '6'],
          correctKey: 'B',
          rationale: '2+2=4',
          module: 'M3',
          topic: 'T5',
          skillArea: 'VSP',
          sourceType: 'synthetic',
          locale: 'sk',
          published: true,
        },
      ],
      attempts: [
        {
          id: 'att1',
          sessionKind: 'practice',
          startedAt: '2026-09-24T10:00:00.000Z',
          endedAt: '2026-09-24T10:05:00.000Z',
          module: 'M3',
          topic: 'T5',
          mistakesScoped: false,
          answers: [
            {
              itemId: 'q1',
              outcome: 'correct',
              givenAnswer: '4',
              module: 'M3',
              topic: 'T5',
              skillArea: 'VSP',
              sourceType: 'synthetic',
            },
          ],
          scoreCorrect: 1,
          scoreTotal: 1,
          durationMs: 300000,
        },
      ],
      flags: [
        {
          id: 'flag1',
          itemId: 'q1',
          createdAt: '2026-09-24T10:06:00.000Z',
          note: 'ok',
        },
      ],
      activeSession: null,
      seenHelp: true,
    };

    saveState(db, state);
    const loaded = loadState(db);
    expect(loaded.catalog).toHaveLength(1);
    expect(loaded.catalog[0].id).toBe('q1');
    expect(loaded.catalog[0].choices).toEqual(['3', '4', '5', '6']);
    expect(loaded.catalog[0].published).toBe(true);
    expect(loaded.attempts).toHaveLength(1);
    expect(loaded.attempts[0].answers[0].outcome).toBe('correct');
    expect(loaded.flags).toHaveLength(1);
    expect(loaded.seenHelp).toBe(true);
    expect(dbStats(db).answers).toBe(1);
    expect(dbStats(db).insights.correctAnswers).toBe(1);
    expect(dbStats(db).insights.completedAttempts).toBe(1);
    db.close();
  });

  it('replaces state on save (no orphans)', () => {
    const db = tmpDb();
    saveState(db, {
      catalog: [
        {
          id: 'old',
          stem: 'x',
          correctKey: 'A',
          rationale: 'r',
          module: 'M1',
          topic: 'T1',
          skillArea: 'VJS',
          sourceType: 'bank',
          published: false,
        },
      ],
      attempts: [],
      flags: [],
      activeSession: null,
      seenHelp: false,
    });
    saveState(db, {
      catalog: [],
      attempts: [],
      flags: [],
      activeSession: {
        sessionKind: 'practice',
        attemptId: 'att_x',
        itemIds: [],
        currentIndex: 0,
      },
      seenHelp: false,
    });
    const loaded = loadState(db);
    expect(loaded.catalog).toHaveLength(0);
    expect(loaded.activeSession?.attemptId).toBe('att_x');
    db.close();
  });
});
