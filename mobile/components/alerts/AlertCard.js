import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NeumorphicCard } from "../common/NeumorphicCard";
import { colors } from "../../theme/colors";

export function AlertCard({ data = {} }) {
  return (
    <NeumorphicCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>⚠️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{data.title || "Heavy Rain Warning"}</Text>
          <Text style={styles.time}>{data.time || "26 May · 12 PM – 27 May · 8 PM"}</Text>
        </View>
      </View>
      <Text style={styles.body}>
        {data.message || "Heavy rainfall is expected in your area."}
      </Text>
      <Text style={styles.action}>• Avoid low-lying areas</Text>
      <Text style={styles.action}>• Monitor local authorities</Text>
    </NeumorphicCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 14, marginTop: 9, borderColor: "#F0CACA" },
  header: { flexDirection: "row", gap: 9, alignItems: "center" },
  icon: { fontSize: 24 },
  title: { color: colors.danger, fontWeight: "900", fontSize: 14 },
  time: { color: colors.muted, fontSize: 10, marginTop: 2 },
  body: { color: colors.textSoft, fontSize: 12, lineHeight: 18, marginTop: 11 },
  action: { color: colors.textSoft, fontSize: 11, marginTop: 5 }
});
