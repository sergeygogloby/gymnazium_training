import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { sessionStore } from '../store/sessionStore';
import { useSessionStore } from '../store/useSessionStore';

export function HelpPage() {
  const { seenHelp } = useSessionStore();

  return (
    <PageShell title="Pomoc" viewId="V08">
      <p className="lede">
        Aplikácia je otvorená na dôveryhodnej domácej LAN — bez účtov a bez
        režimov Practice / Insights.
      </p>
      <ul>
        <li>
          <strong>Cvičenie</strong> — bez časovača; správna odpoveď a krátke
          zdôvodnenie po každej položke.
        </li>
        <li>
          <strong>Skúška 30 / 60 min</strong> — druh relácie na rovnakých
          obrazovkách; hodnotenie až na konci.
        </li>
        <li>
          <strong>Chyby</strong> — fronta na opakovanie nesprávnych odpovedí.
        </li>
        <li>
          <strong>Výsledky a pokrok</strong> — cvičenie a skúšky oddelene.
        </li>
        <li>
          <strong>Nahrať CSV (V11)</strong> — ops na dôveryhodnej domácej LAN:
          doplnenie otázok bez nasadenia kódu. <em>Bez prihlásenia</em> —
          nie je to account-zabezpečený admin na internete. Ktokoľvek na LAN
          môže nahrať; používajte opatrne. Import je all-or-nothing (chybný
          riadok → nič sa nezapíše).
        </li>
      </ul>
      <p>
        <Link to="/nahrat">Prejsť na nahrávanie CSV →</Link>
      </p>
      {!seenHelp && (
        <button type="button" onClick={() => sessionStore.setSeenHelp(true)}>
          Rozumiem
        </button>
      )}
      {seenHelp && <p className="muted">Pomoc označená ako prečítaná.</p>}
    </PageShell>
  );
}
