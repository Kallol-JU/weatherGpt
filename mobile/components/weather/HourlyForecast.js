import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NeumorphicCard } from "../common/NeumorphicCard";
import { colors } from "../../theme/colors";

export function HourlyForecast({ forecast }) {
  const list = forecast?.list || [];
  const hours = list.slice(0, 7).map((item, index) => {
    const condition = item.weather?.[0]?.main || "Clouds";
    const icon = condition === "Rain" ? "🌧️" : condition === "Clouds" ? "☁️" : condition === "Clear" ? "☀️" : "🌤️";
    const time = index === 0 ? "Now" : new Date(item.dt * 1000).toLocaleTimeString([], { hour: "numeric" });
    return [time, icon, `${Math.round(item.main.temp)}°`, `${Math.round((item.pop || 0) * 100)}%`];
  });

  const displayHours = hours.length ? hours : [["Now", "🌤️", "--°", "--"]];

  return (
    <NeumorphicCard style={styles.card}>
      <Text style={styles.title}>Hourly forecast</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {displayHours.map(([time, icon, temp, rain]) => (
          <View key={time} style={styles.item}>
            <Text style={styles.time}>{time}</Text>
            <Text style={styles.icon}>{icon}</Text>
            <Text style={styles.temp}>{temp}</Text>
            <Text style={styles.rain}>{rain}</Text>
          </View>
        ))}
      </ScrollView>
    </NeumorphicCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, marginTop: 14 },
  title: { color: colors.text, fontSize: 16, fontWeight: "800", marginBottom: 10 },
  item: { width: 58, alignItems: "center", marginRight: 9 },
  time: { color: colors.muted, fontSize: 10 },
  icon: { fontSize: 24, marginVertical: 8 },
  temp: { color: colors.text, fontWeight: "800", fontSize: 13 },
  rain: { color: colors.blue, fontSize: 10, marginTop: 5 }
});
