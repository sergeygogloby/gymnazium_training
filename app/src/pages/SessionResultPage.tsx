import { Link, useParams } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { useSessionStore } from '../store/useSessionStore';

export function SessionResultPage() {
  const { attemptId } = useParams();
  const { attempts } = useSessionStore();
  const attempt = attempts.find((a) => a.id === attemptId);

  return (
    <PageShell title="Výsledok relácie" viewId="V04">
      {!attempt ? (
        <p>Relácia nenájdená.</p>
      ) : (
        <>
          <dl className="meta">
            <div>
              <dt>Druh</dt>
              <dd>
                <code>{attempt.sessionKind}</code>
              </dd>
            </div>
            <div>
              <dt>Začiatok</dt>
              <dd>{attempt.startedAt}</dd>
            </div>
            <div>
              <dt>Koniec</dt>
              <dd>{attempt.endedAt ?? '—'}</dd>
            </div>
            <div>
              <dt>Skóre</dt>
              <dd>
                {attempt.scoreCorrect ?? 0} / {attempt.scoreTotal ?? 0} (stub)
              </dd>
            </div>
          </dl>
          <p className="placeholder-box">
            Rozpis a návrhy ďalšieho cvičenia — Wave 2.
          </p>
        </>
      )}
      <ul className="home-links">
        <li>
          <Link to="/cvicenie">Ďalšie cvičenie</Link>
        </li>
        <li>
          <Link to="/chyby">Chyby</Link>
        </li>
        <li>
          <Link to="/vysledky">Výsledky a pokrok</Link>
        </li>
      </ul>
    </PageShell>
  );
}
