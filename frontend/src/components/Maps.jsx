import { useState, useRef } from "react";
import {
  Layers,
  CloudRain,
  Wind,
  Thermometer,
  Cloud,
  Gauge,
  ShieldAlert,
  AlertTriangle,
  Radio,
} from "lucide-react";
import ActiveHighlight from "./ActiveHighlight";

export function Maps({ location, weather, onNavigateAlerts }) {
  const { name, country, latitude, longitude } = location;
  const [activeLayer, setActiveLayer] = useState("rain");
  const layersRef = useRef(null);
  const layerRefs = useRef({});

  // Determine active alerts for this location
  const windSpeed = weather?.current?.wind_speed_10m ?? 0;
  const rainProb = weather?.daily?.precipitation_probability_max?.[0] ?? 0;
  const weatherCode = weather?.current?.weather_code ?? 0;

  const isSevereWind = windSpeed > 40;
  const isHighRain = rainProb > 70;
  const isThunderstorm = [95, 96, 99].includes(weatherCode);
  const hasActiveAlert = isSevereWind || isHighRain || isThunderstorm;

  const layers = [
    { id: "rain", label: "Radar / Rain", icon: CloudRain, overlay: "rain" },
    { id: "wind", label: "Wind Speed", icon: Wind, overlay: "wind" },
    { id: "satellite", label: "Satellite", icon: Radio, overlay: "satellite" },
    { id: "temp", label: "Temperature", icon: Thermometer, overlay: "temp" },
    { id: "clouds", label: "Cloud Cover", icon: Cloud, overlay: "clouds" },
    { id: "pressure", label: "Pressure", icon: Gauge, overlay: "pressure" },
  ];

  const currentOverlay =
    layers.find((l) => l.id === activeLayer)?.overlay || "rain";

  return (
    <section className="page-section" style={{ width: "100%" }}>
      <div className="section-title">
        <div>
          <div className="flex items-center gap-2">
            <Layers size={24} className="text-sky-400" />
            <h1>Interactive Meteorological Map</h1>
          </div>
          <p>
            Real-time radar, satellite layers, and atmospheric conditions for{" "}
            {name}, {country || "Global"}.
          </p>
        </div>
      </div>

      {/* Map-Connected Alerts Banner if active */}
      {hasActiveAlert && (
        <div className="map-alert-card" role="alert">
          <div className="flex items-start gap-3">
            <ShieldAlert size={24} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-rose-400">
                  Active Atmospheric Advisory in Area
                </strong>
                <span className="badge-advisory">Live Risk</span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                {isThunderstorm
                  ? "Convective thunderstorm activity detected on radar. Monitor precipitation and wind shifts."
                  : isSevereWind
                    ? `Elevated wind speed detected (${windSpeed} km/h). Check the wind layer below.`
                    : "High precipitation volume expected. Check radar reflection."}
              </p>
            </div>
          </div>
          {onNavigateAlerts && (
            <button
              type="button"
              className="btn-glass btn-glass-sm btn-glass-danger"
              onClick={onNavigateAlerts}
            >
              <AlertTriangle size={13} className="inline mr-1 text-rose-400" />
              Safety Center
            </button>
          )}
        </div>
      )}

      {/* Layer Selection Controls with Single Sliding Highlight */}
      <div className="map-layer-selector">
        <span className="layer-selector-title">
          <Layers size={14} className="text-slate-400" />
          Map Layers:
        </span>
        <div
          ref={layersRef}
          className="layer-buttons"
          style={{ position: "relative" }}
          role="group"
          aria-label="Map layers"
        >
          <ActiveHighlight
            activeId={activeLayer}
            containerRef={layersRef}
            itemRefs={layerRefs}
            borderRadius={10}
            showAccent={false}
            accentColor="#38bdf8"
          />
          {layers.map((layer) => {
            const IconComponent = layer.icon;
            const isSelected = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                ref={(el) => (layerRefs.current[layer.id] = el)}
                type="button"
                className={`layer-btn ${isSelected ? "layer-btn--active" : ""}`}
                aria-pressed={isSelected}
                onClick={() => setActiveLayer(layer.id)}
              >
                <IconComponent
                  size={14}
                  className="relative z-10"
                  aria-hidden="true"
                />
                <span className="relative z-10">{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Iframe Embed */}
      <div className="map-frame-wrapper">
        <iframe
          key={`${activeLayer}-${latitude}-${longitude}`}
          width="100%"
          height="100%"
          src={`https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=7&overlay=${currentOverlay}&product=${currentOverlay === "satellite" ? "satellite" : "ecmwf"}&level=surface&lat=${latitude}&lon=${longitude}&detailLat=${latitude}&detailLon=${longitude}&marker=true`}
          frameBorder="0"
          title={`Interactive ${activeLayer} weather map of ${name}`}
        />
      </div>
    </section>
  );
}

export default Maps;
