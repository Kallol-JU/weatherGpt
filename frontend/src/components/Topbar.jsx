import { Menu, Search, Settings, LogIn, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export function Topbar({
  location,
  onLocation,
  onProfile,
  mobileMenu,
  menuOpen = false,
  dark,
  onToggleTheme,
  user,
  onLogin,
  onLogout,
}) {
  return (
    <header className="topbar" aria-label="Top bar">
      <button
        type="button"
        className="mobile-menu"
        onClick={mobileMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
      >
        <Menu size={20} />
      </button>

      <button
        type="button"
        className="top-search"
        onClick={onLocation}
        title={location.name || "Search city..."}
        aria-label="Search city or location"
      >
        <Search size={16} className="search-icon text-slate-400" />
        <span className="location-text">
          {location.name ? `${location.name}, ${location.country || "India"}` : "Search city..."}
        </span>
      </button>

      <div className="top-actions">
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />

        <button
          type="button"
          className="round-control settings-control"
          onClick={onProfile}
          title="Open settings"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>

        {user ? (
          <button
            type="button"
            className="btn-glass btn-glass-sm btn-glass-danger auth-btn"
            onClick={onLogout}
          >
            <LogOut size={14} className="inline mr-1 text-rose-400" />
            Sign Out
          </button>
        ) : (
          <button
            type="button"
            className="btn-glass btn-glass-sm auth-btn"
            onClick={onLogin}
          >
            <LogIn size={14} className="inline mr-1 text-sky-400" />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}

export default Topbar;
