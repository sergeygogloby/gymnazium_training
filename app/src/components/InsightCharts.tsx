import type { ModuleProgress, OutcomeMix, SessionScorePoint, SkillAreaProgress, InsightSummary } from '../lib/progress';
import { formatDuration, formatPct } from '../lib/progress';

function pct(n: number): number {
  return Math.round(n * 100);
}

/** Accessible SVG + HTML tables for V06 insights (no chart library). */
export function InsightSummaryCards({ summary }: { summary: InsightSummary }) {
  if (summary.empty) return null;
  const cards = [
    { label: 'Relácie', value: String(summary.sessionCount) },
    { label: 'Odpovede', value: String(summary.answerCount) },
    { label: 'Presnosť', value: formatPct(summary.accuracy) },
    { label: 'Čas', value: formatDuration(summary.durationMs) },
    { label: 'Aktívne dni', value: String(summary.activeDays) },
  ];
  return (
    <ul className="insight-kpi-grid" data-testid="insight-kpi-grid">
      {cards.map((c) => (
        <li key={c.label}>
          <span className="insight-kpi-value">{c.value}</span>
          <span className="insight-kpi-label">{c.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function ModuleAccuracyBars({ modules }: { modules: ModuleProgress[] }) {
  if (modules.length === 0) return null;
  const max = Math.max(...modules.map((m) => m.accuracy), 0.01);
  return (
    <div className="insight-bars" data-testid="module-accuracy-bars" role="img" aria-label="Presnosť podľa modulu">
      {modules.map((m) => (
        <div key={m.module} className="insight-bar-row">
          <span className="insight-bar-label">{m.module}</span>
          <div className="insight-bar-track">
            <div
              className="insight-bar-fill"
              style={{ width: `${(m.accuracy / max) * 100}%` }}
              data-accuracy={pct(m.accuracy)}
            />
          </div>
          <span className="insight-bar-pct">{formatPct(m.accuracy)}</span>
        </div>
      ))}
    </div>
  );
}

export function SessionTrendChart({ points }: { points: SessionScorePoint[] }) {
  if (points.length === 0) return null;
  const w = 320;
  const h = 120;
  const pad = 16;
  const usable = points.filter((p) => p.accuracy != null);
  if (usable.length === 0) return null;

  const xs = usable.map((_, i) =>
    usable.length === 1
      ? w / 2
      : pad + (i / (usable.length - 1)) * (w - pad * 2),
  );
  const ys = usable.map(
    (p) => h - pad - (p.accuracy as number) * (h - pad * 2),
  );
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');

  return (
    <div className="insight-trend" data-testid="session-trend-chart">
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Trend skóre relácií">
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="insight-axis" />
        <line x1={pad} y1={pad} x2={pad} y2={h - pad} className="insight-axis" />
        {/* 50% guide */}
        <line
          x1={pad}
          y1={h - pad - 0.5 * (h - pad * 2)}
          x2={w - pad}
          y2={h - pad - 0.5 * (h - pad * 2)}
          className="insight-guide"
        />
        <path d={line} className="insight-trend-line" fill="none" />
        {usable.map((p, i) => (
          <circle
            key={p.id}
            cx={xs[i]}
            cy={ys[i]}
            r={3.5}
            className={
              p.sessionKind === 'practice'
                ? 'insight-dot-practice'
                : 'insight-dot-exam'
            }
          >
            <title>
              {p.label}: {formatPct(p.accuracy as number)} ({p.sessionKind})
            </title>
          </circle>
        ))}
      </svg>
      <ol className="insight-trend-legend">
        {usable.map((p) => (
          <li key={p.id}>
            {p.label} · {formatPct(p.accuracy as number)}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function OutcomeMixBar({ mix }: { mix: OutcomeMix }) {
  if (mix.total === 0) return null;
  const c = (mix.correct / mix.total) * 100;
  const i = (mix.incorrect / mix.total) * 100;
  const s = (mix.skipped / mix.total) * 100;
  return (
    <div className="insight-outcome" data-testid="outcome-mix-bar">
      <div
        className="insight-outcome-track"
        role="img"
        aria-label={`Správne ${mix.correct}, nesprávne ${mix.incorrect}, preskočené ${mix.skipped}`}
      >
        <span className="seg-correct" style={{ width: `${c}%` }} />
        <span className="seg-incorrect" style={{ width: `${i}%` }} />
        <span className="seg-skipped" style={{ width: `${s}%` }} />
      </div>
      <ul className="insight-outcome-legend">
        <li>
          <span className="swatch swatch-correct" /> Správne {mix.correct} (
          {Math.round(c)} %)
        </li>
        <li>
          <span className="swatch swatch-incorrect" /> Nesprávne {mix.incorrect}{' '}
          ({Math.round(i)} %)
        </li>
        <li>
          <span className="swatch swatch-skipped" /> Preskočené {mix.skipped} (
          {Math.round(s)} %)
        </li>
      </ul>
    </div>
  );
}

export function SkillAreaTable({ rows }: { rows: SkillAreaProgress[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="table-wrap" data-testid="skill-area-table">
      <table className="history-table">
        <thead>
          <tr>
            <th>Oblasť</th>
            <th>Presnosť</th>
            <th>Odpovede</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.skillArea}>
              <td>{r.skillArea === 'VSP' ? 'VŠP' : 'VJS'}</td>
              <td>{formatPct(r.accuracy)}</td>
              <td>
                {r.correct}/{r.answered}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function TopicProgressTable({ modules }: { modules: ModuleProgress[] }) {
  const topics = modules.flatMap((m) => m.topics);
  if (topics.length === 0) return null;
  const sorted = [...topics].sort((a, b) => a.accuracy - b.accuracy);
  return (
    <div className="table-wrap" data-testid="topic-progress-table">
      <table className="history-table">
        <thead>
          <tr>
            <th>Modul</th>
            <th>Téma</th>
            <th>Presnosť</th>
            <th>Odpovede</th>
            <th>Relácie</th>
            <th>Čas</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr key={`${t.module}-${t.topic}`}>
              <td>{t.module}</td>
              <td>{t.topic}</td>
              <td>{formatPct(t.accuracy)}</td>
              <td>
                {t.correct}/{t.answered}
              </td>
              <td>{t.sessionCount}</td>
              <td>{formatDuration(t.durationMs)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
