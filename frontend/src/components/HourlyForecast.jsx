import { useMemo } from "react";
import { Droplets, Wind, Clock } from "lucide-react";
import { formatTemp } from "../utils/weather";
import { WeatherVisual } from "./WeatherVisual";
import "./HourlyForecast.css";

export function HourlyForecast({ weather, unit = "C" }) {
  const hoursList = useMemo(() => {
    const hourly = weather?.hourly;
    if (!hourly || !hourly.time || !hourly.time.length) return [];

    const now = new Date();
    const currentIsoPrefix = now.toISOString().slice(0, 13); // 'YYYY-MM-DDTHH'

    // Find starting index matching the current hour or close to it
    let startIndex = hourly.time.findIndex((t) => t.startsWith(currentIsoPrefix));
    if (startIndex === -1) {
      startIndex = 0;
    }

    // Extract next 24 hours
    const sliceEnd = Math.min(startIndex + 24, hourly.time.length);
    const result = [];

    for (let i = startIndex; i < sliceEnd; i++) {
      const timeStr = hourly.time[i];
      const dateObj = new Date(timeStr);
      const isNow = i === startIndex;

      const formattedHour = isNow
        ? "Now"
        : new Intl.DateTimeFormat("en", {
            hour: "numeric",
            hour12: true,
            timeZone: weather?.timezone || undefined,
          }).format(dateObj);

      result.push({
        time: formattedHour,
        rawTime: timeStr,
        temp: hourly.temperature_2m?.[i],
        code: hourly.weather_code?.[i] ?? 0,
        rainProb: hourly.precipitation_probability?.[i] ?? 0,
        wind: Math.round(hourly.wind_speed_10m?.[i] ?? 0),
        isNow,
      });
    }

    return result;
  }, [weather]);

  if (!hoursList.length) return null;

  return (
    <section
      className="hourly-forecast-container hourly-forecast--v2"
      aria-label="Hourly Forecast"
    >
      <div className="hourly-forecast-header">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-sky-400" aria-hidden="true" />
          <h3>24-Hour Forecast</h3>
        </div>
        <span className="text-xs text-muted">Upcoming hourly changes</span>
      </div>

      <div
        className="hourly-forecast-scroll"
        role="region"
        aria-label="Scrollable hourly forecast"
        tabIndex={0}
      >
        {hoursList.map((item, idx) => (
          <div
            key={item.rawTime || idx}
            className={`hourly-card ${item.isNow ? "hourly-card--now" : ""}`}
          >
            <span className="hourly-time">{item.time}</span>
            <div className="hourly-visual" aria-hidden="true">
              <WeatherVisual code={item.code} size={28} />
            </div>
            <strong className="hourly-temp">{formatTemp(item.temp, unit)}</strong>
            
            <div className="hourly-meta">
              <div className="hourly-meta-item" title="Precipitation Probability">
                <Droplets
                  size={12}
                  className="text-cyan-400"
                  aria-hidden="true"
                />
                <span>{item.rainProb}%</span>
              </div>
              <div className="hourly-meta-item" title="Wind Speed">
                <Wind
                  size={12}
                  className="text-slate-400"
                  aria-hidden="true"
                />
                <span>{item.wind} km/h</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default HourlyForecast;
