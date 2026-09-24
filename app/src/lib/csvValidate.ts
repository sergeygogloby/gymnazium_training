/**
 * F22 question CSV validator (app).
 * All-or-nothing: any bad row → reject whole file; no partial writes.
 * Parity target: tools/lib/f22_schema.py + docs/specs/question-csv-upload.md
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
  /** 1-based data row; 0 = header/file-level */
  row: number;
  /** Item id when present, else `<row-N>` / `<header>` / `<file>` */
  id: string;
  column?: string;
  message: string;
}

export type CsvValidateResult =
  | { ok: true; items: ContentItem[] }
  | { ok: false; errors: CsvRowError[]; wouldWrite: 0 };

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

function rowIdentity(idRaw: string | undefined, rowNum: number): string {
  const id = idRaw?.trim();
  return id ? id : `<row-${rowNum}>`;
}

export function parseChoices(raw: string | undefined): string[] | undefined {
  if (raw === undefined || raw.trim() === '') return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed) as unknown;
    } catch {
      throw new Error('choices JSON invalid');
    }
    if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === 'string')) {
      throw new Error('choices JSON must be an array of strings');
    }
    return parsed.map((s) => s.trim());
  }
  const parts = trimmed.split('|').map((s) => s.trim());
  if (parts.length < 2) {
    throw new Error('choices pipe list needs at least 2 options');
  }
  return parts;
}

function normalizeSkillArea(raw: string): SkillArea | null {
  const trimmed = raw.trim();
  if (trimmed === 'VŠP' || trimmed === 'VŠp') return 'VSP';
  const v = trimmed.toUpperCase().replace(/Š/g, 'S').replace(/š/g, 'S');
  if (v === 'VSP') return 'VSP';
  if (v === 'VJS') return 'VJS';
  if (SKILL_AREAS.includes(v as SkillArea)) return v as SkillArea;
  return null;
}

function parsePublished(raw: string | undefined): boolean {
  if (raw === undefined || raw.trim() === '') return true;
  const v = raw.trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  throw new Error(`published must be boolean-like, got ${raw}`);
}

function validateMcqCorrectKey(
  correct: string,
  choices: string[],
): string | null {
  const upper = correct.toUpperCase();
  if (/^[A-F]$/.test(upper)) {
    const idx = upper.charCodeAt(0) - 'A'.charCodeAt(0);
    if (idx >= choices.length) {
      return `${correct} out of range for ${choices.length} choices`;
    }
    return null;
  }
  if (/^\d+$/.test(correct)) {
    if (Number(correct) >= choices.length) {
      return `index ${correct} out of range for ${choices.length} choices`;
    }
    return null;
  }
  return 'MCQ correctKey should be a choice letter (A–F) or 0-based index';
}

function newStableId(rowNum: number): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `imp_${rowNum}_${rand}`;
}

/**
 * Validate CSV text against F22 schema.
 * Returns items only when every row passes; otherwise errors and zero writes.
 */
export function validateQuestionCsv(csvText: string): CsvValidateResult {
  const lines = csvText
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);

  if (lines.length === 0) {
    return {
      ok: false,
      wouldWrite: 0,
      errors: [{ row: 0, id: '<file>', message: 'CSV is empty' }],
    };
  }

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const colIndex = new Map(header.map((h, i) => [h, i]));

  const errors: CsvRowError[] = [];

  const missing = REQUIRED_COLUMNS.filter((col) => !colIndex.has(col));
  if (missing.length > 0) {
    return {
      ok: false,
      wouldWrite: 0,
      errors: [
        {
          row: 0,
          id: '<header>',
          column: 'header',
          message: `missing required column(s): ${missing.join(', ')}`,
        },
      ],
    };
  }

  const items: ContentItem[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i;
    const cells = parseCsvLine(lines[i]);
    const get = (name: string) => {
      const idx = colIndex.get(name);
      return idx === undefined ? undefined : (cells[idx] ?? '');
    };

    const stem = (get('stem') ?? '').trim();
    const correctKey = (get('correctKey') ?? '').trim();
    const rationale = (get('rationale') ?? '').trim();
    const moduleRaw = (get('module') ?? '').trim();
    const topicRaw = (get('topic') ?? '').trim();
    const skillRaw = (get('skillArea') ?? '').trim();
    const sourceRaw = (get('sourceType') ?? '').trim();
    const idRaw = get('id');
    const localeRaw = get('locale');
    const publishedRaw = get('published');
    const choicesRaw = get('choices');
    const rid = rowIdentity(idRaw, rowNum);

    const pushErr = (column: string, message: string) => {
      errors.push({ row: rowNum, id: rid, column, message });
    };

    if (!stem) pushErr('stem', 'required field is empty');
    if (!correctKey) pushErr('correctKey', 'required field is empty');
    if (!rationale) pushErr('rationale', 'required field is empty');
    if (!moduleRaw) pushErr('module', 'required field is empty');
    if (!topicRaw) pushErr('topic', 'required field is empty');
    if (!skillRaw) pushErr('skillArea', 'required field is empty');
    if (!sourceRaw) pushErr('sourceType', 'required field is empty');

    if (moduleRaw && !MODULES.includes(moduleRaw as ModuleId)) {
      pushErr('module', `must be one of M1–M6, got ${moduleRaw}`);
    }

    const topicNorm = topicRaw.toUpperCase();
    if (topicRaw && !TOPICS.includes(topicNorm as TopicId)) {
      pushErr('topic', `must be one of T1–T12, got ${topicRaw}`);
    }

    const skillArea = skillRaw ? normalizeSkillArea(skillRaw) : null;
    if (skillRaw && !skillArea) {
      pushErr(
        'skillArea',
        `must be VSP or VJS (VŠP→VSP ok), got ${skillRaw}`,
      );
    }

    if (sourceRaw && !SOURCE_TYPES.includes(sourceRaw as SourceType)) {
      pushErr('sourceType', `must be bank|synthetic, got ${sourceRaw}`);
    }

    let choices: string[] | undefined;
    try {
      choices = parseChoices(choicesRaw);
    } catch (e) {
      pushErr(
        'choices',
        e instanceof Error ? e.message : 'neplatné choices',
      );
    }

    if (choices !== undefined) {
      if (choices.length < 2 || choices.length > 6) {
        pushErr('choices', `expected 2–6 options, got ${choices.length}`);
      }
      if (correctKey) {
        const mcqErr = validateMcqCorrectKey(correctKey, choices);
        if (mcqErr) pushErr('correctKey', mcqErr);
      }
    }

    let published = true;
    try {
      published = parsePublished(publishedRaw);
    } catch (e) {
      pushErr(
        'published',
        e instanceof Error ? e.message : 'neplatné published',
      );
    }

    const rowHadError = errors.some((e) => e.row === rowNum);
    if (!rowHadError && skillArea) {
      items.push({
        id: idRaw?.trim() ? idRaw.trim() : newStableId(rowNum),
        stem,
        choices,
        correctKey,
        rationale,
        module: moduleRaw as ModuleId,
        topic: topicNorm as TopicId,
        skillArea,
        sourceType: sourceRaw as SourceType,
        locale: localeRaw?.trim() || 'sk',
        published,
      });
    }
  }

  if (errors.length > 0) {
    return { ok: false, wouldWrite: 0, errors };
  }

  if (items.length === 0) {
    return {
      ok: false,
      wouldWrite: 0,
      errors: [{ row: 0, id: '<file>', message: 'no data rows' }],
    };
  }

  return { ok: true, items };
}
