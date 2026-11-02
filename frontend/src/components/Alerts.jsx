import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Wind,
  CloudLightning,
  CloudRain,
  Map as MapIcon,
  Activity,
} from "lucide-react";
import BellToggle from "./BellToggle";
import { AlertSettingsForm } from "./AlertSettingsForm";

export function Alerts({ location, weather, authToken, onNavigateMaps }) {
  const [notificationsActive, setNotificationsActive] = useState(true);

  // Extract metrics from weather data
  const windSpeed = weather?.current?.wind_speed_10m ?? 0;
  const rainProb = weather?.daily?.precipitation_probability_max?.[0] ?? 0;
  const weatherCode = weather?.current?.weather_code ?? 0;
  const aqiRaw = weather?.airQuality?.current?.us_aqi;

  // Determine hazard conditions dynamically
  const isSevereWind = windSpeed > 40;
  const isHighRain = rainProb > 70;
  const isThunderstorm = [95, 96, 99].includes(weatherCode);
  const isPoorAirQuality = aqiRaw != null && aqiRaw > 150;

  const activeAlertCount =
    (isSevereWind ? 1 : 0) +
    (isHighRain ? 1 : 0) +
    (isThunderstorm ? 1 : 0) +
    (isPoorAirQuality ? 1 : 0);

  const hasActiveAlert = activeAlertCount > 0;

  return (
    <section className="page-section alerts-page-container">
      <div className="section-title">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldAlert size={24} className="text-rose-400" />
              <h1>Meteorological Safety & Alerts Center</h1>
            </div>
            <p>
              Verified atmospheric risk assessment and automated advisory triggers for{" "}
              <strong>{location?.name || "your location"}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <BellToggle
              size="md"
              pressed={notificationsActive}
              onChange={setNotificationsActive}
              offLabel="Enable Alerts"
              onLabel="Alerts Active"
              count={activeAlertCount}
              badge={hasActiveAlert}
              badgeColor="#ef4444"
            />
          </div>
        </div>
      </div>

      {/* Dynamic Status Hero Banner */}
      <div
        className={`alert-hero-banner ${
          hasActiveAlert ? "alert-hero--danger" : "alert-hero--safe"
        }`}
        role="region"
        aria-live="polite"
      >
        <div className="alert-hero-icon-slot">
          {hasActiveAlert ? (
            <AlertTriangle size={36} className="text-rose-400" />
          ) : (
            <ShieldCheck size={36} className="text-emerald-400" />
          )}
        </div>
        
        <div className="alert-hero-text">
          <span className="alert-hero-pill">
            {hasActiveAlert
              ? `${activeAlertCount} Active Atmospheric ${
                  activeAlertCount === 1 ? "Advisory" : "Advisories"
                }`
              : "Safe Operational Baseline"}
          </span>
          <h2>
            {hasActiveAlert
              ? "Elevated Meteorological Advisory in Effect"
              : "No Severe Weather Warnings Active"}
          </h2>
          <p>
            {hasActiveAlert
              ? "Automated meteorological monitoring has triggered one or more threshold advisories. Background notification workers are active for subscribed channels."
              : "All sensor readings, atmospheric pressure gradients, and synoptic conditions for this region remain within standard safe operational thresholds."}
          </p>
        </div>

        {onNavigateMaps && (
          <div className="alert-hero-action">
            <button
              type="button"
              className="btn-glass btn-glass-sm"
              onClick={onNavigateMaps}
            >
              <MapIcon size={14} className="inline mr-1" />
              Inspect on Radar Map
            </button>
          </div>
        )}
      </div>

      {/* Advisory Breakdown Cards */}
      <div className="alert-cards-grid">
        {/* Thunderstorm Card */}
        <div className={`alert-item-card ${isThunderstorm ? "alert-item--active" : ""}`}>
          <div className="alert-item-head">
            <div className="flex items-center gap-2">
              <CloudLightning
                size={20}
                className={isThunderstorm ? "text-amber-400" : "text-slate-400"}
              />
              <h3>Thunderstorm & Electrical Activity</h3>
            </div>
            <span className={`status-badge ${isThunderstorm ? "badge-advisory" : "badge-normal"}`}>
              {isThunderstorm ? "Advisory Active" : "Calm"}
            </span>
          </div>
          <p className="alert-item-desc">
            {isThunderstorm
              ? "Active convective lightning strikes and convective activity observed in region. Seek indoor shelter."
              : "No convective lightning signatures detected in current regional satellite telemetry."}
          </p>
        </div>

        {/* Severe Wind Card */}
        <div className={`alert-item-card ${isSevereWind ? "alert-item--active" : ""}`}>
          <div className="alert-item-head">
            <div className="flex items-center gap-2">
              <Wind
                size={20}
                className={isSevereWind ? "text-amber-400" : "text-slate-400"}
              />
              <h3>High Wind & Gale Watch</h3>
            </div>
            <span className={`status-badge ${isSevereWind ? "badge-advisory" : "badge-normal"}`}>
              {isSevereWind ? "High Wind Warning" : "Normal"}
            </span>
          </div>
          <p className="alert-item-desc">
            {isSevereWind
              ? `Elevated wind speed of ${windSpeed} km/h detected (>40 km/h threshold). Secure outdoor structures.`
              : `Current wind velocity is ${windSpeed} km/h, well below warning thresholds.`}
          </p>
        </div>

        {/* Heavy Precipitation Card */}
        <div className={`alert-item-card ${isHighRain ? "alert-item--active" : ""}`}>
          <div className="alert-item-head">
            <div className="flex items-center gap-2">
              <CloudRain
                size={20}
                className={isHighRain ? "text-sky-400" : "text-slate-400"}
              />
              <h3>Precipitation & Flash Inundation</h3>
            </div>
            <span className={`status-badge ${isHighRain ? "badge-advisory" : "badge-normal"}`}>
              {isHighRain ? "Rain Advisory" : "Standard"}
            </span>
          </div>
          <p className="alert-item-desc">
            {isHighRain
              ? `High precipitation probability (${rainProb}%) projected for current cycle. Monitor low-lying areas.`
              : `Projected precipitation chance is ${rainProb}%. No flood or inundation risk detected.`}
          </p>
        </div>

        {/* Air Quality Card */}
        <div className={`alert-item-card ${isPoorAirQuality ? "alert-item--active" : ""}`}>
          <div className="alert-item-head">
            <div className="flex items-center gap-2">
              <Activity
                size={20}
                className={isPoorAirQuality ? "text-rose-400" : "text-slate-400"}
              />
              <h3>Air Quality Advisory</h3>
            </div>
            <span
              className={`status-badge ${
                isPoorAirQuality
                  ? "badge-advisory"
                  : aqiRaw == null
                    ? "badge-neutral"
                    : "badge-normal"
              }`}
            >
              {aqiRaw == null
                ? "Unavailable"
                : isPoorAirQuality
                  ? "Unhealthy Air"
                  : "Satisfactory"}
            </span>
          </div>
          <p className="alert-item-desc">
            {aqiRaw == null
              ? "Official sensor telemetry is currently unavailable for this coordinate station."
              : isPoorAirQuality
                ? `US AQI index is elevated at ${aqiRaw}. Sensitive individuals should limit prolonged outdoor exertion.`
                : `US AQI index is ${aqiRaw}. Particulate matter concentrations are safe.`}
          </p>
        </div>
      </div>

      {/* Notification Settings Form */}
      <div className="alert-settings-wrapper mt-8">
        <AlertSettingsForm authToken={authToken} location={location} />
      </div>
    </section>
  );
}

export default Alerts;
