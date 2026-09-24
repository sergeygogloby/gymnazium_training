import { describe, expect, it } from 'vitest';
import { buildMistakesQueue } from './mistakesQueue';
import type { Attempt, ContentItem } from '../types/content';

const catalog: ContentItem[] = [
  {
    id: 'q1',
    stem: 'First question stem about numbers',
    choices: ['A) 1', 'B) 2'],
    correctKey: 'A',
    rationale: 'Because A',
    module: 'M1',
    topic: 'T1',
    skillArea: 'VSP',
    sourceType: 'bank',
    published: true,
  },
  {
    id: 'q2',
    stem: 'Second question about language',
    choices: ['A) go', 'B) goes'],
    correctKey: 'B',
    rationale: 'Because B',
    module: 'M2',
    topic: 'T3',
    skillArea: 'VJS',
    sourceType: 'synthetic',
    published: true,
  },
];

function attempt(
  partial: Pick<Attempt, 'id' | 'startedAt' | 'answers'> &
    Partial<Attempt>,
): Attempt {
  return {
    sessionKind: 'practice',
    ...partial,
  };
}

describe('buildMistakesQueue', () => {
  it('includes items answered incorrectly', () => {
    const queue = buildMistakesQueue(
      [
        attempt({
          id: 'a1',
          startedAt: '2026-01-01T10:00:00.000Z',
          endedAt: '2026-01-01T10:05:00.000Z',
          answers: [
            {
              itemId: 'q1',
              outcome: 'incorrect',
              module: 'M1',
              topic: 'T1',
              skillArea: 'VSP',
              sourceType: 'bank',
            },
          ],
        }),
      ],
      catalog,
    );
    expect(queue).toHaveLength(1);
    expect(queue[0].itemId).toBe('q1');
    expect(queue[0].sourceType).toBe('bank');
    expect(queue[0].lastMissedAt).toBe('2026-01-01T10:05:00.000Z');
    expect(queue[0].stemPreview).toContain('First question');
  });

  it('dequeues after a later correct answer (restudy clear)', () => {
    const attempts: Attempt[] = [
      attempt({
        id: 'a1',
        startedAt: '2026-01-01T10:00:00.000Z',
        endedAt: '2026-01-01T10:05:00.000Z',
        answers: [
          {
            itemId: 'q1',
            outcome: 'incorrect',
            module: 'M1',
            topic: 'T1',
            skillArea: 'VSP',
            sourceType: 'bank',
          },
          {
            itemId: 'q2',
            outcome: 'incorrect',
            module: 'M2',
            topic: 'T3',
            skillArea: 'VJS',
            sourceType: 'synthetic',
          },
        ],
      }),
      attempt({
        id: 'a2',
        sessionKind: 'practice',
        mistakesScoped: true,
        startedAt: '2026-01-02T10:00:00.000Z',
        endedAt: '2026-01-02T10:10:00.000Z',
        answers: [
          {
            itemId: 'q1',
            outcome: 'correct',
            module: 'M1',
            topic: 'T1',
            skillArea: 'VSP',
            sourceType: 'bank',
          },
        ],
      }),
    ];
    const queue = buildMistakesQueue(attempts, catalog);
    expect(queue.map((e) => e.itemId)).toEqual(['q2']);
  });

  it('re-enqueues when missed again after a correct clear', () => {
    const attempts: Attempt[] = [
      attempt({
        id: 'a1',
        startedAt: '2026-01-01T10:00:00.000Z',
        endedAt: '2026-01-01T10:05:00.000Z',
        answers: [
          {
            itemId: 'q1',
            outcome: 'incorrect',
            module: 'M1',
            topic: 'T1',
            skillArea: 'VSP',
            sourceType: 'bank',
          },
        ],
      }),
      attempt({
        id: 'a2',
        startedAt: '2026-01-02T10:00:00.000Z',
        endedAt: '2026-01-02T10:05:00.000Z',
        mistakesScoped: true,
        answers: [
          {
            itemId: 'q1',
            outcome: 'correct',
            module: 'M1',
            topic: 'T1',
            skillArea: 'VSP',
            sourceType: 'bank',
          },
        ],
      }),
      attempt({
        id: 'a3',
        startedAt: '2026-01-03T10:00:00.000Z',
        endedAt: '2026-01-03T10:05:00.000Z',
        answers: [
          {
            itemId: 'q1',
            outcome: 'incorrect',
            module: 'M1',
            topic: 'T1',
            skillArea: 'VSP',
            sourceType: 'bank',
          },
        ],
      }),
    ];
    expect(buildMistakesQueue(attempts, catalog).map((e) => e.itemId)).toEqual([
      'q1',
    ]);
  });

  it('does not enqueue skipped-only items', () => {
    const queue = buildMistakesQueue(
      [
        attempt({
          id: 'a1',
          startedAt: '2026-01-01T10:00:00.000Z',
          answers: [
            {
              itemId: 'q1',
              outcome: 'skipped',
              module: 'M1',
              topic: 'T1',
              skillArea: 'VSP',
              sourceType: 'bank',
            },
          ],
        }),
      ],
      catalog,
    );
    expect(queue).toHaveLength(0);
  });

  it('respects module and skillArea filters', () => {
    const attempts: Attempt[] = [
      attempt({
        id: 'a1',
        startedAt: '2026-01-01T10:00:00.000Z',
        endedAt: '2026-01-01T10:05:00.000Z',
        answers: [
          {
            itemId: 'q1',
            outcome: 'incorrect',
            module: 'M1',
            topic: 'T1',
            skillArea: 'VSP',
            sourceType: 'bank',
          },
          {
            itemId: 'q2',
            outcome: 'incorrect',
            module: 'M2',
            topic: 'T3',
            skillArea: 'VJS',
            sourceType: 'synthetic',
          },
        ],
      }),
    ];
    expect(
      buildMistakesQueue(attempts, catalog, { skillArea: 'VJS' }).map(
        (e) => e.itemId,
      ),
    ).toEqual(['q2']);
    expect(
      buildMistakesQueue(attempts, catalog, { module: 'M1' }).map(
        (e) => e.itemId,
      ),
    ).toEqual(['q1']);
    expect(
      buildMistakesQueue(attempts, catalog, { sourceType: 'synthetic' }).map(
        (e) => e.itemId,
      ),
    ).toEqual(['q2']);
  });

  it('includes exam incorrect answers in the queue', () => {
    const queue = buildMistakesQueue(
      [
        attempt({
          id: 'ex1',
          sessionKind: 'exam_30',
          startedAt: '2026-01-01T10:00:00.000Z',
          endedAt: '2026-01-01T10:30:00.000Z',
          answers: [
            {
              itemId: 'q2',
              outcome: 'incorrect',
              module: 'M2',
              topic: 'T3',
              skillArea: 'VJS',
              sourceType: 'synthetic',
            },
          ],
        }),
      ],
      catalog,
    );
    expect(queue.map((e) => e.itemId)).toEqual(['q2']);
  });
});
