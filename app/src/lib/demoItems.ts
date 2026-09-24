import type { ContentItem } from '../types/content';

/**
 * Demo bank used when the catalog is empty so exam sessions are runnable (Wave 2).
 * Not written into persistent catalog — lookup only.
 */
export const DEMO_ITEMS: ContentItem[] = [
  {
    id: 'demo_exam_1',
    stem: 'Koľko je 7 × 8?',
    choices: ['54', '56', '63', '64'],
    correctKey: '56',
    rationale: '7 × 8 = 56.',
    module: 'M1',
    topic: 'T1',
    skillArea: 'VSP',
    sourceType: 'synthetic',
    published: true,
  },
  {
    id: 'demo_exam_2',
    stem: 'Ktoré číslo je párne?',
    choices: ['15', '21', '28', '33'],
    correctKey: '28',
    rationale: '28 je deliteľné dvoma.',
    module: 'M1',
    topic: 'T2',
    skillArea: 'VSP',
    sourceType: 'bank',
    published: true,
  },
  {
    id: 'demo_exam_3',
    stem: 'Synonymum slova „rýchly“:',
    choices: ['pomalý', 'bystrý', 'ťažký', 'tichý'],
    correctKey: 'bystrý',
    rationale: '„Bystrý“ môže znamenať rýchly / svižný.',
    module: 'M2',
    topic: 'T3',
    skillArea: 'VJS',
    sourceType: 'synthetic',
    published: true,
  },
  {
    id: 'demo_exam_4',
    stem: 'Koľko stupňov má pravý uhol?',
    choices: ['45', '90', '180', '360'],
    correctKey: '90',
    rationale: 'Pravý uhol má 90°.',
    module: 'M3',
    topic: 'T5',
    skillArea: 'VSP',
    sourceType: 'bank',
    published: true,
  },
  {
    id: 'demo_exam_5',
    stem: 'Antonymum slova „ľahký“:',
    choices: ['jednoduchý', 'ťažký', 'mäkký', 'jasný'],
    correctKey: 'ťažký',
    rationale: 'Opak ľahkého je ťažký.',
    module: 'M2',
    topic: 'T4',
    skillArea: 'VJS',
    sourceType: 'synthetic',
    published: true,
  },
];
