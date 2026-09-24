/** Shared content types mirrored from app/src/types/content.ts */

export type ModuleId = 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6';
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
export type SkillArea = 'VSP' | 'VJS';
export type SourceType = 'bank' | 'synthetic';
export type SessionKind = 'practice' | 'exam_30' | 'exam_60';
export type AnswerOutcome = 'correct' | 'incorrect' | 'skipped';

export interface ContentItem {
  id: string;
  stem: string;
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

export interface ActiveSession {
  sessionKind: SessionKind;
  attemptId: string;
  mistakesScoped?: boolean;
  itemIds?: string[];
  currentIndex?: number;
  endsAt?: string;
  module?: ModuleId;
  topic?: TopicId;
  skillFilter?: SkillArea;
}

export interface AppStoreState {
  catalog: ContentItem[];
  attempts: Attempt[];
  flags: FlagRecord[];
  activeSession: ActiveSession | null;
  seenHelp: boolean;
}
