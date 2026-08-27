import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import Chat from "./models/Chat.js"; // Ensure you have this file from Phase 2!

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Successfully connected to MongoDB!"))
  .catch((err) => console.error(err));

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("send_prompt", async (data) => {
    try {
      const { message, lat, lon, language = "English", userId } = data;
      console.log(`Received from React: "${message}" (Language: ${language})`);

      // 1. Fetch Real-time Weather (GFS Model)
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m&models=gfs_seamless`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      // 2. Construct the strict Prompt for Gemini
      const systemInstruction = `
        You are WeatherGPT, an AI disaster management assistant.
        The user asked: "${message}"
        Their coordinates are Lat: ${lat}, Lon: ${lon}.
        Live Meteorological Data: ${JSON.stringify(weatherData.current)}
        
        Rules:
        - Analyze the weather data and answer the user's query briefly.
        - If wind_speed_10m is > 40 or precipitation is > 10, start your response with a severe weather warning.
        - YOU MUST RESPOND IN THIS LANGUAGE: ${language}.
      `;

      // 3. Generate the Response via Gemini
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: systemInstruction,
      });
      const finalAnswer = aiResponse.text;

      // 4. Save the conversation context to MongoDB
      await Chat.findOneAndUpdate(
        { userId: userId || socket.id },
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

      // 5. Emit back to the client
      socket.emit("receive_reply", { reply: finalAnswer });
    } catch (error) {
      console.error("AI Routing Error:", error);
      socket.emit("receive_reply", {
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
