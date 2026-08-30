import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.101:5000";

async function request(path, options = {}) {
  const token = await AsyncStorage.getItem("weathergpt_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Server error: ${response.status}`);
  }

  return data;
}

let socket = null;

async function getSocket() {
  const token = await AsyncStorage.getItem("weathergpt_token");
  if (!token) throw new Error("Please sign in to use WeatherGPT AI chat.");

  if (socket?.connected) return socket;

  if (socket) socket.disconnect();

  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    autoConnect: true
  });

  await new Promise((resolve, reject) => {
    const onConnect = () => {
      cleanup();
      resolve();
    };
    const onError = (error) => {
      cleanup();
      reject(new Error(error?.message || "Unable to connect to WeatherGPT."));
    };
    const cleanup = () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
    };

    socket.once("connect", onConnect);
    socket.once("connect_error", onError);
  });

  return socket;
}

export const api = {
  async login(email, password) {
    return request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
  },

  async register(name, email, password) {
    return request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
  },

  async history() {
    return request("/api/history");
  },

  async currentWeather(lat, lon) {
    return request(`/api/current-weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
  },

  async forecast(lat, lon) {
    return request(`/api/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
  },

  async advisory(lat, lon, sector) {
    return request(
      `/api/advisory?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&sector=${encodeURIComponent(sector)}`
    );
  },

  async climate(lat, lon) {
    return request(`/api/climate?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`);
  },

  async settings() {
    return request("/api/user/settings");
  },

  async updateSettings(preferences) {
    return request("/api/user/settings", {
      method: "PUT",
      body: JSON.stringify(preferences)
    });
  },

  async weatherInsight(city) {
    return request("/api/weather-insight", {
      method: "POST",
      body: JSON.stringify({ city })
    });
  },

  async chat({ message, lat, lon, language = "English", onChunk, onDone }) {
    const currentSocket = await getSocket();

    return new Promise((resolve, reject) => {
      let finished = false;

      const cleanup = () => {
        currentSocket.off("receive_reply_chunk", handleChunk);
        currentSocket.off("receive_reply_done", handleDone);
        currentSocket.off("connect_error", handleError);
      };

      const handleChunk = ({ chunk }) => {
        if (chunk) onChunk?.(chunk);
      };

      const handleDone = ({ reply }) => {
        if (finished) return;
        finished = true;
        cleanup();
        onDone?.(reply || "");
        resolve(reply || "");
      };

      const handleError = (error) => {
        if (finished) return;
        finished = true;
        cleanup();
        reject(new Error(error?.message || "WeatherGPT connection failed."));
      };

      currentSocket.on("receive_reply_chunk", handleChunk);
      currentSocket.on("receive_reply_done", handleDone);
      currentSocket.once("connect_error", handleError);

      currentSocket.emit("send_prompt", {
        message,
        lat,
        lon,
        language
      });
    });
  },

  stopChat() {
    socket?.emit("stop_prompt");
  },

  disconnect() {
    socket?.disconnect();
    socket = null;
  }
};
