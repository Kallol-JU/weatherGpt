import { io } from "socket.io-client";

// Connect to your local Express server
const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to backend! Sending test prompt...");

  // Pretend to be a user sending a message from the React UI
  socket.emit("send_prompt", {
    userId: "test_user_123",
    message: "Is it safe to go out and harvest my crops today?",
    lat: 22.59, // Coordinates for Howrah
    lon: 88.31,
    language: "Bengali", // Testing the SIH multilingual requirement
  });
});

// Listen for the AI's final translated response
socket.on("receive_reply", (data) => {
  console.log("\n🤖 WeatherGPT Response:");
  console.log("====================================");
  console.log(data.reply);
  console.log("====================================\n");

  // Close the script automatically after getting the reply
  process.exit();
});
