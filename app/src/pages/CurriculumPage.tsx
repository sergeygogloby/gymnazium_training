import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { MODULES, TOPICS, type ModuleId, type SessionKind } from '../types/content';
import { sessionStore } from '../store/sessionStore';

export function CurriculumPage() {
  const navigate = useNavigate();

  function startPractice(module?: ModuleId) {
    sessionStore.startSession('practice', {
      module,
      limit: 5,
    });
    navigate('/relacia');
  }

  function startExam(kind: Extract<SessionKind, 'exam_30' | 'exam_60'>) {
    sessionStore.startSession(kind);
    navigate('/relacia');
  }

  return (
    <PageShell title="Kurikulum" viewId="V02">
      <p className="lede">
        Moduly M1–M6 a témy T1–T12. Spustite <strong>cvičenie</strong> (untimed,
        spätná väzba po každej položke) alebo časovanú skúšku (druh relácie, nie
        režim).
      </p>
      <div className="session-kind-actions">
        <button type="button" onClick={() => startPractice()}>
          Začať cvičenie
        </button>
        <button type="button" onClick={() => startExam('exam_30')}>
          Skúška · 30 min
        </button>
        <button type="button" onClick={() => startExam('exam_60')}>
          Skúška · 60 min
        </button>
      </div>
      <section>
        <h2>Moduly</h2>
        <ul className="module-start-list">
          {MODULES.map((m) => (
            <li key={m}>
              {m}{' '}
              <button
                type="button"
                className="btn-secondary btn-small"
                onClick={() => startPractice(m)}
              >
                Cvičiť
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Témy</h2>
        <ul className="topic-grid">
          {TOPICS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
      <p>
        <Link to="/cvicenie">Prejsť na cvičenie →</Link>
      </p>
    </PageShell>
  );
}
