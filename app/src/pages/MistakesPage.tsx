import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';

export function MistakesPage() {
  const navigate = useNavigate();
  const { attempts } = useSessionStore();
  const missed = attempts.flatMap((a) =>
    a.answers.filter((ans) => ans.outcome === 'incorrect'),
  );

  function startRestudy() {
    sessionStore.startSession('practice', { mistakesScoped: true });
    navigate('/relacia');
  }

  return (
    <PageShell title="Chyby — opakovanie" viewId="V10">
      <p className="lede">
        Fronta nesprávnych odpovedí. Re-attempt ostáva{' '}
        <code>sessionKind=practice</code> (nie štvrtý timed kind).
      </p>
      <p>
        Položiek vo fronte: <strong>{missed.length}</strong> (naplní sa po Wave
        2 cvičení).
      </p>
      <button type="button" onClick={startRestudy}>
        Spustiť opakovanie (stub)
      </button>
      <p>
        <Link to="/cvicenie">← Cvičenie</Link>
      </p>
    </PageShell>
  );
}
