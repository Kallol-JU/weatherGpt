import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { ForecastCard } from "../components/weather/ForecastCard";
import { HourlyForecast } from "../components/weather/HourlyForecast";
import { SectionTitle } from "../components/common/SectionTitle";
import { colors } from "../theme/colors";
import * as Location from "expo-location";
import { api } from "../services/api";

export function ForecastScreen() {
  const [forecast, setForecast] = useState(null);
  const [location, setLocation] = useState("India");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          setError("Location permission is required for the forecast.");
          return;
        }
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const { latitude, longitude } = position.coords;
        const data = await api.forecast(latitude, longitude);
        setForecast(data.forecast);

        const place = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (place?.[0]) {
          const city = place[0].city || place[0].district || place[0].subregion;
          const region = place[0].region;
          if (city) setLocation(`${city}${region ? `, ${region}` : ""}`);
        }
      } catch (e) {
        setError(e.message || "Failed to load forecast.");
      }
    }
    load();
  }, []);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>5-Day Forecast</Text>
      <Text style={styles.subtitle}>{location}</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <SectionTitle title="Daily forecast" />
      <ForecastCard forecast={forecast} />

      <SectionTitle title="3-hour forecast" />
      <HourlyForecast forecast={forecast} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 18, paddingBottom: 35 },
  title: { color: colors.text, fontSize: 27, fontWeight: "900" },
  subtitle: { color: colors.muted, marginTop: 3, marginBottom: 22, fontSize: 12 },
  error: { color: colors.danger, fontSize: 12, marginBottom: 10 }
});
