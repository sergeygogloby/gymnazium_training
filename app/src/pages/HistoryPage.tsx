import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionKind } from '../types/content';

const KIND_LABEL: Record<SessionKind, string> = {
  practice: 'Cvičenie',
  exam_30: 'Skúška 30 min',
  exam_60: 'Skúška 60 min',
};

export function HistoryPage() {
  const { attempts } = useSessionStore();
  const sorted = [...attempts].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );

  return (
    <PageShell title="História relácií" viewId="V05">
      <p className="lede">
        Zoznam pokusov s <code>sessionKind</code>. Cvičenie a skúšky sú
        rozlíšené v stĺpci Druh.
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
              <tr key={a.id}>
                <td>{new Date(a.startedAt).toLocaleString('sk-SK')}</td>
                <td>
                  <strong>{KIND_LABEL[a.sessionKind]}</strong>
                  <br />
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
