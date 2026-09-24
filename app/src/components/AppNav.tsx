import { NavLink } from 'react-router-dom';

const primary: { to: string; label: string; end?: boolean }[] = [
  { to: '/', label: 'Domov', end: true },
  { to: '/kurikulum', label: 'Kurikulum' },
  { to: '/cvicenie', label: 'Cvičenie' },
  { to: '/chyby', label: 'Chyby' },
  { to: '/vysledky', label: 'Výsledky a pokrok' },
];


const secondary = [
  { to: '/historia', label: 'História' },
  { to: '/nahrat', label: 'Nahrať CSV' },
  { to: '/pomoc', label: 'Pomoc' },
] as const;

export function AppNav() {
  return (
    <header className="site-header">
      <div className="brand-block">
        <NavLink to="/" className="brand" end>
          Gymnázium tréning
        </NavLink>
        <p className="brand-tag">
          Príprava na 5-ročné bilingválne gymnázium (VŠP + VJS)
        </p>
      </div>
      <nav className="nav-primary" aria-label="Hlavná navigácia">
        {primary.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <nav className="nav-secondary" aria-label="Ďalšie">
        {secondary.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
