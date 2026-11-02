import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Save, BellRing, Phone } from "lucide-react";
import { subscribeUserToPush } from "../utils/push";
import { getApiUrl } from "../services/api";

export function AlertSettingsForm({ authToken, location }) {
  const [phone, setPhone] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const apiUrl = getApiUrl();
  const token =
    authToken ||
    localStorage.getItem("weathergpt_token") ||
    localStorage.getItem("token");

  useEffect(() => {
    async function loadSettings() {
      if (!token) return;
      try {
        const res = await fetch(`${apiUrl}/api/user/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setPhone(data.phone || "");
          setSmsEnabled(data.alertSettings?.smsEnabled || false);
          setPushEnabled(data.alertSettings?.pushEnabled ?? true);
        }
      } catch (err) {
        console.error("Failed to load alert settings", err);
      }
    }
    loadSettings();
  }, [token, apiUrl]);

  const handleSaveAlertSettings = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage({ text: "Please sign in to save alert preferences.", type: "error" });
      return;
    }

    setIsSaving(true);
    setMessage({ text: "", type: "" });

    try {
      let pushSubscription = null;

      if (pushEnabled) {
        pushSubscription = await subscribeUserToPush();
      }

      const response = await fetch(`${apiUrl}/api/user/alert-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
          alertSettings: {
            smsEnabled,
            pushEnabled,
            thunderstorm: true,
            heavyRain: true,
          },
          pushSubscription,
          savedLocation: {
            name: location?.name || "Unknown",
            country: location?.country || "",
            latitude: location?.latitude,
            longitude: location?.longitude,
          },
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ text: "Alert preferences updated successfully.", type: "success" });
      } else {
        setMessage({
          text: result.error || "Failed to update alert settings.",
          type: "error",
        });
      }
    } catch {
      setMessage({ text: "Network error occurred while saving.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSaveAlertSettings}
      className="alert-settings-form"
      aria-labelledby="alert-settings-title"
    >
      <div className="form-head">
        <BellRing size={20} className="text-sky-400" aria-hidden="true" />
        <div>
          <h3 id="alert-settings-title">Notification Channels</h3>
          <p>Configure automated dispatch methods for this location.</p>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="alert-phone-input">
          <Phone size={14} className="inline mr-1 text-slate-400" />
          SMS Phone Number (E.164 format with country code)
        </label>
        <input
          id="alert-phone-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+919876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="checkbox-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={smsEnabled}
            onChange={(e) => setSmsEnabled(e.target.checked)}
          />
          <span>Enable critical SMS hazard notifications</span>
        </label>
      </div>

      <div className="checkbox-row">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={pushEnabled}
            onChange={(e) => setPushEnabled(e.target.checked)}
          />
          <span>Enable instant browser push alerts</span>
        </label>
      </div>

      {message.text && (
        <div
          className={`alert-status-banner ${message.type}`}
          role={message.type === "error" ? "alert" : "status"}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="form-actions mt-3">
        <button
          type="submit"
          disabled={isSaving}
          className="btn-glass btn-glass-sm btn-glass-cyan"
        >
          <Save size={14} className="inline mr-1" />
          {isSaving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </form>
  );
}

export default AlertSettingsForm;
