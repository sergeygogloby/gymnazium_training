import type { SessionKind } from '../types/content';

/** Fixed exam lengths (F15). No other durations in MVP. */
export const EXAM_DURATION_MS: Record<'exam_30' | 'exam_60', number> = {
  exam_30: 30 * 60 * 1000,
  exam_60: 60 * 60 * 1000,
};

export function isExamKind(
  kind: SessionKind,
): kind is 'exam_30' | 'exam_60' {
  return kind === 'exam_30' || kind === 'exam_60';
}

/** Result / history labels — Practice vs Exam · 30/60 min. */
export function sessionKindLabel(kind: SessionKind): string {
  switch (kind) {
    case 'practice':
      return 'Cvičenie';
    case 'exam_30':
      return 'Skúška · 30 min';
    case 'exam_60':
      return 'Skúška · 60 min';
  }
}

export function examDurationMs(kind: 'exam_30' | 'exam_60'): number {
  return EXAM_DURATION_MS[kind];
}

export function formatCountdown(msRemaining: number): string {
  const clamped = Math.max(0, msRemaining);
  const totalSec = Math.ceil(clamped / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
