import {
  formatDay,
  formatDate,
  formatTemp,
  weatherMeta,
} from "../utils/weather";

// 1. The small dashboard widget
export function Forecast({ weather, unit, onOpen }) {
  const daily = weather?.daily;
  if (!daily) return null;
  return (
    <section className="panel forecast-panel">
      <div className="panel-head">
        <div>
          <h2>7-Day Forecast</h2>
          <p>A simple look at what is coming.</p>
        </div>
        <button onClick={onOpen}>View Full Forecast →</button>
      </div>
      <div className="forecast-grid">
        {daily.time.map((date, i) => {
          const meta = weatherMeta(daily.weather_code[i]);
          return (
            <div className="forecast-card" key={date}>
              <strong>{i === 0 ? "Today" : formatDay(date)}</strong>
              <small>{formatDate(date)}</small>
              <span className="forecast-emoji">{meta[1]}</span>
              <b>{formatTemp(daily.temperature_2m_max[i], unit)}</b>
              <span>{formatTemp(daily.temperature_2m_min[i], unit)}</span>
              <em>♢ {daily.precipitation_probability_max?.[i] ?? 0}%</em>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// 2. The updated full-page detailed forecast
export function FullForecast({ weather, unit }) {
  const daily = weather?.daily;
  if (!daily) return null;

  return (
    <section className="page-section" style={{ width: "100%" }}>
      <div className="section-title">
        <div>
          <h1>Forecast</h1>
          <p>Seven days of detailed weather for your selected location.</p>
        </div>
      </div>

      <div
        className="forecast-list-large"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        {daily?.time.map((date, i) => {
          const meta = weatherMeta(daily.weather_code[i]);
          const rainProb = daily.precipitation_probability_max?.[i] ?? 0;
          const windSpeed = daily.wind_speed_10m_max?.[i] ?? "--";

          return (
            <div
              className="forecast-row"
              key={date}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                alignItems: "center",
                padding: "1.5rem",
                borderRadius: "12px",
                background: "var(--card-bg, rgba(255, 255, 255, 0.03))",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                gap: "1rem",
              }}
            >
              <div>
                <strong style={{ fontSize: "1.2rem", display: "block" }}>
                  {i === 0 ? "Today" : formatDay(date)}
                </strong>
                <small style={{ opacity: 0.6 }}>{formatDate(date)}</small>
              </div>

              <div style={{ fontSize: "2.5rem", textAlign: "center" }}>
                <span title={meta[0]}>{meta[1]}</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                <b style={{ fontSize: "1.2rem" }}>
                  {formatTemp(daily.temperature_2m_max[i], unit)}
                </b>
                <small style={{ opacity: 0.6 }}>
                  Low: {formatTemp(daily.temperature_2m_min[i], unit)}
                </small>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>💧 {rainProb}%</span>
                <small style={{ opacity: 0.6 }}>Rain Chance</small>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>💨 {windSpeed} km/h</span>
                <small style={{ opacity: 0.6 }}>Max Wind</small>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
