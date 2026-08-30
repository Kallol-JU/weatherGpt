export function Topbar({
  location,
  onLocation,
  language,
  setLanguage,
  onProfile,
  mobileMenu,
}) {
  // Convert full word back to shortcode for the UI button
  const shortLang =
    {
      English: "EN",
      Hindi: "HI",
      Bengali: "BN",
      Tamil: "TA",
      Telugu: "TE",
    }[language] || "EN";

  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={mobileMenu}>
        ☰
      </button>

      <button className="top-search" onClick={onLocation}>
        <span>⌕</span>
        <span>{location.name || "Search city..."}</span>
      </button>

      <div className="top-actions">
        <button className="round-control" onClick={onLocation} title="Location">
          ◉
        </button>

        <button
          className="language-control"
          onClick={() =>
            setLanguage(language === "English" ? "Hindi" : "English")
          }
        >
          🌐 {shortLang}
        </button>

        <button className="round-control" onClick={onProfile} title="Settings">
          ⚙
        </button>
      </div>
    </header>
  );
}
