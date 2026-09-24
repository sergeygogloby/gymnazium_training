/**
 * Content catalog helpers for session serving (F12 / F14 / F18).
 * published=false items stay in catalog but are never eligible for new sessions.
 */

import type { ContentItem, SkillArea, SourceType } from '../types/content';

export interface CatalogFilters {
  skillArea?: SkillArea;
  sourceType?: SourceType;
  module?: ContentItem['module'];
  topic?: ContentItem['topic'];
}

/** Items eligible for new practice/exam sessions (F14). */
export function selectEligibleItems(
  catalog: ContentItem[],
  filters: CatalogFilters = {},
): ContentItem[] {
  return catalog.filter((item) => {
    if (!item.published) return false;
    if (filters.skillArea && item.skillArea !== filters.skillArea) return false;
    if (filters.sourceType && item.sourceType !== filters.sourceType) {
      return false;
    }
    if (filters.module && item.module !== filters.module) return false;
    if (filters.topic && item.topic !== filters.topic) return false;
    return true;
  });
}

/** Slovak UI label for bank vs synthetic (F18). */
export function sourceTypeLabel(sourceType: SourceType): string {
  return sourceType === 'synthetic' ? 'syntetická' : 'banková';
}

export function catalogStats(catalog: ContentItem[]) {
  const published = catalog.filter((i) => i.published).length;
  const hidden = catalog.length - published;
  const synthetic = catalog.filter((i) => i.sourceType === 'synthetic').length;
  return {
    total: catalog.length,
    published,
    hidden,
    synthetic,
    eligible: published,
  };
}
