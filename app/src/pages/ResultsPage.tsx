import { Link, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  InsightSummaryCards,
  ModuleAccuracyBars,
  OutcomeMixBar,
  SessionTrendChart,
  SkillAreaTable,
  TopicProgressTable,
} from '../components/InsightCharts';
import { PageShell } from '../components/PageShell';
import { buildMistakesQueue } from '../lib/mistakesQueue';
import {
  attemptModuleLabel,
  computeEffortVsAccuracy,
  computeGaps,
  computeInsightSummary,
  computeOutcomeMix,
  computeProgress,
  computeSessionScoreTrend,
  computeSkillAreaProgress,
  computeStreak,
  computeSuggestions,
  filterAttemptsBySection,
  formatDuration,
  formatPct,
  sortAttemptsNewestFirst,
  type ProgressSection,
  type Suggestion,
} from '../lib/progress';
import { isExamKind, sessionKindLabel } from '../lib/sessionKind';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';

type SectionTab = 'practice' | 'exams';

const SECTION_TABS: { id: SectionTab; label: string }[] = [
  { id: 'practice', label: 'Cvičenie' },
  { id: 'exams', label: 'Skúšky (30 / 60)' },
];

/**
 * V06 Results & Progress — F08–F11 + F21, plus Mistakes entry (F16).
 * Practice and exam rollups stay in separate sections (locked).
 * Insights (KPIs, graphs, tables) live here — no separate Insights mode.
 */
