export function celsiusToFahrenheit(value) {
  return Math.round((Number(value) * 9) / 5 + 32);
}

export function weatherIcon(condition = "") {
  const text = condition.toLowerCase();
  if (text.includes("rain")) return "🌧️";
  if (text.includes("storm")) return "⛈️";
  if (text.includes("cloud")) return "☁️";
  if (text.includes("clear")) return "☀️";
  return "🌤️";
}
