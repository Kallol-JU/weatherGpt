import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { api } from "../../services/api";
import { colors } from "../../theme/colors";

export function LoginSheet({ visible, onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const data =
        mode === "login"
          ? await api.login(email.trim(), password)
          : await api.register(name.trim(), email.trim(), password);

      onSuccess(data);
    } catch (e) {
      setError(e?.message || "Unable to connect to the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <TouchableOpacity onPress={onClose} style={styles.close}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </Text>
          <Text style={styles.sub}>Use WeatherGPT's live AI assistant.</Text>

          {mode === "register" ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          ) : null}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            style={styles.input}
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            onPress={submit}
            disabled={busy}
            style={[styles.button, busy && styles.disabled]}
          >
            {busy ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {mode === "login" ? "Sign in" : "Create account"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setError("");
              setMode(mode === "login" ? "register" : "login");
            }}
            style={styles.switch}
          >
            <Text style={styles.switchText}>
              {mode === "login"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(23,32,51,0.35)" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 35,
    borderTopWidth: 1,
    borderColor: colors.line
  },
  close: { alignSelf: "flex-end", padding: 3 },
  closeText: { color: colors.muted, fontSize: 30 },
  title: { color: colors.text, fontSize: 25, fontWeight: "900" },
  sub: { color: colors.muted, marginTop: 5, marginBottom: 18 },
  input: {
    height: 50,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    color: colors.text,
    marginBottom: 10
  },
  button: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: "800" },
  switch: { alignItems: "center", padding: 14 },
  switchText: { color: colors.blue, fontWeight: "700" },
  error: { color: colors.danger, fontSize: 12, marginBottom: 8 }
});
