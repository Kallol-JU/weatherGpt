import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { colors } from "../../theme/colors";
import { VoiceButton } from "./VoiceButton";

export function ChatInput({ value, onChangeText, onSend, disabled }) {
  const [listening, setListening] = useState(false);

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.box, listening && styles.activeBox]}>
        <VoiceButton onListeningChange={setListening} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={listening ? "Listening..." : "Ask anything about the weather..."}
          placeholderTextColor={colors.muted}
          style={styles.input}
          multiline
          maxLength={1000}
          editable={!disabled}
          onSubmitEditing={submit}
        />

        <TouchableOpacity
          onPress={submit}
          disabled={disabled || !value.trim()}
          style={[styles.send, (!value.trim() || disabled) && styles.sendDisabled]}
          activeOpacity={0.8}
        >
          <Text style={styles.sendText}>➤</Text>
        </TouchableOpacity>
      </View>

      {listening ? (
        <Text style={styles.voiceHint}>
          Voice input is ready for native speech recognition. The current Expo Go build keeps the microphone UI here without moving it to a separate screen.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingTop: 8 },
  box: {
    minHeight: 62,
    maxHeight: 135,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 9,
    padding: 8,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 4, height: 5 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 4
  },
  activeBox: { borderColor: colors.blue },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    color: colors.text,
    fontSize: 14,
    paddingTop: 12,
    paddingBottom: 9
  },
  send: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center"
  },
  sendDisabled: { backgroundColor: colors.line },
  sendText: { color: colors.white, fontSize: 20, fontWeight: "900" },
  voiceHint: {
    color: colors.muted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 5,
    paddingHorizontal: 5
  }
});
