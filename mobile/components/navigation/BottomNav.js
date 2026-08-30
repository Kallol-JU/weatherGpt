import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../theme/colors";

export function BottomNav({ active, onChange }) {
  const items = [
    ["home", "⌂", "Chat"],
    ["forecast", "☁", "Forecast"],
    ["alerts", "♢", "Alerts"],
    ["history", "◷", "History"],
    ["profile", "○", "Profile"]
  ];

  return (
    <View style={styles.bar}>
      {items.map(([key, icon, label]) => (
        <TouchableOpacity
          key={key}
          onPress={() => onChange(key)}
          style={styles.item}
          activeOpacity={0.8}
        >
          <View style={[styles.iconBox, active === key && styles.activeBox]}>
            <Text style={[styles.icon, active === key && styles.activeIcon]}>{icon}</Text>
          </View>
          <Text style={[styles.label, active === key && styles.activeLabel]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 76,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 5
  },
  item: { alignItems: "center", width: 64 },
  iconBox: {
    width: 38,
    height: 31,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center"
  },
  activeBox: { backgroundColor: colors.blueLight },
  icon: { fontSize: 18, color: colors.muted },
  activeIcon: { color: colors.blue },
  label: { fontSize: 10, color: colors.muted, marginTop: 3 },
  activeLabel: { color: colors.blue, fontWeight: "800" }
});
