import { describe, expect, it } from 'vitest';
import {
  examDurationMs,
  formatCountdown,
  isExamKind,
  sessionKindLabel,
} from './sessionKind';
import {
  finalizeExamScores,
  gradeAnswer,
  resolveExamItems,
  shouldRevealAnswerKey,
} from './examSession';
import { DEMO_ITEMS } from './demoItems';
import type { ContentItem } from '../types/content';

describe('sessionKind', () => {
  it('maps exam durations to 30 and 60 minutes', () => {
    expect(examDurationMs('exam_30')).toBe(30 * 60 * 1000);
    expect(examDurationMs('exam_60')).toBe(60 * 60 * 1000);
  });

  it('labels exam kinds distinctly from practice', () => {
    expect(sessionKindLabel('practice')).toBe('Cvičenie');
    expect(sessionKindLabel('exam_30')).toBe('Skúška · 30 min');
    expect(sessionKindLabel('exam_60')).toBe('Skúška · 60 min');
  });

  it('formats countdown mm:ss', () => {
    expect(formatCountdown(30 * 60 * 1000)).toBe('30:00');
    expect(formatCountdown(60 * 60 * 1000)).toBe('60:00');
    expect(formatCountdown(65_000)).toBe('01:05');
    expect(formatCountdown(-1)).toBe('00:00');
  });

  it('detects exam kinds only', () => {
    expect(isExamKind('exam_30')).toBe(true);
    expect(isExamKind('exam_60')).toBe(true);
    expect(isExamKind('practice')).toBe(false);
  });
});

describe('examSession', () => {
  it('uses demo items when catalog is empty', () => {
    expect(resolveExamItems([])).toEqual(DEMO_ITEMS);
  });

  it('prefers published catalog items', () => {
    const item: ContentItem = {
      ...DEMO_ITEMS[0],
      id: 'catalog_1',
      published: true,
    };
    expect(resolveExamItems([item]).map((i) => i.id)).toEqual(['catalog_1']);
  });

  it('grades without exposing key in the answer record beyond outcome', () => {
    const item = DEMO_ITEMS[0];
    const correct = gradeAnswer(item, '56');
    const wrong = gradeAnswer(item, '54');
    const skip = gradeAnswer(item, undefined);
    expect(correct.outcome).toBe('correct');
    expect(wrong.outcome).toBe('incorrect');
    expect(skip.outcome).toBe('skipped');
  });

  it('scores at end including skips in total', () => {
    const scores = finalizeExamScores([
      { ...gradeAnswer(DEMO_ITEMS[0], '56') },
      { ...gradeAnswer(DEMO_ITEMS[1], undefined) },
    ]);
    expect(scores).toEqual({ scoreCorrect: 1, scoreTotal: 2 });
  });

  it('never reveals answer key mid-exam', () => {
    expect(shouldRevealAnswerKey('exam_30', false)).toBe(false);
    expect(shouldRevealAnswerKey('exam_60', false)).toBe(false);
    expect(shouldRevealAnswerKey('exam_30', true)).toBe(true);
  });
});
