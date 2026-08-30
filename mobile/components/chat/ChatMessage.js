import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { WeatherCard } from "../weather/WeatherCard";
import { ForecastCard } from "../weather/ForecastCard";
import { AlertCard } from "../alerts/AlertCard";
import { AdvisoryCard } from "../advisory/AdvisoryCard";

export function ChatMessage({ message }) {
  const assistant = message.role === "assistant";

  return (
    <View style={[styles.row, !assistant && styles.userRow]}>
      {assistant ? <View style={styles.avatar}><Text style={styles.avatarText}>✦</Text></View> : null}

      <View style={[styles.content, !assistant && styles.userContent]}>
        <View style={[styles.bubble, assistant ? styles.assistantBubble : styles.userBubble]}>
          <Text style={[styles.text, !assistant && styles.userText]}>{message.text}</Text>
        </View>

        {message.card?.type === "weather" ? <WeatherCard data={message.card.data} compact /> : null}
        {message.card?.type === "forecast" ? <ForecastCard data={message.card.data} compact /> : null}
        {message.card?.type === "alert" ? <AlertCard data={message.card.data} /> : null}
        {message.card?.type === "advisory" ? <AdvisoryCard data={message.card.data} /> : null}

        {message.time ? <Text style={styles.time}>{message.time}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 9, marginBottom: 15 },
  userRow: { justifyContent: "flex-end" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarText: { color: colors.white, fontSize: 17, fontWeight: "800" },
  content: { maxWidth: "86%" },
  userContent: { maxWidth: "84%" },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.line
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 5,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 2
  },
  userBubble: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
    borderTopRightRadius: 5
  },
  text: { color: colors.text, fontSize: 15, lineHeight: 22 },
  userText: { color: colors.white },
  time: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 4,
    textAlign: "right"
  }
});
