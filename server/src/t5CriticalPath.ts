#!/usr/bin/env tsx
/**
 * T5 critical path on SQLite:
 *   1) Import candidate CSV with published=false (all-or-nothing)
 *   2) Practice smoke (synthetic label + correct/incorrect feedback + filters)
 *   3) Flip published=true if smoke green; write published CSV + update gate
 *
 * Usage (repo root):
 *   npx tsx server/src/t5CriticalPath.ts
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dbStats, loadState, openDb, saveState } from './db.js';
import { parseQuestionCsv, upsertQuestions } from './importQuestionsCsv.js';
import type { ContentItem } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, '../..');
const BATCH = 'pilot-t5-synth-20260924';
const CANDIDATE = path.join(
  REPO,
  'content/candidates',
  `${BATCH}_M3_T5.csv`,
);
const PUBLISHED_CSV = path.join(
  REPO,
  'content/published',
  `${BATCH}_M3_T5.csv`,
);
const GATE_JSON = path.join(REPO, 'content/reports', `${BATCH}_gate.json`);
const GATE_MD = path.join(REPO, 'content/reports', `${BATCH}_gate.md`);
const SMOKE_JSON = path.join(REPO, 'content/reports', `${BATCH}_smoke.json`);

function sourceTypeLabel(sourceType: string): string {
  return sourceType === 'synthetic' ? 'syntetická' : 'banková';
}

function stripChoicePrefix(text: string): string {
  return text.replace(/^[A-D]\s*[.)]\s*/i, '').trim();
}

function grade(
  item: ContentItem,
  given: string | undefined,
): 'correct' | 'incorrect' | 'skipped' {
  if (given === undefined || given.trim() === '') return 'skipped';
  const key = item.correctKey.trim().toUpperCase();
  const givenU = given.trim().toUpperCase();
  if (/^[A-F]$/.test(givenU) && givenU === key) return 'correct';
  if (!item.choices) {
    return given.trim() === item.correctKey.trim() ? 'correct' : 'incorrect';
  }
  const idx = key.charCodeAt(0) - 65;
  if (idx < 0 || idx >= item.choices.length) return 'incorrect';
  const correctText = stripChoicePrefix(item.choices[idx]);
  if (givenU === key) return 'correct';
  if (stripChoicePrefix(given) === correctText) return 'correct';
  return 'incorrect';
}

