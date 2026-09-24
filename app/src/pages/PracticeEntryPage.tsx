import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { catalogStats, selectEligibleItems } from '../lib/catalog';
import { sessionKindLabel } from '../lib/sessionKind';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionKind } from '../types/content';

export function PracticeEntryPage() {
  const navigate = useNavigate();
  const { activeSession, catalog } = useSessionStore();
  const stats = catalogStats(catalog);
  const eligible = selectEligibleItems(catalog);
  // Empty catalog: exam may fall back to demo items; all-unpublished blocks new sessions.
  const startBlocked = stats.total > 0 && eligible.length === 0;

  function start(kind: SessionKind) {
    sessionStore.startSession(kind);
    navigate('/relacia');
  }

  return (
    <PageShell title="Cvičenie / skúška" viewId="V03-entry">
      <p className="lede">
        Vyberte druh relácie (nie režim). Cvičenie: spätná väzba po každej
        položke. Skúška 30 / 60 min: odpočet, hodnotenie až na konci. Katalóg z
        CSV uploadu (F14: len published).
      </p>
      {activeSession && (
        <p className="notice">
          Aktívna relácia:{' '}
          <strong>{sessionKindLabel(activeSession.sessionKind)}</strong> —{' '}
          <Link to="/relacia">pokračovať</Link>
        </p>
      )}
      <div className="session-kind-actions">
        <button
          type="button"
          onClick={() => start('practice')}
          disabled={startBlocked}
        >
          Cvičenie (bez časovača)
        </button>
        <button
          type="button"
          onClick={() => start('exam_30')}
          disabled={startBlocked}
        >
          Skúška · 30 min
        </button>
        <button
          type="button"
          onClick={() => start('exam_60')}
          disabled={startBlocked}
        >
          Skúška · 60 min
        </button>
      </div>
      <p className="muted">
        Katalóg: {stats.total} · pre relácie: {stats.eligible} · skryté
        (published=false): {stats.hidden}
        {stats.total === 0 && (
          <>
            {' '}
            — prázdny → skúška použije demo položky ·{' '}
            <Link to="/nahrat">nahrať CSV</Link>
          </>
        )}
      </p>
      {startBlocked && (
        <p className="notice">
          Všetky položky majú <code>published=false</code> — do nových relácií
          nevstúpia. Nahrajte CSV s <code>published=true</code> alebo upravte
          príznaky.
        </p>
      )}
    </PageShell>
  );
}
