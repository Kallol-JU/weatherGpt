export const WEATHER = {
  0: ['Clear sky', 'clear'],
  1: ['Mostly clear', 'mostly-clear'],
  2: ['Partly cloudy', 'partly-cloudy'],
  3: ['Cloudy', 'cloudy'],
  45: ['Foggy', 'fog'],
  48: ['Depositing rime fog', 'fog'],
  51: ['Light drizzle', 'drizzle'],
  53: ['Moderate drizzle', 'drizzle'],
  55: ['Heavy drizzle', 'drizzle'],
  61: ['Light rain', 'rain'],
  63: ['Moderate rain', 'rain'],
  65: ['Heavy rain', 'rain'],
  71: ['Light snow', 'snow'],
  73: ['Moderate snow', 'snow'],
  75: ['Heavy snow', 'snow'],
  80: ['Light rain showers', 'rain'],
  81: ['Rain showers', 'rain'],
  82: ['Violent rain showers', 'rain'],
  95: ['Thunderstorm', 'thunderstorm'],
  96: ['Thunderstorm with slight hail', 'thunderstorm'],
  99: ['Thunderstorm with heavy hail', 'thunderstorm'],
};

export function weatherMeta(code) {
  return WEATHER[code] || ['Weather conditions', 'cloudy'];
}

export function formatTemp(value, unit = 'C') {
  if (value == null || Number.isNaN(Number(value))) return '--';
  const converted = unit === 'F' ? (Number(value) * 9) / 5 + 32 : Number(value);
  return `${Math.round(converted)}°${unit}`;
}

export function formatDay(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(`${date}T12:00:00`));
}

export function formatTime(dateTime, timezone) {
  if (!dateTime) return '--:--';
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone || undefined,
  }).format(new Date(dateTime));
}

export function formatDate(date) {
  if (!date) return '';
  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${date}T12:00:00`));
}

export function aqiCategory(aqi) {
  if (aqi == null || Number.isNaN(Number(aqi))) {
    return {
      value: null,
      label: 'Unavailable',
      severity: 'neutral',
      color: '#94a3b8',
      description: 'Sensor data currently unavailable',
    };
  }
  const val = Number(aqi);
  if (val <= 50) {
    return {
      value: val,
      label: 'Good',
      severity: 'good',
      color: '#22c55e',
      description: 'Air quality is satisfactory with little or no risk.',
    };
  }
  if (val <= 100) {
    return {
      value: val,
      label: 'Moderate',
      severity: 'moderate',
      color: '#eab308',
      description: 'Air quality is acceptable; sensitive individuals may take caution.',
    };
  }
  if (val <= 150) {
    return {
      value: val,
      label: 'Sensitive Groups',
      severity: 'unhealthy-sensitive',
      color: '#f97316',
      description: 'General public not likely affected; sensitive groups at risk.',
    };
  }
  if (val <= 200) {
    return {
      value: val,
      label: 'Unhealthy',
      severity: 'unhealthy',
      color: '#ef4444',
      description: 'Everyone may begin to experience some health effects.',
    };
  }
  if (val <= 300) {
    return {
      value: val,
      label: 'Very Unhealthy',
      severity: 'very-unhealthy',
      color: '#a855f7',
      description: 'Health alert: risk of health effects increased for everyone.',
    };
  }
  return {
    value: val,
    label: 'Hazardous',
    severity: 'hazardous',
    color: '#7e22ce',
    description: 'Health warning of emergency conditions for the entire population.',
  };
}

export function aqiLabel(aqi) {
  return aqiCategory(aqi).label;
}

export function getConditionTheme(code) {
  if (code === 0 || code === 1) {
    return {
      type: 'clear',
      label: 'Clear Sky',
      glowColor: '38 90 60',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      gradientFrom: '#f59e0b',
      gradientTo: '#38bdf8',
      colors: ['#f59e0b', '#fbbf24', '#38bdf8'],
    };
  }
  if (code === 2 || code === 3) {
    return {
      type: 'cloudy',
      label: 'Partly Cloudy',
      glowColor: '210 30 65',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      gradientFrom: '#64748b',
      gradientTo: '#38bdf8',
      colors: ['#64748b', '#94a3b8', '#38bdf8'],
    };
  }
  if (code === 45 || code === 48) {
    return {
      type: 'fog',
      label: 'Fog & Mist',
      glowColor: '200 20 60',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      gradientFrom: '#475569',
      gradientTo: '#94a3b8',
      colors: ['#475569', '#64748b', '#94a3b8'],
    };
  }
  if (
    (code >= 51 && code <= 65) ||
    (code >= 80 && code <= 82)
  ) {
    return {
      type: 'rain',
      label: 'Precipitation',
      glowColor: '205 85 55',
      backgroundColor: 'rgba(12, 25, 44, 0.75)',
      gradientFrom: '#0284c7',
      gradientTo: '#38bdf8',
      colors: ['#0284c7', '#38bdf8', '#0ea5e9'],
    };
  }
  if (code >= 71 && code <= 75) {
    return {
      type: 'snow',
      label: 'Snow Conditions',
      glowColor: '195 90 70',
      backgroundColor: 'rgba(15, 26, 45, 0.75)',
      gradientFrom: '#38bdf8',
      gradientTo: '#e0f2fe',
      colors: ['#38bdf8', '#bae6fd', '#e0f2fe'],
    };
  }
  if (code >= 95 && code <= 99) {
    return {
      type: 'thunderstorm',
      label: 'Thunderstorm',
      glowColor: '270 80 65',
      backgroundColor: 'rgba(20, 15, 35, 0.75)',
      gradientFrom: '#8b5cf6',
      gradientTo: '#ef4444',
      colors: ['#8b5cf6', '#a855f7', '#ef4444'],
    };
  }
  return {
    type: 'default',
    label: 'Atmospheric Conditions',
    glowColor: '215 40 60',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    gradientFrom: '#3b82f6',
    gradientTo: '#06b6d4',
    colors: ['#3b82f6', '#06b6d4', '#60a5fa'],
  };
}
