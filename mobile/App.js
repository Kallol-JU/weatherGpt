import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HomeScreen } from "./screens/HomeScreen";
import { ForecastScreen } from "./screens/ForecastScreen";
import { AlertsScreen } from "./screens/AlertsScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { LoginSheet } from "./components/common/LoginSheet";
import { BottomNav } from "./components/navigation/BottomNav";
import { api } from "./services/api";
import { colors } from "./theme/colors";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [user, setUser] = useState(null);
  const [loginVisible, setLoginVisible] = useState(false);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = await AsyncStorage.getItem("weathergpt_user");
        if (saved) setUser(JSON.parse(saved));
      } finally {
        setBooting(false);
      }
    }
    restoreSession();
  }, []);

  async function handleAuth(data) {
    if (data?.token) await AsyncStorage.setItem("weathergpt_token", data.token);
    const nextUser = data?.user || data;
    await AsyncStorage.setItem("weathergpt_user", JSON.stringify(nextUser));
    setUser(nextUser);
    setLoginVisible(false);
  }

  async function logout() {
    api.disconnect();
    await AsyncStorage.multiRemove(["weathergpt_token", "weathergpt_user"]);
    setUser(null);
  }

  if (booting) {
    return (
      <SafeAreaView style={styles.boot}>
        <ActivityIndicator size="large" color={colors.blue} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.content}>
        {screen === "home" && (
          <HomeScreen user={user} onLogin={() => setLoginVisible(true)} />
        )}
        {screen === "forecast" && <ForecastScreen />}
        {screen === "alerts" && <AlertsScreen />}
        {screen === "history" && <HistoryScreen />}
        {screen === "profile" && (
          <ProfileScreen user={user} onLogin={() => setLoginVisible(true)} onLogout={logout} />
        )}
      </View>

      <BottomNav active={screen} onChange={setScreen} />

      <LoginSheet
        visible={loginVisible}
        onClose={() => setLoginVisible(false)}
        onSuccess={handleAuth}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  boot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  }
});
