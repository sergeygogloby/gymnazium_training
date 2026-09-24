import { describe, expect, it } from 'vitest';
import { DEMO_ITEMS } from './demoItems';
import { resolveExamItems } from './examSession';
import type { ContentItem } from '../types/content';

const bank: ContentItem[] = [
  {
    id: 'p1',
    stem: 'a',
    correctKey: 'A',
    rationale: 'r',
    module: 'M1',
    topic: 'T1',
    skillArea: 'VSP',
    sourceType: 'bank',
    published: true,
  },
  {
    id: 'p2',
    stem: 'b',
    correctKey: 'B',
    rationale: 'r',
    module: 'M2',
    topic: 'T3',
    skillArea: 'VJS',
    sourceType: 'bank',
    published: true,
  },
  {
    id: 'hidden',
    stem: 'h',
    correctKey: 'A',
    rationale: 'r',
    module: 'M1',
    topic: 'T1',
    skillArea: 'VSP',
    sourceType: 'bank',
    published: false,
  },
];

describe('resolveExamItems filters (F17)', () => {
  it('filters published catalog by skillArea', () => {
    const items = resolveExamItems(bank, { skillArea: 'VJS' });
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('p2');
  });

  it('filters by module', () => {
    const items = resolveExamItems(bank, { module: 'M1' });
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('p1');
  });

  it('uses demo items when catalog empty and still filters', () => {
    const items = resolveExamItems([], { skillArea: 'VJS' });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.skillArea === 'VJS')).toBe(true);
    expect(items.every((i) => DEMO_ITEMS.some((d) => d.id === i.id))).toBe(
      true,
    );
  });

  it('falls back to full pool when filter matches nothing', () => {
    const items = resolveExamItems(bank, { module: 'M6' });
    expect(items.map((i) => i.id).sort()).toEqual(['p1', 'p2']);
  });
});
