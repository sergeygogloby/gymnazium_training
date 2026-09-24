import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';

export function HomePage() {
  return (
    <PageShell title="Domov" viewId="V01">
      <p className="lede">
        Spoločná LAN aplikácia na prípravu na bilingválne prijímacie skúšky —
        VŠP a VJS pre 8./9. ročník. Bez prihlásenia, bez režimov.
      </p>
      <ul className="home-links">
        <li>
          <Link to="/kurikulum">Kurikulum (M1–M6)</Link>
        </li>
        <li>
          <Link to="/cvicenie">Cvičenie / skúška</Link>
        </li>
        <li>
          <Link to="/chyby">Chyby — opakovanie</Link>
        </li>
        <li>
          <Link to="/vysledky">Výsledky a pokrok</Link>
        </li>
        <li>
          <Link to="/nahrat">Nahrať otázky (CSV, ops)</Link>
        </li>
        <li>
          <Link to="/pomoc">Pomoc</Link>
        </li>
      </ul>
    </PageShell>
  );
}
