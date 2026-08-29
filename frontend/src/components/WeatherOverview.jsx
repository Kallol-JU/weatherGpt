import { formatTemp, formatTime, weatherMeta, aqiLabel } from '../utils/weather'

export function WeatherOverview({ location, weather, unit, onAsk }) {
  if (!weather) return <div className="loading-card">Loading weather…</div>
  const current = weather.current || {}
  const daily = weather.daily || {}
  const meta = weatherMeta(current.weather_code)
  const aqi = weather.airQuality?.current?.us_aqi
  const high = daily.temperature_2m_max?.[0]
  const low = daily.temperature_2m_min?.[0]
  const rain = daily.precipitation_probability_max?.[0] ?? 0

  return (
    <section className="weather-overview">
      <div className="weather-main">
        <div className="weather-art">{meta[1]}</div>
        <div className="weather-copy">
          <div className="place-line"><span>⌖</span><strong>{location.name}, {location.country || 'India'}</strong></div>
          <p className="date-line">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · {formatTime(new Date().toISOString(), weather.timezone)}</p>
          <div className="temperature">{formatTemp(current.temperature_2m, unit)}</div>
          <h1>{meta[0]}</h1>
          <p>Feels like {formatTemp(current.apparent_temperature, unit)}</p>
        </div>
        <div className="sun-card">
          <div><span>🌅</span><p>Sunrise</p><strong>{formatTime(daily.sunrise?.[0], weather.timezone)}</strong></div>
          <div><span>🌇</span><p>Sunset</p><strong>{formatTime(daily.sunset?.[0], weather.timezone)}</strong></div>
          <div><span>☔</span><p>Chance of Rain</p><strong>{rain}%</strong></div>
          <div><span>🍃</span><p>Air Quality</p><strong className="good">{aqiLabel(aqi)} <i /></strong></div>
        </div>
      </div>
      <div className="weather-metrics">
        <Metric icon="💧" label="Humidity" value={`${Math.round(current.relative_humidity_2m ?? 0)}%`} />
        <Metric icon="≋" label="Wind" value={`${Math.round(current.wind_speed_10m ?? 0)} km/h`} />
        <Metric icon="◷" label="Pressure" value={`${Math.round(current.pressure_msl ?? 1012)} hPa`} />
        <Metric icon="◉" label="Visibility" value={`${Math.round((current.visibility ?? 8000) / 1000)} km`} />
        <Metric icon="☀" label="UV Index" value={`${Math.round(daily.uv_index_max?.[0] ?? 0)}  High`} accent />
      </div>
      <div className="weather-quick-links">
        <button onClick={() => onAsk('What should I know about today?')}>Today overview →</button>
        <button onClick={() => onAsk('Will it rain today?')}>Rain chance →</button>
        <span>High {formatTemp(high, unit)} · Low {formatTemp(low, unit)}</span>
      </div>
    </section>
  )
}

function Metric({ icon, label, value, accent }) {
  return <div className="weather-metric"><span className={accent ? 'metric-accent' : ''}>{icon}</span><small>{label}</small><strong>{value}</strong></div>
}
