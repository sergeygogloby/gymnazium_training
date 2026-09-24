/**
 * Light F11 next-practice suggestion for Curriculum recommended entry.
 * Empty history → M1 / T1. With history → first unfinished module, else weakest
 * practice topic (accuracy), else M1.
 */

import { CURRICULUM_MODULES } from './curriculumMap';
import type { Attempt, ModuleId, TopicId } from '../types/content';
import { MODULES } from '../types/content';

export type RecommendReason = 'default' | 'unfinished' | 'weak';

export interface RecommendedNext {
  module: ModuleId;
  topic?: TopicId;
  reason: RecommendReason;
  /** Short Slovak copy for the CTA. */
  label: string;
}

function endedAttempts(attempts: Attempt[]): Attempt[] {
  return attempts.filter((a) => Boolean(a.endedAt));
}

/** Modules that already have at least one ended practice attempt. */
function practicedModules(attempts: Attempt[]): Set<ModuleId> {
  const set = new Set<ModuleId>();
  for (const a of endedAttempts(attempts)) {
    if (a.sessionKind !== 'practice') continue;
    if (a.module) set.add(a.module);
    for (const ans of a.answers) set.add(ans.module);
  }
  return set;
}

interface TopicStats {
  module: ModuleId;
  topic: TopicId;
  correct: number;
  total: number;
}

function practiceTopicStats(attempts: Attempt[]): TopicStats[] {
  const map = new Map<string, TopicStats>();
  for (const a of endedAttempts(attempts)) {
    if (a.sessionKind !== 'practice') continue;
    for (const ans of a.answers) {
      const key = `${ans.module}:${ans.topic}`;
      const cur = map.get(key) ?? {
        module: ans.module,
        topic: ans.topic,
        correct: 0,
        total: 0,
      };
      cur.total += 1;
      if (ans.outcome === 'correct') cur.correct += 1;
      map.set(key, cur);
    }
  }
  return Array.from(map.values());
}

/**
 * Pick recommended practice scope from local attempt history.
 * Prefer practice-derived signals; exam attempts do not drive “weak” drills alone.
 */
export function recommendNext(attempts: Attempt[]): RecommendedNext {
  const finished = endedAttempts(attempts);
  if (finished.length === 0) {
    return {
      module: 'M1',
      topic: 'T1',
      reason: 'default',
      label: 'Odporúčané: M1 — Verbálne základy (začiatok)',
    };
  }

  const done = practicedModules(attempts);
  const unfinished = MODULES.find((m) => !done.has(m));
  if (unfinished) {
    const mod = CURRICULUM_MODULES.find((m) => m.id === unfinished)!;
    const topic = mod.topics[0]?.id;
    return {
      module: unfinished,
      topic,
      reason: 'unfinished',
      label: `Odporúčané: ${mod.id} — ${mod.title} (ešte necvičené)`,
    };
  }

  const stats = practiceTopicStats(attempts).filter((s) => s.total > 0);
  if (stats.length > 0) {
    stats.sort((a, b) => {
      const accA = a.correct / a.total;
      const accB = b.correct / b.total;
      if (accA !== accB) return accA - accB;
      return b.total - a.total;
    });
    const weak = stats[0];
    return {
      module: weak.module,
      topic: weak.topic,
      reason: 'weak',
      label: `Odporúčané: ${weak.topic} v ${weak.module} (najslabšia téma)`,
    };
  }

  return {
    module: 'M1',
    topic: 'T1',
    reason: 'default',
    label: 'Odporúčané: M1 — Verbálne základy',
  };
}
