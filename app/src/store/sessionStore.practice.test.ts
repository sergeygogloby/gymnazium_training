import { beforeEach, describe, expect, it } from 'vitest';

const mem = new Map<string, string>();
const localStorageMock = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => {
    mem.set(k, v);
  },
  removeItem: (k: string) => {
    mem.delete(k);
  },
  clear: () => mem.clear(),
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  configurable: true,
});

const { sessionStore } = await import('./sessionStore');

describe('practice session persist', () => {
  beforeEach(() => {
    mem.clear();
    sessionStore.resetForTests();
  });

  it('seeds demo catalog and persists practice attempt with kind', () => {
    const id = sessionStore.startSession('practice', { limit: 3 });
    const state = sessionStore.getState();
    expect(state.catalog.length).toBeGreaterThan(0);
    expect(state.activeSession?.sessionKind).toBe('practice');
    expect(state.activeSession?.itemIds?.length).toBe(3);
    expect(state.attempts.find((a) => a.id === id)?.sessionKind).toBe(
      'practice',
    );

    const itemId = state.activeSession!.itemIds![0];
    const item = state.catalog.find((c) => c.id === itemId)!;
    sessionStore.appendAnswer({
      itemId: item.id,
      outcome: 'correct',
      givenAnswer: item.correctKey,
      module: item.module,
      topic: item.topic,
      skillArea: item.skillArea,
      sourceType: item.sourceType,
    });
    sessionStore.endSession();
    const closed = sessionStore.getState().attempts.find((a) => a.id === id)!;
    expect(closed.sessionKind).toBe('practice');
    expect(closed.endedAt).toBeTruthy();
    expect(closed.scoreCorrect).toBe(1);
    expect(closed.scoreTotal).toBe(1);
    expect(closed.answers[0].module).toBe(item.module);
    expect(sessionStore.getState().activeSession).toBeNull();
  });

  it('records flags without auth', () => {
    sessionStore.addFlag('demo_m1_t1_vsp_01', 'typo');
    expect(sessionStore.getState().flags.at(-1)?.itemId).toBe(
      'demo_m1_t1_vsp_01',
    );
  });

  it('keeps practice distinct from exam kinds in storage', () => {
    const practiceId = sessionStore.startSession('practice', { limit: 1 });
    sessionStore.endSession();
    const examId = sessionStore.startSession('exam_30');
    sessionStore.endSession();
    const kinds = sessionStore
      .getState()
      .attempts.filter((a) => a.id === practiceId || a.id === examId)
      .map((a) => a.sessionKind);
    expect(kinds).toEqual(['practice', 'exam_30']);
  });

  it('starts mistakes-scoped practice with explicit item ids only', () => {
    sessionStore.ensureDemoCatalog();
    const ids = ['demo_m1_t1_vsp_01', 'demo_m1_t2_vsp_02'];
    const attemptId = sessionStore.startSession('practice', {
      mistakesScoped: true,
      itemIds: ids,
    });
    const active = sessionStore.getState().activeSession;
    expect(active?.sessionKind).toBe('practice');
    expect(active?.mistakesScoped).toBe(true);
    expect(active?.itemIds).toEqual(ids);
    expect(
      sessionStore.getState().attempts.find((a) => a.id === attemptId)
        ?.mistakesScoped,
    ).toBe(true);
  });

  it('does not invent a practice set when mistakes queue is empty', () => {
    sessionStore.ensureDemoCatalog();
    sessionStore.startSession('practice', {
      mistakesScoped: true,
      itemIds: [],
    });
    expect(sessionStore.getState().activeSession?.itemIds).toEqual([]);
  });
});
