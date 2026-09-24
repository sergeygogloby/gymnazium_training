import { useSyncExternalStore } from 'react';
import { sessionStore, type AppStoreState } from '../store/sessionStore';

export function useSessionStore(): AppStoreState {
  return useSyncExternalStore(
    sessionStore.subscribe,
    sessionStore.getState,
    sessionStore.getState,
  );
}
