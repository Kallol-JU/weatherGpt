import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
<<<<<<< Updated upstream

// import { GoogleGenAI } from "@google/genai";
=======
import dns from "node:dns";
import { GoogleGenAI } from "@google/genai";
import Chat from "./models/Chat.js";
import rateLimit from "express-rate-limit";
import { RateLimiterMemory } from "rate-limiter-flexible";
import authRoutes from "./routes/auth.js";
import { protect } from "./middleware/auth.js";
import jwt from "jsonwebtoken";
import userRoutes from "./routes/user.js";
>>>>>>> Stashed changes

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

<<<<<<< Updated upstream
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // frontend port no
    methods: ["GET", "POST"],
  },
=======
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
dns.setServers(["1.1.1.1"]);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((err) => console.error("MongoDB connection error:", err));

function isWeatherOrTerm(text) {
  if (!text) return false;
  const lower = text.toLowerCase();

  const weatherPatterns = [
    /weather/i,
    /forecast/i,
    /climat/i,
    /temp/i,
    /deg/i,
    /rain/i,
    /shower/i,
    /drizzle/i,
    /wet/i,
    /sun/i,
    /hot/i,
    /warm/i,
    /heat/i,
    /cold/i,
    /chill/i,
    /freeze/i,
    /frost/i,
    /snow/i,
    /ice/i,
    /wind/i,
    /breeze/i,
    /storm/i,
    /cyclone/i,
    /monsoon/i,
    /cloud/i,
    /overcast/i,
    /fog/i,
    /mist/i,
    /haze/i,
    /thunder/i,
    /lightning/i,
    /humid/i,
    /pressure/i,
    /umbrella/i,
    /jacket/i,
    /coat/i,
    /sweater/i,
    /outfit/i,
    /wear/i,
    /aqi/i,
    /air quality/i,
    /visibility/i,
    /sunrise/i,
    /sunset/i,
    /imd/i,
    /meteorolog/i,
  ];

  const matchesPattern = weatherPatterns.some((pattern) => pattern.test(lower));

  const conversationalWeather =
    (lower.includes("outside") ||
      lower.includes("today") ||
      lower.includes("tomorrow") ||
      lower.includes("now")) &&
    (lower.includes("how") ||
      lower.includes("is it") ||
      lower.includes("can i") ||
      lower.includes("should i"));

  const isForbiddenTopic =
    lower.includes("score") ||
    lower.includes("match") ||
    lower.includes("cricket") ||
    lower.includes("football") ||
    lower.includes("president") ||
    lower.includes("code") ||
    lower.includes("recipe") ||
    lower.includes("movie") ||
    lower.includes("song");

  if (isForbiddenTopic) return false;

  return matchesPattern || conversationalWeather;
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

const socketLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60,
});

app.post("/api/weather-insight", async (req, res) => {
  const { city } = req.body || {};

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    const response = await fetch(weatherUrl);
    const weatherData = await response.json();

    if (weatherData.cod !== 200) {
      return res.status(weatherData.cod).json({ error: weatherData.message });
    }

    const temp = weatherData.main.temp;
    const condition = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;

    const prompt = `
      You are an engaging weather assistant. The current weather for ${city} is:
      - Temperature: ${temp}°C
      - Conditions: ${condition}
      - Humidity: ${humidity}%
      - Wind Speed: ${windSpeed} m/s
      
      Based on this data, write a short, 2-sentence creative weather update advising the user on what to wear or expect.
    `;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const aiSummary = aiResponse.text;

    res.json({
      success: true,
      aiSummary: aiSummary,
      rawWeather: weatherData,
    });
  } catch (error) {
    console.error("Pipeline Error:", error);
    res.status(500).json({ error: "Failed to generate weather insight" });
  }
});

app.get("/api/forecast", protect, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required." });
    }

    const isWithinIndia =
      lat >= 8.4 && lat <= 37.6 && lon >= 68.7 && lon <= 97.25;
    if (!isWithinIndia) {
      return res.status(403).json({
        error: "Forecast data is restricted to Indian territories only.",
      });
    }

    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    const response = await fetch(forecastUrl);
    const forecastData = await response.json();

    if (forecastData.cod !== "200") {
      return res
        .status(Number(forecastData.cod))
        .json({ error: forecastData.message });
    }

    res.json({ success: true, forecast: forecastData });
  } catch (error) {
    console.error("Forecast API Error:", error);
    res.status(500).json({ error: "Failed to fetch forecast data." });
  }
});

