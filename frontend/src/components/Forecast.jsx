import { formatDay, formatDate, formatTemp, weatherMeta } from '../utils/weather'

export function Forecast({ weather, unit, onOpen }) {
  const daily = weather?.daily
  if (!daily) return null
  return (
    <section className="panel forecast-panel">
      <div className="panel-head"><div><h2>7-Day Forecast</h2><p>A simple look at what is coming.</p></div><button onClick={onOpen}>View Full Forecast →</button></div>
      <div className="forecast-grid">
        {daily.time.map((date, i) => {
          const meta = weatherMeta(daily.weather_code[i])
          return <div className="forecast-card" key={date}>
            <strong>{i === 0 ? 'Today' : formatDay(date)}</strong><small>{formatDate(date)}</small>
            <span className="forecast-emoji">{meta[1]}</span><b>{formatTemp(daily.temperature_2m_max[i], unit)}</b><span>{formatTemp(daily.temperature_2m_min[i], unit)}</span>
            <em>♢ {daily.precipitation_probability_max?.[i] ?? 0}%</em>
          </div>
        })}
      </div>
    </section>
  )
}

export function FullForecast({ weather, unit }) {
  const daily = weather?.daily
  return <section className="page-section"><div className="section-title"><div><h1>Forecast</h1><p>Seven days of weather for your selected location.</p></div></div><div className="forecast-list-large">{daily?.time.map((date, i) => { const meta=weatherMeta(daily.weather_code[i]); return <div className="forecast-row" key={date}><div><strong>{i===0?'Today':formatDay(date)}</strong><small>{formatDate(date)}</small></div><span>{meta[1]}</span><div><b>{formatTemp(daily.temperature_2m_max[i],unit)}</b> <small>{formatTemp(daily.temperature_2m_min[i],unit)}</small></div><div>💧 {daily.precipitation_probability_max?.[i] ?? 0}%</div></div> })}</div></section>
}
