import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import { NeumorphicCard } from "../components/common/NeumorphicCard";
import { colors } from "../theme/colors";
import { api } from "../services/api";

export function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.history()
      .then((data) => setHistory(data.history || []))
      .catch((e) => setError(e.message));
  }, []);

  const conversations = history
    .filter((item) => item.role === "user")
    .slice()
    .reverse();

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Chat History</Text>
      <Text style={styles.subtitle}>Your WeatherGPT conversations</Text>

      <NeumorphicCard style={styles.search}>
        <Text style={styles.searchIcon}>⌕</Text>
        <Text style={styles.searchText}>Saved conversations from MongoDB</Text>
      </NeumorphicCard>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && !conversations.length ? (
        <Text style={styles.empty}>No conversations yet.</Text>
      ) : null}

      {conversations.map((item, index) => (
        <TouchableOpacity key={`${item.timestamp || index}-${index}`} activeOpacity={0.8}>
          <NeumorphicCard style={styles.item}>
            <Text style={styles.chatIcon}>○</Text>
            <Text style={styles.chatText}>{item.message}</Text>
            <Text style={styles.time}>
              {item.timestamp ? new Date(item.timestamp).toLocaleDateString() : ""}
            </Text>
          </NeumorphicCard>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
