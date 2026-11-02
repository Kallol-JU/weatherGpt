import { useRef } from "react";
import { X, Globe, Thermometer, Moon, Sun, User, LogOut } from "lucide-react";
import { useDialog } from "../hooks/useDialog";

export function SettingsModal({
  onClose,
  language,
  setLanguage,
  unit,
  setUnit,
  dark,
  setDark,
  user,
  onLogout,
}) {
  const dialogRef = useRef(null);

  useDialog(true, onClose, dialogRef);

  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <div
        className="settings-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        ref={dialogRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-title">
          <div>
            <h2 id="settings-title">Application Preferences</h2>
            <p>Accessibility, measurement units, and interface controls.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <Setting
          icon={<Globe size={16} className="text-sky-400" />}
          label="Interface & AI Language"
        >
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="form-select"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिन्दी)</option>
            <option value="Bengali">Bengali (বাংলা)</option>
            <option value="Tamil">Tamil (தமிழ்)</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
          </select>
        </Setting>

        <Setting
          icon={<Thermometer size={16} className="text-amber-400" />}
          label="Temperature Unit"
        >
          <div className="small-toggle">
            <button
              type="button"
              className={unit === "C" ? "selected" : ""}
              onClick={() => setUnit("C")}
            >
              °C
            </button>
            <button
              type="button"
              className={unit === "F" ? "selected" : ""}
              onClick={() => setUnit("F")}
            >
              °F
            </button>
          </div>
        </Setting>

        <Setting
          icon={dark ? <Moon size={16} className="text-indigo-400" /> : <Sun size={16} className="text-amber-400" />}
          label="Theme Appearance"
        >
          <button
            type="button"
            className={`switch ${dark ? "on" : ""}`}
            onClick={() => setDark(!dark)}
            aria-label="Toggle dark mode"
          >
            <i />
          </button>
        </Setting>

        <Setting
          icon={<User size={16} className="text-slate-400" />}
          label="User Session"
        >
          <div>
            <strong>{user?.name || "Guest Mode"}</strong>
            <small>{user?.email || "Local session only"}</small>
          </div>
        </Setting>

        {user && (
          <div className="mt-4">
            <button
              type="button"
              className="btn-glass btn-glass-sm btn-glass-danger"
              onClick={onLogout}
            >
              <LogOut size={14} className="inline mr-1 text-rose-400" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Setting({ icon, label, children }) {
  return (
    <div className="setting-row">
      <div className="flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

export default SettingsModal;
