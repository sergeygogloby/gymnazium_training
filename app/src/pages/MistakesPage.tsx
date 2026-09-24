import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { buildMistakesQueue } from '../lib/mistakesQueue';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';
import {
  MODULES,
  TOPICS,
  type ModuleId,
  type SkillArea,
  type SourceType,
  type TopicId,
} from '../types/content';

function skillLabel(area: SkillArea): string {
  return area === 'VSP' ? 'VŠP' : 'VJS';
}

function formatMissed(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '—';
  return d.toLocaleString('sk-SK');
}

/**
 * V10 Mistakes / restudy — F16 queue from incorrect history;
 * restudy stays sessionKind=practice with after-each feedback (V03).
 */
export function MistakesPage() {
  const navigate = useNavigate();
  const { attempts, catalog } = useSessionStore();
  const [module, setModule] = useState<ModuleId | ''>('');
  const [topic, setTopic] = useState<TopicId | ''>('');
  const [skillArea, setSkillArea] = useState<SkillArea | ''>('');
  const [sourceType, setSourceType] = useState<SourceType | ''>('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const queue = useMemo(
    () =>
      buildMistakesQueue(attempts, catalog, {
        module: module || undefined,
        topic: topic || undefined,
        skillArea: skillArea || undefined,
        sourceType: sourceType || undefined,
      }),
    [attempts, catalog, module, topic, skillArea, sourceType],
  );

  const selectedIds = queue
    .map((e) => e.itemId)
    .filter((id) => selected.has(id));

  function toggle(itemId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(queue.map((e) => e.itemId)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function startRestudy(itemIds: string[]) {
    if (itemIds.length === 0) return;
    sessionStore.ensureDemoCatalog();
    sessionStore.startSession('practice', {
      mistakesScoped: true,
      itemIds,
    });
    navigate('/relacia');
  }

  return (
    <PageShell title="Chyby — opakovanie" viewId="V10">
      <p className="lede">
        Fronta položiek zodpovedaných nesprávne pri cvičení alebo skúške.
        Opakovanie je <strong>cvičenie</strong> (untimed) so spätnou väzbou po
        každej položke — nie časovaná skúška.
      </p>

      <fieldset className="filter-fieldset">
        <legend>Filtre (F12 / F17)</legend>
        <label>
          Modul{' '}
          <select
            value={module}
            onChange={(e) => setModule(e.target.value as ModuleId | '')}
          >
            <option value="">Všetky</option>
            {MODULES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <label>
          Téma{' '}
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value as TopicId | '')}
          >
            <option value="">Všetky</option>
            {TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label>
          VŠP / VJS{' '}
          <select
            value={skillArea}
            onChange={(e) => setSkillArea(e.target.value as SkillArea | '')}
          >
            <option value="">Oboje</option>
            <option value="VSP">VŠP</option>
            <option value="VJS">VJS</option>
          </select>
        </label>
        <label>
          Zdroj{' '}
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType | '')}
          >
            <option value="">Všetky</option>
            <option value="bank">bank</option>
            <option value="synthetic">synthetic</option>
          </select>
        </label>
      </fieldset>

      {queue.length === 0 ? (
        <div className="empty-state" data-testid="mistakes-empty">
          <p>
            Zatiaľ žiadne chyby vo fronte. Dokončite cvičenie alebo skúšku s
            nesprávnou odpoveďou — položka sa tu zobrazí. Správne opakovanie ju
            z fronty odstráni.
          </p>
          <ul className="home-links">
            <li>
              <Link to="/kurikulum">Kurikulum</Link>
            </li>
            <li>
              <Link to="/cvicenie">Cvičenie</Link>
            </li>
            <li>
              <Link to="/vysledky">Výsledky a pokrok</Link>
            </li>
          </ul>
        </div>
      ) : (
        <>
          <p className="muted" data-testid="mistakes-count">
            Aktívnych položiek: <strong>{queue.length}</strong>
            {selectedIds.length > 0
              ? ` · vybraných: ${selectedIds.length}`
              : ''}
          </p>

          <div className="session-kind-actions">
            <button
              type="button"
              onClick={() => startRestudy(queue.map((e) => e.itemId))}
              data-testid="mistakes-start-all"
            >
              Opakovať celú frontu
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={selectedIds.length === 0}
              onClick={() => startRestudy(selectedIds)}
              data-testid="mistakes-start-selected"
            >
              Opakovať vybrané
            </button>
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={selectAllVisible}
            >
              Vybrať všetky
            </button>
            <button
              type="button"
              className="btn-secondary btn-small"
              onClick={clearSelection}
              disabled={selected.size === 0}
            >
              Zrušiť výber
            </button>
          </div>

          <ul className="mistakes-queue" data-testid="mistakes-queue">
            {queue.map((entry) => {
              const checked = selected.has(entry.itemId);
              return (
                <li key={entry.itemId} className="mistakes-queue-item">
                  <label className="mistakes-queue-row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(entry.itemId)}
                      aria-label={`Vybrať ${entry.itemId}`}
                    />
                    <span className="mistakes-queue-body">
                      <span className="mistakes-stem">{entry.stemPreview}</span>
                      <span className="item-labels">
                        <span className="tag tag-source">
                          {entry.sourceType}
                        </span>
                        <span className="tag">
                          {skillLabel(entry.skillArea)}
                        </span>
                        <span className="tag">
                          {entry.module} / {entry.topic}
                        </span>
                        <span className="tag muted-tag">
                          naposledy: {formatMissed(entry.lastMissedAt)}
                        </span>
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </PageShell>
  );
}
