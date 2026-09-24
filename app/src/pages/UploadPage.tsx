import { useState, type FormEvent } from 'react';
import { PageShell } from '../components/PageShell';
import {
  validateQuestionCsv,
  type CsvRowError,
} from '../lib/csvValidate';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';

/**
 * V11 — CSV upload. All-or-nothing: any bad row → no catalog writes.
 */
export function UploadPage() {
  const { catalog } = useSessionStore();
  const [errors, setErrors] = useState<CsvRowError[] | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors(null);
    setSuccess(null);
    const form = e.currentTarget;
    const input = form.elements.namedItem('csv') as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      setErrors([{ row: 0, message: 'Vyberte CSV súbor' }]);
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    const result = validateQuestionCsv(text);
    if (!result.ok) {
      // Locked: do not write anything
      setErrors(result.errors);
      return;
    }
    sessionStore.upsertCatalogItems(result.items);
    setSuccess(
      `OK — ${result.items.length} položiek (all-or-nothing). Katalóg: ${
        sessionStore.getState().catalog.length
      }.`,
    );
  }

  return (
    <PageShell title="Nahrať otázky (CSV)" viewId="V11">
      <p className="lede">
        Ops na dôveryhodnej LAN — bez prihlásenia. Akákoľvek chybná riadková
        validácia zamietne <strong>celý</strong> súbor (žiadny čiastočný
        import).
      </p>
      <form className="upload-form" onSubmit={onSubmit}>
        <label>
          CSV súbor
          <input name="csv" type="file" accept=".csv,text/csv" />
        </label>
        <button type="submit">Overiť a nahrať</button>
      </form>
      {fileName && <p className="muted">Súbor: {fileName}</p>}
      {success && <p className="notice success">{success}</p>}
      {errors && (
        <div className="notice error" role="alert">
          <p>Súbor zamietnutý — nič nebolo zapísané.</p>
          <ul>
            {errors.map((err, i) => (
              <li key={i}>
                Riadok {err.row}
                {err.column ? ` (${err.column})` : ''}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="muted">Položiek v katalógu: {catalog.length}</p>
    </PageShell>
  );
}
