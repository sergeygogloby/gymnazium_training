import { Link, useParams } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { useSessionStore } from '../store/useSessionStore';
import type { AnswerOutcome, SessionKind } from '../types/content';

const KIND_LABEL: Record<SessionKind, string> = {
  practice: 'Cvičenie',
  exam_30: 'Skúška 30 min',
  exam_60: 'Skúška 60 min',
};

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

/** V04 Session result — practice label + score breakdown (F06/F07/F11). */
export function SessionResultPage() {
  const { attemptId } = useParams();
  const { attempts, catalog } = useSessionStore();
  const attempt = attempts.find((a) => a.id === attemptId);

  const isPractice = attempt?.sessionKind === 'practice';
  const byOutcome = {
    correct: attempt?.answers.filter((a) => a.outcome === 'correct').length ?? 0,
    incorrect:
      attempt?.answers.filter((a) => a.outcome === 'incorrect').length ?? 0,
    skipped: attempt?.answers.filter((a) => a.outcome === 'skipped').length ?? 0,
  };

  return (
    <PageShell title="Výsledok relácie" viewId="V04">
      {!attempt ? (
        <p>Relácia nenájdená.</p>
      ) : (
        <>
          <p className="result-kind-badge" data-kind={attempt.sessionKind}>
            {KIND_LABEL[attempt.sessionKind]}
            <span className="muted">
              {' '}
              · <code>{attempt.sessionKind}</code>
            </span>
          </p>

          <dl className="meta">
            <div>
              <dt>Druh</dt>
              <dd>
                <strong>{KIND_LABEL[attempt.sessionKind]}</strong>
              </dd>
            </div>
            <div>
              <dt>Skóre</dt>
              <dd>
                {attempt.scoreCorrect ?? byOutcome.correct} /{' '}
                {attempt.scoreTotal ?? attempt.answers.length}
              </dd>
            </div>
            <div>
              <dt>Trvanie</dt>
              <dd>{formatDuration(attempt.durationMs)}</dd>
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
            {attempt.module && (
              <div>
                <dt>Modul</dt>
                <dd>{attempt.module}</dd>
              </div>
            )}
          </dl>

          {isPractice && (
            <section className="result-breakdown">
              <h2>Rozpis</h2>
              <p className="muted">
                Správne {byOutcome.correct} · Nesprávne {byOutcome.incorrect} ·
                Preskočené {byOutcome.skipped}
              </p>
              {attempt.answers.length > 0 ? (
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
                            {a.skillArea === 'VSP' ? 'VŠP' : 'VJS'} ·{' '}
                            {a.sourceType}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="muted">Žiadne odpovede v tejto relácii.</p>
              )}
            </section>
          )}
        </>
      )}
      <ul className="home-links">
        <li>
          <Link to="/cvicenie">Ďalšie cvičenie</Link>
        </li>
        <li>
          <Link to="/historia">História relácií</Link>
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
