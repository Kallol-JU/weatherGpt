export const WEATHER = {
  0: ['Clear sky', '☀️'],
  1: ['Mostly clear', '🌤️'],
  2: ['Partly cloudy', '⛅'],
  3: ['Cloudy', '☁️'],
  45: ['Foggy', '🌫️'],
  48: ['Foggy', '🌫️'],
  51: ['Light drizzle', '🌦️'],
  53: ['Drizzle', '🌦️'],
  55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌧️'],
  63: ['Rain', '🌧️'],
  65: ['Heavy rain', '🌧️'],
  71: ['Light snow', '🌨️'],
  73: ['Snow', '🌨️'],
  75: ['Heavy snow', '❄️'],
  80: ['Rain showers', '🌦️'],
  81: ['Rain showers', '🌧️'],
  82: ['Heavy showers', '🌧️'],
  95: ['Thunderstorm', '⛈️'],
  96: ['Thunderstorm', '⛈️'],
  99: ['Thunderstorm', '⛈️'],
}

export function weatherMeta(code) {
  return WEATHER[code] || ['Weather conditions', '🌤️']
}

export function formatTemp(value, unit = 'C') {
  if (value == null || Number.isNaN(Number(value))) return '--'
  const converted = unit === 'F' ? (Number(value) * 9) / 5 + 32 : Number(value)
  return `${Math.round(converted)}°${unit}`
}

export function formatDay(date) {
  return new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(`${date}T12:00:00`))
}

export function formatTime(dateTime, timezone) {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit', timeZone: timezone || undefined }).format(new Date(dateTime))
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short' }).format(new Date(`${date}T12:00:00`))
}

export function aqiLabel(aqi) {
  if (aqi == null) return 'Good'
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Fair'
  if (aqi <= 150) return 'Unhealthy for some'
  if (aqi <= 200) return 'Unhealthy'
  return 'Very unhealthy'
}
