import { Link, useParams } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { attemptBreakdown, lookupItem } from '../lib/examSession';
import { isExamKind, sessionKindLabel } from '../lib/sessionKind';
import { useSessionStore } from '../store/useSessionStore';
import type { AnswerOutcome } from '../types/content';

const OUTCOME_LABEL: Record<AnswerOutcome, string> = {
  correct: 'správne',
  incorrect: 'nesprávne',
  skipped: 'preskočené',
};

function formatDuration(ms?: number): string {
  if (ms == null) return '—';
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m} min ${s} s`;
}

/** V04 — shared result shell for practice (after-each already shown) and exam (end-only keys). */
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
        <div>
          <dt>Trvanie</dt>
          <dd>{formatDuration(attempt.durationMs)}</dd>
        </div>
        {attempt.module && (
          <div>
            <dt>Modul</dt>
            <dd>{attempt.module}</dd>
          </div>
        )}
        <div>
          <dt>Skóre</dt>
          <dd data-testid="result-score">
            {attempt.scoreCorrect ?? 0} / {attempt.scoreTotal ?? 0}
          </dd>
        </div>
      </dl>

      <section className="result-breakdown">
        <h2>Rozpis</h2>
        <p className="muted">
          Správne {breakdown.correct} · Nesprávne {breakdown.incorrect} ·
          Preskočené {breakdown.skipped}
        </p>
        {attempt.answers.length > 0 ? (
          exam ? (
            <details className="answer-review" open>
              <summary>Prehľad odpovedí (po ukončení skúšky)</summary>
              <ol>
                {attempt.answers.map((a, i) => {
                  const item = lookupItem(catalog, a.itemId);
                  return (
                    <li key={`${a.itemId}-${i}`}>
                      <strong>{OUTCOME_LABEL[a.outcome]}</strong>
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
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Položka</th>
                  <th>Výsledok</th>
                  <th>Značky</th>
                </tr>
              </thead>
              <tbody>
                {attempt.answers.map((a, i) => {
                  const stem = catalog.find((c) => c.id === a.itemId)?.stem;
                  return (
                    <tr key={`${a.itemId}-${i}`}>
                      <td>{i + 1}</td>
                      <td>
                        <code>{a.itemId}</code>
                        {stem ? (
                          <span className="muted">
                            {' '}
                            — {stem.slice(0, 48)}
                            {stem.length > 48 ? '…' : ''}
                          </span>
                        ) : null}
                      </td>
                      <td>{OUTCOME_LABEL[a.outcome]}</td>
                      <td>
                        {a.module}/{a.topic} ·{' '}
                        {a.skillArea === 'VSP' ? 'VŠP' : 'VJS'} · {a.sourceType}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        ) : (
          <p className="muted">Žiadne odpovede v tejto relácii.</p>
        )}
      </section>

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
