import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import {
  catalogStats,
  selectEligibleItems,
  sourceTypeLabel,
} from '../lib/catalog';
import {
  validateQuestionCsv,
  type CsvRowError,
} from '../lib/csvValidate';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';

/**
 * V11 — CSV upload. All-or-nothing: any bad row → no catalog writes.
 * No auth — trusted LAN ops surface only.
 */
export function UploadPage() {
  const { catalog } = useSessionStore();
  const [errors, setErrors] = useState<CsvRowError[] | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const stats = catalogStats(catalog);
  const eligible = selectEligibleItems(catalog);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors(null);
    setSuccess(null);
    const form = e.currentTarget;
    const input = form.elements.namedItem('csv') as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      setErrors([
        { row: 0, id: '<file>', message: 'Vyberte CSV súbor' },
      ]);
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    const result = validateQuestionCsv(text);
    if (!result.ok) {
      // Locked: do not write anything (all-or-nothing)
      setErrors(result.errors);
      return;
    }
    const { created, updated } = sessionStore.upsertCatalogItems(result.items);
    const next = catalogStats(sessionStore.getState().catalog);
    setSuccess(
      `Import OK — vytvorené: ${created}, aktualizované: ${updated}. ` +
        `Katalóg: ${next.total} (pre relácie: ${next.eligible}, skryté: ${next.hidden}).`,
    );
  }

  return (
    <PageShell title="Nahrať otázky (CSV)" viewId="V11">
      <aside className="ops-warning" role="note">
        <p>
          <strong>Upozornenie (LAN ops):</strong> Táto obrazovka je určená len
          pre dôveryhodnú domácu sieť. Aplikácia nemá prihlásenie — ktokoľvek na
          LAN môže nahrať alebo prepísať otázky. Nie je to zabezpečený admin na
          verejnom internete. Používajte opatrne.
        </p>
      </aside>

      <p className="lede">
        Validácia F22 je <strong>all-or-nothing</strong>: akákoľvek chybná
        riadková validácia zamietne <strong>celý</strong> súbor — žiadny
        čiastočný import. Položky s <code>published=false</code> ostanú v
        katalógu, ale nevstúpia do nových relácií.
      </p>

      <form className="upload-form" onSubmit={onSubmit}>
        <label>
          CSV súbor
          <input name="csv" type="file" accept=".csv,text/csv" />
        </label>
        <button type="submit">Overiť a nahrať</button>
      </form>

      {fileName && <p className="muted">Súbor: {fileName}</p>}

      {success && (
        <div className="notice success" role="status">
          <p>{success}</p>
          <p>
            <Link to="/cvicenie">Spustiť cvičenie / skúšku →</Link>
          </p>
        </div>
      )}

      {errors && (
        <div className="notice error" role="alert">
          <p>
            Súbor zamietnutý — <strong>nič nebolo zapísané</strong>{' '}
            (wouldWrite=0).
          </p>
          <ul className="error-list">
            {errors.map((err, i) => (
              <li key={i}>
                Riadok {err.row} ({err.id})
                {err.column ? ` [${err.column}]` : ''}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="catalog-summary" aria-label="Katalóg">
        <h2>Katalóg v tejto inštancii</h2>
        <p className="muted">
          Celkom {stats.total} · pre relácie {stats.eligible} · skryté{' '}
          {stats.hidden} · syntetické {stats.synthetic}
        </p>
        {catalog.length === 0 ? (
          <p className="muted">
            Katalóg je prázdny. Skúste fixture{' '}
            <code>content/candidates/fixtures/valid-ops-published.csv</code>.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>id</th>
                  <th>modul</th>
                  <th>téma</th>
                  <th>oblasť</th>
                  <th>zdroj</th>
                  <th>published</th>
                </tr>
              </thead>
              <tbody>
                {catalog.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <code>{item.id}</code>
                    </td>
                    <td>{item.module}</td>
                    <td>{item.topic}</td>
                    <td>{item.skillArea}</td>
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
                    <td>{item.published ? 'áno' : 'nie'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {eligible.length > 0 && (
          <p className="muted">
            Do novej relácie by išlo {eligible.length} položiek (iba{' '}
            <code>published=true</code>).
          </p>
        )}
      </section>
    </PageShell>
  );
}
