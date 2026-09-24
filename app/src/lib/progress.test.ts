import { describe, expect, it } from 'vitest';
import type { Attempt, AttemptAnswer } from '../types/content';
import {
  computeEffortVsAccuracy,
  computeGaps,
  computeInsightSummary,
  computeOutcomeMix,
  computeProgress,
  computeSessionScoreTrend,
  computeSkillAreaProgress,
  computeStreak,
  computeSuggestions,
  filterAttemptsBySection,
} from './progress';

function ans(
  partial: Partial<AttemptAnswer> & Pick<AttemptAnswer, 'itemId' | 'outcome'>,
): AttemptAnswer {
  return {
    module: 'M1',
    topic: 'T1',
    skillArea: 'VSP',
    sourceType: 'bank',
    ...partial,
  };
}

function attempt(
  partial: Partial<Attempt> &
    Pick<Attempt, 'id' | 'sessionKind' | 'startedAt'>,
): Attempt {
  return {
    answers: [],
    endedAt: partial.endedAt ?? partial.startedAt,
    ...partial,
  };
}

describe('filterAttemptsBySection', () => {
  const sample: Attempt[] = [
    attempt({
      id: 'p1',
      sessionKind: 'practice',
      startedAt: '2026-09-20T10:00:00.000Z',
      answers: [ans({ itemId: 'a', outcome: 'correct' })],
      scoreCorrect: 1,
      scoreTotal: 1,
    }),
    attempt({
      id: 'e30',
      sessionKind: 'exam_30',
      startedAt: '2026-09-21T10:00:00.000Z',
      answers: [ans({ itemId: 'b', outcome: 'incorrect', topic: 'T2' })],
      scoreCorrect: 0,
      scoreTotal: 1,
    }),
    attempt({
      id: 'e60',
      sessionKind: 'exam_60',
      startedAt: '2026-09-22T10:00:00.000Z',
      answers: [ans({ itemId: 'c', outcome: 'correct', module: 'M2', topic: 'T3' })],
      scoreCorrect: 1,
      scoreTotal: 1,
    }),
    attempt({
      id: 'open',
      sessionKind: 'practice',
      startedAt: '2026-09-23T10:00:00.000Z',
      endedAt: undefined,
      answers: [],
    }),
  ];

  it('keeps practice and exams separate — never mixes into one filter', () => {
    const practice = filterAttemptsBySection(sample, 'practice');
    const exams = filterAttemptsBySection(sample, 'exams');
    expect(practice.map((a) => a.id)).toEqual(['p1']);
    expect(exams.map((a) => a.id).sort()).toEqual(['e30', 'e60']);
    expect(filterAttemptsBySection(sample, 'exam_30').map((a) => a.id)).toEqual(
      ['e30'],
    );
    expect(filterAttemptsBySection(sample, 'exam_60').map((a) => a.id)).toEqual(
      ['e60'],
    );
  });

  it('ignores open (unended) attempts', () => {
    expect(filterAttemptsBySection(sample, 'practice')).toHaveLength(1);
  });
});

describe('computeProgress + gaps', () => {
  it('derives module/topic accuracy only from the section attempts', () => {
    const practice = [
      attempt({
        id: 'p1',
        sessionKind: 'practice',
        startedAt: '2026-09-20T10:00:00.000Z',
        durationMs: 60_000,
        answers: [
          ans({ itemId: '1', outcome: 'correct', module: 'M1', topic: 'T1' }),
          ans({ itemId: '2', outcome: 'incorrect', module: 'M1', topic: 'T1' }),
          ans({ itemId: '3', outcome: 'incorrect', module: 'M1', topic: 'T2' }),
        ],
        scoreCorrect: 1,
        scoreTotal: 3,
      }),
    ];
    const exam = [
      attempt({
        id: 'e1',
        sessionKind: 'exam_30',
        startedAt: '2026-09-21T10:00:00.000Z',
        answers: [
          ans({ itemId: 'x', outcome: 'correct', module: 'M1', topic: 'T1' }),
          ans({ itemId: 'y', outcome: 'correct', module: 'M1', topic: 'T1' }),
        ],
        scoreCorrect: 2,
        scoreTotal: 2,
      }),
    ];

    const practiceProg = computeProgress(practice);
    const examProg = computeProgress(exam);
    const m1Practice = practiceProg.find((m) => m.module === 'M1')!;
    const m1Exam = examProg.find((m) => m.module === 'M1')!;

    // Practice T1 is 50%; exam T1 is 100% — must not silently merge.
    expect(m1Practice.topics.find((t) => t.topic === 'T1')?.accuracy).toBe(0.5);
    expect(m1Exam.topics.find((t) => t.topic === 'T1')?.accuracy).toBe(1);

    const gaps = computeGaps(practice, 2);
    expect(gaps[0].topic).toBe('T2');
    expect(gaps.length).toBeGreaterThanOrEqual(1);
  });
});

describe('computeSuggestions', () => {
  it('returns 1–3 actions including a startable practice suggestion', () => {
    const attempts = [
      attempt({
        id: 'p1',
        sessionKind: 'practice',
        startedAt: '2026-09-20T10:00:00.000Z',
        answers: [
          ans({ itemId: '1', outcome: 'incorrect', module: 'M3', topic: 'T5' }),
          ans({ itemId: '2', outcome: 'incorrect', module: 'M3', topic: 'T5' }),
        ],
        scoreCorrect: 0,
        scoreTotal: 2,
      }),
    ];
    const suggestions = computeSuggestions(attempts, { incorrectCount: 2 });
    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    expect(suggestions.length).toBeLessThanOrEqual(3);
    expect(suggestions.some((s) => s.action.type === 'practice')).toBe(true);
    expect(suggestions.some((s) => s.action.type === 'mistakes')).toBe(true);
  });
});

