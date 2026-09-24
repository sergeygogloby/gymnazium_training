import { describe, expect, it } from 'vitest';
import { validateQuestionCsv } from './csvValidate';

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

  it('rejects whole file when any row is invalid', () => {
    const bad =
      'q2,Stem ok,A|B,A,ok,M9,T1,VSP,bank,sk,true';
    const result = validateQuestionCsv(
      `${HEADER}\n${goodRow}\n${bad}\n`,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.column === 'module')).toBe(true);
      // no partial items on failure
      expect('items' in result).toBe(false);
    }
  });

  it('rejects missing required columns', () => {
    const result = validateQuestionCsv('stem,module\nhello,M1\n');
    expect(result.ok).toBe(false);
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
});
