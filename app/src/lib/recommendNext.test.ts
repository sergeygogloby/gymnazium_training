import { describe, expect, it } from 'vitest';
import { recommendNext } from './recommendNext';
import type { Attempt } from '../types/content';

function practiceAttempt(
  partial: Partial<Attempt> & Pick<Attempt, 'id' | 'answers'>,
): Attempt {
  return {
    sessionKind: 'practice',
    startedAt: '2026-01-01T10:00:00.000Z',
    endedAt: '2026-01-01T10:10:00.000Z',
    ...partial,
  };
}

describe('recommendNext', () => {
  it('defaults to M1/T1 when history is empty', () => {
    const rec = recommendNext([]);
    expect(rec.module).toBe('M1');
    expect(rec.topic).toBe('T1');
    expect(rec.reason).toBe('default');
  });

  it('suggests first unfinished module after M1 practice', () => {
    const attempts: Attempt[] = [
      practiceAttempt({
        id: 'a1',
        module: 'M1',
        answers: [
          {
            itemId: 'x',
            outcome: 'correct',
            module: 'M1',
            topic: 'T1',
            skillArea: 'VSP',
            sourceType: 'bank',
          },
        ],
      }),
    ];
    const rec = recommendNext(attempts);
    expect(rec.module).toBe('M2');
    expect(rec.reason).toBe('unfinished');
  });

  it('suggests weakest practice topic when all modules seen', () => {
    const modules = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'] as const;
    const attempts: Attempt[] = modules.map((m, i) =>
      practiceAttempt({
        id: `a${i}`,
        module: m,
        answers: [
          {
            itemId: `i${i}`,
            outcome: m === 'M3' ? 'incorrect' : 'correct',
            module: m,
            topic: m === 'M3' ? 'T5' : 'T1',
            skillArea: 'VSP',
            sourceType: 'bank',
          },
        ],
      }),
    );
    // Give M3 a topic that exists on M3 for clarity
    attempts[2] = practiceAttempt({
      id: 'a2',
      module: 'M3',
      answers: [
        {
          itemId: 'weak',
          outcome: 'incorrect',
          module: 'M3',
          topic: 'T5',
          skillArea: 'VSP',
          sourceType: 'bank',
        },
        {
          itemId: 'weak2',
          outcome: 'incorrect',
          module: 'M3',
          topic: 'T5',
          skillArea: 'VSP',
          sourceType: 'bank',
        },
      ],
    });

    const rec = recommendNext(attempts);
    expect(rec.reason).toBe('weak');
    expect(rec.module).toBe('M3');
    expect(rec.topic).toBe('T5');
  });

  it('ignores exam-only history for unfinished module walk', () => {
    const attempts: Attempt[] = [
      {
        id: 'e1',
        sessionKind: 'exam_30',
        startedAt: '2026-01-01T10:00:00.000Z',
        endedAt: '2026-01-01T10:30:00.000Z',
        module: 'M1',
        answers: [
          {
            itemId: 'x',
            outcome: 'correct',
            module: 'M1',
            topic: 'T1',
            skillArea: 'VSP',
            sourceType: 'bank',
          },
        ],
      },
    ];
    const rec = recommendNext(attempts);
    // Exam does not count as practiced → still unfinished walk from M1
    expect(rec.module).toBe('M1');
    expect(rec.reason).toBe('unfinished');
  });
});
