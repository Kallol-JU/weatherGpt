export function Maps({ location }) {
  const { name, country, latitude, longitude } = location;

  return (
    <section className="page-section">
      <div className="section-title">
        <div>
          <h1>Weather map</h1>
          <p>
            Live satellite & radar context for {name}, {country}.
          </p>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: "65vh",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          marginTop: "1rem",
        }}
      >
        <iframe
          width="100%"
          height="100%"
          src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=6&overlay=satellite&product=satellite&level=surface&lat=${latitude}&lon=${longitude}&detailLat=${latitude}&detailLon=${longitude}&marker=true`}
          frameBorder="0"
          title={`Live satellite map of ${name}`}
        />
      </div>
    </section>
  );
}
