import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { WeatherHero } from "../components/weather/WeatherHero";
import { HourlyForecast } from "../components/weather/HourlyForecast";
import { SectionTitle } from "../components/common/SectionTitle";
import { ChatMessage } from "../components/chat/ChatMessage";
import { ChatInput } from "../components/chat/ChatInput";
import { QuickActions } from "../components/chat/QuickActions";
import { colors } from "../theme/colors";
import { api } from "../services/api";

export function HomeScreen({ user, onLogin }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [locationName, setLocationName] = useState("India");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (messages.length) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages, streaming]);

  useEffect(() => {
    let active = true;

    async function loadWeather() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") return;

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        const { latitude, longitude } = position.coords;

        const [currentData, forecastData] = await Promise.all([
          api.currentWeather(latitude, longitude),
          user ? api.forecast(latitude, longitude) : Promise.resolve(null)
        ]);

        if (!active) return;
        setWeather(currentData.weather);
        setForecast(forecastData?.forecast || null);

        const place = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place?.[0]) {
          const city = place[0].city || place[0].district || place[0].subregion;
          const region = place[0].region;
          if (city) setLocationName(`${city}${region ? `, ${region}` : ""}`);
        }
      } catch (error) {
        console.log("Weather load error:", error?.message);
      }
    }

    loadWeather();
    return () => { active = false; };
  }, [user]);

  async function send(text) {
    if (!text.trim() || streaming) return;

    if (!user) {
      onLogin();
      return;
    }

    const cleanText = text.trim();
    const userMessage = {
      role: "user",
      text: cleanText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setInput("");
    setMessages((current) => [...current, userMessage]);
    setStreaming(true);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        throw new Error("Location permission is required for live WeatherGPT chat.");
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced
      });

      const { latitude: lat, longitude: lon } = position.coords;
      let streamedReply = "";
      const assistantId = `assistant-${Date.now()}`;

      setMessages((current) => {
        return [
          ...current,
          {
            id: assistantId,
            role: "assistant",
            text: "",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ];
      });

      await api.chat({
        message: cleanText,
        lat,
        lon,
        language: "English",
        onChunk: (chunk) => {
          streamedReply += chunk;
          setMessages((current) =>
            current.map((item, index) =>
              item.id === assistantId ? { ...item, text: streamedReply } : item
            )
          );
        }
      });
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: error?.message || "I couldn't reach the WeatherGPT server. Please check that your backend is running.",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setStreaming(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={10}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>WeatherGPT</Text>
            <Text style={styles.subtitle}>Simple weather intelligence</Text>
          </View>
          <Text style={styles.status}>{user ? "● Live" : "○ Guest"}</Text>
        </View>

        <WeatherHero location={locationName} weather={weather} />

        <SectionTitle title="Hourly forecast" />
        <HourlyForecast forecast={forecast} />

        <SectionTitle title="WeatherGPT" action={user ? "Live AI" : "Sign in"} />
        {!user && messages.length === 0 ? (
          <View style={styles.welcome}>
            <Text style={styles.welcomeIcon}>✦</Text>
            <Text style={styles.welcomeTitle}>Ask me anything about the weather</Text>
            <Text style={styles.welcomeText}>
              Forecasts, warnings, farming advice, climate questions and more.
            </Text>
          </View>
        ) : null}

        {messages.map((message, index) => (
          <ChatMessage key={`${message.role}-${index}`} message={message} />
        ))}

        {streaming ? (
          <View style={styles.typing}>
            <Text style={styles.typingText}>WeatherGPT is thinking ···</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.composer}>
        <QuickActions onSelect={send} disabled={streaming} />
        <ChatInput
          value={input}
          onChangeText={setInput}
          onSend={send}
          disabled={streaming}
        />
        {!user ? (
          <Text style={styles.loginLink} onPress={onLogin}>
            Sign in for live AI chat
          </Text>
        ) : null}
        <Text style={styles.disclaimer}>
          WeatherGPT can make mistakes. Verify important warnings with official sources.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: { padding: 18, paddingBottom: 18 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15
  },
  brand: { color: colors.text, fontSize: 25, fontWeight: "900" },
  subtitle: { color: colors.muted, fontSize: 11, marginTop: 2 },
  status: { color: colors.blue, fontSize: 12, fontWeight: "800" },
  welcome: {
    padding: 19,
    borderRadius: 21,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: 15,
    alignItems: "center"
  },
  welcomeIcon: { color: colors.blue, fontSize: 30 },
  welcomeTitle: { color: colors.text, fontSize: 17, fontWeight: "900", textAlign: "center", marginTop: 7 },
  welcomeText: { color: colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center", marginTop: 5 },
  typing: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.line
  },
  typingText: { color: colors.muted, fontSize: 11 },
  composer: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 7,
    backgroundColor: colors.background
  },
  loginLink: {
    color: colors.blue,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    paddingTop: 7
  },
  disclaimer: {
    color: colors.muted,
    fontSize: 9,
    textAlign: "center",
    marginTop: 5
  }
});
