import { describe, expect, it } from 'vitest';
import { CURRICULUM_MODULES } from './curriculumMap';
import { MODULES, TOPICS } from '../types/content';

describe('curriculumMap', () => {
  it('lists all six modules with two topics each covering T1–T12', () => {
    expect(CURRICULUM_MODULES.map((m) => m.id)).toEqual([...MODULES]);
    const topicIds = CURRICULUM_MODULES.flatMap((m) => m.topics.map((t) => t.id));
    expect(topicIds).toEqual([...TOPICS]);
    for (const mod of CURRICULUM_MODULES) {
      expect(mod.topics).toHaveLength(2);
      expect(mod.title.length).toBeGreaterThan(0);
    }
  });
});
