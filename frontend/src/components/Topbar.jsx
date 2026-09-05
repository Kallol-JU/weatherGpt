export function Topbar({
  location,
  onLocation,
  language,
  setLanguage,
  onProfile,
  mobileMenu,
  user,
  onLogin,
  onLogout,
}) {
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

      <button
        className="top-search"
        onClick={onLocation}
        title={location.name || "Search city..."}
      >
        <span className="search-icon">⌕</span>
        <span className="location-text">
          {location.name || "Search city..."}
        </span>
      </button>

      <div
        className="top-actions"
        style={{ display: "flex", alignItems: "center", gap: "8px" }}
      >
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

        {user ? (
          <button
            className="auth-btn"
            onClick={onLogout}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "20px",
              border: "1px solid var(--border-color, #ccc)",
              background: "transparent",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
              marginLeft: "4px",
            }}
          >
            Logout
          </button>
        ) : (
          <button
            className="auth-btn"
            onClick={onLogin}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "20px",
              background: "#007BFF",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
              marginLeft: "4px",
            }}
          >
            Sign In / Sign Up
          </button>
        )}
      </div>
    </header>
  );
}
