import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NeumorphicCard } from "../common/NeumorphicCard";
import { colors } from "../../theme/colors";

export function AdvisoryCard({ data = {} }) {
  return (
    <NeumorphicCard style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.icon}>🌱</Text>
        <Text style={styles.title}>{data.title || "Farming Advisory"}</Text>
      </View>
      <View style={styles.good}>
        <Text style={styles.goodText}>
          ✓ {data.summary || "Conditions are suitable for outdoor farm work."}
        </Text>
      </View>
      <Text style={styles.item}>🌡️ Temperature: 25°–31°C</Text>
      <Text style={styles.item}>💧 Rainfall: 12 mm expected</Text>
      <Text style={styles.item}>💨 Wind: 18 km/h</Text>
    </NeumorphicCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, marginTop: 9 },
  titleRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  icon: { fontSize: 19 },
  title: { color: colors.text, fontSize: 14, fontWeight: "900" },
  good: {
    marginTop: 10,
    backgroundColor: colors.successLight,
    borderRadius: 12,
    padding: 10
  },
  goodText: { color: colors.success, fontSize: 11, lineHeight: 17, fontWeight: "700" },
  item: { color: colors.textSoft, fontSize: 11, marginTop: 9 }
});
