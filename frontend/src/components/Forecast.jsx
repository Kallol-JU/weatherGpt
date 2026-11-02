import { CalendarDays, Droplets, Wind } from "lucide-react";
import { formatDate, weatherMeta } from "../utils/weather";
import WeatherVisual from "./WeatherVisual";
import "./Forecast.css";

function toTemp(value, unit = "C") {
  if (value == null || Number.isNaN(Number(value))) return null;
  const numeric = Number(value);
  return Math.round(unit === "F" ? (numeric * 9) / 5 + 32 : numeric);
}

function tempLabel(value) {
  return value == null ? "--" : `${value}°`;
}

function formatAmount(value) {
  if (value == null || Number.isNaN(Number(value))) return "--";
  return `${Math.round(Number(value) * 10) / 10} mm`;
}

function weekdayLabel(date, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Intl.DateTimeFormat("en", { weekday: "long" }).format(
    new Date(`${date}T12:00:00`),
  );
}

// Full-page detailed forecast presented as a single ruled table rather than
// a stack of cards, so days can be compared vertically.
export function FullForecast({ weather, unit = "C", location }) {
  const daily = weather?.daily;
  if (!daily || !daily.time) return null;

  const rows = daily.time.slice(0, 7).map((date, index) => {
    const code = daily.weather_code?.[index] ?? 0;
    return {
      date,
      index,
      code,
      meta: weatherMeta(code),
      high: toTemp(daily.temperature_2m_max?.[index], unit),
      low: toTemp(daily.temperature_2m_min?.[index], unit),
      rainProb: daily.precipitation_probability_max?.[index] ?? 0,
      rainAmount: daily.rain_sum?.[index] ?? 0,
      wind: daily.wind_speed_10m_max?.[index],
    };
  });

  return (
    <section
      className="page-section forecast-page"
      aria-labelledby="forecast-title"
    >
      <div className="section-title forecast-heading">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays size={22} className="text-sky-400" aria-hidden="true" />
            <h1 id="forecast-title">7-Day Forecast</h1>
          </div>
          <p>
            Daily conditions for {location?.name || "your area"} over the next
            seven days.
          </p>
        </div>
      </div>

      <div
        className="forecast-panel"
        role="table"
        aria-label={`Daily forecast for ${location?.name || "the next seven days"}`}
        aria-colcount={5}
        aria-rowcount={rows.length + 1}
      >
        <div className="forecast-head" role="row">
          <span role="columnheader">Day</span>
          <span role="columnheader">Conditions</span>
          <span role="columnheader">
            Temperature
            <span className="forecast-unit">{unit === "F" ? "°F" : "°C"}</span>
          </span>
          <span role="columnheader">Rain</span>
          <span role="columnheader">Wind</span>
        </div>

        {rows.map((row) => {
          return (
            <div className="forecast-row" role="row" key={row.date}>
              <div className="forecast-day" role="cell">
                <strong>{weekdayLabel(row.date, row.index)}</strong>
                <span>{formatDate(row.date)}</span>
              </div>

              <div className="forecast-cond" role="cell">
                <span className="forecast-cond__icon" aria-hidden="true">
                  <WeatherVisual code={row.code} size={30} />
                </span>
                <span>{row.meta[0]}</span>
              </div>

              <div
                className="forecast-temp"
                role="cell"
                title={`High ${tempLabel(row.high)}, low ${tempLabel(row.low)}`}
              >
                <span className="forecast-temps">
                  <span className="forecast-high">
                    <span className="sr-only">High </span>
                    {tempLabel(row.high)}
                  </span>
                  <span className="forecast-sep" aria-hidden="true">
                    /
                  </span>
                  <span className="forecast-low">
                    <span className="sr-only">Low </span>
                    {tempLabel(row.low)}
                  </span>
                </span>
              </div>

              <div className="forecast-rain" role="cell">
                <Droplets
                  size={14}
                  aria-hidden="true"
                  className="text-cyan-400"
                />
                <strong>{row.rainProb}%</strong>
                <span className="forecast-muted">
                  {formatAmount(row.rainAmount)}
                </span>
              </div>

              <div className="forecast-wind" role="cell">
                <Wind size={14} aria-hidden="true" className="text-slate-400" />
                <span>
                  {row.wind == null
                    ? "--"
                    : `${Number(row.wind).toFixed(1)} km/h`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FullForecast;
