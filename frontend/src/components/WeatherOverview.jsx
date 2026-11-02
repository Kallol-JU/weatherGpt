import { useMemo } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  Droplets,
  Eye,
  Lightbulb,
  MapPin,
  Sparkles,
  Sun,
  Wind,
} from "lucide-react";
import BorderGlow from "./BorderGlow";
import LatticeLoader from "./LatticeLoader";
import WeatherVisual from "./WeatherVisual";
import {
  formatTemp,
  formatTime,
  weatherMeta,
  aqiCategory,
  getConditionTheme,
} from "../utils/weather";
import { buildWorkBrief } from "../utils/workBrief";
import "./WeatherOverview.css";

export function WeatherOverview({
  location,
  weather,
  unit,
  dark = true,
  user,
  onAsk,
  onOpenForecast,
}) {
  const dateString = useMemo(() => {
    return new Intl.DateTimeFormat("en", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).format(new Date());
  }, []);

  if (!weather) {
    return (
      <div className="weather-overview-loading" role="status" aria-live="polite">
        <LatticeLoader
          label="Fetching meteorological data..."
          pattern="orbit"
          grid={3}
          color="#38bdf8"
          glow={true}
          status="working"
        />
      </div>
    );
  }

  const current = weather.current || {};
  const daily = weather.daily || {};
  const code = current.weather_code ?? 0;
  const meta = weatherMeta(code);
  const theme = getConditionTheme(code);

  const aqiRaw = weather.airQuality?.current?.us_aqi;
  const aqiInfo = aqiCategory(aqiRaw);

  const high = daily.temperature_2m_max?.[0];
  const low = daily.temperature_2m_min?.[0];
  const rainChance = daily.precipitation_probability_max?.[0] ?? 0;
  const uvValue = daily.uv_index_max?.[0];
  const visibilityKm =
    current.visibility != null ? Math.round(current.visibility / 1000) : null;

  const brief = buildWorkBrief({
    user,
    current,
    daily,
    aqiRaw,
    rainChance,
    unit,
  });

  return (
    <section
      className="weather-overview-section weather-overview--v2"
      aria-label="Current weather overview"
    >
      <BorderGlow
        className={`glass-weather-container ${dark ? "" : "glass-weather-container--light"}`}
        borderRadius={24}
        edgeSensitivity={35}
        glowColor={theme.glowColor}
        colors={theme.colors}
        glowRadius={45}
        glowIntensity={1.1}
        backgroundColor={
          dark ? "rgba(10, 22, 38, 0.72)" : "rgba(255, 255, 255, 0.72)"
        }
      >
        <div className="glass-weather-inner">
          <div className="overview-head">
            <div className="overview-place">
              <span className="overview-place__icon" aria-hidden="true">
                <MapPin size={17} />
              </span>
              <div>
                <h2>
                  {location.name}
                  {location.country ? `, ${location.country}` : ""}
                </h2>
                <div className="overview-time">
                  <Calendar size={13} aria-hidden="true" />
                  <span>{dateString}</span>
                  <Clock size={13} aria-hidden="true" />
                  <span>{formatTime(new Date().toISOString(), weather.timezone)}</span>
                </div>
              </div>
            </div>

            <div
              className="overview-aqi"
              style={{
                borderColor: `${aqiInfo.color}40`,
                backgroundColor: `${aqiInfo.color}12`,
              }}
              title={aqiInfo.description}
            >
              <Activity
                size={14}
                style={{ color: aqiInfo.color }}
                aria-hidden="true"
              />
              <div>
                <span className="overview-aqi__label">Air quality</span>
                <div className="overview-aqi__reading">
                  <strong style={{ color: aqiInfo.color }}>
                    {aqiInfo.value != null ? aqiInfo.value : "N/A"}
                  </strong>
                  <span style={{ color: aqiInfo.color }}>{aqiInfo.label}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="overview-main">
            <div className="overview-condition">
              <div className="overview-visual" aria-hidden="true">
                <WeatherVisual code={code} size={88} />
              </div>

              <div className="overview-readout">
                <div className="overview-temp-line">
                  <span className="overview-temp-value">
                    {formatTemp(current.temperature_2m, unit)}
                  </span>
                  <div className="overview-bounds">
                    <span className="overview-bound overview-bound--high">
                      <ArrowUp size={13} aria-hidden="true" />
                      <span className="sr-only">High: </span>
                      <span>{formatTemp(high, unit)}</span>
                    </span>
                    <span className="overview-bound overview-bound--low">
                      <ArrowDown size={13} aria-hidden="true" />
                      <span className="sr-only">Low: </span>
                      <span>{formatTemp(low, unit)}</span>
                    </span>
                  </div>
                </div>

                <p className="overview-condition-text">{meta[0]}</p>
                <p className="overview-feels">
                  <span>Feels like {formatTemp(current.apparent_temperature, unit)}</span>
                  <span>Humidity {Math.round(current.relative_humidity_2m ?? 0)}%</span>
                </p>
              </div>
            </div>

            <div className="overview-metrics">
              <div className="overview-metric">
                <Droplets
                  size={15}
                  className="overview-metric__icon overview-metric__icon--rain"
                  aria-hidden="true"
                />
                <span className="overview-metric__label">Rain chance</span>
                <strong>{rainChance}%</strong>
              </div>

              <div className="overview-metric">
                <Wind
                  size={15}
                  className="overview-metric__icon overview-metric__icon--wind"
                  aria-hidden="true"
                />
                <span className="overview-metric__label">Wind</span>
                <strong>{Math.round(current.wind_speed_10m ?? 0)} km/h</strong>
              </div>

              <div className="overview-metric">
                <Sun
                  size={15}
                  className="overview-metric__icon overview-metric__icon--uv"
                  aria-hidden="true"
                />
                <span className="overview-metric__label">UV index</span>
                <strong>
                  {uvValue != null ? Math.round(uvValue) : "—"}
                </strong>
              </div>

              <div className="overview-metric">
                <Eye
                  size={15}
                  className="overview-metric__icon overview-metric__icon--visibility"
                  aria-hidden="true"
                />
                <span className="overview-metric__label">Visibility</span>
                <strong>{visibilityKm != null ? `${visibilityKm} km` : "—"}</strong>
              </div>
            </div>
          </div>

          <aside className="work-brief" aria-labelledby="work-brief-title">
            <Lightbulb
              size={17}
              className="work-brief__icon"
              aria-hidden="true"
            />
            <div className="work-brief__body">
              <div className="work-brief__head">
                <h3 id="work-brief-title" className="work-brief__title">
                  {brief.title}
                </h3>
                <span className="work-brief__label">{brief.label}</span>
              </div>
              <p className="work-brief__text">{brief.tip}</p>
              {brief.factors.length > 0 && (
                <ul
                  className="work-brief__factors"
                  aria-label="Weather factors in this brief"
                >
                  {brief.factors.map((factor) => (
                    <li key={factor}>{factor}</li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          <div className="overview-footer">
            <div className="overview-actions">
              <button
                type="button"
                className="overview-action"
                onClick={() => onAsk("What should I know about today's weather?")}
              >
                <Sparkles size={14} aria-hidden="true" />
                Today's Overview
              </button>

              <button
                type="button"
                className="overview-action"
                onClick={() => onAsk("Will it rain today or in the next few hours?")}
              >
                <Droplets size={14} aria-hidden="true" />
                Rain Analysis
              </button>

              {onOpenForecast && (
                <button
                  type="button"
                  className="overview-action"
                  onClick={onOpenForecast}
                >
                  <Calendar size={14} aria-hidden="true" />
                  Full 7-Day Forecast
                </button>
              )}
            </div>

            <div className="overview-status">
              <span className="overview-status__dot" aria-hidden="true" />
              <span>Live meteorological observation</span>
            </div>
          </div>
        </div>
      </BorderGlow>
    </section>
  );
}

export default WeatherOverview;
