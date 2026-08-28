import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to backend! Sending test prompt...");

  socket.emit("send_prompt", {
    userId: "test_user_123",
    message: "Is it safe to go out and harvest my crops today?",
    lat: 22.59,
    lon: 88.31,
    language: "Bengali",
  });
});

socket.on("receive_reply", (data) => {
  console.log("\n🤖 WeatherGPT Response:");
  console.log("====================================");
  console.log(data.reply);
  console.log("====================================\n");

  process.exit();
});
