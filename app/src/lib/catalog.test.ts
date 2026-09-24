import { describe, expect, it } from 'vitest';
import {
  catalogStats,
  selectEligibleItems,
  sourceTypeLabel,
} from './catalog';
import type { ContentItem } from '../types/content';

const items: ContentItem[] = [
  {
    id: 'a',
    stem: 'A',
    correctKey: 'A',
    rationale: 'r',
    module: 'M1',
    topic: 'T1',
    skillArea: 'VSP',
    sourceType: 'bank',
    published: true,
  },
  {
    id: 'b',
    stem: 'B',
    correctKey: 'B',
    rationale: 'r',
    module: 'M2',
    topic: 'T2',
    skillArea: 'VJS',
    sourceType: 'synthetic',
    published: true,
  },
  {
    id: 'c',
    stem: 'C',
    correctKey: 'C',
    rationale: 'r',
    module: 'M3',
    topic: 'T5',
    skillArea: 'VSP',
    sourceType: 'bank',
    published: false,
  },
];

describe('catalog eligibility (F14 / F18)', () => {
  it('excludes published=false from new sessions', () => {
    const eligible = selectEligibleItems(items);
    expect(eligible.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('filters by skillArea and sourceType', () => {
    expect(
      selectEligibleItems(items, { skillArea: 'VJS' }).map((i) => i.id),
    ).toEqual(['b']);
    expect(
      selectEligibleItems(items, { sourceType: 'synthetic' }).map(
        (i) => i.id,
      ),
    ).toEqual(['b']);
  });

  it('reports stats and SK synthetic label', () => {
    expect(catalogStats(items)).toEqual({
      total: 3,
      published: 2,
      hidden: 1,
      synthetic: 1,
      eligible: 2,
    });
    expect(sourceTypeLabel('synthetic')).toBe('syntetická');
    expect(sourceTypeLabel('bank')).toBe('banková');
  });
});
