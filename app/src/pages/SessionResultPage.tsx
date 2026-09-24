import { Link, useParams } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { attemptBreakdown, lookupItem } from '../lib/examSession';
import { isExamKind, sessionKindLabel } from '../lib/sessionKind';
import { useSessionStore } from '../store/useSessionStore';

/** V04 — shared result shell; exam kinds get end-of-session score + label. */
export function SessionResultPage() {
  const { attemptId } = useParams();
  const { attempts, catalog } = useSessionStore();
  const attempt = attempts.find((a) => a.id === attemptId);

  if (!attempt) {
    return (
      <PageShell title="Výsledok relácie" viewId="V04">
        <p>Relácia nenájdená.</p>
        <ul className="home-links">
          <li>
            <Link to="/cvicenie">Ďalšie cvičenie / skúška</Link>
          </li>
        </ul>
      </PageShell>
    );
  }

  const exam = isExamKind(attempt.sessionKind);
  const label = sessionKindLabel(attempt.sessionKind);
  const breakdown = attemptBreakdown(attempt);
  const durationMin =
    attempt.durationMs != null
      ? Math.round(attempt.durationMs / 60000)
      : null;

  return (
    <PageShell title="Výsledok relácie" viewId="V04">
      <p className="result-kind-badge" data-testid="result-kind-label">
        {label}
      </p>

      <dl className="meta">
        <div>
          <dt>Druh</dt>
          <dd>
            <code>{attempt.sessionKind}</code>
          </dd>
        </div>
        <div>
          <dt>Začiatok</dt>
          <dd>{new Date(attempt.startedAt).toLocaleString('sk-SK')}</dd>
        </div>
        <div>
          <dt>Koniec</dt>
          <dd>
            {attempt.endedAt
              ? new Date(attempt.endedAt).toLocaleString('sk-SK')
              : '—'}
          </dd>
        </div>
        {durationMin != null && (
          <div>
            <dt>Trvanie</dt>
            <dd>~{durationMin} min</dd>
          </div>
        )}
        <div>
          <dt>Skóre</dt>
          <dd data-testid="result-score">
            {attempt.scoreCorrect ?? 0} / {attempt.scoreTotal ?? 0}
          </dd>
        </div>
      </dl>

      {exam ? (
        <>
          <h2>Rozpis</h2>
          <ul className="breakdown-list">
            <li>Správne: {breakdown.correct}</li>
            <li>Nesprávne: {breakdown.incorrect}</li>
            <li>Preskočené: {breakdown.skipped}</li>
          </ul>
          {attempt.answers.length > 0 && (
            <details className="answer-review">
              <summary>Prehľad odpovedí (po ukončení)</summary>
              <ol>
                {attempt.answers.map((a) => {
                  const item = lookupItem(catalog, a.itemId);
                  return (
                    <li key={`${a.itemId}-${a.outcome}`}>
                      <strong>{a.outcome}</strong>
                      {item ? ` — ${item.stem}` : ` — ${a.itemId}`}
                      {item && (
                        <span className="muted">
                          {' '}
                          · kľúč: {item.correctKey}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </details>
          )}
        </>
      ) : (
        <p className="placeholder-box">
          Practice result detail — practice slice. Druh zostáva{' '}
          <code>practice</code>.
        </p>
      )}

      <ul className="home-links">
        <li>
          <Link to="/historia">História</Link>
        </li>
        <li>
          <Link to="/vysledky">Výsledky a pokrok</Link>
        </li>
        <li>
          <Link to="/chyby">Chyby</Link>
        </li>
        <li>
          <Link to="/cvicenie">Ďalšie cvičenie / skúška</Link>
        </li>
      </ul>
    </PageShell>
  );
}
