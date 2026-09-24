import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { PageShell } from '../components/PageShell';
import {
  attemptModuleLabel,
  filterAttemptsBySection,
  formatDuration,
  sortAttemptsNewestFirst,
  type ProgressSection,
} from '../lib/progress';
import { isExamKind, sessionKindLabel } from '../lib/sessionKind';
import { useSessionStore } from '../store/useSessionStore';

type HistoryFilter = ProgressSection;

const FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: 'practice', label: 'Cvičenie' },
  { id: 'exams', label: 'Skúšky' },
  { id: 'exam_30', label: 'Skúšky · 30' },
  { id: 'exam_60', label: 'Skúšky · 60' },
];

/** V05 Session history — F08 kind-aware list with Practice | Exams filters. */
export function HistoryPage() {
  const { attempts } = useSessionStore();
  const [filter, setFilter] = useState<HistoryFilter>('practice');

  const rows = useMemo(() => {
    const scoped = filterAttemptsBySection(attempts, filter);
    return sortAttemptsNewestFirst(scoped);
  }, [attempts, filter]);

  const anyCompleted = attempts.some((a) => a.endedAt);

  return (
    <PageShell title="História relácií" viewId="V05">
      <p className="lede">
        Minulé relácie s dátumom, modulom, skóre, trvaním a druhom (
        <code>practice</code> / <code>exam_30</code> / <code>exam_60</code>).
        Cvičenie a skúšky sú oddelené — nie jeden nerozlíšený zoznam.
      </p>

      <fieldset className="filter-fieldset" data-testid="history-kind-filter">
        <legend>Filter: Cvičenie | Skúšky</legend>
        {FILTERS.map((f) => (
          <label key={f.id} className="choice">
            <input
              type="radio"
              name="history-filter"
              checked={filter === f.id}
              onChange={() => setFilter(f.id)}
            />
            {f.label}
          </label>
        ))}
      </fieldset>

      {!anyCompleted ? (
        <p className="notice" data-testid="history-empty">
          Zatiaľ žiadne ukončené relácie. Dokončite cvičenie alebo skúšku z{' '}
          <Link to="/cvicenie">Cvičenia</Link> alebo{' '}
          <Link to="/kurikulum">Kurikula</Link> — história sa vytvorí po
          ukončení. Bez účtu alebo pozvánky.
        </p>
      ) : rows.length === 0 ? (
        <p className="muted" data-testid="history-empty-filter">
          V tomto filtri nie sú relácie. Skúste Cvičenie alebo Skúšky.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="history-table" data-testid="history-table">
            <thead>
              <tr>
                <th>Dátum</th>
                <th>Druh</th>
                <th>Modul</th>
                <th>Skóre</th>
                <th>Trvanie</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
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
                    </span>
                  </td>
                  <td>{attemptModuleLabel(a)}</td>
                  <td>
                    {a.scoreCorrect ?? '—'} / {a.scoreTotal ?? '—'}
                  </td>
                  <td>{formatDuration(a.durationMs)}</td>
                  <td>
                    <Link to={`/vysledok/${a.id}`}>Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="muted">
        História je len na čítanie — odpovede sa tu nemenia.
      </p>
      <p>
        <Link to="/vysledky">← Výsledky a pokrok</Link>
      </p>
    </PageShell>
  );
}
