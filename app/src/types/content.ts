/** Content + session types aligned with docs/specs/content-model.md and F22. */

export type ModuleId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6';

/** Curriculum topic codes T1–T12 (materials-structure map). */
export type TopicId =
  | 'T1'
  | 'T2'
  | 'T3'
  | 'T4'
  | 'T5'
  | 'T6'
  | 'T7'
  | 'T8'
  | 'T9'
  | 'T10'
  | 'T11'
  | 'T12';

/** Stored as VSP/VJS (normalize VŠP → VSP). */
export type SkillArea = 'VSP' | 'VJS';

export type SourceType = 'bank' | 'synthetic';

export type SessionKind = 'practice' | 'exam_30' | 'exam_60';

export type AnswerOutcome = 'correct' | 'incorrect' | 'skipped';

export interface ContentItem {
  id: string;
  stem: string;
  /** MCQ options; omit / empty for free-answer. */
  choices?: string[];
  correctKey: string;
  rationale: string;
  module: ModuleId;
  topic: TopicId;
  skillArea: SkillArea;
  sourceType: SourceType;
  locale?: string;
  published: boolean;
}

export interface AttemptAnswer {
  itemId: string;
  outcome: AnswerOutcome;
  givenAnswer?: string;
  module: ModuleId;
  topic: TopicId;
  skillArea: SkillArea;
  sourceType: SourceType;
}

export interface Attempt {
  id: string;
  sessionKind: SessionKind;
  startedAt: string;
  endedAt?: string;
  module?: ModuleId;
  topic?: TopicId;
  /** Mistakes restudy stays practice-kind; optional source tag. */
  mistakesScoped?: boolean;
  answers: AttemptAnswer[];
  scoreCorrect?: number;
  scoreTotal?: number;
  durationMs?: number;
}

export interface FlagRecord {
  id: string;
  itemId: string;
  createdAt: string;
  note?: string;
  resolved?: boolean;
}

export const MODULES: ModuleId[] = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];
export const TOPICS: TopicId[] = [
  'T1',
  'T2',
  'T3',
  'T4',
  'T5',
  'T6',
  'T7',
  'T8',
  'T9',
  'T10',
  'T11',
  'T12',
];
export const SKILL_AREAS: SkillArea[] = ['VSP', 'VJS'];
export const SOURCE_TYPES: SourceType[] = ['bank', 'synthetic'];
export const SESSION_KINDS: SessionKind[] = ['practice', 'exam_30', 'exam_60'];
