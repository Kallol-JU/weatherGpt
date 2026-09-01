import { useState, useEffect } from "react";
import { subscribeUserToPush } from "../utils/push";
import { getApiUrl } from "../services/api";

export function AlertSettingsForm({ authToken, location }) {
  const [phone, setPhone] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

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
          setPushEnabled(data.alertSettings?.pushEnabled || true);
        }
      } catch (err) {
        console.error("Failed to load settings");
      }
    }
    loadSettings();
  }, [token, apiUrl]);

  const handleSaveAlertSettings = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("❌ Please sign in to save preferences.");
      return;
    }

    setIsSaving(true);
    setMessage("");

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
        setMessage("✅ Alert settings saved successfully!");
      } else {
        setMessage(`❌ ${result.error || "Failed to save settings."}`);
      }
    } catch (error) {
      setMessage("❌ Network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSaveAlertSettings}
      className="alert-settings-form"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "400px",
      }}
    >
      <h3>Emergency Alert Preferences</h3>

      <label
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        Phone Number (Include Country Code, e.g., +91):
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+919876543210"
          style={{ padding: "0.5rem", borderRadius: "6px" }}
        />
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="checkbox"
          checked={smsEnabled}
          onChange={(e) => setSmsEnabled(e.target.checked)}
        />
        Enable Twilio SMS Alerts
      </label>

      <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <input
          type="checkbox"
          checked={pushEnabled}
          onChange={(e) => setPushEnabled(e.target.checked)}
        />
        Enable Browser Push Notifications
      </label>

      <button
        type="submit"
        disabled={isSaving}
        style={{
          padding: "0.75rem",
          background: "#007BFF",
          color: "white",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
        }}
      >
        {isSaving ? "Saving..." : "Save Preferences"}
      </button>

      {message && (
        <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>{message}</p>
      )}
    </form>
  );
}
