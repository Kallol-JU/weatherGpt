import { Icon } from "./Icon";

const items = [
  ["chat", "⌁", "Overview"],
  ["forecast", "▦", "Forecast"],
  ["maps", "◇", "Maps"],
  ["alerts", "♧", "Alerts"],
  ["locations", "♡", "Saved Locations"],
  ["history", "◷", "History"],
  ["settings", "⚙", "Settings"],
  ["about", "ⓘ", "About"],
];

export function Sidebar({
  active,
  setActive,
  location,
  unit,
  setUnit,
  dark,
  setDark,
  isOpen, // NEW: Accepts state from App.jsx to toggle mobile view
  closeMenu, // NEW: Closes menu after clicking a link
  user, // NEW: For mobile auth
  onLogin, // NEW: For mobile auth
  onLogout, // NEW: For mobile auth
}) {
  // Auto-close the mobile menu when an item is clicked
  const handleNavigation = (id) => {
    setActive(id);
    if (closeMenu) closeMenu();
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <button className="brand" onClick={() => handleNavigation("chat")}>
        <span className="brand-weather">🌤️</span>
        <span>WeatherGPT</span>
      </button>

      <nav className="side-nav">
        {items.map(([id, icon, label]) => (
          <button
            key={id}
            className={`side-item ${active === id ? "active" : ""}`}
            onClick={() => handleNavigation(id)}
          >
            <Icon>{icon}</Icon>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        {/* Mobile Authentication Button */}
        <div className="mobile-auth">
          {user ? (
            <button className="auth-btn-mobile" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <button className="auth-btn-mobile" onClick={onLogin}>
              Sign In / Sign Up
            </button>
          )}
        </div>

        <button
          className="side-location"
          onClick={() => handleNavigation("locations")}
        >
          <span className="location-pin">●</span>
          <span>
            <strong>{location.name}</strong>
            <small>{location.country || "India"}</small>
          </span>
          <span className="chevron">›</span>
        </button>

        <div className="unit-control">
          <button
            className={unit === "C" ? "selected" : ""}
            onClick={() => setUnit("C")}
          >
            °C
          </button>
          <button
            className={unit === "F" ? "selected" : ""}
            onClick={() => setUnit("F")}
          >
            °F
          </button>
        </div>

        <div className="theme-control">
          <span>◐</span>
          <strong>Dark Mode</strong>
          <button
            className={`switch ${dark ? "on" : ""}`}
            onClick={() => setDark(!dark)}
            aria-label="Toggle dark mode"
          >
            <i />
          </button>
        </div>
      </div>
    </aside>
  );
}
