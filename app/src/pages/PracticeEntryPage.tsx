import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { SessionKind, SkillArea } from '../types/content';

const KIND_LABEL: Record<SessionKind, string> = {
  practice: 'Cvičenie (bez časovača)',
  exam_30: 'Skúška 30 min',
  exam_60: 'Skúška 60 min',
};

/** Practice entry — starts untimed practice; exam buttons remain stubs for other slice. */
export function PracticeEntryPage() {
  const navigate = useNavigate();
  const { activeSession, catalog } = useSessionStore();
  const [skillFilter, setSkillFilter] = useState<SkillArea | 'all'>('all');

  function startPractice() {
    sessionStore.startSession('practice', {
      skillArea: skillFilter === 'all' ? undefined : skillFilter,
      limit: 5,
    });
    navigate('/relacia');
  }

  function startExamStub(kind: 'exam_30' | 'exam_60') {
    sessionStore.startSession(kind);
    navigate('/relacia');
  }

  const published = catalog.filter((c) => c.published).length;

  return (
    <PageShell title="Cvičenie / skúška" viewId="V03-entry">
      <p className="lede">
        Vyberte druh relácie. Pri cvičení uvidíte správnu odpoveď a zdôvodnenie
        po každej položke. Skúšky hodnotia až na konci (časovač — samostatná
        vlna).
      </p>
      {activeSession && (
        <p className="notice">
          Aktívna relácia:{' '}
          <strong>{KIND_LABEL[activeSession.sessionKind]}</strong> —{' '}
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
        <button type="button" onClick={startPractice}>
          {KIND_LABEL.practice}
        </button>
        <button type="button" onClick={() => startExamStub('exam_30')}>
          {KIND_LABEL.exam_30}
        </button>
        <button type="button" onClick={() => startExamStub('exam_60')}>
          {KIND_LABEL.exam_60}
        </button>
      </div>
      <p className="muted">
        Katalóg: {published} publikovaných
        {published === 0
          ? ' — pri štarte cvičenia sa doplní demo/bank sada'
          : ''}
        .
      </p>
    </PageShell>
  );
}
