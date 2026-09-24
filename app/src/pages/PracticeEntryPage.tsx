import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { catalogStats, selectEligibleItems } from '../lib/catalog';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionKind } from '../types/content';

const KIND_LABEL: Record<SessionKind, string> = {
  practice: 'Cvičenie (bez časovača)',
  exam_30: 'Skúška 30 min',
  exam_60: 'Skúška 60 min',
};

export function PracticeEntryPage() {
  const navigate = useNavigate();
  const { activeSession, catalog } = useSessionStore();
  const stats = catalogStats(catalog);
  const eligible = selectEligibleItems(catalog);

  function start(kind: SessionKind) {
    sessionStore.startSession(kind);
    navigate('/relacia');
  }

  return (
    <PageShell title="Cvičenie / skúška" viewId="V03-entry">
      <p className="lede">
        Vyberte druh relácie. Spätná väzba po každej položke platí pre cvičenie;
        skúšky hodnotia až na konci. Slučka položiek je Wave 2 (iné agenty) —
        tu sa berie katalóg z CSV uploadu (F14: len published).
      </p>
      {activeSession && (
        <p className="notice">
          Aktívna relácia:{' '}
          <strong>{KIND_LABEL[activeSession.sessionKind]}</strong> —{' '}
          <Link to="/relacia">pokračovať</Link>
        </p>
      )}
      <div className="session-kind-actions">
        <button
          type="button"
          onClick={() => start('practice')}
          disabled={eligible.length === 0}
        >
          {KIND_LABEL.practice}
        </button>
        <button
          type="button"
          onClick={() => start('exam_30')}
          disabled={eligible.length === 0}
        >
          {KIND_LABEL.exam_30}
        </button>
        <button
          type="button"
          onClick={() => start('exam_60')}
          disabled={eligible.length === 0}
        >
          {KIND_LABEL.exam_60}
        </button>
      </div>
      <p className="muted">
        Katalóg: {stats.total} · pre relácie: {stats.eligible} · skryté
        (published=false): {stats.hidden}
        {stats.total === 0 && (
          <>
            {' '}
            — <Link to="/nahrat">nahrať CSV</Link>
          </>
        )}
      </p>
      {stats.total > 0 && eligible.length === 0 && (
        <p className="notice">
          Všetky položky majú <code>published=false</code> — do nových relácií
          nevstúpia. Nahrajte CSV s <code>published=true</code> alebo upravte
          príznaky.
        </p>
      )}
    </PageShell>
  );
}
