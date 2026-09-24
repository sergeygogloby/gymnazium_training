import { describe, expect, it } from 'vitest';
import { DEMO_CATALOG } from './demoCatalog';
import {
  gradeAnswer,
  normalizeAnswerKey,
  selectPracticeItems,
} from './selectPracticeItems';

describe('selectPracticeItems', () => {
  it('returns only published items up to limit', () => {
    const items = selectPracticeItems(DEMO_CATALOG, { limit: 3 });
    expect(items).toHaveLength(3);
    expect(items.every((i) => i.published)).toBe(true);
  });

  it('filters by skillArea VSP', () => {
    const items = selectPracticeItems(DEMO_CATALOG, {
      skillArea: 'VSP',
      limit: 10,
    });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.skillArea === 'VSP')).toBe(true);
  });

  it('filters by module', () => {
    const items = selectPracticeItems(DEMO_CATALOG, {
      module: 'M2',
      limit: 10,
    });
    expect(items.every((i) => i.module === 'M2')).toBe(true);
  });
});

describe('gradeAnswer', () => {
  const item = DEMO_CATALOG[0];

  it('accepts letter key', () => {
    expect(gradeAnswer(item, 'B')).toBe('correct');
    expect(gradeAnswer(item, 'A')).toBe('incorrect');
  });

  it('accepts choice-prefixed answer', () => {
    expect(gradeAnswer(item, 'B) 0,8')).toBe('correct');
  });
});

describe('normalizeAnswerKey', () => {
  it('extracts leading letter', () => {
    expect(normalizeAnswerKey('a) foo')).toBe('A');
    expect(normalizeAnswerKey('C')).toBe('C');
  });
});
