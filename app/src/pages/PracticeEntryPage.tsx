import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { sessionKindLabel } from '../lib/sessionKind';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionKind } from '../types/content';

export function PracticeEntryPage() {
  const navigate = useNavigate();
  const { activeSession, catalog } = useSessionStore();

  function start(kind: SessionKind) {
    sessionStore.startSession(kind);
    navigate('/relacia');
  }

  return (
    <PageShell title="Cvičenie / skúška" viewId="V03-entry">
      <p className="lede">
        Vyberte druh relácie (nie režim). Cvičenie: spätná väzba po každej
        položke. Skúška 30 / 60 min: odpočet, hodnotenie až na konci.
      </p>
      {activeSession && (
        <p className="notice">
          Aktívna relácia:{' '}
          <strong>{sessionKindLabel(activeSession.sessionKind)}</strong> —{' '}
          <Link to="/relacia">pokračovať</Link>
        </p>
      )}
      <div className="session-kind-actions">
        <button type="button" onClick={() => start('practice')}>
          Cvičenie (bez časovača)
        </button>
        <button type="button" onClick={() => start('exam_30')}>
          Skúška · 30 min
        </button>
        <button type="button" onClick={() => start('exam_60')}>
          Skúška · 60 min
        </button>
      </div>
      <p className="muted">
        Katalóg otázok: {catalog.length}
        {catalog.length === 0
          ? ' (prázdny → skúška použije demo položky)'
          : ''}
      </p>
    </PageShell>
  );
}
