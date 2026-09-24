import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { catalogStats, selectEligibleItems } from '../lib/catalog';
import { sessionKindLabel } from '../lib/sessionKind';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { SkillArea } from '../types/content';

/** Practice entry — skill filter + exam start; CSV eligibility + demo fallbacks. */
export function PracticeEntryPage() {
  const navigate = useNavigate();
  const { activeSession, catalog } = useSessionStore();
  const [skillFilter, setSkillFilter] = useState<SkillArea | 'all'>('all');
  const stats = catalogStats(catalog);
  const eligible = selectEligibleItems(catalog);
  // All-unpublished blocks; empty catalog allows practice/exam demo seeds.
  const startBlocked = stats.total > 0 && eligible.length === 0;

  function startPractice() {
    sessionStore.startSession('practice', {
      skillArea: skillFilter === 'all' ? undefined : skillFilter,
      limit: 5,
    });
    navigate('/relacia');
  }

  function startExam(kind: 'exam_30' | 'exam_60') {
    sessionStore.startSession(kind, {
      skillArea: skillFilter === 'all' ? undefined : skillFilter,
    });
    navigate('/relacia');
  }

  return (
    <PageShell title="Cvičenie / skúška" viewId="V03-entry">
      <p className="lede">
        Vyberte druh relácie (nie režim). Pri cvičení uvidíte správnu odpoveď a
        zdôvodnenie po každej položke. Skúška 30 / 60 min: odpočet, hodnotenie
        až na konci. Katalóg z CSV (F14: len published).
      </p>
      {activeSession && (
        <p className="notice">
          Aktívna relácia:{' '}
          <strong>{sessionKindLabel(activeSession.sessionKind)}</strong> —{' '}
          <Link to="/relacia">pokračovať</Link>
        </p>
      )}

      <fieldset className="filter-fieldset">
        <legend>Filter VŠP | VJS (F17)</legend>
        <label className="choice">
          <input
            type="radio"
            name="skill"
            checked={skillFilter === 'all'}
            onChange={() => setSkillFilter('all')}
          />
          Všetko
        </label>
        <label className="choice">
          <input
            type="radio"
            name="skill"
            checked={skillFilter === 'VSP'}
            onChange={() => setSkillFilter('VSP')}
          />
          VŠP
        </label>
        <label className="choice">
          <input
            type="radio"
            name="skill"
            checked={skillFilter === 'VJS'}
            onChange={() => setSkillFilter('VJS')}
          />
          VJS
        </label>
      </fieldset>

      <div className="session-kind-actions">
        <button type="button" onClick={startPractice} disabled={startBlocked}>
          Cvičenie (bez časovača)
        </button>
        <button
          type="button"
          onClick={() => startExam('exam_30')}
          disabled={startBlocked}
        >
          Skúška · 30 min
        </button>
        <button
          type="button"
          onClick={() => startExam('exam_60')}
          disabled={startBlocked}
        >
          Skúška · 60 min
        </button>
      </div>
      <p className="muted">
        Katalóg: {stats.total} · pre relácie: {stats.eligible} · skryté
        (published=false): {stats.hidden}
        {stats.total === 0 && (
          <>
            {' '}
            — prázdny → cvičenie/skúška doplní demo ·{' '}
            <Link to="/nahrat">nahrať CSV</Link>
          </>
        )}
      </p>
      {startBlocked && (
        <p className="notice">
          Všetky položky majú <code>published=false</code> — do nových relácií
          nevstúpia. Nahrajte CSV s <code>published=true</code> alebo upravte
          príznaky.
        </p>
      )}
    </PageShell>
  );
}
