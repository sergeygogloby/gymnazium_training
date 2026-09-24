import type {
  Attempt,
  ContentItem,
  FlagRecord,
  SessionKind,
} from '../types/content';

const STORAGE_KEY = 'gymnazium-training-store-v1';

export interface AppStoreState {
  catalog: ContentItem[];
  attempts: Attempt[];
  flags: FlagRecord[];
  /** Active session shell (Wave 1 stub — no full practice logic). */
  activeSession: {
    sessionKind: SessionKind;
    attemptId: string;
    mistakesScoped?: boolean;
  } | null;
  seenHelp: boolean;
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

  startSession(sessionKind: SessionKind, options?: { mistakesScoped?: boolean }): string {
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const attempt: Attempt = {
      id: attemptId,
      sessionKind,
      startedAt: new Date().toISOString(),
      answers: [],
      mistakesScoped: options?.mistakesScoped,
    };
    state = {
      ...state,
      attempts: [...state.attempts, attempt],
      activeSession: {
        sessionKind,
        attemptId,
        mistakesScoped: options?.mistakesScoped,
      },
    };
    emit();
    return attemptId;
  },

  endSession(): void {
    if (!state.activeSession) return;
    const { attemptId } = state.activeSession;
    state = {
      ...state,
      activeSession: null,
      attempts: state.attempts.map((a) =>
        a.id === attemptId
          ? { ...a, endedAt: new Date().toISOString() }
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
};
