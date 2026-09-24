import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { useSessionStore } from '../store/useSessionStore';

export function ResultsPage() {
  const { attempts } = useSessionStore();
  const practice = attempts.filter((a) => a.sessionKind === 'practice');
  const exam30 = attempts.filter((a) => a.sessionKind === 'exam_30');
  const exam60 = attempts.filter((a) => a.sessionKind === 'exam_60');

  return (
    <PageShell title="Výsledky a pokrok" viewId="V06">
      <p className="lede">
        Cvičenie a skúšky sú oddelené — nie jeden nerozlíšený súhrn. Streak,
        medzery a návrhy — Wave 2.
      </p>
      <section>
        <h2>Cvičenie</h2>
        <p>{practice.length} relácií (stub)</p>
      </section>
      <section>
        <h2>Skúšky 30 min</h2>
        <p>{exam30.length} relácií (stub)</p>
      </section>
      <section>
        <h2>Skúšky 60 min</h2>
        <p>{exam60.length} relácií (stub)</p>
      </section>
      <p>
        <Link to="/historia">História relácií (V05)</Link>
      </p>
    </PageShell>
  );
}
