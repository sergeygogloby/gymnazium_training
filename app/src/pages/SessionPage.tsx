import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { isDemoItemId } from '../lib/demoCatalog';
import { gradeAnswer } from '../lib/selectPracticeItems';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { AnswerOutcome, SessionKind } from '../types/content';

const KIND_LABEL: Record<SessionKind, string> = {
  practice: 'Cvičenie',
  exam_30: 'Skúška 30 min',
  exam_60: 'Skúška 60 min',
};

const SOURCE_LABEL = {
  bank: 'bank',
  synthetic: 'synthetic',
} as const;

type Phase = 'answer' | 'feedback';

/**
 * V03 — practice path: untimed, item-by-item, feedback after each item.
 * Exam kinds remain shell stubs (owned by exam-session slice).
 */
export function SessionPage() {
  const navigate = useNavigate();
  const { activeSession, catalog, attempts } = useSessionStore();
  const [phase, setPhase] = useState<Phase>('answer');
  const [selected, setSelected] = useState<string>('');
  const [lastOutcome, setLastOutcome] = useState<AnswerOutcome | null>(null);

  const attempt = useMemo(
    () => attempts.find((a) => a.id === activeSession?.attemptId),
    [attempts, activeSession?.attemptId],
  );

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

  const kind = activeSession.sessionKind;

  // Exam path: leave for exam-session agent — do not implement timers here.
  if (kind !== 'practice') {
    return (
      <PageShell title={`Relácia — ${KIND_LABEL[kind]}`} viewId="V03">
        <p className="lede">
          Shell skúšky ({kind}). Časovač a hodnotenie až na konci sú v samostatnej
          vlne — tu sa implementuje len cvičenie.
        </p>
        <div className="session-kind-actions">
          <button
            type="button"
            onClick={() => {
              sessionStore.endSession();
              navigate(`/vysledok/${activeSession.attemptId}`);
            }}
          >
            Ukončiť (stub)
          </button>
          <Link to="/cvicenie">Späť</Link>
        </div>
      </PageShell>
    );
  }

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
