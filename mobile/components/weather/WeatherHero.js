import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NeumorphicCard } from "../common/NeumorphicCard";
import { colors } from "../../theme/colors";

export function WeatherHero({ location = "India", weather }) {
  const current = weather?.main || {};
  const condition = weather?.weather?.[0]?.description || "Loading weather...";
  const icon = weather?.weather?.[0]?.main === "Rain" ? "🌧️" : weather?.weather?.[0]?.main === "Clouds" ? "☁️" : weather?.weather?.[0]?.main === "Clear" ? "☀️" : "🌤️";
  return (
    <NeumorphicCard style={styles.card}>
      <View style={styles.location}>
        <Text style={styles.pin}>●</Text>
        <View>
          <Text style={styles.city}>{location}</Text>
          <Text style={styles.date}>{new Date().toLocaleString([], { weekday: "long", hour: "2-digit", minute: "2-digit" })}</Text>
        </View>
      </View>

      <View style={styles.main}>
        <Text style={styles.weatherIcon}>{icon}</Text>
        <View>
          <Text style={styles.temp}>{weather ? `${Math.round(current.temp)}°` : "--°"}</Text>
          <Text style={styles.condition}>{condition}</Text>
          <Text style={styles.feels}>{weather ? `Feels like ${Math.round(current.feels_like)}°C` : "Fetching current conditions..."}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        {[
          ["💧", "Humidity", weather ? `${current.humidity}%` : "--"],
          ["💨", "Wind", weather ? `${Math.round((weather.wind?.speed || 0) * 3.6)} km/h` : "--"],
          ["◉", "Pressure", weather ? `${current.pressure} hPa` : "--"],
          ["◎", "Visibility", weather?.visibility ? `${(weather.visibility / 1000).toFixed(1)} km` : "--"]
        ].map(([icon, label, value]) => (
          <View key={label} style={styles.stat}>
            <Text style={styles.statIcon}>{icon}</Text>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}
      </View>
    </NeumorphicCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18 },
  location: { flexDirection: "row", gap: 9, alignItems: "center" },
  pin: { color: colors.blue, fontSize: 17 },
  city: { color: colors.text, fontWeight: "800", fontSize: 17 },
  date: { color: colors.muted, fontSize: 11, marginTop: 2 },
  main: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingVertical: 18
  },
  weatherIcon: { fontSize: 70 },
  temp: { color: colors.text, fontSize: 54, fontWeight: "900", lineHeight: 60 },
  condition: { color: colors.textSoft, fontSize: 15, fontWeight: "700" },
  feels: { color: colors.muted, fontSize: 11, marginTop: 3 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stat: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: colors.surfaceBlue,
    borderRadius: 13,
    padding: 9
  },
  statIcon: { fontSize: 15 },
  statLabel: { color: colors.muted, fontSize: 10, marginTop: 3 },
  statValue: { color: colors.text, fontSize: 12, fontWeight: "800", marginTop: 2 }
});
