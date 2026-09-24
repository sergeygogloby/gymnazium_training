import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { MODULES, TOPICS, type SessionKind } from '../types/content';
import { sessionStore } from '../store/sessionStore';
import { useNavigate } from 'react-router-dom';

export function CurriculumPage() {
  const navigate = useNavigate();

  function start(kind: SessionKind) {
    sessionStore.startSession(kind);
    navigate('/relacia');
  }

  return (
    <PageShell title="Kurikulum" viewId="V02">
      <p className="lede">
        Moduly M1–M6 a témy T1–T12. Filter VŠP | VJS príde v ďalšej vlne.
        Spustite cvičenie alebo časovanú skúšku (druh relácie, nie režim).
      </p>
      <div className="session-kind-actions">
        <button type="button" onClick={() => start('practice')}>
          Začať cvičenie
        </button>
        <button type="button" onClick={() => start('exam_30')}>
          Skúška · 30 min
        </button>
        <button type="button" onClick={() => start('exam_60')}>
          Skúška · 60 min
        </button>
      </div>
      <section>
        <h2>Moduly</h2>
        <ul>
          {MODULES.map((m) => (
            <li key={m}>{m}</li>
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
