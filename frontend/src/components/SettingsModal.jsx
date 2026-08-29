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
  return (
    <div className="modal-layer" onMouseDown={onClose}>
      <div className="settings-card" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-title">
          <div>
            <h2>Settings</h2>
            <p>Keep WeatherGPT comfortable and accessible.</p>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        <Setting label="Language">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {/* Values updated to match the exact string required by App.jsx state */}
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Bengali">Bengali</option>
            <option value="Tamil">Tamil</option>
            <option value="Telugu">Telugu</option>
          </select>
        </Setting>

        <Setting label="Temperature">
          <div className="small-toggle">
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
        </Setting>

        <Setting label="Dark mode">
          <button
            className={`switch ${dark ? "on" : ""}`}
            onClick={() => setDark(!dark)}
          >
            <i />
          </button>
        </Setting>

        <Setting label="Account">
          <div>
            <strong>{user?.name || "Guest"}</strong>
            <small>{user?.email || "Not signed in"}</small>
          </div>
        </Setting>

        {user && (
          <button className="logout-btn" onClick={onLogout}>
            Sign out
          </button>
        )}
      </div>
    </div>
  );
}

function Setting({ label, children }) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      {children}
    </div>
  );
}
