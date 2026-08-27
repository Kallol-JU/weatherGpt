import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // frontend port no
    methods: ["GET", "POST"],
  },
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