export function ResultsPage() {
  const navigate = useNavigate();
  const { attempts, catalog } = useSessionStore();
  const [section, setSection] = useState<SectionTab>('practice');
  const [examSub, setExamSub] = useState<'exams' | 'exam_30' | 'exam_60'>(
    'exams',
  );

  const progressSection: ProgressSection =
    section === 'practice' ? 'practice' : examSub;

  const scoped = useMemo(
    () => filterAttemptsBySection(attempts, progressSection),
    [attempts, progressSection],
  );
  const practiceScoped = useMemo(
    () => filterAttemptsBySection(attempts, 'practice'),
    [attempts],
  );
  const modules = useMemo(() => computeProgress(scoped), [scoped]);
  const gaps = useMemo(
    () =>
      computeGaps(
        section === 'practice' ? practiceScoped : scoped,
        3,
      ),
    [section, practiceScoped, scoped],
  );
  const suggestions = useMemo(() => computeSuggestions(attempts), [attempts]);
  const streak = useMemo(() => computeStreak(attempts), [attempts]);
  const effort = useMemo(() => computeEffortVsAccuracy(attempts), [attempts]);
  const recent = useMemo(
    () => sortAttemptsNewestFirst(scoped).slice(0, 5),
    [scoped],
  );
  const mistakesCount = useMemo(
    () => buildMistakesQueue(attempts, catalog).length,
    [attempts, catalog],
  );
  const summary = useMemo(() => computeInsightSummary(scoped), [scoped]);
  const skillAreas = useMemo(
    () => computeSkillAreaProgress(scoped),
    [scoped],
  );
  const outcomeMix = useMemo(() => computeOutcomeMix(scoped), [scoped]);
  const trend = useMemo(
    () => computeSessionScoreTrend(scoped, 12),
    [scoped],
  );

  const anyCompleted = attempts.some((a) => a.endedAt);

  function runSuggestion(s: Suggestion) {
    if (s.action.type === 'practice') {
      sessionStore.startSession('practice', {
        module: s.action.module,
        topic: s.action.topic,
        limit: 5,
      });
      navigate('/relacia');
      return;
    }
    if (s.action.type === 'mistakes') {
      navigate('/chyby');
      return;
    }
    sessionStore.startSession(s.action.kind);
    navigate('/relacia');
  }

  return (
    <PageShell title="Výsledky a pokrok" viewId="V06">
      <p className="lede">
        Spoločný prehľad domácnosti: metriky, grafy a tabuľky z uložených
        relácií (SQLite). Cvičenie a skúšky sú vždy oddelené — nie jeden
        nerozlíšený súčet. Žiadny samostatný režim Insights.
      </p>

      <fieldset className="filter-fieldset" data-testid="progress-section-filter">
        <legend>Sekcia: Cvičenie | Skúšky</legend>
        {SECTION_TABS.map((t) => (
          <label key={t.id} className="choice">
            <input
              type="radio"
              name="progress-section"
              checked={section === t.id}
              onChange={() => setSection(t.id)}
            />
            {t.label}
          </label>
        ))}
      </fieldset>

      {section === 'exams' && (
        <fieldset className="filter-fieldset" data-testid="exam-subfilter">
          <legend>Skúšky — dĺžka</legend>
          {(
            [
              { id: 'exams' as const, label: 'Všetky skúšky' },
              { id: 'exam_30' as const, label: '30 min' },
              { id: 'exam_60' as const, label: '60 min' },
            ] as const
          ).map((t) => (
            <label key={t.id} className="choice">
              <input
                type="radio"
                name="exam-sub"
                checked={examSub === t.id}
                onChange={() => setExamSub(t.id)}
              />
              {t.label}
            </label>
          ))}
        </fieldset>
      )}

      {!anyCompleted ? (
        <p className="notice" data-testid="results-empty">
          Zatiaľ žiadne ukončené pokusy. Spustite cvičenie alebo skúšku z{' '}
          <Link to="/cvicenie">Cvičenia</Link> /{' '}
          <Link to="/kurikulum">Kurikula</Link>. Žiadny účet ani pozvánka nie sú
          potrebné.
        </p>
      ) : null}

      <section className="progress-block" data-testid="insight-summary-block">
        <h2>
          Prehľad — {section === 'practice' ? 'Cvičenie' : 'Skúšky'}
        </h2>
        {summary.empty ? (
          <p className="muted">V tejto sekcii ešte nie sú dáta na súhrn.</p>
        ) : (
          <InsightSummaryCards summary={summary} />
        )}
      </section>

      <section className="results-mistakes-cue" data-testid="results-mistakes-link">
        <h2>Chyby na opakovanie</h2>
        {mistakesCount > 0 ? (
          <p>
            Vo fronte je <strong>{mistakesCount}</strong>{' '}
            {mistakesCount === 1 ? 'položka' : 'položiek'}.{' '}
            <Link to="/chyby">Otvoriť Chyby (V10)</Link>
          </p>
        ) : (
          <p className="muted">
            Žiadne aktívne chyby. Po nesprávnej odpovedi sa tu objaví odkaz na{' '}
            <Link to="/chyby">Chyby</Link>.
          </p>
        )}
      </section>

      <section className="progress-block" data-testid="streak-block">
        <h2>Streak / kalendár</h2>
        {streak.empty ? (
          <p className="muted">Zatiaľ žiadne dni s aktivitou.</p>
        ) : (
          <>
            <p>
              Tento týždeň: <strong>{streak.daysThisWeek}</strong> dní s
              aktivitou (cvičenie alebo skúška).
            </p>
            <ol className="study-calendar" aria-label="Posledných 14 dní">
              {streak.recentDays.map((d) => (
                <li
                  key={d.date}
                  className={d.count > 0 ? 'day-active' : 'day-idle'}
                  title={`${d.date}: ${d.count}`}
                  data-count={d.count}
                >
                  <span className="visually-hidden">
                    {d.date}: {d.count}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>

      <section className="progress-block" data-testid="effort-block">
        <h2>Úsilie vs presnosť</h2>
        <p data-effort-cue={effort.cue}>{effort.label}</p>
      </section>

      <section className="progress-block" data-testid="outcome-mix-block">
        <h2>Rozloženie odpovedí</h2>
        {outcomeMix.total === 0 ? (
          <p className="muted">Žiadne odpovede v tejto sekcii.</p>
        ) : (
          <OutcomeMixBar mix={outcomeMix} />
        )}
      </section>

      <section className="progress-block" data-testid="session-trend-block">
        <h2>
          Trend skóre
          {section === 'exams' ? ' (skúšky)' : ' (cvičenie)'}
        </h2>
        {trend.length === 0 ? (
          <p className="muted">Po niekoľkých reláciách sa tu zobrazí krivka.</p>
        ) : (
          <SessionTrendChart points={trend} />
        )}
      </section>

      <section className="progress-block" data-testid="suggestions-block">
        <h2>Návrhy (1–3)</h2>
        <ul className="suggestion-list">
          {suggestions.map((s) => (
            <li key={s.id}>
              <span>{s.label}</span>{' '}
              <button
                type="button"
                className="btn-small"
                onClick={() => runSuggestion(s)}
              >
                Spustiť
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="progress-block" data-testid="gaps-block">
        <h2>
          Medzery
          {section === 'practice'
            ? ' (z cvičenia)'
            : ' (v zvolenej skúškovej sekcii)'}
        </h2>
        {gaps.length === 0 ? (
          <p className="muted">
            Zatiaľ žiadne slabé témy v tejto sekcii — po niekoľkých odpovediach
            sa tu objavia.
          </p>
        ) : (
          <ul className="gap-list">
            {gaps.map((g) => (
              <li key={`${g.module}-${g.topic}`}>
                <strong>
                  {g.module} / {g.topic}
                </strong>{' '}
                — presnosť {formatPct(g.accuracy)} ({g.correct}/{g.answered}),{' '}
                {g.sessionCount} relácií
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="progress-block" data-testid="module-progress-block">
        <h2>
          Pokrok podľa modulu —{' '}
          {section === 'practice' ? 'Cvičenie' : 'Skúšky'}
        </h2>
        {modules.length === 0 ? (
          <p className="muted">
            V tejto sekcii ešte nie sú dáta. Skúšky a cvičenie sa nemiešajú do
            jedného súčtu.
          </p>
        ) : (
          <>
            <ModuleAccuracyBars modules={modules} />
            <div className="table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Modul</th>
                    <th>Presnosť</th>
                    <th>Odpovede</th>
                    <th>Relácie</th>
                    <th>Témy</th>
                  </tr>
                </thead>
                <tbody>
                  {modules.map((m) => (
                    <tr key={m.module} data-module={m.module}>
                      <td>{m.module}</td>
                      <td>{formatPct(m.accuracy)}</td>
                      <td>
                        {m.correct}/{m.answered}
                      </td>
                      <td>{m.sessionCount}</td>
                      <td>
                        {m.topics
                          .map(
                            (t) =>
                              `${t.topic} ${formatPct(t.accuracy)}`,
                          )
                          .join(' · ') || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="progress-block" data-testid="skill-area-block">
        <h2>VŠP | VJS</h2>
        {skillAreas.length === 0 ? (
          <p className="muted">Zatiaľ bez odpovedí s označením oblasti.</p>
        ) : (
          <SkillAreaTable rows={skillAreas} />
        )}
      </section>

      <section className="progress-block" data-testid="topic-table-block">
        <h2>Tabuľka tém</h2>
        {modules.length === 0 ? (
          <p className="muted">Žiadne témy v tejto sekcii.</p>
        ) : (
          <TopicProgressTable modules={modules} />
        )}
      </section>

      <section className="progress-block" data-testid="recent-activity-block">
        <h2>Nedávna aktivita</h2>
        {recent.length === 0 ? (
          <p className="muted">Žiadna aktivita v tejto sekcii.</p>
        ) : (
          <ul className="recent-list">
            {recent.map((a) => (
              <li key={a.id} data-session-kind={a.sessionKind}>
                <Link to={`/vysledok/${a.id}`}>
                  {sessionKindLabel(a.sessionKind)}
                </Link>
                {' · '}
                {attemptModuleLabel(a)}
                {' · '}
                {a.scoreCorrect ?? 0}/{a.scoreTotal ?? 0}
                {' · '}
                {formatDuration(a.durationMs)}
                {' · '}
                {new Date(a.startedAt).toLocaleString('sk-SK')}
                {isExamKind(a.sessionKind) ? (
                  <span className="kind-pill kind-exam"> skúška</span>
                ) : (
                  <span className="kind-pill kind-practice"> cvičenie</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="muted">
        Metriky sa počítajú z <code>attempts</code> / <code>attempt_answers</code>{' '}
        v lokálnej DB. Tieto obrazovky nemenia uložené odpovede.
      </p>
      <p>
        <Link to="/historia">História relácií (V05)</Link>
        {' · '}
        <Link to="/chyby">Chyby</Link>
        {' · '}
        <Link to="/cvicenie">Cvičenie / skúška</Link>
      </p>
    </PageShell>
  );
}
