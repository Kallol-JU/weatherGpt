import { Moon, Sun } from "lucide-react";
import "./ThemeToggle.css";

export function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      type="button"
      className={`theme-toggle ${dark ? "theme-toggle--night" : "theme-toggle--day"}`}
      role="switch"
      aria-checked={dark}
      aria-label="Night theme"
      title={dark ? "Switch to day theme" : "Switch to night theme"}
      onClick={onToggle}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__stars">
          <i />
          <i />
          <i />
        </span>
        <span className="theme-toggle__knob">
          <Sun
            className="theme-toggle__icon theme-toggle__icon--sun"
            size={18}
            strokeWidth={2}
          />
          <Moon
            className="theme-toggle__icon theme-toggle__icon--moon"
            size={17}
            strokeWidth={2}
          />
        </span>
      </span>
    </button>
  );
}

export default ThemeToggle;
