import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";

export function NeumorphicCard({ children, style, inset = false }) {
  return (
    <View style={[styles.card, inset ? styles.inset : null, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 5, height: 7 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 4
  },
  inset: {
    shadowColor: colors.shadowDark,
    shadowOffset: { width: -2, height: -2 },
    shadowOpacity: 0.35,
    shadowRadius: 7,
    elevation: 0
  }
});
