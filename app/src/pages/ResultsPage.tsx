import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { buildMistakesQueue } from '../lib/mistakesQueue';
import { useSessionStore } from '../store/useSessionStore';

/**
 * V06 stub shell with Mistakes entry (F11/F16) — full progress rollups
 * belong to the Results & Progress slice; this view only exposes the
 * natural Mistakes link required by mistakes-restudy acceptance.
 */
export function ResultsPage() {
  const { attempts, catalog } = useSessionStore();
  const practice = attempts.filter((a) => a.sessionKind === 'practice');
  const exam30 = attempts.filter((a) => a.sessionKind === 'exam_30');
  const exam60 = attempts.filter((a) => a.sessionKind === 'exam_60');
  const mistakesCount = buildMistakesQueue(attempts, catalog).length;

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

      <p>
        <Link to="/historia">História relácií (V05)</Link>
      </p>
    </PageShell>
  );
}
