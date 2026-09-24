import type {
  Attempt,
  ContentItem,
  ModuleId,
  SkillArea,
  SourceType,
  TopicId,
} from '../types/content';

/** One active Mistakes queue entry (F16 / V10). */
export interface MistakeQueueEntry {
  itemId: string;
  stemPreview: string;
  module: ModuleId;
  topic: TopicId;
  skillArea: SkillArea;
  sourceType: SourceType;
  /** ISO timestamp of the most recent incorrect answer for this item. */
  lastMissedAt: string;
}

export interface MistakeQueueFilter {
  module?: ModuleId;
  topic?: TopicId;
  skillArea?: SkillArea;
  sourceType?: SourceType;
}

interface ItemTrack {
  lastIncorrectAt?: string;
  lastCorrectAt?: string;
  module: ModuleId;
  topic: TopicId;
  skillArea: SkillArea;
  sourceType: SourceType;
}

function attemptTime(attempt: Attempt): string {
  return attempt.endedAt ?? attempt.startedAt;
}

/**
 * Build the active Mistakes queue from attempt history.
 * Incorrect-only eligibility; an item leaves the active list when a later
 * answer is correct (restudy or any subsequent correct clears it).
 */
export function buildMistakesQueue(
  attempts: Attempt[],
  catalog: ContentItem[],
  filter: MistakeQueueFilter = {},
): MistakeQueueEntry[] {
  const byId = new Map(catalog.map((item) => [item.id, item]));
  const tracks = new Map<string, ItemTrack>();

  const ordered = [...attempts].sort((a, b) =>
    attemptTime(a).localeCompare(attemptTime(b)),
  );

  for (const attempt of ordered) {
    const at = attemptTime(attempt);
    for (const answer of attempt.answers) {
      const item = byId.get(answer.itemId);
      const prev = tracks.get(answer.itemId);
      const base: ItemTrack = prev ?? {
        module: answer.module,
        topic: answer.topic,
        skillArea: answer.skillArea,
        sourceType: answer.sourceType,
      };
      // Prefer live catalog tags when present.
      if (item) {
        base.module = item.module;
        base.topic = item.topic;
        base.skillArea = item.skillArea;
        base.sourceType = item.sourceType;
      }
      if (answer.outcome === 'incorrect') {
        base.lastIncorrectAt = at;
      } else if (answer.outcome === 'correct') {
        base.lastCorrectAt = at;
      }
      // skipped does not enqueue or clear
      tracks.set(answer.itemId, base);
    }
  }

  const entries: MistakeQueueEntry[] = [];
  for (const [itemId, track] of tracks) {
    if (!track.lastIncorrectAt) continue;
    if (
      track.lastCorrectAt &&
      track.lastCorrectAt >= track.lastIncorrectAt
    ) {
      continue;
    }
    if (filter.module && track.module !== filter.module) continue;
    if (filter.topic && track.topic !== filter.topic) continue;
    if (filter.skillArea && track.skillArea !== filter.skillArea) continue;
    if (filter.sourceType && track.sourceType !== filter.sourceType) continue;

    const item = byId.get(itemId);
    const stem = item?.stem ?? itemId;
    entries.push({
      itemId,
      stemPreview: stem.length > 96 ? `${stem.slice(0, 96)}…` : stem,
      module: track.module,
      topic: track.topic,
      skillArea: track.skillArea,
      sourceType: track.sourceType,
      lastMissedAt: track.lastIncorrectAt,
    });
  }

  return entries.sort((a, b) =>
    b.lastMissedAt.localeCompare(a.lastMissedAt),
  );
}

export function filterMistakeEntries(
  entries: MistakeQueueEntry[],
  filter: MistakeQueueFilter,
): MistakeQueueEntry[] {
  return entries.filter((entry) => {
    if (filter.module && entry.module !== filter.module) return false;
    if (filter.topic && entry.topic !== filter.topic) return false;
    if (filter.skillArea && entry.skillArea !== filter.skillArea) return false;
    if (filter.sourceType && entry.sourceType !== filter.sourceType) {
      return false;
    }
    return true;
  });
}
