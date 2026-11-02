import { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import {
  RefreshCw,
  MapPin,
  Check,
  LogOut,
} from "lucide-react";
import "./App.css";

// React Bits components
import DotField from "./components/DotField";
import SwipeToast from "./components/SwipeToast";

// Layout & View Components
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { ChatPanel } from "./components/ChatPanel";
import { WeatherOverview } from "./components/WeatherOverview";
import { HourlyForecast } from "./components/HourlyForecast";
import { FullForecast } from "./components/Forecast";
import { Alerts } from "./components/Alerts";
import { Advisories } from "./components/Advisories";
import { Climate } from "./components/Climate";
import { Voice } from "./components/Voice";
import { History } from "./components/History";
import { Maps } from "./components/Maps";
import { About } from "./components/About";
import { NotFound } from "./components/NotFound";

// Modals
import { AuthModal } from "./components/AuthModal";
import { LocationModal } from "./components/LocationModal";
import { SettingsModal } from "./components/SettingsModal";

// Services & Utilities
import {
  getApiUrl,
  getForecast,
  getHistory,
} from "./services/api";
import { getConditionTheme } from "./utils/weather";

const defaultLocation = {
  name: "Kolkata",
  country: "India",
  latitude: 22.5726,
  longitude: 88.3639,
  timezone: "Asia/Kolkata",
};

const KNOWN_ROUTES = [
  "chat",
  "forecast",
  "maps",
  "alerts",
  "advisory",
  "climate",
  "voice",
  "history",
  "locations",
  "settings",
  "about",
];

function App() {
  const [active, setActive] = useState("chat");
  const [location, setLocation] = useState(defaultLocation);
  const [weather, setWeather] = useState(null);

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // SwipeToast Alert Notification State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastDetails, setToastDetails] = useState(null);

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("weathergpt_user") || "null"),
  );
  const [token, setToken] = useState(
    () =>
      localStorage.getItem("weathergpt_token") ||
      localStorage.getItem("token") ||
      "",
  );
  const [history, setHistory] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [weatherError, setWeatherError] = useState("");

  const apiUrl = getApiUrl();

  useEffect(() => {
    localStorage.setItem("weathergpt_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("weathergpt_unit", unit);
  }, [unit]);

  useEffect(() => {
    localStorage.setItem("weathergpt_dark", dark);
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("theme-light", !dark);
  }, [dark]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKey(event) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }

    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [mobileMenuOpen]);

  async function loadLocation(place, force = false) {
    setLoadingWeather(true);
    setWeatherError("");
    try {
      const data = await getForecast(place.latitude, place.longitude, force);
      setLocation(place);
      setWeather(data);

      // Check for active advisories to display the SwipeToast
      const windSpeed = data.current?.wind_speed_10m ?? 0;
      const rainProb = data.daily?.precipitation_probability_max?.[0] ?? 0;
      const code = data.current?.weather_code ?? 0;
      const aqi = data.airQuality?.current?.us_aqi;

      if (code >= 95 || windSpeed > 40 || rainProb > 70 || (aqi && aqi > 150)) {
        const hazardSummary =
          code >= 95
            ? "Convective thunderstorm activity detected on radar."
            : windSpeed > 40
              ? `Elevated wind speed detected (${Math.round(windSpeed)} km/h).`
              : rainProb > 70
                ? `High precipitation probability (${rainProb}%).`
                : `Elevated air quality index (${aqi}).`;

        setToastDetails({
          title: "Atmospheric Advisory Active",
          description: `${place.name}: ${hazardSummary}`,
          actionLabel: "View Safety Center",
        });
        setToastOpen(true);
      }
    } catch (err) {
      setWeatherError(err.message || "Could not load meteorological observations.");
    } finally {
      setLoadingWeather(false);
    }
  }

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
          } catch {
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
      /* keep UI resilient */
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
    localStorage.removeItem("token");
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

  function handleQuick(prompt) {
    setInput(prompt);
  }

  function selectHistory(text) {
    setActive("chat");
    setInput(text);
  }

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    const timeGreeting =
      h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    const firstName = user?.name ? user.name.split(" ")[0] : "";
    return firstName ? `${timeGreeting}, ${firstName}` : timeGreeting;
  }, [user]);

  const conditionTheme = useMemo(() => {
    return getConditionTheme(weather?.current?.weather_code ?? 0);
  }, [weather?.current?.weather_code]);

  return (
    <div className={`app-shell ${dark ? "theme-dark" : "theme-light"}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      {/* Background Animated Condition DotField */}
      <div className="dotfield-background" aria-hidden="true">
        <DotField
          pattern="grid"
          opacity={0.16}
          speed={0.5}
          sparkle={true}
          gradientFrom={conditionTheme.gradientFrom}
          gradientTo={conditionTheme.gradientTo}
          glowColor={conditionTheme.glowColor}
        />
      </div>

      {/* SwipeToast Alert Banner */}
      {toastOpen && toastDetails && (
        <div className="app-toast-container" role="alert">
          <SwipeToast
            open={toastOpen}
            title={toastDetails.title}
            description={toastDetails.description}
            actionLabel={toastDetails.actionLabel}
            onAction={() => {
              setActive("alerts");
              setToastOpen(false);
            }}
            onClose={() => setToastOpen(false)}
            background={dark ? "#1e293b" : "#f8fafc"}
            color={dark ? "#f8fafc" : "#0f172a"}
            fuseColor="#ef4444"
            closeButton={true}
            duration={8000}
          />
        </div>
      )}

      {mobileMenuOpen && (
        <button
          type="button"
          className="sidebar-scrim"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        active={active}
        setActive={setActive}
        isOpen={mobileMenuOpen}
        closeMenu={() => setMobileMenuOpen(false)}
        user={user}
        onLogin={() => setAuthOpen(true)}
        onLogout={logout}
      />

      <main className="main-area" id="main-content" tabIndex={-1}>
        <Topbar
          location={location}
          onLocation={() => setLocationOpen(true)}
          onProfile={() => setSettingsOpen(true)}
          dark={dark}
          onToggleTheme={() => setDark((value) => !value)}
          mobileMenu={() => setMobileMenuOpen(true)}
          menuOpen={mobileMenuOpen}
          user={user}
          onLogin={() => setAuthOpen(true)}
          onLogout={logout}
        />

        {weatherError && <div className="inline-error">{weatherError}</div>}

        <div className="dashboard">
          {active === "chat" && (
            <div className="chat-layout-grid">
              <div className="weather-widgets-column">
                <div className="dashboard-welcome">
                  <div className="dashboard-welcome__copy">
                    <h1>{greeting}</h1>
                    <p>Live conditions and practical guidance for your day.</p>
                  </div>
                  <button
                    type="button"
                    className="btn-glass btn-glass-sm"
                    onClick={() => loadLocation({ ...location }, true)}
                    title="Refresh telemetry"
                  >
                    <RefreshCw size={14} className="inline mr-1" />
                    Refresh Data
                  </button>
                </div>

                {/* 1. Main Glassmorphism Overview Container */}
                <WeatherOverview
                  location={location}
                  weather={loadingWeather ? null : weather}
                  unit={unit}
                  dark={dark}
                  user={user}
                  onAsk={sendMessage}
                  onOpenForecast={() => setActive("forecast")}
                />

                {/* 2. Integrated 24-Hour Forecast */}
                <HourlyForecast weather={weather} unit={unit} />
              </div>

              <div className="chat-panel-column">
                <ChatPanel
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  onSend={sendMessage}
                  onQuick={handleQuick}
                  connected={connected}
                  streaming={streaming}
                  authenticated={Boolean(token)}
                  onLogin={() => setAuthOpen(true)}
                  language={language}
                  location={location}
                  onStop={stopGeneration}
                />
              </div>
            </div>
          )}

          {active === "forecast" && (
            <FullForecast weather={weather} unit={unit} location={location} />
          )}

          {active === "maps" && (
            <Maps
              location={location}
              weather={weather}
              onNavigateAlerts={() => setActive("alerts")}
            />
          )}

          {active === "alerts" && (
            <Alerts
              location={location}
              weather={weather}
              authToken={token}
              onNavigateMaps={() => setActive("maps")}
            />
          )}

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

          {/* Custom 404 Page for any unrecognized route */}
          {!KNOWN_ROUTES.includes(active) && (
            <NotFound onHome={() => setActive("chat")} />
          )}
        </div>
      </main>

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onAuth={handleAuth}
          dark={dark}
        />
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

function LocationPage({ current }) {
  return (
    <section className="page-section" style={{ width: "100%" }}>
      <div className="section-title">
        <div>
          <div className="flex items-center gap-2">
            <MapPin size={24} className="text-sky-400" />
            <h1>Saved Meteorological Stations</h1>
          </div>
          <p>Switch observation coordinates for localized synoptic reports.</p>
        </div>
      </div>

      <div className="saved-location-card">
        <div className="saved-current">
          <MapPin size={22} className="text-sky-400 shrink-0" />
          <div>
            <strong>
              {current.name}, {current.country || "Global"}
            </strong>
            <small>Active Station Coordinates ({current.latitude.toFixed(2)}, {current.longitude.toFixed(2)})</small>
          </div>
          <Check size={20} className="text-emerald-400" />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Use the location trigger in the top bar to search for any municipality or coordinates worldwide.
        </p>
      </div>
    </section>
  );
}

function SettingsPage(props) {
  return (
    <section className="page-section" style={{ width: "100%" }}>
      <div className="section-title">
        <div>
          <h1>Preferences & Accessibility</h1>
          <p>Interface ergonomics, measurement units, and session configuration.</p>
        </div>
      </div>
      <div className="settings-page-card">
        <div>
          <strong>Appearance</strong>
          <span>Dark mode</span>
          <button
            type="button"
            className={`switch ${props.dark ? "on" : ""}`}
            onClick={() => props.setDark(!props.dark)}
            aria-label="Toggle dark mode"
          >
            <i />
          </button>
        </div>
        <div>
          <strong>Language</strong>
          <span>Assistant and translation language</span>
          <select
            value={props.language}
            onChange={(e) => props.setLanguage(e.target.value)}
            className="form-select"
          >
            <option value="English">English</option>
            <option value="Hindi">Hindi (हिन्दी)</option>
            <option value="Bengali">Bengali (বাংলা)</option>
            <option value="Tamil">Tamil (தமிழ்)</option>
            <option value="Telugu">Telugu (తెలుగు)</option>
          </select>
        </div>
        <div>
          <strong>Units</strong>
          <span>Temperature measurement</span>
          <div className="small-toggle">
            <button
              type="button"
              className={props.unit === "C" ? "selected" : ""}
              onClick={() => props.setUnit("C")}
            >
              °C
            </button>
            <button
              type="button"
              className={props.unit === "F" ? "selected" : ""}
              onClick={() => props.setUnit("F")}
            >
              °F
            </button>
          </div>
        </div>
        <div>
          <strong>Account</strong>
          <span>{props.user?.email || "Guest Session"}</span>
        </div>
        {props.user && (
          <button
            type="button"
            className="btn-glass btn-glass-sm btn-glass-danger"
            onClick={props.onLogout}
          >
            <LogOut size={14} className="inline mr-1 text-rose-400" />
            Sign Out
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
