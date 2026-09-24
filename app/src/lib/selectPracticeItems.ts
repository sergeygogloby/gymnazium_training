import type {
  ContentItem,
  ModuleId,
  SkillArea,
  TopicId,
} from '../types/content';

export interface PracticeItemFilter {
  module?: ModuleId;
  topic?: TopicId;
  skillArea?: SkillArea;
  /** Cap session length; default 5. */
  limit?: number;
}

/** Published catalog items matching optional module/topic/VŠP|VJS filter. */
export function selectPracticeItems(
  catalog: ContentItem[],
  filter: PracticeItemFilter = {},
): ContentItem[] {
  const limit = filter.limit ?? 5;
  const published = catalog.filter((item) => item.published);
  const matched = published.filter((item) => {
    if (filter.module && item.module !== filter.module) return false;
    if (filter.topic && item.topic !== filter.topic) return false;
    if (filter.skillArea && item.skillArea !== filter.skillArea) return false;
    return true;
  });
  return matched.slice(0, limit);
}

/** Normalize MCQ letter from choice text or raw key (A / A) / index). */
export function normalizeAnswerKey(raw: string): string {
  const trimmed = raw.trim();
  const letter = trimmed.match(/^([A-Da-d])\b/);
  if (letter) return letter[1].toUpperCase();
  return trimmed.toUpperCase();
}

export function gradeAnswer(
  item: ContentItem,
  givenAnswer: string | undefined,
): 'correct' | 'incorrect' {
  if (givenAnswer == null || givenAnswer.trim() === '') return 'incorrect';
  return normalizeAnswerKey(givenAnswer) === normalizeAnswerKey(item.correctKey)
    ? 'correct'
    : 'incorrect';
}
