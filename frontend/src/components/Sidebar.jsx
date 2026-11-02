import { useRef } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Map,
  ShieldAlert,
  MapPin,
  History,
  Settings,
  Info,
  CloudSun,
  LogIn,
  LogOut,
  X,
} from "lucide-react";
import ActiveHighlight from "./ActiveHighlight";

const navItems = [
  { id: "chat", label: "Overview", icon: LayoutDashboard },
  { id: "forecast", label: "7-Day Forecast", icon: CalendarDays },
  { id: "maps", label: "Interactive Radar", icon: Map },
  { id: "alerts", label: "Safety & Alerts", icon: ShieldAlert },
  { id: "locations", label: "Saved Locations", icon: MapPin },
  { id: "history", label: "Query History", icon: History },
  { id: "settings", label: "Preferences", icon: Settings },
  { id: "about", label: "About System", icon: Info },
];

export function Sidebar({
  active,
  setActive,
  isOpen,
  closeMenu,
  user,
  onLogin,
  onLogout,
}) {
  const navRef = useRef(null);
  const itemRefs = useRef({});

  const handleNavigation = (id) => {
    setActive(id);
    if (closeMenu) closeMenu();
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Sidebar navigation">
      {/* Brand Header */}
      <button
        className="brand"
        onClick={() => handleNavigation("chat")}
        aria-label="WeatherGPT Home"
      >
        <span className="brand-weather text-sky-400" aria-hidden="true">
          <CloudSun size={28} />
        </span>
        <span className="brand-title">WeatherGPT</span>
      </button>

      <button
        type="button"
        className="sidebar-close"
        onClick={closeMenu}
        aria-label="Close navigation"
      >
        <X size={18} aria-hidden="true" />
      </button>

      {/* Navigation List with Single Continuous Sliding Highlight */}
      <nav
        ref={navRef}
        className="side-nav"
        id="primary-navigation"
        aria-label="Main Navigation"
      >
        {/* The single, physically moving highlight */}
        <ActiveHighlight
          activeId={active}
          containerRef={navRef}
          itemRefs={itemRefs}
          borderRadius={16}
          accentColor="#38bdf8"
          showAccent={true}
        />

        {navItems.map(({ id, label, icon: IconComponent }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              ref={(el) => (itemRefs.current[id] = el)}
              className={`side-item ${isActive ? "active" : ""}`}
              onClick={() => handleNavigation(id)}
              aria-current={isActive ? "page" : undefined}
            >
              <IconComponent size={18} className="side-icon shrink-0" />
              <span className="side-label">{label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        {/* Mobile Authentication Button */}
        <div className="mobile-auth">
          {user ? (
            <button className="auth-btn-mobile" onClick={onLogout}>
              <LogOut size={16} className="inline mr-1" />
              Sign Out
            </button>
          ) : (
            <button className="auth-btn-mobile" onClick={onLogin}>
              <LogIn size={16} className="inline mr-1" />
              Sign In
            </button>
          )}
        </div>

      </div>
    </aside>
  );
}

export default Sidebar;
