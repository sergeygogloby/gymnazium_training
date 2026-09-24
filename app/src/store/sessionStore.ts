import type {
  Attempt,
  AttemptAnswer,
  ContentItem,
  FlagRecord,
  ModuleId,
  SessionKind,
  SkillArea,
  TopicId,
} from '../types/content';
import { DEMO_CATALOG } from '../lib/demoCatalog';
import { selectPracticeItems } from '../lib/selectPracticeItems';

const STORAGE_KEY = 'gymnazium-training-store-v1';

export interface ActiveSession {
  sessionKind: SessionKind;
  attemptId: string;
  mistakesScoped?: boolean;
  /** Ordered item ids for the run (practice Wave 2). */
  itemIds?: string[];
  currentIndex?: number;
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

export interface StartSessionOptions {
  mistakesScoped?: boolean;
  module?: ModuleId;
  topic?: TopicId;
  skillArea?: SkillArea;
  /** Explicit item set (e.g. mistakes queue); otherwise selected from catalog. */
  itemIds?: string[];
  limit?: number;
}

const emptyState = (): AppStoreState => ({
  catalog: [],
  attempts: [],
  flags: [],
  activeSession: null,
  seenHelp: false,
});

function load(): AppStoreState {
  if (typeof localStorage === 'undefined') return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<AppStoreState>;
    return {
      ...emptyState(),
      ...parsed,
      catalog: parsed.catalog ?? [],
      attempts: parsed.attempts ?? [],
      flags: parsed.flags ?? [],
      activeSession: parsed.activeSession ?? null,
      seenHelp: parsed.seenHelp ?? false,
    };
  } catch {
    return emptyState();
  }
}

function save(state: AppStoreState): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

type Listener = () => void;

let state = load();
const listeners = new Set<Listener>();

function emit(): void {
  save(state);
  listeners.forEach((l) => l());
}

function publishedCount(catalog: ContentItem[]): number {
  return catalog.filter((i) => i.published).length;
}

export const sessionStore = {
  getState(): AppStoreState {
    return state;
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Replace entire catalog only after all-or-nothing CSV validation succeeds. */
  replaceCatalog(items: ContentItem[]): void {
    state = { ...state, catalog: items };
    emit();
  },

  upsertCatalogItems(items: ContentItem[]): void {
    const byId = new Map(state.catalog.map((i) => [i.id, i]));
    for (const item of items) {
      byId.set(item.id, item);
    }
    state = { ...state, catalog: Array.from(byId.values()) };
    emit();
  },

  /**
   * If the store has no published items, seed the tagged demo/bank set
   * so practice is testable without CSV upload.
   */
  ensureDemoCatalog(): void {
    if (publishedCount(state.catalog) > 0) return;
    sessionStore.upsertCatalogItems(DEMO_CATALOG);
  },

  addAttempt(attempt: Attempt): void {
    state = { ...state, attempts: [...state.attempts, attempt] };
    emit();
  },

  updateAttempt(id: string, patch: Partial<Attempt>): void {
    state = {
      ...state,
      attempts: state.attempts.map((a) =>
        a.id === id ? { ...a, ...patch } : a,
      ),
    };
    emit();
  },

  /**
   * Start a session. For `practice`, builds an item set from catalog
   * (or demo seed) and tracks currentIndex. Exam kinds stay shell-only
   * (timer / end-only scoring owned by exam-session slice).
   */
  startSession(sessionKind: SessionKind, options?: StartSessionOptions): string {
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    let itemIds = options?.itemIds;
    if (sessionKind === 'practice') {
      sessionStore.ensureDemoCatalog();
      if (!itemIds || itemIds.length === 0) {
        const selected = selectPracticeItems(sessionStore.getState().catalog, {
          module: options?.module,
          topic: options?.topic,
          skillArea: options?.skillArea,
          limit: options?.limit ?? 5,
        });
        itemIds = selected.map((i) => i.id);
      }
    }

    const attempt: Attempt = {
      id: attemptId,
      sessionKind,
      startedAt: new Date().toISOString(),
      answers: [],
      mistakesScoped: options?.mistakesScoped,
      module: options?.module,
      topic: options?.topic,
    };

    state = {
      ...state,
      attempts: [...state.attempts, attempt],
      activeSession: {
        sessionKind,
        attemptId,
        mistakesScoped: options?.mistakesScoped,
        itemIds,
        currentIndex: sessionKind === 'practice' ? 0 : undefined,
        module: options?.module,
        topic: options?.topic,
        skillFilter: options?.skillArea,
      },
    };
    emit();
    return attemptId;
  },

  appendAnswer(answer: AttemptAnswer): void {
    if (!state.activeSession) return;
    const { attemptId } = state.activeSession;
    state = {
      ...state,
      attempts: state.attempts.map((a) =>
        a.id === attemptId
          ? { ...a, answers: [...a.answers, answer] }
          : a,
      ),
    };
    emit();
  },

  advanceItem(): void {
    if (!state.activeSession) return;
    const idx = state.activeSession.currentIndex ?? 0;
    state = {
      ...state,
      activeSession: {
        ...state.activeSession,
        currentIndex: idx + 1,
      },
    };
    emit();
  },

  /**
   * Close active session: score, duration, endedAt; clear activeSession.
   * Practice and exam share this persist path (F06/F07).
   */
  endSession(): void {
    if (!state.activeSession) return;
    const { attemptId } = state.activeSession;
    const attempt = state.attempts.find((a) => a.id === attemptId);
    const endedAt = new Date().toISOString();
    const startedMs = attempt ? Date.parse(attempt.startedAt) : Date.now();
    const durationMs = Math.max(0, Date.parse(endedAt) - startedMs);
    const answers = attempt?.answers ?? [];
    const scoreCorrect = answers.filter((a) => a.outcome === 'correct').length;
    const scoreTotal = answers.length;

    state = {
      ...state,
      activeSession: null,
      attempts: state.attempts.map((a) =>
        a.id === attemptId
          ? {
              ...a,
              endedAt,
              durationMs,
              scoreCorrect,
              scoreTotal,
            }
          : a,
      ),
    };
    emit();
  },

  addFlag(itemId: string, note?: string): void {
    const flag: FlagRecord = {
      id: `flag_${Date.now()}`,
      itemId,
      createdAt: new Date().toISOString(),
      note,
    };
    state = { ...state, flags: [...state.flags, flag] };
    emit();
  },

  setSeenHelp(seen: boolean): void {
    state = { ...state, seenHelp: seen };
    emit();
  },

  /** Test helper — wipe in-memory + persisted store. */
  resetForTests(): void {
    state = emptyState();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};