app.get("/api/advisory", protect, async (req, res) => {
  try {
    const { lat, lon, sector } = req.query;

    if (!lat || !lon || !sector) {
      return res
        .status(400)
        .json({ error: "Latitude, longitude, and sector are required." });
    }

    const isWithinIndia =
      lat >= 8.4 && lat <= 37.6 && lon >= 68.7 && lon <= 97.25;
    if (!isWithinIndia) {
      return res
        .status(403)
        .json({ error: "Restricted to Indian territories only." });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (weatherData.cod && weatherData.cod !== 200) {
      return res
        .status(Number(weatherData.cod))
        .json({ error: weatherData.message });
    }

    const prompt = `
      You are an expert meteorological advisor for the Indian government.
      Current weather data: ${JSON.stringify(weatherData)}
      
      Generate a ${sector} advisory based strictly on IMD guidelines.
      You MUST return ONLY valid JSON in this exact structure, with no markdown formatting or extra text:
      {
        "suitability": "string (e.g., Good, Fair, Poor, Dangerous)",
        "summary": "string (1 brief sentence)",
        "tips": ["string", "string"]
      }
    `;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const rawText = aiResponse.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const advisoryJson = JSON.parse(rawText);

    res.json({ success: true, sector, advisory: advisoryJson });
  } catch (error) {
    console.error("Advisory API Error:", error);
    res.status(500).json({ error: "Failed to generate sector advisory." });
  }
});

app.get("/api/climate", protect, async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required." });
    }

    const isWithinIndia =
      lat >= 8.4 && lat <= 37.6 && lon >= 68.7 && lon <= 97.25;
    if (!isWithinIndia) {
      return res
        .status(403)
        .json({ error: "Restricted to Indian territories only." });
    }

    const currentYear = new Date().getFullYear();
    const startDate = `${currentYear - 20}-01-01`;
    const endDate = `${currentYear - 1}-12-31`;

    const archiveUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean&timezone=auto`;

    const response = await fetch(archiveUrl);
    const climateData = await response.json();

    if (climateData.error) {
      return res
        .status(400)
        .json({ error: "Failed to fetch historical data from Open-Meteo" });
    }

    const yearlyAverages = {};
    climateData.daily.time.forEach((date, index) => {
      const year = date.split("-")[0];
      const temp = climateData.daily.temperature_2m_mean[index];

      if (temp !== null) {
        if (!yearlyAverages[year]) yearlyAverages[year] = { sum: 0, count: 0 };
        yearlyAverages[year].sum += temp;
        yearlyAverages[year].count += 1;
      }
    });

    const trendData = Object.keys(yearlyAverages).map((year) => ({
      year,
      averageTemperature: parseFloat(
        (yearlyAverages[year].sum / yearlyAverages[year].count).toFixed(2),
      ),
    }));

    res.json({ success: true, trends: trendData });
  } catch (error) {
    console.error("Climate API Error:", error);
    res.status(500).json({ error: "Failed to fetch climate analytics." });
  }
});

app.get("/api/history", protect, async (req, res) => {
  try {
    const chatData = await Chat.findOne({ userId: req.userId });

    if (!chatData) {
      return res.json({ success: true, history: [] });
    }

    res.json({ success: true, history: chatData.history });
  } catch (error) {
    console.error("History Fetch Error:", error);
    res.status(500).json({ error: "Failed to retrieve chat history" });
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    next();
  } catch (error) {
    return next(new Error("Authentication error: Invalid token"));
  }
>>>>>>> Stashed changes
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("send_prompt", async (data) => {
    console.log("Received from React:", data.message);

    // TODO: Step 1. Fetch weather data from Open-Meteo API using data.lat/lon
    // TODO: Step 2. Send data.message + weather JSON to the LLM

    // For now, let's just echo it back to test the connection
    const fakeAiResponse = `Server received your message: "${data.message}". AI integration pending!`;

    // Emit the answer back to the frontend
    socket.emit("receive_reply", { reply: fakeAiResponse });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`WeatherGPT server running on port ${PORT}`);
});
