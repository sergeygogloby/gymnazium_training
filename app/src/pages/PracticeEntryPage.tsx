import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
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

  function start(kind: SessionKind) {
    sessionStore.startSession(kind);
    navigate('/relacia');
  }

  return (
    <PageShell title="Cvičenie / skúška" viewId="V03-entry">
      <p className="lede">
        Vyberte druh relácie. Spätná väzba po každej položke platí pre cvičenie;
        skúšky hodnotia až na konci. Plná logika cvičenia príde vo Wave 2.
      </p>
      {activeSession && (
        <p className="notice">
          Aktívna relácia:{' '}
          <strong>{KIND_LABEL[activeSession.sessionKind]}</strong> —{' '}
          <Link to="/relacia">pokračovať</Link>
        </p>
      )}
      <div className="session-kind-actions">
        <button type="button" onClick={() => start('practice')}>
          {KIND_LABEL.practice}
        </button>
        <button type="button" onClick={() => start('exam_30')}>
          {KIND_LABEL.exam_30}
        </button>
        <button type="button" onClick={() => start('exam_60')}>
          {KIND_LABEL.exam_60}
        </button>
      </div>
      <p className="muted">
        Katalóg otázok: {catalog.length} (prázdny = Wave 2 / CSV upload)
      </p>
    </PageShell>
  );
}
