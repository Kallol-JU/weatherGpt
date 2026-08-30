import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";

export function SectionTitle({ title, action }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {action ? <Text style={styles.action}>{action}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  title: { fontSize: 19, fontWeight: "800", color: colors.text },
  action: { color: colors.blue, fontSize: 13, fontWeight: "700" }
});
