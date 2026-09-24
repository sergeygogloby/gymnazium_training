import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionKind } from '../types/content';

const KIND_LABEL: Record<SessionKind, string> = {
  practice: 'Cvičenie',
  exam_30: 'Skúška 30 min',
  exam_60: 'Skúška 60 min',
};

/** V03 shared shell — placeholder body; Wave 2 adds item loop. */
export function SessionPage() {
  const navigate = useNavigate();
  const { activeSession, catalog } = useSessionStore();

  if (!activeSession) {
    return (
      <PageShell title="Relácia" viewId="V03">
        <p>Žiadna aktívna relácia.</p>
        <p>
          <Link to="/cvicenie">Spustiť cvičenie alebo skúšku</Link>
        </p>
      </PageShell>
    );
  }

  const kind = activeSession.sessionKind;

  function finish() {
    sessionStore.endSession();
    navigate(`/vysledok/${activeSession!.attemptId}`);
  }

  return (
    <PageShell title={`Relácia — ${KIND_LABEL[kind]}`} viewId="V03">
      <p className="lede">
        Shell relácie ({kind}
        {activeSession.mistakesScoped ? ', chyby' : ''}). Položky a spätná
        väzba ešte nie sú implementované.
      </p>
      <dl className="meta">
        <div>
          <dt>sessionKind</dt>
          <dd>
            <code>{kind}</code>
          </dd>
        </div>
        <div>
          <dt>Spätná väzba</dt>
          <dd>
            {kind === 'practice'
              ? 'Po každej položke (Wave 2)'
              : 'Až na konci skúšky (Wave 2)'}
          </dd>
        </div>
        <div>
          <dt>Zdrojové štítky</dt>
          <dd>bank / synthetic (F18 — Wave 2)</dd>
        </div>
        <div>
          <dt>Položky v katalógu</dt>
          <dd>{catalog.length}</dd>
        </div>
      </dl>
      <p className="placeholder-box">
        Tu bude otázka, voľby odpovede a (pri cvičení) kľúč + zdôvodnenie.
      </p>
      <div className="session-kind-actions">
        <button type="button" onClick={finish}>
          Ukončiť reláciu (stub)
        </button>
        <Link to="/nahlásenie">Nahlásiť zlú položku (V09)</Link>
      </div>
    </PageShell>
  );
}
