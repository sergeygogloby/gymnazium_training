import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { isDemoItemId } from '../lib/demoCatalog';
import { lookupItem } from '../lib/examSession';
import { gradeAnswer } from '../lib/selectPracticeItems';
import {
  formatCountdown,
  isExamKind,
  sessionKindLabel,
} from '../lib/sessionKind';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { AnswerOutcome } from '../types/content';

const SOURCE_LABEL = {
  bank: 'bank',
  synthetic: 'synthetic',
} as const;

type Phase = 'answer' | 'feedback';

/**
 * V03 shared shell — practice: after-each feedback; exam: timer + end-only keys.
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

  return <PracticeSessionBody />;
}

function PracticeSessionBody() {
  const navigate = useNavigate();
  const { activeSession, catalog, attempts } = useSessionStore();
  const [phase, setPhase] = useState<Phase>('answer');
  const [selected, setSelected] = useState<string>('');
  const [lastOutcome, setLastOutcome] = useState<AnswerOutcome | null>(null);

  const attempt = useMemo(
    () => attempts.find((a) => a.id === activeSession?.attemptId),
    [attempts, activeSession?.attemptId],
  );

  const itemIds = activeSession.itemIds ?? [];
  const index = activeSession.currentIndex ?? 0;
  const done = itemIds.length === 0 || index >= itemIds.length;
  const currentId = !done ? itemIds[index] : undefined;
  const item = currentId
    ? catalog.find((c) => c.id === currentId)
    : undefined;

  function finish() {
    sessionStore.endSession();
    navigate(`/vysledok/${activeSession!.attemptId}`);
  }

  function submitAnswer(outcomeForced?: AnswerOutcome) {
    if (!item) return;
    const outcome: AnswerOutcome =
      outcomeForced ??
      (selected.trim()
        ? gradeAnswer(item, selected)
        : 'incorrect');
    sessionStore.appendAnswer({
      itemId: item.id,
      outcome,
      givenAnswer: outcomeForced === 'skipped' ? undefined : selected || undefined,
      module: item.module,
      topic: item.topic,
      skillArea: item.skillArea,
      sourceType: item.sourceType,
    });
    setLastOutcome(outcome);
    setPhase('feedback');
  }

  function nextItem() {
    const isLast = index + 1 >= itemIds.length;
    if (isLast) {
      finish();
      return;
    }
    sessionStore.advanceItem();
    setSelected('');
    setLastOutcome(null);
    setPhase('answer');
  }

  if (done) {
    return (
      <PageShell title="Relácia — Cvičenie" viewId="V03">
        <p className="lede">
          {itemIds.length === 0
            ? 'V katalógu nie sú žiadne vhodné položky pre tento filter.'
            : 'Všetky položky v tejto relácii sú hotové.'}
        </p>
        <div className="session-kind-actions">
          <button type="button" onClick={finish}>
            Zobraziť výsledok
          </button>
        </div>
      </PageShell>
    );
  }

  if (!item) {
    return (
      <PageShell title="Relácia — Cvičenie" viewId="V03">
        <p className="notice error">
          Položka <code>{currentId}</code> chýba v katalógu.
        </p>
        <button type="button" onClick={finish}>
          Ukončiť
        </button>
      </PageShell>
    );
  }

  const skillDisplay = item.skillArea === 'VSP' ? 'VŠP' : 'VJS';
  const sourceDisplay = SOURCE_LABEL[item.sourceType];
  const correctChoice = item.choices?.find((c) =>
    c.trim().toUpperCase().startsWith(item.correctKey.toUpperCase()),
  );

  return (
    <PageShell title="Relácia — Cvičenie" viewId="V03">
      <p className="session-progress muted">
        Položka {index + 1} / {itemIds.length}
        {attempt ? ` · odpovedí: ${attempt.answers.length}` : ''}
        {activeSession.mistakesScoped ? ' · z chýb' : ''}
      </p>

      <div className="item-labels" aria-label="Značky položky">
        <span className="tag tag-source">
          {sourceDisplay}
          {isDemoItemId(item.id) ? ' · demo' : ''}
        </span>
        <span className="tag">{skillDisplay}</span>
        <span className="tag">
          {item.module} / {item.topic}
        </span>
      </div>

      <p className="item-stem">{item.stem}</p>

      {phase === 'answer' ? (
        <>
          {item.choices && item.choices.length > 0 ? (
            <ul className="choice-list">
              {item.choices.map((choice) => {
                const key = choice.trim().charAt(0).toUpperCase();
                const checked = selected === key || selected === choice;
                return (
                  <li key={choice}>
                    <label className={checked ? 'choice selected' : 'choice'}>
                      <input
                        type="radio"
                        name="answer"
                        value={key}
                        checked={selected === key}
                        onChange={() => setSelected(key)}
                      />
                      {choice}
                    </label>
                  </li>
                );
              })}
            </ul>
          ) : (
            <label className="free-answer">
              Odpoveď
              <input
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                autoComplete="off"
              />
            </label>
          )}

          <div className="session-kind-actions">
            <button
              type="button"
              onClick={() => submitAnswer()}
              disabled={!selected.trim()}
            >
              Potvrdiť odpoveď
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => submitAnswer('skipped')}
            >
              Preskočiť
            </button>
            <Link
              to={`/nahlasenie?itemId=${encodeURIComponent(item.id)}`}
            >
              Nahlásiť zlú položku
            </Link>
          </div>
        </>
      ) : (
        <div
          className={
            lastOutcome === 'correct'
              ? 'feedback feedback-ok'
              : 'feedback feedback-bad'
          }
        >
          <p className="feedback-verdict">
            {lastOutcome === 'correct'
              ? 'Správne'
              : lastOutcome === 'skipped'
                ? 'Preskočené'
                : 'Nesprávne'}
          </p>
          <p>
            <strong>Správna odpoveď:</strong> {item.correctKey}
            {correctChoice ? ` — ${correctChoice}` : ''}
          </p>
          <p>
            <strong>Zdôvodnenie:</strong> {item.rationale}
          </p>
          <div className="session-kind-actions">
            <button type="button" onClick={nextItem}>
              {index + 1 >= itemIds.length
                ? 'Dokončiť reláciu'
                : 'Ďalšia položka'}
            </button>
            <Link
              to={`/nahlasenie?itemId=${encodeURIComponent(item.id)}`}
            >
              Nahlásiť zlú položku
            </Link>
          </div>
        </div>
      )}
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
