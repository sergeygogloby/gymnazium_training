/**
 * VSJP8 curriculum map — M1–M6 with two topics each
 * (docs/materials-structure.md §2). Used by V02 Curriculum (F01).
 */

import type { ModuleId, TopicId } from '../types/content';

export interface CurriculumTopic {
  id: TopicId;
  title: string;
}

export interface CurriculumModule {
  id: ModuleId;
  title: string;
  topics: CurriculumTopic[];
}

/** Short Slovak titles aligned to the materials map. */
export const CURRICULUM_MODULES: CurriculumModule[] = [
  {
    id: 'M1',
    title: 'Verbálne základy',
    topics: [
      { id: 'T1', title: 'Doplňanie slov / zoraďovanie viet' },
      { id: 'T2', title: 'Logické dvojice slov' },
    ],
  },
  {
    id: 'M2',
    title: 'Postupnosti a tvar slov',
    topics: [
      { id: 'T3', title: 'Verbalizácia / postupnosti' },
      { id: 'T4', title: 'Predpony, prípony, anagramy' },
    ],
  },
  {
    id: 'M3',
    title: 'Kvantita a dáta',
    topics: [
      { id: 'T5', title: 'Numerické / logické' },
      { id: 'T6', title: 'Grafy, tabuľky, údaje' },
    ],
  },
  {
    id: 'M4',
    title: 'Lexika a podmienky',
    topics: [
      { id: 'T7', title: 'Synonymá / antonymá / frazémy' },
      { id: 'T8', title: 'Práca s podmienkami' },
    ],
  },
  {
    id: 'M5',
    title: 'Čítanie a latinské stopy',
    topics: [
      { id: 'T9', title: 'Zoskupovanie / porozumenie' },
      { id: 'T10', title: 'Latinčina, citáty, rytmus' },
    ],
  },
  {
    id: 'M6',
    title: 'Cudzí text a šifrovanie',
    topics: [
      { id: 'T11', title: 'Cudzojazyčný text' },
      { id: 'T12', title: 'Šifrovanie / samohlásky' },
    ],
  },
];

export function moduleLabel(id: ModuleId): string {
  const mod = CURRICULUM_MODULES.find((m) => m.id === id);
  return mod ? `${mod.id} — ${mod.title}` : id;
}

export function topicLabel(id: TopicId): string {
  for (const mod of CURRICULUM_MODULES) {
    const topic = mod.topics.find((t) => t.id === id);
    if (topic) return `${topic.id} — ${topic.title}`;
  }
  return id;
}
