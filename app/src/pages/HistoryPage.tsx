import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { isExamKind, sessionKindLabel } from '../lib/sessionKind';
import { useSessionStore } from '../store/useSessionStore';

export function HistoryPage() {
  const { attempts } = useSessionStore();
  const sorted = [...attempts].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );

  return (
    <PageShell title="História relácií" viewId="V05">
      <p className="lede">
        Pokusy s <code>sessionKind</code>. Skúšky sú označené oddelene od
        cvičenia (plný filter Cvičenie | Skúšky — progress slice).
      </p>
      {sorted.length === 0 ? (
        <p className="muted">Zatiaľ žiadne relácie.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Dátum</th>
              <th>Druh</th>
              <th>Skóre</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.id} data-session-kind={a.sessionKind}>
                <td>{new Date(a.startedAt).toLocaleString('sk-SK')}</td>
                <td>
                  <span
                    className={
                      isExamKind(a.sessionKind)
                        ? 'kind-pill kind-exam'
                        : 'kind-pill kind-practice'
                    }
                  >
                    {sessionKindLabel(a.sessionKind)}
                  </span>{' '}
                  <code>{a.sessionKind}</code>
                </td>
                <td>
                  {a.scoreCorrect ?? '—'} / {a.scoreTotal ?? '—'}
                </td>
                <td>
                  <Link to={`/vysledok/${a.id}`}>Detail</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p>
        <Link to="/vysledky">← Výsledky a pokrok</Link>
      </p>
    </PageShell>
  );
}
