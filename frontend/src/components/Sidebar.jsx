import { Icon } from './Icon'

const items = [
  ['chat', '⌁', 'Overview'],
  ['forecast', '▦', 'Forecast'],
  ['maps', '◇', 'Maps'],
  ['alerts', '♧', 'Alerts'],
  ['locations', '♡', 'Saved Locations'],
  ['history', '◷', 'History'],
  ['settings', '⚙', 'Settings'],
  ['about', 'ⓘ', 'About'],
]

export function Sidebar({ active, setActive, location, unit, setUnit, dark, setDark }) {
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => setActive('chat')}>
        <span className="brand-weather">🌤️</span>
        <span>WeatherGPT</span>
      </button>

      <nav className="side-nav">
        {items.map(([id, icon, label]) => (
          <button key={id} className={`side-item ${active === id ? 'active' : ''}`} onClick={() => setActive(id)}>
            <Icon>{icon}</Icon><span>{label}</span>
            {id === 'alerts' && <b className="nav-badge">2</b>}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="side-location" onClick={() => setActive('locations')}>
          <span className="location-pin">●</span>
          <span><strong>{location.name}</strong><small>{location.country || 'India'}</small></span>
          <span className="chevron">›</span>
        </button>

        <div className="unit-control">
          <button className={unit === 'C' ? 'selected' : ''} onClick={() => setUnit('C')}>°C</button>
          <button className={unit === 'F' ? 'selected' : ''} onClick={() => setUnit('F')}>°F</button>
        </div>

        <div className="theme-control">
          <span>◐</span><strong>Dark Mode</strong>
          <button className={`switch ${dark ? 'on' : ''}`} onClick={() => setDark(!dark)} aria-label="Toggle dark mode"><i /></button>
        </div>
      </div>
    </aside>
  )
}