describe('computeStreak', () => {
  it('marks calendar days from dated activity and empty when none', () => {
    expect(computeStreak([]).empty).toBe(true);

    const now = new Date(2026, 8, 24, 12, 0, 0); // Sep 24 2026 local
    const attempts = [
      attempt({
        id: 'p1',
        sessionKind: 'practice',
        startedAt: new Date(2026, 8, 24, 9, 0, 0).toISOString(),
        answers: [ans({ itemId: '1', outcome: 'correct' })],
      }),
      attempt({
        id: 'p2',
        sessionKind: 'exam_30',
        startedAt: new Date(2026, 8, 22, 9, 0, 0).toISOString(),
        answers: [ans({ itemId: '2', outcome: 'correct' })],
      }),
    ];
    const streak = computeStreak(attempts, now);
    expect(streak.empty).toBe(false);
    expect(streak.recentDays).toHaveLength(14);
    expect(streak.recentDays.some((d) => d.count > 0)).toBe(true);
    expect(streak.daysThisWeek).toBeGreaterThanOrEqual(1);
  });
});

describe('computeEffortVsAccuracy', () => {
  it('distinguishes no-practice from practiced-but-stuck', () => {
    const empty = computeEffortVsAccuracy([]);
    expect(empty.cue).toBe('empty');

    const examOnly = [
      attempt({
        id: 'e1',
        sessionKind: 'exam_30',
        startedAt: '2026-09-21T10:00:00.000Z',
        answers: [ans({ itemId: '1', outcome: 'correct' })],
        scoreCorrect: 1,
        scoreTotal: 1,
      }),
    ];
    expect(computeEffortVsAccuracy(examOnly).cue).toBe('no_practice');

    const stuck = [
      attempt({
        id: 'p1',
        sessionKind: 'practice',
        startedAt: '2026-09-20T10:00:00.000Z',
        answers: [
          ans({ itemId: '1', outcome: 'incorrect', module: 'M1', topic: 'T1' }),
          ans({ itemId: '2', outcome: 'incorrect', module: 'M1', topic: 'T1' }),
        ],
        scoreCorrect: 0,
        scoreTotal: 2,
      }),
      attempt({
        id: 'p2',
        sessionKind: 'practice',
        startedAt: '2026-09-21T10:00:00.000Z',
        answers: [
          ans({ itemId: '3', outcome: 'incorrect', module: 'M1', topic: 'T1' }),
          ans({ itemId: '4', outcome: 'incorrect', module: 'M1', topic: 'T1' }),
        ],
        scoreCorrect: 0,
        scoreTotal: 2,
      }),
    ];
    const cue = computeEffortVsAccuracy(stuck);
    expect(cue.cue).toBe('practiced_stuck');
    expect(cue.topic).toBe('T1');
  });
});

describe('insight aggregates', () => {
  const sample: Attempt[] = [
    attempt({
      id: 'p1',
      sessionKind: 'practice',
      startedAt: '2026-09-20T10:00:00.000Z',
      durationMs: 60_000,
      answers: [
        ans({ itemId: 'a', outcome: 'correct', skillArea: 'VSP' }),
        ans({
          itemId: 'b',
          outcome: 'incorrect',
          skillArea: 'VJS',
          topic: 'T2',
        }),
        ans({ itemId: 'c', outcome: 'skipped', skillArea: 'VSP' }),
      ],
      scoreCorrect: 1,
      scoreTotal: 3,
    }),
    attempt({
      id: 'e1',
      sessionKind: 'exam_30',
      startedAt: '2026-09-21T10:00:00.000Z',
      durationMs: 120_000,
      answers: [
        ans({ itemId: 'd', outcome: 'correct', module: 'M2', topic: 'T3' }),
      ],
      scoreCorrect: 1,
      scoreTotal: 1,
    }),
  ];

  it('computeInsightSummary totals sessions and accuracy', () => {
    const practice = filterAttemptsBySection(sample, 'practice');
    const s = computeInsightSummary(practice);
    expect(s.sessionCount).toBe(1);
    expect(s.answerCount).toBe(3);
    expect(s.correctCount).toBe(1);
    expect(s.accuracy).toBeCloseTo(1 / 3);
    expect(s.durationMs).toBe(60_000);
    expect(s.activeDays).toBe(1);
  });

  it('computeSkillAreaProgress splits VSP/VJS', () => {
    const rows = computeSkillAreaProgress(
      filterAttemptsBySection(sample, 'practice'),
    );
    expect(rows.find((r) => r.skillArea === 'VSP')?.answered).toBe(2);
    expect(rows.find((r) => r.skillArea === 'VJS')?.answered).toBe(1);
  });

  it('computeOutcomeMix counts outcomes', () => {
    const mix = computeOutcomeMix(filterAttemptsBySection(sample, 'practice'));
    expect(mix).toEqual({
      correct: 1,
      incorrect: 1,
      skipped: 1,
      total: 3,
    });
  });

  it('computeSessionScoreTrend returns chronological points', () => {
    const pts = computeSessionScoreTrend(sample, 12);
    expect(pts).toHaveLength(2);
    expect(pts[0].id).toBe('p1');
    expect(pts[1].accuracy).toBe(1);
  });
});
