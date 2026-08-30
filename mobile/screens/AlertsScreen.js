import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AlertCard } from "../components/alerts/AlertCard";
import { NeumorphicCard } from "../components/common/NeumorphicCard";
import { colors } from "../theme/colors";

export function AlertsScreen() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Weather Alerts</Text>
      <Text style={styles.subtitle}>Warnings relevant to your location</Text>

      <AlertCard />

      {[
        ["⛈️", "Thunderstorm Alert", "26 May · 1 PM – 7 PM"],
        ["💨", "Strong Winds", "26 May · 10 AM – 8 PM"],
        ["🌊", "Flood Watch", "Monitor local updates"]
      ].map(([icon, title, time]) => (
        <NeumorphicCard key={title} style={styles.item}>
          <View style={styles.icon}><Text>{icon}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>{title}</Text>
            <Text style={styles.itemTime}>{time}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </NeumorphicCard>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 35 },
  title: { color: colors.text, fontSize: 27, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 3, marginBottom: 20 },
  item: { padding: 14, marginTop: 10, flexDirection: "row", alignItems: "center", gap: 11 },
  icon: {
    width: 39, height: 39, borderRadius: 13,
    backgroundColor: colors.surfaceBlue, alignItems: "center", justifyContent: "center"
  },
  itemTitle: { color: colors.text, fontSize: 13, fontWeight: "800" },
  itemTime: { color: colors.muted, fontSize: 10, marginTop: 3 },
  arrow: { color: colors.muted, fontSize: 23 }
});
