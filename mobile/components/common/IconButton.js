import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../../theme/colors";

export function IconButton({ icon, onPress, active = false, label }) {
  return (
    <TouchableOpacity
      accessible
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.button, active && styles.active]}
      activeOpacity={0.8}
    >
      <Text style={[styles.icon, active && styles.activeIcon]}>{icon}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 3, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3
  },
  active: { backgroundColor: colors.blue },
  icon: { fontSize: 19, color: colors.textSoft },
  activeIcon: { color: colors.white }
});
