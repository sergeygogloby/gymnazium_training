#!/usr/bin/env tsx
/**
 * Import F22 question CSV into local SQLite (all-or-nothing).
 *
 * Usage (repo root or server/):
 *   npx tsx server/src/importQuestionsCsv.ts path/to.csv [--force-unpublished]
 *
 * Default keeps CSV published column. --force-unpublished sets published=0
 * for every row (import phase of the publish gate).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbStats, loadState, openDb, saveState } from './db.js';
import type { ContentItem, ModuleId, SkillArea, SourceType, TopicId } from './types.js';

const MODULES = new Set(['M1', 'M2', 'M3', 'M4', 'M5', 'M6']);
const TOPICS = new Set([
  'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12',
]);
const SKILLS = new Set(['VSP', 'VJS']);
const SOURCES = new Set(['bank', 'synthetic']);

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
  if (!raw || !raw.trim()) return undefined;
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((x) => typeof x === 'string')) {
      throw new Error('choices JSON must be an array of strings');
    }
    return parsed.map((s) => String(s).trim());
  }
  const parts = trimmed.split('|').map((s) => s.trim());
  if (parts.length < 2) throw new Error('choices pipe list needs ≥2 options');
  return parts;
}

function parsePublished(raw: string | undefined): boolean {
  if (raw === undefined || raw.trim() === '') return true;
  const v = raw.trim().toLowerCase();
  if (['true', '1', 'yes'].includes(v)) return true;
  if (['false', '0', 'no'].includes(v)) return false;
  throw new Error(`bad published: ${raw}`);
}

export function parseQuestionCsv(
  text: string,
  opts?: { forceUnpublished?: boolean },
): { ok: true; items: ContentItem[] } | { ok: false; errors: string[] } {
  const lines = text
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { ok: false, errors: ['CSV is empty'] };

  const header = parseCsvLine(lines[0]);
  const idx = new Map(header.map((h, i) => [h, i]));
  const required = [
    'stem',
    'correctKey',
    'rationale',
    'module',
    'topic',
    'skillArea',
    'sourceType',
  ];
  const missing = required.filter((c) => !idx.has(c));
  if (missing.length) {
    return { ok: false, errors: [`missing columns: ${missing.join(', ')}`] };
  }

  const get = (cells: string[], name: string) => {
    const i = idx.get(name);
    return i === undefined ? '' : (cells[i] ?? '');
  };

  const errors: string[] = [];
  const items: ContentItem[] = [];

  for (let r = 1; r < lines.length; r++) {
    const cells = parseCsvLine(lines[r]);
    const stem = get(cells, 'stem').trim();
    const correctKey = get(cells, 'correctKey').trim();
    const rationale = get(cells, 'rationale').trim();
    const module = get(cells, 'module').trim();
    const topic = get(cells, 'topic').trim().toUpperCase();
    let skillArea = get(cells, 'skillArea').trim();
    if (skillArea === 'VŠP') skillArea = 'VSP';
    const sourceType = get(cells, 'sourceType').trim();
    const id = get(cells, 'id').trim() || `imp_${r}`;
    const locale = get(cells, 'locale').trim() || 'sk';

    const rowErrs: string[] = [];
    if (!stem) rowErrs.push('empty stem');
    if (!correctKey) rowErrs.push('empty correctKey');
    if (!rationale) rowErrs.push('empty rationale');
    if (!MODULES.has(module)) rowErrs.push(`bad module ${module}`);
    if (!TOPICS.has(topic)) rowErrs.push(`bad topic ${topic}`);
    if (!SKILLS.has(skillArea)) rowErrs.push(`bad skillArea ${skillArea}`);
    if (!SOURCES.has(sourceType)) rowErrs.push(`bad sourceType ${sourceType}`);

    let choices: string[] | undefined;
    try {
      choices = parseChoices(get(cells, 'choices'));
    } catch (e) {
      rowErrs.push(e instanceof Error ? e.message : 'choices');
    }

    let published = true;
    try {
      published = parsePublished(get(cells, 'published'));
    } catch (e) {
      rowErrs.push(e instanceof Error ? e.message : 'published');
    }
    if (opts?.forceUnpublished) published = false;

    if (choices) {
      const letter = correctKey.toUpperCase();
      if (/^[A-F]$/.test(letter)) {
        const ci = letter.charCodeAt(0) - 65;
        if (ci >= choices.length) rowErrs.push('correctKey out of range');
      }
    }

    if (rowErrs.length) {
      errors.push(`row ${r} (${id}): ${rowErrs.join('; ')}`);
      continue;
    }

    items.push({
      id,
      stem,
      choices,
      correctKey,
      rationale,
      module: module as ModuleId,
      topic: topic as TopicId,
      skillArea: skillArea as SkillArea,
      sourceType: sourceType as SourceType,
      locale,
      published,
    });
  }

  if (errors.length) return { ok: false, errors };
  if (!items.length) return { ok: false, errors: ['no data rows'] };
  return { ok: true, items };
}

export function upsertQuestions(
  items: ContentItem[],
): { created: number; updated: number; total: number } {
  const db = openDb();
  const state = loadState(db);
  const byId = new Map(state.catalog.map((i) => [i.id, i]));
  let created = 0;
  let updated = 0;
  for (const item of items) {
    if (byId.has(item.id)) updated += 1;
    else created += 1;
    byId.set(item.id, item);
  }
  saveState(db, { ...state, catalog: Array.from(byId.values()) });
  const stats = dbStats(db);
  db.close();
  return { created, updated, total: stats.questions };
}

function main(argv: string[]): number {
  const args = argv.slice(2);
  const forceUnpublished = args.includes('--force-unpublished');
  const fileArg = args.find((a) => !a.startsWith('--'));
  if (!fileArg) {
    console.error('Usage: importQuestionsCsv.ts <csv> [--force-unpublished]');
    return 1;
  }
  const csvPath = path.resolve(fileArg);
  const text = fs.readFileSync(csvPath, 'utf8');
  const parsed = parseQuestionCsv(text, { forceUnpublished });
  if (!parsed.ok) {
    console.error('REJECT — all-or-nothing; zero writes');
    for (const e of parsed.errors) console.error(`  - ${e}`);
    return 1;
  }
  const result = upsertQuestions(parsed.items);
  console.log(
    JSON.stringify(
      {
        ok: true,
        path: csvPath,
        forceUnpublished,
        rows: parsed.items.length,
        ...result,
      },
      null,
      2,
    ),
  );
  return 0;
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  process.exit(main(process.argv));
}
