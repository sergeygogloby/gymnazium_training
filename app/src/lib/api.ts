import type { AppStoreState } from '../store/sessionStore';

/** Base URL for API. Empty = same origin (Vite proxy in dev). */
const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function fetchHealth(): Promise<{
  ok: boolean;
  engine: string;
  dbPath: string;
}> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new ApiError(res.status, 'health failed');
  return res.json();
}

export async function fetchState(): Promise<AppStoreState> {
  const res = await fetch(`${API_BASE}/api/state`);
  if (!res.ok) throw new ApiError(res.status, `GET /api/state ${res.status}`);
  return res.json();
}

export async function putState(state: AppStoreState): Promise<void> {
  const res = await fetch(`${API_BASE}/api/state`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new ApiError(res.status, `PUT /api/state ${res.status}`);
}

/** True when Vitest / Node test harness — keep memory-only store. */
export function isTestRuntime(): boolean {
  if (import.meta.env?.MODE === 'test') return true;
  if (typeof process !== 'undefined' && process.env?.VITEST) return true;
  return false;
}
