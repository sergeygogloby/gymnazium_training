import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { selectEligibleItems, sourceTypeLabel } from '../lib/catalog';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionKind } from '../types/content';

const KIND_LABEL: Record<SessionKind, string> = {
  practice: 'Cvičenie',
  exam_30: 'Skúška 30 min',
  exam_60: 'Skúška 60 min',
};

/**
 * V03 shared shell — eligible catalog preview for CSV acceptance.
 * Full item answer loop is owned by practice/exam agents (out of scope here).
 */
export function SessionPage() {
  const navigate = useNavigate();
  const { activeSession, catalog } = useSessionStore();
  const eligible = selectEligibleItems(catalog);

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
        Náhľad položiek z katalógu pre {kind}
        {activeSession.mistakesScoped ? ' (chyby)' : ''}. Odpovedná slučka ešte
        nie je v tomto slice — overenie CSV: tagy, published a štítok
        bank/syntetická.
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
              ? 'Po každej položke (practice agent)'
              : 'Až na konci skúšky (exam agent)'}
          </dd>
        </div>
        <div>
          <dt>Spôsobilé položky</dt>
          <dd>
            {eligible.length} (z {catalog.length} v katalógu; skryté
            published=false vylúčené)
          </dd>
        </div>
      </dl>

      {eligible.length === 0 ? (
        <p className="notice">
          Žiadne published položky. <Link to="/nahrat">Nahrať CSV</Link>
        </p>
      ) : (
        <div className="table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>id</th>
                <th>tagy</th>
                <th>zdroj</th>
                <th>stem (skrátene)</th>
              </tr>
            </thead>
            <tbody>
              {eligible.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <code>{item.id}</code>
                  </td>
                  <td>
                    {item.module} · {item.topic} · {item.skillArea}
                  </td>
                  <td>
                    <span
                      className={
                        item.sourceType === 'synthetic'
                          ? 'source-label synthetic'
                          : 'source-label bank'
                      }
                    >
                      {sourceTypeLabel(item.sourceType)}
                    </span>
                  </td>
                  <td>
                    {item.stem.length > 80
                      ? `${item.stem.slice(0, 80)}…`
                      : item.stem}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="session-kind-actions">
        <button type="button" onClick={finish}>
          Ukončiť reláciu
        </button>
        <Link to="/nahlásenie">Nahlásiť zlú položku (V09)</Link>
      </div>
    </PageShell>
  );
}
