import type { ContentItem } from '../types/content';

/**
 * Tiny in-app demo bank used when the catalog store is empty,
 * so practice is testable without CSV upload. Tagged demo/bank.
 */
export const DEMO_CATALOG: ContentItem[] = [
  {
    id: 'demo_m1_t1_vsp_01',
    stem: 'Ktoré číslo je najväčšie?',
    choices: ['A) 3/4', 'B) 0,8', 'C) 7/10', 'D) 0,75'],
    correctKey: 'B',
    rationale: '0,8 = 8/10 = 4/5. To je viac ako 3/4 (=0,75) a 7/10 (=0,7).',
    module: 'M1',
    topic: 'T1',
    skillArea: 'VSP',
    sourceType: 'bank',
    locale: 'sk',
    published: true,
  },
  {
    id: 'demo_m1_t2_vsp_02',
    stem: 'Koľko je 15 % z 200?',
    choices: ['A) 20', 'B) 25', 'C) 30', 'D) 35'],
    correctKey: 'C',
    rationale: '15 % z 200 = 0,15 × 200 = 30.',
    module: 'M1',
    topic: 'T2',
    skillArea: 'VSP',
    sourceType: 'bank',
    locale: 'sk',
    published: true,
  },
  {
    id: 'demo_m2_t3_vjs_01',
    stem: 'Which word best completes the sentence: "She ___ to school every day."?',
    choices: ['A) go', 'B) goes', 'C) going', 'D) gone'],
    correctKey: 'B',
    rationale: 'Third-person singular present tense takes -s: she goes.',
    module: 'M2',
    topic: 'T3',
    skillArea: 'VJS',
    sourceType: 'synthetic',
    locale: 'en',
    published: true,
  },
  {
    id: 'demo_m2_t4_vjs_02',
    stem: 'Choose the antonym of "cold".',
    choices: ['A) cool', 'B) hot', 'C) wet', 'D) dark'],
    correctKey: 'B',
    rationale: 'Hot is the opposite of cold.',
    module: 'M2',
    topic: 'T4',
    skillArea: 'VJS',
    sourceType: 'synthetic',
    locale: 'en',
    published: true,
  },
  {
    id: 'demo_m3_t5_vsp_01',
    stem: 'Obvod štvorca so stranou 5 cm je:',
    choices: ['A) 10 cm', 'B) 15 cm', 'C) 20 cm', 'D) 25 cm'],
    correctKey: 'C',
    rationale: 'Obvod štvorca = 4 × strana = 4 × 5 = 20 cm.',
    module: 'M3',
    topic: 'T5',
    skillArea: 'VSP',
    sourceType: 'bank',
    locale: 'sk',
    published: true,
  },
];

export function isDemoItemId(id: string): boolean {
  return id.startsWith('demo_');
}
