import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { NeumorphicCard } from "../components/common/NeumorphicCard";
import { colors } from "../theme/colors";

export function ProfileScreen({ user, onLogin, onLogout }) {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile & Settings</Text>
      <Text style={styles.subtitle}>Keep WeatherGPT simple and personal</Text>

      <NeumorphicCard style={styles.profile}>
        <Text style={styles.avatar}>☁️</Text>
        <Text style={styles.name}>{user?.name || "Guest user"}</Text>
        <Text style={styles.email}>{user?.email || "Sign in for live AI features"}</Text>
      </NeumorphicCard>

      {[
        ["📍", "Location", "Kolkata, India"],
        ["°", "Temperature unit", "Celsius"],
        ["🌐", "Language", "English"],
        ["🔔", "Weather notifications", "Enabled"],
        ["☀️", "Appearance", "Light"]
      ].map(([icon, title, value]) => (
        <NeumorphicCard key={title} style={styles.setting}>
          <Text style={styles.settingIcon}>{icon}</Text>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingValue}>{value}</Text>
        </NeumorphicCard>
      ))}

      {user ? (
        <TouchableOpacity onPress={onLogout} style={styles.action}>
          <Text style={styles.actionText}>Sign out</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onLogin} style={styles.action}>
          <Text style={styles.actionText}>Sign in / Create account</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 35 },
  title: { color: colors.text, fontSize: 27, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 12, marginTop: 3, marginBottom: 20 },
  profile: { padding: 20, alignItems: "center", marginBottom: 13 },
  avatar: { fontSize: 46 },
  name: { color: colors.text, fontSize: 18, fontWeight: "900", marginTop: 7 },
  email: { color: colors.muted, fontSize: 11, marginTop: 3 },
  setting: {
    minHeight: 58, padding: 12, flexDirection: "row", alignItems: "center", marginBottom: 9
  },
  settingIcon: { width: 35, fontSize: 18 },
  settingTitle: { flex: 1, color: colors.text, fontSize: 13, fontWeight: "700" },
  settingValue: { color: colors.muted, fontSize: 11 },
  action: {
    height: 52, borderRadius: 15, backgroundColor: colors.blue,
    alignItems: "center", justifyContent: "center", marginTop: 8
  },
  actionText: { color: colors.white, fontWeight: "900" }
});