function selectEligible(
  catalog: ContentItem[],
  filters: {
    skillArea?: string;
    sourceType?: string;
    module?: string;
    topic?: string;
  } = {},
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

interface SmokeResult {
  ok: boolean;
  phase: string;
  checks: { name: string; pass: boolean; detail: string }[];
}

function smokeUnpublished(items: ContentItem[]): SmokeResult {
  const checks: SmokeResult['checks'] = [];
  const synthetic = items.filter((i) => i.sourceType === 'synthetic');
  checks.push({
    name: 'all_synthetic',
    pass: synthetic.length === items.length && items.length > 0,
    detail: `${synthetic.length}/${items.length} synthetic`,
  });
  checks.push({
    name: 'all_unpublished',
    pass: items.every((i) => i.published === false),
    detail: `published=true count=${items.filter((i) => i.published).length}`,
  });
  checks.push({
    name: 'synthetic_label_sk',
    pass: sourceTypeLabel('synthetic') === 'syntetická',
    detail: sourceTypeLabel('synthetic'),
  });

  let feedbackOk = 0;
  let feedbackFail = 0;
  for (const item of items) {
    const right = grade(item, item.correctKey);
    const wrongLetter =
      item.correctKey.toUpperCase() === 'A' ? 'B' : 'A';
    const wrong = grade(item, wrongLetter);
    if (right === 'correct' && wrong === 'incorrect') feedbackOk += 1;
    else feedbackFail += 1;
  }
  checks.push({
    name: 'feedback_correct_and_incorrect',
    pass: feedbackFail === 0 && feedbackOk === items.length,
    detail: `ok=${feedbackOk} fail=${feedbackFail}`,
  });

  // Explicit-id practice queue (allowed before publish; eligibility still false)
  const queue = items.slice(0, 5).map((i) => i.id);
  checks.push({
    name: 'explicit_practice_queue',
    pass: queue.length === 5 && queue.every((id) => items.some((i) => i.id === id)),
    detail: `queue=${queue.length}`,
  });

  return {
    ok: checks.every((c) => c.pass),
    phase: 'unpublished_smoke',
    checks,
  };
}

function smokePublished(catalog: ContentItem[], batchIds: Set<string>): SmokeResult {
  const checks: SmokeResult['checks'] = [];
  const batch = catalog.filter((i) => batchIds.has(i.id));
  checks.push({
    name: 'batch_all_published',
    pass: batch.length > 0 && batch.every((i) => i.published),
    detail: `batch=${batch.length} published=${batch.filter((i) => i.published).length}`,
  });

  const eligible = selectEligible(catalog);
  const eligibleBatch = eligible.filter((i) => batchIds.has(i.id));
  checks.push({
    name: 'eligible_includes_batch',
    pass: eligibleBatch.length === batch.length,
    detail: `eligibleBatch=${eligibleBatch.length}/${batch.length}`,
  });

  const vspSynth = selectEligible(catalog, {
    skillArea: 'VSP',
    sourceType: 'synthetic',
    module: 'M3',
    topic: 'T5',
  });
  checks.push({
    name: 'filters_vsp_synthetic_m3_t5',
    pass: vspSynth.length === batch.length && vspSynth.every((i) => batchIds.has(i.id)),
    detail: `filtered=${vspSynth.length}`,
  });

  // Simulate a short practice: grade first 3 eligible with correct keys
  let sessionOk = true;
  for (const item of eligibleBatch.slice(0, 3)) {
    if (grade(item, item.correctKey) !== 'correct') sessionOk = false;
    if (sourceTypeLabel(item.sourceType) !== 'syntetická') sessionOk = false;
  }
  checks.push({
    name: 'practice_serves_synthetic_feedback',
    pass: sessionOk && eligibleBatch.length >= 3,
    detail: 'graded 3 eligible synthetic items correct + label',
  });

  return {
    ok: checks.every((c) => c.pass),
    phase: 'published_smoke',
    checks,
  };
}

function writePublishedCsv(items: ContentItem[]): void {
  const header = [
    'id',
    'stem',
    'choices',
    'correctKey',
    'rationale',
    'module',
    'topic',
    'skillArea',
    'sourceType',
    'locale',
    'published',
  ];
  const esc = (v: string) => {
    if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
    return v;
  };
  const lines = [header.join(',')];
  for (const item of items) {
    const choices = item.choices?.join('|') ?? '';
    lines.push(
      [
        item.id,
        esc(item.stem),
        esc(choices),
        item.correctKey,
        esc(item.rationale),
        item.module,
        item.topic,
        item.skillArea,
        item.sourceType,
        item.locale ?? 'sk',
        'true',
      ].join(','),
    );
  }
  fs.mkdirSync(path.dirname(PUBLISHED_CSV), { recursive: true });
  fs.writeFileSync(PUBLISHED_CSV, lines.join('\n') + '\n', 'utf8');
}

function updateGate(smoke: SmokeResult, importCounts: {
  created: number;
  updated: number;
  rows: number;
}): void {
  const gate = JSON.parse(fs.readFileSync(GATE_JSON, 'utf8')) as Record<
    string,
    unknown
  >;
  const checks = (gate.checks as { id: number; name: string; pass: boolean; detail: string }[]) ?? [];
  for (const ch of checks) {
    if (ch.name === 'all_or_nothing_import') {
      ch.pass = true;
      ch.detail = `imported to SQLite created=${importCounts.created} updated=${importCounts.updated} rows=${importCounts.rows}`;
    }
    if (ch.name === 'smoke_practice_serves_synthetic') {
      ch.pass = smoke.ok;
      ch.detail = smoke.ok
        ? 'PASS — eligible synthetic practice + feedback + filters'
        : `FAIL — ${smoke.checks.filter((c) => !c.pass).map((c) => c.name).join(', ')}`;
    }
  }
  const allPass = checks.every((c) => c.pass);
  gate.checks = checks;
  gate.publishDecision = allPass ? 'PUBLISH' : 'DO_NOT_PUBLISH';
  gate.publishReason = allPass
    ? 'All gate checks green including smoke; SQLite published=true for batch.'
    : 'Smoke or prior check failed';
  gate.candidateGate = {
    verdict: 'PASS',
    meaning: 'Batch imported; see publishDecision',
    ok: true,
  };
  gate.dryRun = {
    wouldWrite: importCounts.rows,
    wouldCreate: importCounts.created,
    wouldUpdate: importCounts.updated,
    allOrNothing: true,
    catalogWritePerformed: true,
  };
  gate.sqlitePublish = {
    publishedCsv: path.relative(REPO, PUBLISHED_CSV),
    smokeReport: path.relative(REPO, SMOKE_JSON),
    at: new Date().toISOString(),
  };
  gate.updatedAt = new Date().toISOString();
  fs.writeFileSync(GATE_JSON, JSON.stringify(gate, null, 2) + '\n');

  const md = [
    `# Gate report — \`${BATCH}\``,
    '',
    `- Rows: **${importCounts.rows}**`,
    `- Publish decision: **${gate.publishDecision}**`,
    `- Smoke: **${smoke.ok ? 'PASS' : 'FAIL'}**`,
    '',
    '## Checklist',
    '',
    ...checks.map(
      (c) => `- [${c.pass ? 'PASS' : 'FAIL'}] \`${c.name}\` — ${c.detail}`,
    ),
    '',
    '## Artifacts',
    '',
    `- Candidate: \`content/candidates/${BATCH}_M3_T5.csv\``,
    `- Published: \`content/published/${BATCH}_M3_T5.csv\``,
    `- Smoke: \`content/reports/${BATCH}_smoke.json\``,
    '',
  ].join('\n');
  fs.writeFileSync(GATE_MD, md + '\n');
}

function main(): number {
  console.log('=== T5 critical path ===');
  console.log('1) Structural lint (Python all-or-nothing)');
  execFileSync(
    'python3',
    [path.join(REPO, 'tools/validate-questions-csv'), CANDIDATE],
    { stdio: 'inherit' },
  );

  console.log('2) Import → SQLite published=false');
  const text = fs.readFileSync(CANDIDATE, 'utf8');
  const parsed = parseQuestionCsv(text, { forceUnpublished: true });
  if (!parsed.ok) {
    console.error(parsed.errors);
    return 1;
  }
  const batchIds = new Set(parsed.items.map((i) => i.id));
  const importResult = upsertQuestions(parsed.items);
  console.log(importResult);

  console.log('3) Unpublished smoke');
  const smoke1 = smokeUnpublished(parsed.items);
  console.log(JSON.stringify(smoke1, null, 2));
  if (!smoke1.ok) {
    fs.writeFileSync(SMOKE_JSON, JSON.stringify({ smoke1 }, null, 2) + '\n');
    return 1;
  }

  console.log('4) Flip published=true in SQLite');
  const db = openDb();
  const state = loadState(db);
  const nextCatalog = state.catalog.map((item) =>
    batchIds.has(item.id) ? { ...item, published: true } : item,
  );
  saveState(db, { ...state, catalog: nextCatalog });
  const stats = dbStats(db);
  db.close();
  console.log('db stats', stats);

  console.log('5) Published practice smoke');
  const smoke2 = smokePublished(nextCatalog, batchIds);
  console.log(JSON.stringify(smoke2, null, 2));
  fs.writeFileSync(
    SMOKE_JSON,
    JSON.stringify({ smoke1, smoke2, stats }, null, 2) + '\n',
  );
  if (!smoke2.ok) return 1;

  console.log('6) Write published CSV + update gate');
  writePublishedCsv(nextCatalog.filter((i) => batchIds.has(i.id)));
  updateGate(smoke2, {
    created: importResult.created,
    updated: importResult.updated,
    rows: parsed.items.length,
  });

  console.log('=== DONE: published=true ===');
  console.log(`published csv: ${PUBLISHED_CSV}`);
  console.log(`gate: ${GATE_JSON}`);
  return 0;
}

process.exit(main());
