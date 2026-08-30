import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";

export function QuickActions({ onSelect, disabled }) {
  const actions = [
    ["🌤️", "Current weather"],
    ["📅", "5 day forecast"],
    ["⚠️", "Weather alerts"],
    ["🌾", "Farming advice"]
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {actions.map(([icon, text]) => (
        <TouchableOpacity
          key={text}
          disabled={disabled}
          onPress={() => onSelect(text)}
          style={[styles.chip, disabled && styles.disabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 9, paddingVertical: 4 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    height: 39,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 2
  },
  disabled: { opacity: 0.5 },
  icon: { fontSize: 14 },
  text: { color: colors.textSoft, fontSize: 12, fontWeight: "700" }
});
