import type {
  Attempt,
  AttemptAnswer,
  ContentItem,
  FlagRecord,
  SessionKind,
} from '../types/content';
import {
  gradeAnswer,
  finalizeExamScores,
  lookupItem,
  resolveExamItems,
} from '../lib/examSession';
import { examDurationMs, isExamKind } from '../lib/sessionKind';

const STORAGE_KEY = 'gymnazium-training-store-v1';

export interface ActiveSession {
  sessionKind: SessionKind;
  attemptId: string;
  mistakesScoped?: boolean;
  /** Exam item queue (ids). Practice agent owns practice item loop. */
  itemIds?: string[];
  currentIndex?: number;
  /** ISO timestamp when exam countdown hits zero. */
  endsAt?: string;
}

export interface AppStoreState {
  catalog: ContentItem[];
  attempts: Attempt[];
  flags: FlagRecord[];
  activeSession: ActiveSession | null;
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

function patchAttempt(id: string, patch: Partial<Attempt>): void {
  state = {
    ...state,
    attempts: state.attempts.map((a) =>
      a.id === id ? { ...a, ...patch } : a,
    ),
  };
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

  /**
   * Upsert by id after all-or-nothing CSV validation.
   * Returns created / updated counts for the V11 success summary.
   */
  upsertCatalogItems(items: ContentItem[]): { created: number; updated: number } {
    const byId = new Map(state.catalog.map((i) => [i.id, i]));
    let created = 0;
    let updated = 0;
    for (const item of items) {
      if (byId.has(item.id)) updated += 1;
      else created += 1;
      byId.set(item.id, item);
    }
    state = { ...state, catalog: Array.from(byId.values()) };
    emit();
    return { created, updated };
  },

  addAttempt(attempt: Attempt): void {
    state = { ...state, attempts: [...state.attempts, attempt] };
    emit();
  },

  updateAttempt(id: string, patch: Partial<Attempt>): void {
    patchAttempt(id, patch);
    emit();
  },

  /**
   * Start a session. Exam kinds get countdown + item queue.
   * Practice path stays minimal — practice slice owns after-each feedback.
   */
  startSession(
    sessionKind: SessionKind,
    options?: { mistakesScoped?: boolean; nowMs?: number },
  ): string {
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const startedAt = new Date(options?.nowMs ?? Date.now()).toISOString();
    const attempt: Attempt = {
      id: attemptId,
      sessionKind,
      startedAt,
      answers: [],
      mistakesScoped: options?.mistakesScoped,
    };

    let activeSession: ActiveSession = {
      sessionKind,
      attemptId,
      mistakesScoped: options?.mistakesScoped,
    };

    if (isExamKind(sessionKind)) {
      const items = resolveExamItems(state.catalog);
      const duration = examDurationMs(sessionKind);
      const now = options?.nowMs ?? Date.now();
      activeSession = {
        ...activeSession,
        itemIds: items.map((i) => i.id),
        currentIndex: 0,
        endsAt: new Date(now + duration).toISOString(),
      };
    }

    state = {
      ...state,
      attempts: [...state.attempts, attempt],
      activeSession,
    };
    emit();
    return attemptId;
  },

  /**
   * Record an exam answer or skip — grades silently (no mid-exam key reveal).
   * Practice must not call this for after-each feedback UI.
   */
  recordExamResponse(givenAnswer?: string): {
    done: boolean;
    answer: AttemptAnswer | null;
  } {
    const active = state.activeSession;
    if (!active || !isExamKind(active.sessionKind)) {
      return { done: false, answer: null };
    }
    const itemIds = active.itemIds ?? [];
    const idx = active.currentIndex ?? 0;
    if (idx >= itemIds.length) {
      return { done: true, answer: null };
    }
    const item = lookupItem(state.catalog, itemIds[idx]);
    if (!item) {
      return { done: false, answer: null };
    }

    const answer = gradeAnswer(item, givenAnswer);
    const attempt = state.attempts.find((a) => a.id === active.attemptId);
    const answers = [...(attempt?.answers ?? []), answer];
    const nextIndex = idx + 1;
    const done = nextIndex >= itemIds.length;

    patchAttempt(active.attemptId, { answers });
    state = {
      ...state,
      activeSession: done
        ? { ...active, currentIndex: nextIndex }
        : { ...active, currentIndex: nextIndex },
    };
    emit();
    return { done, answer };
  },

  /**
   * Close session: score exams end-only; clear active shell.
   * Practice may call this after its own feedback loop.
   */
  endSession(options?: { nowMs?: number }): void {
    if (!state.activeSession) return;
    const { attemptId, sessionKind, itemIds, currentIndex } =
      state.activeSession;
    const now = options?.nowMs ?? Date.now();
    const attempt = state.attempts.find((a) => a.id === attemptId);
    if (!attempt) {
      state = { ...state, activeSession: null };
      emit();
      return;
    }

    let answers = [...attempt.answers];

    if (isExamKind(sessionKind) && itemIds) {
      // Auto-skip remaining items on time-up / early finish.
      const startIdx = currentIndex ?? answers.length;
      for (let i = startIdx; i < itemIds.length; i++) {
        const already = answers.some((a) => a.itemId === itemIds[i]);
        if (already) continue;
        const item = lookupItem(state.catalog, itemIds[i]);
        if (!item) continue;
        answers.push(gradeAnswer(item, undefined));
      }
    }

    const scores = isExamKind(sessionKind)
      ? finalizeExamScores(answers)
      : {
          scoreCorrect: answers.filter((a) => a.outcome === 'correct').length,
          scoreTotal: answers.length,
        };

    const started = Date.parse(attempt.startedAt);
    const durationMs = Number.isFinite(started)
      ? Math.max(0, now - started)
      : undefined;

    patchAttempt(attemptId, {
      answers,
      endedAt: new Date(now).toISOString(),
      scoreCorrect: scores.scoreCorrect,
      scoreTotal: scores.scoreTotal,
      durationMs,
    });
    state = { ...state, activeSession: null };
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

  /** Test helper — reset in-memory + storage. */
  __resetForTests(): void {
    state = emptyState();
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    listeners.forEach((l) => l());
  },
};
