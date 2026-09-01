import { AlertSettingsForm } from "./AlertSettingsForm";

export function Alerts({ location, weather, authToken }) {
  // Retrieve token from props or localStorage fallback[cite: 1]
  const token =
    authToken ||
    localStorage.getItem("weathergpt_token") ||
    localStorage.getItem("token");

  // Extract metrics from weather data[cite: 1]
  const windSpeed = weather?.current?.wind_speed_10m ?? 0;
  const rainProb = weather?.daily?.precipitation_probability_max?.[0] ?? 0;
  const weatherCode = weather?.current?.weather_code;

  // Determine hazard conditions dynamically[cite: 1]
  const isSevereWind = windSpeed > 40;
  const isHighRain = rainProb > 70;
  const isThunderstorm = [95, 96, 99].includes(weatherCode);

  const hasActiveAlert = isSevereWind || isHighRain || isThunderstorm;

  return (
    <section
      className="page-section"
      style={{ width: "100%", maxWidth: "900px" }}
    >
      <div className="section-title">
        <div>
          <h1>Weather alerts & safety center</h1>
          <p>
            Live warnings and SMS/Push alert setup for{" "}
            {location?.name || "your location"}.
          </p>
        </div>
      </div>

      {/* Dynamic Status Banner */}
      <div
        className="alert-hero"
        style={{
          padding: "1.5rem",
          borderRadius: "12px",
          background: hasActiveAlert
            ? "rgba(239, 68, 68, 0.15)"
            : "rgba(34, 197, 94, 0.12)",
          border: `1px solid ${hasActiveAlert ? "rgba(239, 68, 68, 0.4)" : "rgba(34, 197, 94, 0.3)"}`,
          display: "flex",
          alignItems: "flex-start",
          gap: "1.2rem",
          marginBottom: "2rem",
        }}
      >
        <span style={{ fontSize: "2.2rem" }}>
          {hasActiveAlert ? "⚠️" : "🛡️"}
        </span>
        <div>
          <em
            style={{
              fontSize: "0.75rem",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontWeight: "bold",
              color: hasActiveAlert ? "#ef4444" : "#22c55e",
            }}
          >
            {hasActiveAlert ? "ACTIVE ADVISORY" : "NORMAL CONDITIONS"}
          </em>
          <h2 style={{ margin: "0.2rem 0" }}>
            {hasActiveAlert
              ? "Severe Weather Advisory in Effect"
              : "No Severe Weather Warnings"}
          </h2>
          <p style={{ margin: 0, opacity: 0.85, fontSize: "0.95rem" }}>
            {hasActiveAlert
              ? "Automated triggers active. Background checks will dispatch SMS and Push notifications if risks escalate."
              : "Current meteorological parameters for this area remain within standard safe thresholds."}
          </p>
        </div>
      </div>

      {/* Active Advisory Breakdown */}
      <div
        className="alert-list"
        style={{ display: "grid", gap: "1rem", marginBottom: "2.5rem" }}
      >
        <div style={cardStyle}>
          <div>
            <strong>⛈️ Thunderstorm & Wind Watch</strong>
            <p style={subTextStyle}>
              {isSevereWind || isThunderstorm
                ? `High winds detected (${windSpeed} km/h). Secure loose outdoor items.`
                : `Wind conditions are calm (${windSpeed} km/h).`}
            </p>
          </div>
          <span style={badgeStyle(isSevereWind || isThunderstorm)}>
            {isSevereWind || isThunderstorm ? "Advisory" : "Low Risk"}
          </span>
        </div>

        <div style={cardStyle}>
          <div>
            <strong>🌧️ Heavy Rainfall & Inundation Risk</strong>
            <p style={subTextStyle}>
              {isHighRain
                ? `Precipitation probability is elevated (${rainProb}%). Localized waterlogging possible.`
                : `Precipitation risk remains low (${rainProb}%).`}
            </p>
          </div>
          <span style={badgeStyle(isHighRain)}>
            {isHighRain ? "Warning" : "Low Risk"}
          </span>
        </div>
      </div>

      <hr
        style={{
          border: "0",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          margin: "2.5rem 0",
        }}
      />

      {/* Embedded Notification Configuration Form */}
      <div className="alert-settings-container">
        <AlertSettingsForm authToken={token} location={location} />
      </div>
    </section>
  );
}

const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1.2rem 1.5rem",
  borderRadius: "10px",
  background: "var(--card-bg, rgba(255, 255, 255, 0.03))",
  border: "1px solid rgba(255, 255, 255, 0.05)",
};

const subTextStyle = {
  margin: "0.2rem 0 0 0",
  fontSize: "0.88rem",
  opacity: 0.7,
};

const badgeStyle = (isDanger) => ({
  padding: "0.3rem 0.8rem",
  borderRadius: "20px",
  fontSize: "0.78rem",
  fontWeight: "bold",
  background: isDanger ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.15)",
  color: isDanger ? "#ef4444" : "#22c55e",
  border: `1px solid ${isDanger ? "rgba(239, 68, 68, 0.4)" : "rgba(34, 197, 94, 0.3)"}`,
});
