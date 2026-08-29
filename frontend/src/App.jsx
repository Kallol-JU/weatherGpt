import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { ChatPanel } from "./components/ChatPanel";
import { WeatherOverview } from "./components/WeatherOverview";
import { Forecast, FullForecast } from "./components/Forecast";
import { TrendCard } from "./components/TrendCard";
import { Alerts } from "./components/Alerts";
import { Advisories } from "./components/Advisories";
import { Climate } from "./components/Climate";
import { Voice } from "./components/Voice";
import { History } from "./components/History";
import { Maps } from "./components/Maps";
import { About } from "./components/About";
import { AuthModal } from "./components/AuthModal";
import { LocationModal } from "./components/LocationModal";
import { SettingsModal } from "./components/SettingsModal";
import {
  getApiUrl,
  getForecast,
  getHistory,
  geocodeCity,
} from "./services/api";
import { formatTemp, formatTime, weatherMeta } from "./utils/weather";

const defaultLocation = {
  name: "Kolkata",
  country: "India",
  latitude: 22.5726,
  longitude: 88.3639,
  timezone: "Asia/Kolkata",
};

function App() {
  const [active, setActive] = useState("chat");
  const [location, setLocation] = useState(defaultLocation);
  const [weather, setWeather] = useState(null);

  // Settings initialized with LocalStorage for persistence
  const [unit, setUnit] = useState(
    () => localStorage.getItem("weathergpt_unit") || "C",
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("weathergpt_lang") || "English",
  );
  const [dark, setDark] = useState(
    () => localStorage.getItem("weathergpt_dark") !== "false",
  );

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("weathergpt_user") || "null"),
  );
  const [token, setToken] = useState(
    () => localStorage.getItem("weathergpt_token") || "",
  );
  const [history, setHistory] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  const apiUrl = getApiUrl();

  // Save settings to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem("weathergpt_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("weathergpt_unit", unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem("weathergpt_dark", dark);
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  async function loadLocation(place) {
    setLoadingWeather(true);
    setWeatherError("");
    try {
      const data = await getForecast(place.latitude, place.longitude);
      setLocation(place);
      setWeather(data);
    } catch (err) {
      setWeatherError(err.message || "Could not load weather.");
    } finally {
      setLoadingWeather(false);
    }
  }

  // Initial Location Detection (Checks Saved Location -> GPS -> Default Fallback)
  useEffect(() => {
    const savedLoc = localStorage.getItem("weathergpt_location");
    if (savedLoc) {
      try {
        const parsed = JSON.parse(savedLoc);
        loadLocation(parsed);
        return;
      } catch (e) {
        console.error("Error parsing saved location", e);
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const mapTilerKey =
              import.meta.env.VITE_MAPTILER_API_KEY || "skvm1S2eynHwdOdazyId";
            const res = await fetch(
              `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${mapTilerKey}`,
            );
            const data = await res.json();

            let cityName = "Current Location";
            let countryName = "India";

            if (data.features && data.features.length > 0) {
              cityName = data.features[0].text || cityName;
              const countryFeature = data.features.find((f) =>
                f.place_type.includes("country"),
              );
              if (countryFeature) countryName = countryFeature.text;
            }

            const detectedLoc = {
              name: cityName,
              country: countryName,
              latitude,
              longitude,
              timezone: "auto",
            };

            localStorage.setItem(
              "weathergpt_location",
              JSON.stringify(detectedLoc),
            );
            loadLocation(detectedLoc);
          } catch (err) {
            loadLocation(defaultLocation);
          }
        },
        () => {
          loadLocation(defaultLocation);
        },
        { timeout: 8000 },
      );
    } else {
      loadLocation(defaultLocation);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setSocket(null);
      setConnected(false);
      return;
    }
    const client = io(apiUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    client.on("connect", () => setConnected(true));
    client.on("disconnect", () => setConnected(false));
    client.on("connect_error", () => setConnected(false));
    client.on("receive_reply_chunk", ({ chunk }) => {
      setStreaming(false);
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant" && last.streaming) {
          next[next.length - 1] = {
            ...last,
            text: `${last.text}${chunk}`,
            streaming: true,
          };
        } else {
          next.push({
            role: "assistant",
            text: chunk,
            streaming: true,
            time: nowTime(),
          });
        }
        return next;
      });
    });
    client.on("receive_reply_done", ({ reply }) => {
      setStreaming(false);
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === "assistant")
          next[next.length - 1] = {
            ...last,
            text: reply || last.text,
            streaming: false,
            time: last.time || nowTime(),
          };
        else
          next.push({
            role: "assistant",
            text: reply || "I could not generate a response.",
            time: nowTime(),
          });
        return next;
      });
      refreshHistory(token);
    });
    setSocket(client);
    return () => client.disconnect();
  }, [token, apiUrl]);

  async function refreshHistory(authToken = token) {
    if (!authToken) return;
    try {
      const data = await getHistory(authToken);
      setHistory(data.history || []);
    } catch {
      /* keep UI usable */
    }
  }

  useEffect(() => {
    refreshHistory();
  }, [token]);

  async function handleAuth(data) {
    localStorage.setItem("weathergpt_token", data.token);
    localStorage.setItem("weathergpt_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setAuthOpen(false);
    setActive("chat");
  }

  function logout() {
    socket?.disconnect();
    localStorage.removeItem("weathergpt_token");
    localStorage.removeItem("weathergpt_user");
    setToken("");
    setUser(null);
    setMessages([]);
    setHistory([]);
    setSettingsOpen(false);
  }

  async function handleLocationChange(place) {
    setMessages([]);
    localStorage.setItem("weathergpt_location", JSON.stringify(place));
    await loadLocation(place);
  }

  function sendMessage(text = input) {
    const clean = text.trim();
    if (!clean || streaming) return;
    if (!token || !socket || !connected) {
      setAuthOpen(true);
      return;
    }
    const userMessage = { role: "user", text: clean, time: nowTime() };
    setMessages((prev) => [
      ...prev,
      userMessage,
      { role: "assistant", text: "", streaming: true, time: nowTime() },
    ]);
    setInput("");
    setStreaming(true);
    socket.emit("send_prompt", {
      message: clean,
      lat: location.latitude,
      lon: location.longitude,
      language: language,
    });
  }

  function stopGeneration() {
    setStreaming(false);

    if (socket) {
      socket.emit("stop_prompt");
    }
  }

  function handleQuick(q) {
    const map = {
      "Current weather": "What is the current weather?",
      "5 day forecast": "How will the weather be for the next 5 days?",
      "Weather alerts": "Are there any weather warnings or alerts?",
    };
    setInput(map[q] || q);
  }

  function selectHistory(text) {
    setActive("chat");
    setInput(text);
  }

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  }, []);

  return (
    <div className={`app-shell ${dark ? "theme-dark" : "theme-light"}`}>
      <Sidebar
        active={active}
        setActive={setActive}
        location={location}
        unit={unit}
        setUnit={setUnit}
        dark={dark}
        setDark={setDark}
      />
      <main className="main-area">
        <Topbar
          location={location}
          onLocation={() => setLocationOpen(true)}
          language={language}
          setLanguage={setLanguage}
          onProfile={() => setSettingsOpen(true)}
          mobileMenu={() => setActive(active === "chat" ? "forecast" : "chat")}
        />
        {weatherError && <div className="inline-error">{weatherError}</div>}
        <div className="dashboard">
          {active === "chat" && (
            <>
              <div className="dashboard-main">
                <div className="dashboard-welcome">
                  <div>
                    <span className="eyebrow">
                      {location.name}, {location.country}
                    </span>
                    <h1>{greeting} 👋</h1>
                    <p>Your weather, explained simply.</p>
                  </div>
                  <button
                    className="refresh-btn"
                    onClick={() => loadLocation(location)}
                  >
                    ↻
                  </button>
                </div>
                <WeatherOverview
                  location={location}
                  weather={weather}
                  unit={unit}
                  onAsk={sendMessage}
                />
                <div className="dashboard-two">
                  <Forecast
                    weather={weather}
                    unit={unit}
                    onOpen={() => setActive("forecast")}
                  />
                  <TrendCard weather={weather} unit={unit} />
                </div>
              </div>
              <ChatPanel
                messages={messages}
                input={input}
                setInput={setInput}
                onSend={sendMessage}
                onQuick={handleQuick}
                connected={connected}
                streaming={streaming}
                onLogin={() => setAuthOpen(true)}
                language={language}
                onStop={stopGeneration}
              />
            </>
          )}
          {active === "forecast" && (
            <FullForecast weather={weather} unit={unit} />
          )}
          {active === "maps" && <Maps location={location} />}
          {active === "alerts" && <Alerts location={location} />}
          {active === "advisory" && (
            <Advisories location={location} onAsk={sendMessage} />
          )}
          {active === "climate" && <Climate location={location} />}
          {active === "voice" && (
            <Voice onAsk={sendMessage} language={language} />
          )}
          {active === "history" && (
            <History history={history} onSelect={selectHistory} />
          )}
          {active === "locations" && (
            <LocationPage current={location} onChange={handleLocationChange} />
          )}
          {active === "settings" && (
            <SettingsPage
              dark={dark}
              setDark={setDark}
              language={language}
              setLanguage={setLanguage}
              unit={unit}
              setUnit={setUnit}
              user={user}
              onLogout={logout}
            />
          )}
          {active === "about" && <About />}
        </div>
      </main>
      {authOpen && (
        <AuthModal onClose={() => setAuthOpen(false)} onAuth={handleAuth} />
      )}
      {locationOpen && (
        <LocationModal
          current={location}
          onClose={() => setLocationOpen(false)}
          onChange={handleLocationChange}
        />
      )}
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          language={language}
          setLanguage={setLanguage}
          unit={unit}
          setUnit={setUnit}
          dark={dark}
          setDark={setDark}
          user={user}
          onLogout={logout}
        />
      )}
    </div>
  );
}

