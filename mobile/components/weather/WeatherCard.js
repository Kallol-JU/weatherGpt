import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NeumorphicCard } from "../common/NeumorphicCard";
import { colors } from "../../theme/colors";

export function WeatherCard({ data = {}, compact = false }) {
  return (
    <NeumorphicCard style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.icon}>{data.icon || "🌤️"}</Text>
        <View>
          <Text style={styles.temp}>{data.temperature ?? 29}°</Text>
          <Text style={styles.condition}>{data.condition || "Partly Cloudy"}</Text>
        </View>
      </View>
      <View style={styles.stats}>
        <Text style={styles.stat}>💧 {data.rain ?? 20}% rain</Text>
        <Text style={styles.stat}>💨 {data.wind ?? 12} km/h</Text>
        {!compact ? <Text style={styles.stat}>🌡️ Feels {data.feelsLike ?? 32}°</Text> : null}
      </View>
    </NeumorphicCard>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 9, padding: 14 },
  top: { flexDirection: "row", alignItems: "center", gap: 13 },
  icon: { fontSize: 42 },
  temp: { fontSize: 29, fontWeight: "900", color: colors.text },
  condition: { color: colors.textSoft, marginTop: 1, fontSize: 12 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  stat: {
    backgroundColor: colors.surfaceBlue,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    color: colors.textSoft,
    fontSize: 11,
    fontWeight: "700"
  }
});
