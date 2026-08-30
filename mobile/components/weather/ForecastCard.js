import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NeumorphicCard } from "../common/NeumorphicCard";
import { colors } from "../../theme/colors";

export function ForecastCard({ data = [], compact = false, forecast }) {
  const apiRows = forecast?.list ? Object.entries(forecast.list.reduce((groups, item) => {
    const day = new Date(item.dt * 1000).toLocaleDateString([], { weekday: "short" });
    if (!groups[day]) groups[day] = { temps: [], rain: 0, icon: item.weather?.[0]?.main };
    groups[day].temps.push(item.main.temp);
    groups[day].rain = Math.max(groups[day].rain, Math.round((item.pop || 0) * 100));
    return groups;
  }, {})).map(([day, group], index) => ({
    day: index === 0 ? "Today" : day,
    icon: group.icon === "Rain" ? "🌧️" : group.icon === "Clouds" ? "☁️" : group.icon === "Clear" ? "☀️" : "🌤️",
    high: Math.round(Math.max(...group.temps)),
    low: Math.round(Math.min(...group.temps)),
    rain: group.rain
  })) : [];

  const rows = data.length ? data : apiRows.length ? apiRows : [
    { day: "Today", icon: "🌤️", high: 29, low: 23, rain: 20 },
    { day: "Tomorrow", icon: "🌧️", high: 27, low: 22, rain: 70 },
    { day: "Wed", icon: "🌦️", high: 28, low: 22, rain: 60 },
    { day: "Thu", icon: "☀️", high: 30, low: 23, rain: 20 },
    { day: "Fri", icon: "☀️", high: 31, low: 24, rain: 10 }
  ];

  return (
    <NeumorphicCard style={styles.card}>
      {rows.slice(0, compact ? 3 : 5).map((item) => (
        <View key={item.day} style={styles.row}>
          <Text style={styles.day}>{item.day}</Text>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.temp}>{item.high}° / {item.low}°</Text>
          <Text style={styles.rain}>💧 {item.rain}%</Text>
        </View>
      ))}
    </NeumorphicCard>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 9, padding: 10 },
  row: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.line
  },
  day: { width: 76, color: colors.text, fontWeight: "700", fontSize: 12 },
  icon: { width: 35, fontSize: 20 },
  temp: { flex: 1, color: colors.textSoft, fontSize: 12, fontWeight: "700" },
  rain: { color: colors.blue, fontSize: 11 }
});
