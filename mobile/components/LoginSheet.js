import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "../services/api";
import { colors } from "../theme/colors";

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
      let data;

      if (mode === "login") {
        data = await api.login(email, password);
      } else {
        data = await api.register(name, email, password);
      }

      onSuccess(data);
    } catch (e) {
      setError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setError("");

    setMode((currentMode) =>
      currentMode === "login" ? "register" : "login"
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          <TouchableOpacity
            onPress={onClose}
            style={styles.close}
          >
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>

          <Text style={styles.title}>
            {mode === "login"
              ? "Welcome back"
              : "Create your account"}
          </Text>

          <Text style={styles.sub}>
            Use WeatherGPT's live AI assistant.
          </Text>

          {mode === "register" && (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoCapitalize="words"
            />
          )}

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.muted}
            style={styles.input}
            secureTextEntry
          />

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={[
              styles.button,
              busy && styles.buttonDisabled,
            ]}
            onPress={submit}
            disabled={busy}
          >
            {busy ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === "login"
                  ? "Sign in"
                  : "Create account"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleMode}
            style={styles.switch}
            disabled={busy}
          >
            <Text style={styles.switchText}>
              {mode === "login"
                ? "Need an account? Create one"
                : "Already have an account? Sign in"}
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: 35,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,

    elevation: 10,
  },

  close: {
    alignSelf: "flex-end",
    padding: 4,
  },

  closeText: {
    color: colors.muted,
    fontSize: 30,
    lineHeight: 32,
  },

  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
  },

  sub: {
    color: colors.muted,
    marginTop: 6,
    marginBottom: 18,
  },

  input: {
    height: 50,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 15,
    color: colors.text,
    marginBottom: 10,
  },

  button: {
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },

  switch: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    padding: 8,
  },

  switchText: {
    color: colors.blue2,
    fontWeight: "700",
  },

  error: {
    color: colors.danger,
    marginBottom: 10,
    fontSize: 14,
  },
});