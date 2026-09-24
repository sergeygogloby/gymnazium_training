import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { CURRICULUM_MODULES } from '../lib/curriculumMap';
import { recommendNext } from '../lib/recommendNext';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import type { ModuleId, SessionKind, SkillArea, TopicId } from '../types/content';

type ExamKind = Extract<SessionKind, 'exam_30' | 'exam_60'>;

/**
 * V02 Curriculum — browse M1–M6 / topics, VŠP|VJS filter (F17),
 * start practice or exam_30/exam_60, recommended next (light F11).
 * Reuses sessionStore.startSession (practice/exam flows on main).
 */
export function CurriculumPage() {
  const navigate = useNavigate();
  const { attempts } = useSessionStore();
  const [skillFilter, setSkillFilter] = useState<SkillArea | 'all'>('all');
  const [openModule, setOpenModule] = useState<ModuleId | null>('M1');

  const recommended = recommendNext(attempts);
  const skillArea = skillFilter === 'all' ? undefined : skillFilter;

  function startPractice(scope?: { module?: ModuleId; topic?: TopicId }) {
    sessionStore.startSession('practice', {
      module: scope?.module,
      topic: scope?.topic,
      skillArea,
      limit: 5,
    });
    navigate('/relacia');
  }

  function startExam(
    kind: ExamKind,
    scope?: { module?: ModuleId; topic?: TopicId },
  ) {
    sessionStore.startSession(kind, {
      module: scope?.module,
      topic: scope?.topic,
      skillArea,
    });
    navigate('/relacia');
  }

  function toggleModule(id: ModuleId) {
    setOpenModule((prev) => (prev === id ? null : id));
  }

  return (
    <PageShell title="Kurikulum" viewId="V02">
      <p className="lede">
        Moduly M1–M6 a témy podľa mapy VSJP8. Filter VŠP | VJS zúži položky v
        cvičení aj skúške. Spustite <strong>cvičenie</strong> (bez časovača) alebo
        skúšku 30 / 60 min — druh relácie, nie režim.
      </p>

      <section className="recommended-block" aria-labelledby="recommended-heading">
        <h2 id="recommended-heading">Odporúčané ďalej</h2>
        <p className="muted">{recommended.label}</p>
        <button
          type="button"
          onClick={() =>
            startPractice({
              module: recommended.module,
              topic: recommended.topic,
            })
          }
        >
          Začať odporúčané cvičenie
        </button>
      </section>

      <fieldset className="filter-fieldset">
        <legend>Filter VŠP | VJS (F17)</legend>
        <label className="choice">
          <input
            type="radio"
            name="curriculum-skill"
            checked={skillFilter === 'all'}
            onChange={() => setSkillFilter('all')}
          />
          Všetko
        </label>
        <label className="choice">
          <input
            type="radio"
            name="curriculum-skill"
            checked={skillFilter === 'VSP'}
            onChange={() => setSkillFilter('VSP')}
          />
          VŠP
        </label>
        <label className="choice">
          <input
            type="radio"
            name="curriculum-skill"
            checked={skillFilter === 'VJS'}
            onChange={() => setSkillFilter('VJS')}
          />
          VJS
        </label>
      </fieldset>

      <div className="session-kind-actions">
        <button type="button" onClick={() => startPractice()}>
          Cvičenie (všetky moduly)
        </button>
        <button type="button" onClick={() => startExam('exam_30')}>
          Skúška · 30 min
        </button>
        <button type="button" onClick={() => startExam('exam_60')}>
          Skúška · 60 min
        </button>
      </div>

      <section aria-labelledby="modules-heading">
        <h2 id="modules-heading">Moduly M1–M6</h2>
        <ul className="curriculum-module-list">
          {CURRICULUM_MODULES.map((mod) => {
            const open = openModule === mod.id;
            return (
              <li key={mod.id} className="curriculum-module">
                <div className="curriculum-module-head">
                  <button
                    type="button"
                    className="curriculum-module-toggle"
                    aria-expanded={open}
                    onClick={() => toggleModule(mod.id)}
                  >
                    <span className="curriculum-module-id">{mod.id}</span>
                    <span className="curriculum-module-title">{mod.title}</span>
                  </button>
                  <div className="curriculum-module-actions">
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={() => startPractice({ module: mod.id })}
                    >
                      Cvičiť
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={() => startExam('exam_30', { module: mod.id })}
                    >
                      30 min
                    </button>
                    <button
                      type="button"
                      className="btn-secondary btn-small"
                      onClick={() => startExam('exam_60', { module: mod.id })}
                    >
                      60 min
                    </button>
                  </div>
                </div>
                {open && (
                  <ul className="curriculum-topic-list">
                    {mod.topics.map((topic) => (
                      <li key={topic.id}>
                        <div className="curriculum-topic-meta">
                          <strong>{topic.id}</strong>
                          <span>{topic.title}</span>
                        </div>
                        <div className="curriculum-module-actions">
                          <button
                            type="button"
                            className="btn-secondary btn-small"
                            onClick={() =>
                              startPractice({
                                module: mod.id,
                                topic: topic.id,
                              })
                            }
                          >
                            Cvičiť tému
                          </button>
                          <button
                            type="button"
                            className="btn-secondary btn-small"
                            onClick={() =>
                              startExam('exam_30', {
                                module: mod.id,
                                topic: topic.id,
                              })
                            }
                          >
                            30 min
                          </button>
                          <button
                            type="button"
                            className="btn-secondary btn-small"
                            onClick={() =>
                              startExam('exam_60', {
                                module: mod.id,
                                topic: topic.id,
                              })
                            }
                          >
                            60 min
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <p>
        <Link to="/cvicenie">Prejsť na vstup cvičenia →</Link>
      </p>
    </PageShell>
  );
}
