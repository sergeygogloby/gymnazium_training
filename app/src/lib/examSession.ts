import { DEMO_ITEMS } from './demoItems';
import type {
  Attempt,
  AttemptAnswer,
  ContentItem,
  SessionKind,
} from '../types/content';
import { isExamKind } from './sessionKind';

/** Published catalog items, or demo set when empty. */
export function resolveExamItems(catalog: ContentItem[]): ContentItem[] {
  const published = catalog.filter((i) => i.published);
  return published.length > 0 ? published : DEMO_ITEMS;
}

export function lookupItem(
  catalog: ContentItem[],
  itemId: string,
): ContentItem | undefined {
  return (
    catalog.find((i) => i.id === itemId) ??
    DEMO_ITEMS.find((i) => i.id === itemId)
  );
}

export function gradeAnswer(
  item: ContentItem,
  givenAnswer: string | undefined,
): AttemptAnswer {
  if (givenAnswer == null || givenAnswer === '') {
    return {
      itemId: item.id,
      outcome: 'skipped',
      module: item.module,
      topic: item.topic,
      skillArea: item.skillArea,
      sourceType: item.sourceType,
    };
  }
  const correct =
    givenAnswer.trim().toLowerCase() === item.correctKey.trim().toLowerCase();
  return {
    itemId: item.id,
    outcome: correct ? 'correct' : 'incorrect',
    givenAnswer,
    module: item.module,
    topic: item.topic,
    skillArea: item.skillArea,
    sourceType: item.sourceType,
  };
}

/** Score includes skipped as part of total items served. */
export function finalizeExamScores(answers: AttemptAnswer[]): {
  scoreCorrect: number;
  scoreTotal: number;
} {
  return {
    scoreCorrect: answers.filter((a) => a.outcome === 'correct').length,
    scoreTotal: answers.length,
  };
}

export function shouldRevealAnswerKey(
  kind: SessionKind,
  sessionEnded: boolean,
): boolean {
  if (isExamKind(kind)) return sessionEnded;
  // Practice feedback is owned by the practice slice (after each item).
  return false;
}

export function attemptBreakdown(attempt: Attempt): {
  correct: number;
  incorrect: number;
  skipped: number;
} {
  return {
    correct: attempt.answers.filter((a) => a.outcome === 'correct').length,
    incorrect: attempt.answers.filter((a) => a.outcome === 'incorrect').length,
    skipped: attempt.answers.filter((a) => a.outcome === 'skipped').length,
  };
}
