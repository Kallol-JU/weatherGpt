export function Topbar({ location, onLocation, language, setLanguage, onProfile, mobileMenu }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={mobileMenu}>☰</button>
      <button className="top-search" onClick={onLocation}>
        <span>⌕</span><span>{location.name || 'Search city...'}</span>
      </button>
      <div className="top-actions">
        <button className="round-control" onClick={onLocation} title="Location">◉</button>
        <button className="language-control" onClick={() => setLanguage(language === 'EN' ? 'HI' : 'EN')}>🌐 {language}</button>
        <button className="round-control" onClick={onProfile} title="Settings">⚙</button>
      </div>
    </header>
  )
}
