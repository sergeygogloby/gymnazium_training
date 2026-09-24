import { beforeEach, describe, expect, it } from 'vitest';
import { sessionStore } from '../store/sessionStore';
import { DEMO_ITEMS } from './demoItems';

beforeEach(() => {
  sessionStore.__resetForTests();
});

describe('sessionStore exam flow', () => {
  it('starts exam_30 with 30-minute endsAt and demo items', () => {
    const now = 1_700_000_000_000;
    const id = sessionStore.startSession('exam_30', { nowMs: now });
    const { activeSession, attempts } = sessionStore.getState();
    expect(activeSession?.attemptId).toBe(id);
    expect(activeSession?.sessionKind).toBe('exam_30');
    expect(activeSession?.itemIds?.length).toBe(DEMO_ITEMS.length);
    expect(Date.parse(activeSession!.endsAt!)).toBe(now + 30 * 60 * 1000);
    expect(attempts.find((a) => a.id === id)?.sessionKind).toBe('exam_30');
  });

  it('starts exam_60 with 60-minute endsAt', () => {
    const now = 1_700_000_000_000;
    sessionStore.startSession('exam_60', { nowMs: now });
    const { activeSession } = sessionStore.getState();
    expect(activeSession?.sessionKind).toBe('exam_60');
    expect(Date.parse(activeSession!.endsAt!)).toBe(now + 60 * 60 * 1000);
  });

  it('does not attach exam queue to practice starts', () => {
    sessionStore.startSession('practice');
    const { activeSession } = sessionStore.getState();
    expect(activeSession?.sessionKind).toBe('practice');
    expect(activeSession?.itemIds).toBeUndefined();
    expect(activeSession?.endsAt).toBeUndefined();
  });

  it('records answers silently and scores only on endSession', () => {
    const now = 1_700_000_000_000;
    const id = sessionStore.startSession('exam_30', { nowMs: now });
    sessionStore.recordExamResponse('56');
    let attempt = sessionStore.getState().attempts.find((a) => a.id === id)!;
    expect(attempt.answers).toHaveLength(1);
    expect(attempt.scoreCorrect).toBeUndefined();
    expect(attempt.endedAt).toBeUndefined();

    sessionStore.endSession({ nowMs: now + 5_000 });
    attempt = sessionStore.getState().attempts.find((a) => a.id === id)!;
    expect(attempt.sessionKind).toBe('exam_30');
    expect(attempt.endedAt).toBeTruthy();
    expect(attempt.scoreCorrect).toBe(1);
    expect(attempt.scoreTotal).toBe(DEMO_ITEMS.length);
    expect(attempt.answers.filter((a) => a.outcome === 'skipped').length).toBe(
      DEMO_ITEMS.length - 1,
    );
    expect(sessionStore.getState().activeSession).toBeNull();
  });

  it('persists exam_60 distinctly from exam_30', () => {
    sessionStore.startSession('exam_30');
    sessionStore.endSession();
    sessionStore.startSession('exam_60');
    sessionStore.endSession();
    const kinds = sessionStore.getState().attempts.map((a) => a.sessionKind);
    expect(kinds).toEqual(['exam_30', 'exam_60']);
  });
});
