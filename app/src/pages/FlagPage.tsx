import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { sessionStore } from '../store/sessionStore';

export function FlagPage() {
  const [itemId, setItemId] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!itemId.trim()) return;
    sessionStore.addFlag(itemId.trim(), note.trim() || undefined);
    setDone(true);
  }

  return (
    <PageShell title="Nahlásiť zlú položku" viewId="V09">
      <p className="lede">
        Lokálny front na review — bez prihlásenia (F13).
      </p>
      {done ? (
        <p>
          Nahlásené. <Link to="/relacia">Späť na reláciu</Link>
        </p>
      ) : (
        <form className="flag-form" onSubmit={onSubmit}>
          <label>
            ID položky
            <input
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              required
            />
          </label>
          <label>
            Poznámka (voliteľné)
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </label>
          <button type="submit">Potvrdiť nahlásenie</button>
        </form>
      )}
    </PageShell>
  );
}
