import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import Chat from "./models/Chat.js";
import User from "./models/User.js";
import rateLimit from "express-rate-limit";
import { RateLimiterMemory } from "rate-limiter-flexible";
import authRoutes from "./routes/auth.js";
import { protect } from "./middleware/auth.js";
import jwt from "jsonwebtoken";
import userRoutes from "./routes/user.js";
// 1. Updated import to use the new triggerAlerts function
import { triggerAlerts } from "./services/alertWorker.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB!");
    // 2. Removed initAlertWorker() from startup; it is now an HTTP trigger
  })
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

app.post("/api/alerts/subscribe", protect, async (req, res) => {
  try {
    const { phone, smsEnabled, pushEnabled, pushSubscription } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          phone: phone || "",
          "alertSettings.smsEnabled": smsEnabled,
          "alertSettings.pushEnabled": pushEnabled,
          pushSubscription: pushSubscription,
        },
      },
      { new: true },
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    return res
      .status(200)
      .json({ success: true, message: "Alert preferences securely saved." });
  } catch (error) {
    console.error("Alert Subscription Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to update alert preferences." });
  }
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

    res.json({
      success: true,
      aiSummary: aiResponse.text,
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

// 3. New endpoint for the external cron service to trigger alerts
app.get("/api/trigger-cron", async (req, res) => {
  try {
    const result = await triggerAlerts();
    res.status(200).json({
      success: true,
      message: "Alerts processed successfully.",
      details: result,
    });
  } catch (error) {
    console.error("Cron trigger error:", error);
    res.status(500).json({ success: false, error: error.message });
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
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("stop_prompt", () => {
    socket.stopStream = true;
  });

  socket.on("send_prompt", async (data) => {
    socket.stopStream = false;

    try {
      if (typeof socketLimiter !== "undefined") {
        await socketLimiter.consume(socket.handshake.address);
      }
    } catch (rejRes) {
      return socket.emit("receive_reply_done", {
        reply:
          "Rate limit reached. Please wait a minute before sending another prompt.",
      });
    }

    const { message, lat, lon, language = "English" } = data || {};

    if (!message || !isWeatherOrTerm(message)) {
      const genericReply =
        "I am WeatherGPT, your dedicated AI weather assistant. I can only assist you with weather forecasts, meteorological data, climate trends, weather alerts, or explaining weather-related terms. Please ask me a weather-related question!";

      socket.emit("receive_reply_chunk", { chunk: genericReply });
      socket.emit("receive_reply_done", { reply: genericReply });
      return;
    }

    try {
      console.log(`Received from React: "${message}" (Language: ${language})`);

      const isWithinIndia =
        lat >= 8.4 && lat <= 37.6 && lon >= 68.7 && lon <= 97.25;
      if (!isWithinIndia) {
        return socket.emit("receive_reply_done", {
          reply: "Error: This portal is restricted to Indian territories only.",
        });
      }

      // Fetch User Persona for dynamic prompt generation
      let userPersona = "General Citizen";
      const userDoc = await User.findById(socket.userId);
      if (userDoc) {
        userPersona = userDoc.customDomain
          ? `${userDoc.customDomain} (${userDoc.sector} sector)`
          : `${userDoc.sector} worker`;
      }

      const mapTilerUrl = `https://api.maptiler.com/geocoding/${lon},${lat}.json?key=${process.env.MAPTILER_API_KEY}`;
      const geoRes = await fetch(mapTilerUrl);
      const geoData = await geoRes.json();

      let locationContext = "India";
      if (geoData.features && geoData.features.length > 0) {
        const bestMatch = geoData.features[0];
        const state =
          geoData.features.find((f) => f.place_type.includes("region"))?.text ||
          "";
        locationContext = `${bestMatch.text}, ${state}`.trim();
      }

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      if (weatherData.cod && weatherData.cod !== 200) {
        throw new Error(weatherData.message || "Weather API Error");
      }

      const systemInstruction = `
        You are WeatherGPT, an AI disaster management assistant for the Indian government.

        User Message: "${message}"
        Target Language Preference: ${language}
        Official Location: ${locationContext} (Lat: ${lat}, Lon: ${lon})
        User Profile / Persona: ${userPersona}
        Live Meteorological Data: ${JSON.stringify(weatherData)}
        
        CRITICAL INSTRUCTION: Tailor your advice specifically for a ${userPersona}. 
        - Do not list irrelevant technical data. Keep it actionable for their specific daily work context.
        
        LANGUAGE RULES:
        - You MUST respond fluently in the language requested by the user.
        - If the user explicitly asks to write in a specific language inside their message (e.g., "write in Bengali"), OVERRIDE the Target Language Preference and respond ENTIRELY in that requested language.
        - NEVER output disclaimers saying responses are restricted to English.
        
        SAFETY & TERMINOLOGY:
        - Analyze the weather data and respond concisely.
        - Use Indian Meteorological Department (IMD) terminology.
        - If weather conditions are severe, advise citizens to call the NDMA helpline at 1078.
      `;

      const streamResult = await ai.models.generateContentStream({
        model: "gemini-3.6-flash",
        contents: systemInstruction,
      });

      let finalAnswer = "";

      for await (const chunk of streamResult) {
        if (socket.stopStream) {
          console.log(`Stream aborted by user: ${socket.id}`);
          break;
        }

        const chunkText = chunk.text;
        if (chunkText) {
          finalAnswer += chunkText;
          socket.emit("receive_reply_chunk", { chunk: chunkText });
        }
      }

      socket.emit("receive_reply_done", { reply: finalAnswer });

      await Chat.findOneAndUpdate(
        { userId: socket.userId },
        {
          $set: { location: { lat, lon } },
          $push: {
            history: [
              { role: "user", message: message },
              { role: "model", message: finalAnswer },
            ],
          },
        },
        { upsert: true, returnDocument: "after" },
      );
    } catch (error) {
      console.error("AI Routing Error:", error);
      socket.emit("receive_reply_done", {
        reply: "Error processing the weather data. Please try again.",
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

//done
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`WeatherGPT server running on port ${PORT}`),
);
