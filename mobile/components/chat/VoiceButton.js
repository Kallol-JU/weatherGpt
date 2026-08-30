import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import { colors } from "../../theme/colors";

export function VoiceButton({ onListeningChange }) {
  const [listening, setListening] = useState(false);

  async function toggle() {
    const next = !listening;
    setListening(next);
    onListeningChange?.(next);
    await Haptics.selectionAsync();

    if (!next) {
      // Expo Go supports text-to-speech, but speech-to-text requires
      // a development build/native speech-recognition module.
      Speech.stop();
    }
  }

  return (
    <TouchableOpacity
      onPress={toggle}
      style={[styles.button, listening && styles.listening]}
      activeOpacity={0.8}
      accessibilityLabel={listening ? "Stop voice input" : "Voice input"}
    >
      <Text style={styles.icon}>{listening ? "■" : "🎙️"}</Text>
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
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3
  },
  listening: { backgroundColor: colors.blueLight, borderColor: colors.blue },
  icon: { fontSize: 18, color: colors.blue }
});
