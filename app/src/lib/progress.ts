import type {
  Attempt,
  ModuleId,
  SessionKind,
  TopicId,
} from '../types/content';
import { MODULES, TOPICS } from '../types/content';
import { isExamKind } from './sessionKind';

/** UI section / filter for practice vs exams (locked separate reporting). */
export type ProgressSection = 'practice' | 'exams' | 'exam_30' | 'exam_60';

export function isCompletedAttempt(a: Attempt): boolean {
  return Boolean(a.endedAt);
}

/** Keep practice and exam rollups strictly separated by section. */
export function filterAttemptsBySection(
  attempts: Attempt[],
  section: ProgressSection,
): Attempt[] {
  const closed = attempts.filter(isCompletedAttempt);
  switch (section) {
    case 'practice':
      return closed.filter((a) => a.sessionKind === 'practice');
    case 'exams':
      return closed.filter((a) => isExamKind(a.sessionKind));
    case 'exam_30':
      return closed.filter((a) => a.sessionKind === 'exam_30');
    case 'exam_60':
      return closed.filter((a) => a.sessionKind === 'exam_60');
  }
}

export function sortAttemptsNewestFirst(attempts: Attempt[]): Attempt[] {
  return [...attempts].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export interface TopicProgress {
  module: ModuleId;
  topic: TopicId;
  answered: number;
  correct: number;
  /** 0–1; 0 when unanswered. */
  accuracy: number;
  sessionCount: number;
  durationMs: number;
}

export interface ModuleProgress {
  module: ModuleId;
  answered: number;
  correct: number;
  accuracy: number;
  sessionCount: number;
  topics: TopicProgress[];
}

function emptyTopic(module: ModuleId, topic: TopicId): TopicProgress {
  return {
    module,
    topic,
    answered: 0,
    correct: 0,
    accuracy: 0,
    sessionCount: 0,
    durationMs: 0,
  };
}

/** F09 — accuracy / completion from attempts within one kind-section only. */
export function computeProgress(attempts: Attempt[]): ModuleProgress[] {
  const byKey = new Map<string, TopicProgress>();
  const sessionTopics = new Map<string, Set<string>>();

  for (const attempt of attempts) {
    const durationShare =
      attempt.durationMs != null && attempt.answers.length > 0
        ? attempt.durationMs / attempt.answers.length
        : 0;

    const seenInSession = new Set<string>();
    for (const ans of attempt.answers) {
      const key = `${ans.module}:${ans.topic}`;
      const row = byKey.get(key) ?? emptyTopic(ans.module, ans.topic);
      row.answered += 1;
      if (ans.outcome === 'correct') row.correct += 1;
      row.durationMs += durationShare;
      byKey.set(key, row);
      seenInSession.add(key);
    }

    // Session-level module/topic when no per-answer tags (edge).
    if (attempt.answers.length === 0 && attempt.module && attempt.topic) {
      const key = `${attempt.module}:${attempt.topic}`;
      seenInSession.add(key);
      if (!byKey.has(key)) byKey.set(key, emptyTopic(attempt.module, attempt.topic));
    }

    for (const key of seenInSession) {
      const set = sessionTopics.get(key) ?? new Set();
      set.add(attempt.id);
      sessionTopics.set(key, set);
    }
  }

  for (const [key, row] of byKey) {
    row.sessionCount = sessionTopics.get(key)?.size ?? 0;
    row.accuracy = row.answered > 0 ? row.correct / row.answered : 0;
  }

  return MODULES.map((module) => {
    const topics = TOPICS.map((topic) => {
      const key = `${module}:${topic}`;
      return byKey.get(key) ?? emptyTopic(module, topic);
    }).filter((t) => t.answered > 0 || t.sessionCount > 0);

    const answered = topics.reduce((s, t) => s + t.answered, 0);
    const correct = topics.reduce((s, t) => s + t.correct, 0);
    const sessionIds = new Set(
      attempts
        .filter((a) => {
          if (a.module === module) return true;
          return a.answers.some((ans) => ans.module === module);
        })
        .map((a) => a.id),
    );

    return {
      module,
      answered,
      correct,
      accuracy: answered > 0 ? correct / answered : 0,
      sessionCount: sessionIds.size,
      topics,
    };
  }).filter((m) => m.answered > 0 || m.sessionCount > 0);
}

/** F10 — lowest-accuracy topics (prefer enough samples). */
export function computeGaps(
  attempts: Attempt[],
  limit = 3,
): TopicProgress[] {
  const modules = computeProgress(attempts);
  const topics = modules
    .flatMap((m) => m.topics)
    .filter((t) => t.answered >= 1);
  topics.sort((a, b) => {
    if (a.accuracy !== b.accuracy) return a.accuracy - b.accuracy;
    return b.answered - a.answered;
  });
  return topics.slice(0, limit);
}

export type SuggestionAction =
  | { type: 'practice'; module?: ModuleId; topic?: TopicId }
  | { type: 'mistakes' }
  | { type: 'exam'; kind: 'exam_30' | 'exam_60' };

export interface Suggestion {
  id: string;
  label: string;
  action: SuggestionAction;
}

/**
 * F11 — 1–3 next actions from attempt data.
 * Gaps drive practice suggestions; mistakes / exam readiness when relevant.
 */
export function computeSuggestions(
  attempts: Attempt[],
  options?: { incorrectCount?: number },
): Suggestion[] {
  const out: Suggestion[] = [];
  const practice = filterAttemptsBySection(attempts, 'practice');
  const exams = filterAttemptsBySection(attempts, 'exams');
  const gaps = computeGaps(practice, 2);
  const incorrect =
    options?.incorrectCount ??
    attempts.flatMap((a) => a.answers).filter((a) => a.outcome === 'incorrect')
      .length;

  for (const gap of gaps) {
    if (out.length >= 3) break;
    out.push({
      id: `practice-${gap.module}-${gap.topic}`,
      label: `Precvičiť ${gap.module} / ${gap.topic} (presnosť ${Math.round(gap.accuracy * 100)} %)`,
      action: { type: 'practice', module: gap.module, topic: gap.topic },
    });
  }

  if (out.length < 3 && incorrect > 0) {
    out.push({
      id: 'mistakes',
      label: `Opakovať chyby (${incorrect})`,
      action: { type: 'mistakes' },
    });
  }

  if (out.length < 3 && practice.length >= 1 && exams.length === 0) {
    out.push({
      id: 'exam-30',
      label: 'Skúsiť skúšku · 30 min',
      action: { type: 'exam', kind: 'exam_30' },
    });
  } else if (out.length < 3 && exams.some((a) => a.sessionKind === 'exam_30')) {
    out.push({
      id: 'exam-60',
      label: 'Skúsiť skúšku · 60 min',
      action: { type: 'exam', kind: 'exam_60' },
    });
  }

  if (out.length === 0) {
    out.push({
      id: 'start-practice',
      label: 'Začať cvičenie z kurikula',
      action: { type: 'practice' },
    });
  }

  return out.slice(0, 3);
}

export interface CalendarDay {
  /** YYYY-MM-DD local */
  date: string;
  count: number;
}

export interface StreakInfo {
  daysThisWeek: number;
  recentDays: CalendarDay[];
  empty: boolean;
}

function localDateKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function localDateKeyFromIso(iso: string): string {
  return localDateKeyFromDate(new Date(iso));
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** F21 — light streak / study calendar from attempt timestamps. */
export function computeStreak(
  attempts: Attempt[],
  now: Date = new Date(),
): StreakInfo {
  const closed = attempts.filter(isCompletedAttempt);
  const counts = new Map<string, number>();
  for (const a of closed) {
    const key = localDateKeyFromIso(a.startedAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const recentDays: CalendarDay[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const localKey = localDateKeyFromDate(day);
    recentDays.push({ date: localKey, count: counts.get(localKey) ?? 0 });
  }

  const weekStart = startOfLocalDay(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday start; light cue only
  let daysThisWeek = 0;
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    if (day > now) break;
    const localKey = localDateKeyFromDate(day);
    if ((counts.get(localKey) ?? 0) > 0) daysThisWeek += 1;
  }

  return {
    daysThisWeek,
    recentDays,
    empty: closed.length === 0,
  };
}

export type EffortCue = 'empty' | 'no_practice' | 'practiced_stuck' | 'ok';

export interface EffortVsAccuracy {
  cue: EffortCue;
  label: string;
  module?: ModuleId;
  topic?: TopicId;
  sessionCount: number;
  accuracy: number | null;
}

/**
 * F21 — distinguish little/no practice vs practiced-but-stuck.
 * Prefers practice attempts for “what to drill”.
 */
export function computeEffortVsAccuracy(
  attempts: Attempt[],
): EffortVsAccuracy {
  const practice = filterAttemptsBySection(attempts, 'practice');
  if (practice.length === 0) {
    return {
      cue: attempts.some(isCompletedAttempt) ? 'no_practice' : 'empty',
      label: attempts.some(isCompletedAttempt)
        ? 'Skúšky prebehli, ale cvičenie ešte chýba — najprv krátke cvičenie.'
        : 'Zatiaľ žiadna aktivita — začnite cvičením alebo skúškou.',
      sessionCount: 0,
      accuracy: null,
    };
  }

  const gaps = computeGaps(practice, 5);
  const stuck = gaps.find((g) => g.sessionCount >= 2 && g.accuracy < 0.5);
  if (stuck) {
    return {
      cue: 'practiced_stuck',
      label: `${stuck.module}/${stuck.topic}: cvičené (${stuck.sessionCount}×), stále nízka presnosť (${Math.round(stuck.accuracy * 100)} %) — skúste Chyby alebo kratšie sady.`,
      module: stuck.module,
      topic: stuck.topic,
      sessionCount: stuck.sessionCount,
      accuracy: stuck.accuracy,
    };
  }

  const thin = gaps.find((g) => g.sessionCount <= 1 && g.answered > 0);
  if (thin && thin.accuracy < 0.6) {
    return {
      cue: 'no_practice',
      label: `${thin.module}/${thin.topic}: málo cvičenia (${thin.sessionCount} relácia) — skôr pridať opakovaní než hodnotiť pripravenosť.`,
      module: thin.module,
      topic: thin.topic,
      sessionCount: thin.sessionCount,
      accuracy: thin.accuracy,
    };
  }

  const best = [...practice].sort(
    (a, b) => (b.scoreCorrect ?? 0) - (a.scoreCorrect ?? 0),
  )[0];
  const acc =
    best?.scoreTotal && best.scoreTotal > 0
      ? (best.scoreCorrect ?? 0) / best.scoreTotal
      : null;

  return {
    cue: 'ok',
    label: 'Cvičenie prebieha — sledujte medzery nižšie a pokračujte v slabších témach.',
    sessionCount: practice.length,
    accuracy: acc,
  };
}

export function formatDuration(ms?: number): string {
  if (ms == null) return '—';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m} min ${s} s` : `${m} min`;
}

export function formatPct(accuracy: number): string {
  return `${Math.round(accuracy * 100)} %`;
}

/** Household KPI strip — Duolingo/Quizlet-style overview (no gamification). */
export interface InsightSummary {
  sessionCount: number;
  answerCount: number;
  correctCount: number;
  accuracy: number;
  durationMs: number;
  activeDays: number;
  empty: boolean;
}

export function computeInsightSummary(attempts: Attempt[]): InsightSummary {
  const closed = attempts.filter(isCompletedAttempt);
  let answerCount = 0;
  let correctCount = 0;
  let durationMs = 0;
  const days = new Set<string>();
  for (const a of closed) {
    answerCount += a.answers.length;
    correctCount += a.answers.filter((x) => x.outcome === 'correct').length;
    durationMs += a.durationMs ?? 0;
    days.add(localDateKeyFromIso(a.startedAt));
  }
  return {
    sessionCount: closed.length,
    answerCount,
    correctCount,
    accuracy: answerCount > 0 ? correctCount / answerCount : 0,
    durationMs,
    activeDays: days.size,
    empty: closed.length === 0,
  };
}

export interface SkillAreaProgress {
  skillArea: 'VSP' | 'VJS';
  answered: number;
  correct: number;
  accuracy: number;
}

/** VŠP | VJS accuracy (F17 cue on progress). */
export function computeSkillAreaProgress(
  attempts: Attempt[],
): SkillAreaProgress[] {
  const buckets: Record<'VSP' | 'VJS', { answered: number; correct: number }> = {
    VSP: { answered: 0, correct: 0 },
    VJS: { answered: 0, correct: 0 },
  };
  for (const a of attempts) {
    if (!isCompletedAttempt(a)) continue;
    for (const ans of a.answers) {
      const skill = ans.skillArea === 'VJS' ? 'VJS' : 'VSP';
      buckets[skill].answered += 1;
      if (ans.outcome === 'correct') buckets[skill].correct += 1;
    }
  }
  return (['VSP', 'VJS'] as const)
    .map((skillArea) => {
      const b = buckets[skillArea];
      return {
        skillArea,
        answered: b.answered,
        correct: b.correct,
        accuracy: b.answered > 0 ? b.correct / b.answered : 0,
      };
    })
    .filter((r) => r.answered > 0);
}

export interface OutcomeMix {
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
}

export function computeOutcomeMix(attempts: Attempt[]): OutcomeMix {
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  for (const a of attempts) {
    if (!isCompletedAttempt(a)) continue;
    for (const ans of a.answers) {
      if (ans.outcome === 'correct') correct += 1;
      else if (ans.outcome === 'incorrect') incorrect += 1;
      else skipped += 1;
    }
  }
  return { correct, incorrect, skipped, total: correct + incorrect + skipped };
}

export interface SessionScorePoint {
  id: string;
  startedAt: string;
  label: string;
  /** 0–1; null if unscored */
  accuracy: number | null;
  scoreCorrect: number;
  scoreTotal: number;
  sessionKind: SessionKind;
}

/** Chronological session scores for trend charts (Anki/Duolingo-style). */
export function computeSessionScoreTrend(
  attempts: Attempt[],
  limit = 12,
): SessionScorePoint[] {
  const closed = sortAttemptsNewestFirst(attempts.filter(isCompletedAttempt))
    .slice(0, limit)
    .reverse();
  return closed.map((a) => {
    const scoreTotal =
      a.scoreTotal ??
      (a.answers.length > 0 ? a.answers.length : 0);
    const scoreCorrect =
      a.scoreCorrect ??
      a.answers.filter((x) => x.outcome === 'correct').length;
    const accuracy =
      scoreTotal > 0 ? scoreCorrect / scoreTotal : null;
    const day = localDateKeyFromIso(a.startedAt).slice(5); // MM-DD
    return {
      id: a.id,
      startedAt: a.startedAt,
      label: day,
      accuracy,
      scoreCorrect,
      scoreTotal,
      sessionKind: a.sessionKind,
    };
  });
}

export function attemptModuleLabel(a: Attempt): string {
  if (a.module) {
    return a.topic ? `${a.module} / ${a.topic}` : a.module;
  }
  const fromAnswers = a.answers[0];
  if (fromAnswers) {
    return `${fromAnswers.module} / ${fromAnswers.topic}`;
  }
  return '—';
}

export function sectionMatchesKind(
  section: ProgressSection,
  kind: SessionKind,
): boolean {
  if (section === 'practice') return kind === 'practice';
  if (section === 'exams') return isExamKind(kind);
  return kind === section;
}
