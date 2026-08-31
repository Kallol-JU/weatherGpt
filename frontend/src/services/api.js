const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export function getApiUrl() {
  return API_URL;
}

export function login(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(name, email, password, phone) {
  return request("/api/auth/register", {
    method: "POST",
    // Fixed: phone is now included in the payload sent to the backend
    body: JSON.stringify({ name, email, password, phone }),
  });
}

export function getHistory(token) {
  return request("/api/history", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function getWeatherInsight(city) {
  return request("/api/weather-insight", {
    method: "POST",
    body: JSON.stringify({ city }),
  });
}

export async function geocodeCity(city) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok || !data.results?.length) {
    throw new Error(`I couldn't find "${city}".`);
  }

  const result = data.results[0];
  return {
    name: result.name,
    country: result.country || "",
    admin1: result.admin1 || "",
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

export async function getForecast(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude);
  url.searchParams.set("longitude", longitude);
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,wind_speed_10m,pressure_msl,visibility",
  );
  url.searchParams.set(
    "hourly",
    "temperature_2m,precipitation_probability,weather_code,wind_speed_10m",
  );

  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,rain_sum,sunrise,sunset,uv_index_max,wind_speed_10m_max",
  );

  const response = await fetch(url);
  if (!response.ok) throw new Error("Forecast service is unavailable.");
  return response.json();
}
