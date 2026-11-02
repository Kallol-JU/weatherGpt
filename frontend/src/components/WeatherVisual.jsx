import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudDrizzle,
} from "lucide-react";

export function WeatherVisual({ code = 0, size = 48, className = "" }) {
  // Clear sky
  if (code === 0) {
    return (
      <div className={`weather-visual visual-clear ${className}`} aria-label="Clear sky">
        <Sun size={size} className="text-amber-400 animate-spin-slow" strokeWidth={1.75} />
      </div>
    );
  }

  // Mostly clear
  if (code === 1) {
    return (
      <div className={`weather-visual visual-mostly-clear ${className}`} aria-label="Mostly clear">
        <CloudSun size={size} className="text-amber-300" strokeWidth={1.75} />
      </div>
    );
  }

  // Partly cloudy
  if (code === 2) {
    return (
      <div className={`weather-visual visual-partly-cloudy ${className}`} aria-label="Partly cloudy">
        <CloudSun size={size} className="text-slate-300" strokeWidth={1.75} />
      </div>
    );
  }

  // Overcast / Cloudy
  if (code === 3) {
    return (
      <div className={`weather-visual visual-cloudy ${className}`} aria-label="Cloudy">
        <Cloud size={size} className="text-slate-400" strokeWidth={1.75} />
      </div>
    );
  }

  // Fog / Mist
  if (code === 45 || code === 48) {
    return (
      <div className={`weather-visual visual-fog ${className}`} aria-label="Foggy">
        <CloudFog size={size} className="text-slate-400" strokeWidth={1.75} />
      </div>
    );
  }

  // Drizzle
  if (code >= 51 && code <= 55) {
    return (
      <div className={`weather-visual visual-drizzle ${className}`} aria-label="Drizzle">
        <CloudDrizzle size={size} className="text-cyan-400" strokeWidth={1.75} />
      </div>
    );
  }

  // Rain & Showers
  if ((code >= 61 && code <= 65) || (code >= 80 && code <= 82)) {
    return (
      <div className={`weather-visual visual-rain ${className}`} aria-label="Rain">
        <CloudRain size={size} className="text-sky-400" strokeWidth={1.75} />
      </div>
    );
  }

  // Snow
  if (code >= 71 && code <= 75) {
    return (
      <div className={`weather-visual visual-snow ${className}`} aria-label="Snow">
        <CloudSnow size={size} className="text-sky-200" strokeWidth={1.75} />
      </div>
    );
  }

  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return (
      <div className={`weather-visual visual-thunderstorm ${className}`} aria-label="Thunderstorm">
        <CloudLightning size={size} className="text-violet-400 animate-pulse" strokeWidth={1.75} />
      </div>
    );
  }

  // Fallback
  return (
    <div className={`weather-visual visual-default ${className}`} aria-label="Atmospheric">
      <CloudSun size={size} className="text-sky-300" strokeWidth={1.75} />
    </div>
  );
}

export default WeatherVisual;

