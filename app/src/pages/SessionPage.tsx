import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { selectEligibleItems, sourceTypeLabel } from '../lib/catalog';
import { lookupItem } from '../lib/examSession';
import {
  formatCountdown,
  isExamKind,
  sessionKindLabel,
} from '../lib/sessionKind';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionKind } from '../types/content';

/**
 * V03 shared shell — behavior branches on sessionKind.
 * Exam: countdown + end-only scoring (this slice).
 * Practice: stub left for practice agent (after-each feedback).
 */
export function SessionPage() {
  const { activeSession } = useSessionStore();

  if (!activeSession) {
    return (
      <PageShell title="Relácia" viewId="V03">
        <p>Žiadna aktívna relácia.</p>
        <p>
          <Link to="/cvicenie">Spustiť cvičenie alebo skúšku</Link>
        </p>
      </PageShell>
    );
  }

  if (isExamKind(activeSession.sessionKind)) {
    return <ExamSessionBody />;
  }

  return <PracticeSessionStub kind={activeSession.sessionKind} />;
}

function PracticeSessionStub({ kind }: { kind: SessionKind }) {
  const navigate = useNavigate();
  const { activeSession, catalog } = useSessionStore();
  const eligible = selectEligibleItems(catalog);

  function finish() {
    sessionStore.endSession();
    navigate(`/vysledok/${activeSession!.attemptId}`);
  }

  return (
    <PageShell title={`Relácia — ${sessionKindLabel(kind)}`} viewId="V03">
      <p className="lede">
        Shell cvičenia (<code>{kind}</code>
        {activeSession?.mistakesScoped ? ', chyby' : ''}). Spätná väzba po
        každej položke patrí practice slice — tu je iba stub. CSV: náhľad
        published položiek.
      </p>
      <dl className="meta">
        <div>
          <dt>sessionKind</dt>
          <dd>
            <code>{kind}</code>
          </dd>
        </div>
        <div>
          <dt>Spätná väzba</dt>
          <dd>Po každej položke (practice agent)</dd>
        </div>
        <div>
          <dt>Spôsobilé položky</dt>
          <dd>
            {eligible.length} (z {catalog.length} v katalógu; skryté
            published=false vylúčené)
          </dd>
        </div>
      </dl>

      {eligible.length === 0 ? (
        <p className="notice">
          Žiadne published položky. <Link to="/nahrat">Nahrať CSV</Link>
        </p>
      ) : (
        <div className="table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>id</th>
                <th>tagy</th>
                <th>zdroj</th>
                <th>stem (skrátene)</th>
              </tr>
            </thead>
            <tbody>
              {eligible.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <code>{item.id}</code>
                  </td>
                  <td>
                    {item.module} · {item.topic} · {item.skillArea}
                  </td>
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
                  <td>
                    {item.stem.length > 80
                      ? `${item.stem.slice(0, 80)}…`
                      : item.stem}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="placeholder-box">
        Practice item loop + after-each answer key — owned by practice slice.
      </p>
      <div className="session-kind-actions">
        <button type="button" onClick={finish}>
          Ukončiť stub cvičenia
        </button>
        <Link to="/nahlásenie">Nahlásiť zlú položku (V09)</Link>
      </div>
    </PageShell>
  );
}

function ExamSessionBody() {
  const navigate = useNavigate();
  const { activeSession, catalog, attempts } = useSessionStore();
  const [selected, setSelected] = useState<string>('');
  const [nowMs, setNowMs] = useState(() => Date.now());

  const kind = activeSession!.sessionKind as 'exam_30' | 'exam_60';
  const endsAtMs = activeSession!.endsAt
    ? Date.parse(activeSession!.endsAt)
    : Number.POSITIVE_INFINITY;
  const remaining = endsAtMs - nowMs;
  const itemIds = activeSession!.itemIds ?? [];
  const index = activeSession!.currentIndex ?? 0;
  const currentId = itemIds[index];
  const item = currentId ? lookupItem(catalog, currentId) : undefined;
  const attempt = attempts.find((a) => a.id === activeSession!.attemptId);
  const usingDemo =
    catalog.filter((i) => i.published).length === 0 && itemIds.length > 0;

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining > 0) return;
    const attemptId = activeSession!.attemptId;
    sessionStore.endSession();
    navigate(`/vysledok/${attemptId}`, { replace: true });
  }, [remaining, activeSession, navigate]);

  function finishEarly() {
    const attemptId = activeSession!.attemptId;
    sessionStore.endSession();
    navigate(`/vysledok/${attemptId}`);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const { done } = sessionStore.recordExamResponse(selected || undefined);
    setSelected('');
    if (done) {
      finishEarly();
    }
  }

  function skip() {
    const { done } = sessionStore.recordExamResponse(undefined);
    setSelected('');
    if (done) {
      finishEarly();
    }
  }

  if (!item) {
    return (
      <PageShell title={`Relácia — ${sessionKindLabel(kind)}`} viewId="V03">
        <p>Žiadne položky na skúšku.</p>
        <button type="button" onClick={finishEarly}>
          Ukončiť
        </button>
      </PageShell>
    );
  }

  return (
    <PageShell title={`Relácia — ${sessionKindLabel(kind)}`} viewId="V03">
      <div className="exam-toolbar" role="status" aria-live="polite">
        <span className="exam-timer" data-testid="exam-countdown">
          {formatCountdown(remaining)}
        </span>
        <span className="muted">
          Otázka {Math.min(index + 1, itemIds.length)} / {itemIds.length}
          {usingDemo ? ' · demo položky' : ''}
        </span>
        <span className="source-label" data-testid="source-label">
          {item.sourceType === 'bank' ? 'bank' : 'synthetic'} · {item.skillArea}
        </span>
      </div>

      <p className="lede exam-stem">{item.stem}</p>

      <form className="exam-answer-form" onSubmit={submit}>
        {item.choices && item.choices.length > 0 ? (
          <fieldset>
            <legend className="visually-hidden">Odpoveď</legend>
            {item.choices.map((choice) => (
              <label key={choice} className="choice-row">
                <input
                  type="radio"
                  name="answer"
                  value={choice}
                  checked={selected === choice}
                  onChange={() => setSelected(choice)}
                />
                {choice}
              </label>
            ))}
          </fieldset>
        ) : (
          <label>
            Odpoveď
            <input
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              autoComplete="off"
            />
          </label>
        )}

        {/* Explicit: no answer key / rationale while clock runs */}
        <p className="muted exam-no-key" data-testid="exam-no-key">
          Správna odpoveď a hodnotenie až po ukončení skúšky.
        </p>

        <div className="session-kind-actions">
          <button type="submit" disabled={!selected}>
            Potvrdiť
          </button>
          <button type="button" className="button-secondary" onClick={skip}>
            Preskočiť
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={finishEarly}
          >
            Ukončiť skúšku
          </button>
          <Link to={`/nahlásenie?itemId=${encodeURIComponent(item.id)}`}>
            Nahlásiť (V09)
          </Link>
        </div>
      </form>

      <p className="muted">
        Zodpovedané: {attempt?.answers.length ?? 0} · sessionKind=
        <code>{kind}</code>
      </p>
    </PageShell>
  );
}
