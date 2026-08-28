const API_URL = import.meta.env.VITE_API_URL || ''

export async function askWeatherGPT(message, location) {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not configured')
  }

  const response = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, location }),
  })

  if (!response.ok) throw new Error(`WeatherGPT API error: ${response.status}`)
  return response.json()
}

export async function getWeather(location) {
  if (!API_URL) throw new Error('VITE_API_URL is not configured')
  const response = await fetch(`${API_URL}/api/weather?location=${encodeURIComponent(location)}`)
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`)
  return response.json()
}
