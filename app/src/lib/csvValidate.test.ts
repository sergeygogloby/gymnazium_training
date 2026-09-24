import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { validateQuestionCsv } from './csvValidate';

const FIXTURES = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../content/candidates/fixtures',
);

function readFixture(name: string): string {
  return readFileSync(join(FIXTURES, name), 'utf8');
}

const HEADER =
  'id,stem,choices,correctKey,rationale,module,topic,skillArea,sourceType,locale,published';

const goodRow =
  'q1,Aké je synonymum?,A|B|C|D,A,Lebo A,M1,T1,VSP,bank,sk,true';

describe('validateQuestionCsv (F22 all-or-nothing)', () => {
  it('accepts a valid file and returns items', () => {
    const result = validateQuestionCsv(`${HEADER}\n${goodRow}\n`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items).toHaveLength(1);
      expect(result.items[0].module).toBe('M1');
      expect(result.items[0].skillArea).toBe('VSP');
      expect(result.items[0].choices).toEqual(['A', 'B', 'C', 'D']);
    }
  });

  it('rejects whole file when any row is invalid (no items)', () => {
    const bad =
      'q2,Stem ok,A|B,A,ok,M9,T1,VSP,bank,sk,true';
    const result = validateQuestionCsv(
      `${HEADER}\n${goodRow}\n${bad}\n`,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.wouldWrite).toBe(0);
      expect(result.errors.some((e) => e.column === 'module')).toBe(true);
      expect(result.errors.some((e) => e.id === 'q2')).toBe(true);
      expect('items' in result).toBe(false);
    }
  });

  it('rejects missing required columns', () => {
    const result = validateQuestionCsv('stem,module\nhello,M1\n');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.wouldWrite).toBe(0);
      expect(result.errors[0].id).toBe('<header>');
    }
  });

  it('normalizes VŠP to VSP', () => {
    const row =
      'q1,Stem,A|B,A,ok,M2,T3,VŠP,synthetic,sk,true';
    const result = validateQuestionCsv(`${HEADER}\n${row}\n`);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items[0].skillArea).toBe('VSP');
      expect(result.items[0].sourceType).toBe('synthetic');
    }
  });

  it('rejects MCQ correctKey out of range', () => {
    const row =
      'mcq-bad,Stem,A|B|C|D,E,ok,M3,T5,VSP,synthetic,sk,false';
    const result = validateQuestionCsv(`${HEADER}\n${row}\n`);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.column === 'correctKey')).toBe(true);
    }
  });

  it('accepts content fixture valid-sample.csv', () => {
    const result = validateQuestionCsv(readFixture('valid-sample.csv'));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items.length).toBeGreaterThanOrEqual(2);
      expect(result.items.every((i) => i.published === false)).toBe(true);
    }
  });

  it('accepts ops published fixture with synthetic + hidden', () => {
    const result = validateQuestionCsv(
      readFixture('valid-ops-published.csv'),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items).toHaveLength(3);
      expect(
        result.items.filter((i) => i.published).map((i) => i.id).sort(),
      ).toEqual(['ops-bank-01', 'ops-syn-01']);
      expect(
        result.items.find((i) => i.id === 'ops-syn-01')?.sourceType,
      ).toBe('synthetic');
    }
  });

  it('rejects fixture invalid-enums.csv entirely', () => {
    const result = validateQuestionCsv(readFixture('invalid-enums.csv'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.wouldWrite).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('rejects fixture invalid-mcq.csv entirely', () => {
    const result = validateQuestionCsv(readFixture('invalid-mcq.csv'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.wouldWrite).toBe(0);
    }
  });

  it('rejects empty.csv', () => {
    const result = validateQuestionCsv(readFixture('empty.csv'));
    expect(result.ok).toBe(false);
  });

  it('rejects missing-columns.csv', () => {
    const result = validateQuestionCsv(readFixture('missing-columns.csv'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0].column).toBe('header');
    }
  });
});
