import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import Chat from "./models/Chat.js";
import rateLimit from "express-rate-limit";
import { RateLimiterMemory } from "rate-limiter-flexible";
import authRoutes from "./routes/auth.js";
import { protect } from "./middleware/auth.js";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((err) => console.error("MongoDB connection error:", err));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: "Too many requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", apiLimiter);
app.use("/api/auth", authRoutes);

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
      model: "gemini-3.5-flash",
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

// socket auth middleware
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

  socket.on("send_prompt", async (data) => {
    // rate limiter checking
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

    try {
      const isWithinIndia =
        lat >= 8.4 && lat <= 37.6 && lon >= 68.7 && lon <= 97.25;
      if (!isWithinIndia) {
        return socket.emit("receive_reply_done", {
          reply: "Error: This portal is restricted to Indian territories only.",
        });
      }
      console.log(`Received from React: "${message}" (Language: ${language})`);

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
  The user asked: "${message}"
  Official Location: ${locationContext} (Lat: ${lat}, Lon: ${lon}).
  Live Meteorological Data: ${JSON.stringify(weatherData)}
  
  Rules:
  - Analyze the data and answer briefly.
  - Use Indian Meteorological Department (IMD) terminology (e.g., use "Cyclonic Storm" instead of "Hurricane").
  - If conditions are severe, advise citizens to contact the NDMA helpline at 1078.
  - YOU MUST RESPOND IN THIS LANGUAGE: ${language}.
      `;

      const streamResult = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: systemInstruction,
      });

      let finalAnswer = "";

      for await (const chunk of streamResult) {
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

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () =>
  console.log(`WeatherGPT server running on port ${PORT}`),
);
