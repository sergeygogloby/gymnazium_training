/**
 * CSV question validator stub (F22).
 * All-or-nothing: any bad row → reject whole file; no partial writes.
 * See docs/specs/question-csv-upload.md and content-model.md.
 */

import {
  MODULES,
  SKILL_AREAS,
  SOURCE_TYPES,
  TOPICS,
  type ContentItem,
  type ModuleId,
  type SkillArea,
  type SourceType,
  type TopicId,
} from '../types/content';

export const REQUIRED_COLUMNS = [
  'stem',
  'correctKey',
  'rationale',
  'module',
  'topic',
  'skillArea',
  'sourceType',
] as const;

export interface CsvRowError {
  row: number; // 1-based data row (header = row 0 conceptually; first data = 1)
  column?: string;
  message: string;
}

export type CsvValidateResult =
  | { ok: true; items: ContentItem[] }
  | { ok: false; errors: CsvRowError[] };

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current.trim());
  return cells;
}

function parseChoices(raw: string | undefined): string[] | undefined {
  if (raw === undefined || raw === '') return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === 'string')) {
        throw new Error('choices must be a JSON string array');
      }
      return parsed;
    } catch {
      throw new Error('malformed choices JSON');
    }
  }
  return trimmed.split('|').map((s) => s.trim()).filter(Boolean);
}

function normalizeSkillArea(raw: string): SkillArea | null {
  const v = raw.trim().toUpperCase().replace('Š', 'S').replace('š', 'S');
  if (v === 'VSP' || v === 'VŠP') return 'VSP';
  if (v === 'VJS') return 'VJS';
  // After Š→S, VŠP becomes VSP already via replace
  if (SKILL_AREAS.includes(v as SkillArea)) return v as SkillArea;
  return null;
}

function parsePublished(raw: string | undefined): boolean {
  if (raw === undefined || raw === '') return true;
  const v = raw.trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  throw new Error(`invalid published value: ${raw}`);
}

/**
 * Validate CSV text against F22 schema.
 * Returns items only when every row passes; otherwise errors and zero items.
 */
export function validateQuestionCsv(csvText: string): CsvValidateResult {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    return { ok: false, errors: [{ row: 0, message: 'Prázdny súbor' }] };
  }

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const colIndex = new Map(header.map((h, i) => [h, i]));

  const errors: CsvRowError[] = [];

  for (const col of REQUIRED_COLUMNS) {
    if (!colIndex.has(col)) {
      errors.push({
        row: 0,
        column: col,
        message: `Chýba povinný stĺpec: ${col}`,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const items: ContentItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i; // data rows 1..n
    const cells = parseCsvLine(lines[i]);
    const get = (name: string) => {
      const idx = colIndex.get(name);
      return idx === undefined ? undefined : (cells[idx] ?? '');
    };

    const stem = get('stem') ?? '';
    const correctKey = get('correctKey') ?? '';
    const rationale = get('rationale') ?? '';
    const moduleRaw = get('module') ?? '';
    const topicRaw = get('topic') ?? '';
    const skillRaw = get('skillArea') ?? '';
    const sourceRaw = get('sourceType') ?? '';
    const idRaw = get('id');
    const localeRaw = get('locale');
    const publishedRaw = get('published');
    const choicesRaw = get('choices');

    if (!stem) {
      errors.push({ row: rowNum, column: 'stem', message: 'stem je povinný' });
    }
    if (!correctKey) {
      errors.push({
        row: rowNum,
        column: 'correctKey',
        message: 'correctKey je povinný',
      });
    }
    if (!rationale) {
      errors.push({
        row: rowNum,
        column: 'rationale',
        message: 'rationale je povinný',
      });
    }

    if (!MODULES.includes(moduleRaw as ModuleId)) {
      errors.push({
        row: rowNum,
        column: 'module',
        message: `module musí byť M1–M6 (dostané: ${moduleRaw})`,
      });
    }

    if (!TOPICS.includes(topicRaw as TopicId)) {
      errors.push({
        row: rowNum,
        column: 'topic',
        message: `topic musí byť T1–T12 (dostané: ${topicRaw})`,
      });
    }

    const skillArea = normalizeSkillArea(skillRaw);
    if (!skillArea) {
      errors.push({
        row: rowNum,
        column: 'skillArea',
        message: `skillArea musí byť VSP alebo VJS (dostané: ${skillRaw})`,
      });
    }

    if (!SOURCE_TYPES.includes(sourceRaw as SourceType)) {
      errors.push({
        row: rowNum,
        column: 'sourceType',
        message: `sourceType musí byť bank alebo synthetic (dostané: ${sourceRaw})`,
      });
    }

    let choices: string[] | undefined;
    try {
      choices = parseChoices(choicesRaw);
    } catch (e) {
      errors.push({
        row: rowNum,
        column: 'choices',
        message: e instanceof Error ? e.message : 'neplatné choices',
      });
    }

    let published = true;
    try {
      published = parsePublished(publishedRaw);
    } catch (e) {
      errors.push({
        row: rowNum,
        column: 'published',
        message: e instanceof Error ? e.message : 'neplatné published',
      });
    }

    // Collect row only if no new errors for this row since we started it —
    // simpler: build item only after all checks; if any errors exist for this
    // row, skip pushing. We check errors added for this rowNum.
    const rowHadError = errors.some((e) => e.row === rowNum);
    if (!rowHadError && skillArea) {
      items.push({
        id:
          idRaw && idRaw.trim()
            ? idRaw.trim()
            : `csv_${rowNum}_${Date.now()}`,
        stem,
        choices,
        correctKey,
        rationale,
        module: moduleRaw as ModuleId,
        topic: topicRaw as TopicId,
        skillArea,
        sourceType: sourceRaw as SourceType,
        locale: localeRaw?.trim() || 'sk',
        published,
      });
    }
  }

  if (errors.length > 0) {
    // All-or-nothing: discard any partially collected items
    return { ok: false, errors };
  }

  if (items.length === 0) {
    return {
      ok: false,
      errors: [{ row: 0, message: 'Žiadne dátové riadky' }],
    };
  }

  return { ok: true, items };
}