function LocationPage({ current, onChange }) {
  return (
    <section className="page-section">
      <div className="section-title">
        <div>
          <h1>Saved locations</h1>
          <p>Choose a location for weather and conversations.</p>
        </div>
      </div>
      <div className="saved-location-card">
        <div className="saved-current">
          <span>⌖</span>
          <div>
            <strong>
              {current.name}, {current.country}
            </strong>
            <small>Current location</small>
          </div>
          <b>✓</b>
        </div>
        <p>
          Use the location button in the top bar to search for another city.
        </p>
      </div>
    </section>
  );
}

function SettingsPage(props) {
  return (
    <section className="page-section">
      <div className="section-title">
        <div>
          <h1>Settings</h1>
          <p>Accessibility and WeatherGPT preferences.</p>
        </div>
      </div>
      <div className="settings-page-card">
        <div>
          <strong>Appearance</strong>
          <span>Dark mode</span>
          <button
            className={`switch ${props.dark ? "on" : ""}`}
            onClick={() => props.setDark(!props.dark)}
          >
            <i />
          </button>
        </div>
        <div>
          <strong>Language</strong>
          <span>Assistant language</span>
          <select
            value={props.language}
            onChange={(e) => props.setLanguage(e.target.value)}
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Bengali">Bengali</option>
            <option value="Tamil">Tamil</option>
            <option value="Telugu">Telugu</option>
          </select>
        </div>
        <div>
          <strong>Units</strong>
          <span>Temperature</span>
          <div className="small-toggle">
            <button
              className={props.unit === "C" ? "selected" : ""}
              onClick={() => props.setUnit("C")}
            >
              °C
            </button>
            <button
              className={props.unit === "F" ? "selected" : ""}
              onClick={() => props.setUnit("F")}
            >
              °F
            </button>
          </div>
        </div>
        <div>
          <strong>Account</strong>
          <span>{props.user?.email || "Guest mode"}</span>
        </div>
        {props.user && (
          <button className="logout-btn" onClick={props.onLogout}>
            Sign out
          </button>
        )}
      </div>
    </section>
  );
}

function nowTime() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default App;
