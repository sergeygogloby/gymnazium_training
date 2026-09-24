import { StrictMode, useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { sessionStore } from './store/sessionStore';
import './styles/app.css';

function Boot({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(sessionStore.isHydrated());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    sessionStore
      .hydrateFromDb()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          err instanceof Error
            ? err.message
            : 'Nepodarilo sa načítať SQLite API';
        setError(
          `${msg}. Spustite server: cd server && npm run dev (port 8787).`,
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="app-shell" style={{ padding: '2rem', maxWidth: 40 + 'rem' }}>
        <h1>Databáza nedostupná</h1>
        <p>{error}</p>
        <p className="muted">
          Otázky a výsledky sa ukladajú do lokálneho SQLite cez LAN API — nie do
          localStorage.
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="app-shell" style={{ padding: '2rem' }}>
        <p>Načítavam údaje zo SQLite…</p>
      </div>
    );
  }

  return <>{children}</>;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Boot>
      <App />
    </Boot>
  </StrictMode>,
);
