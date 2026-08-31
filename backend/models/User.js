import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, default: "" },

    // web Push / FCM Subscription object for browser push notifications
    pushSubscription: { type: Object, default: null },

    preferences: {
      language: { type: String, default: "English" },
      unit: { type: String, enum: ["metric", "imperial"], default: "metric" },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },

    // emergency alert toggles
    alertSettings: {
      smsEnabled: { type: Boolean, default: false },
      pushEnabled: { type: Boolean, default: true },
      thunderstorm: { type: Boolean, default: true },
      heavyRain: { type: Boolean, default: true },
      highAqi: { type: Boolean, default: true },
      extremeHeat: { type: Boolean, default: true },
    },

    // primary location monitored by background cron jobs for emergency alerts
    savedLocation: {
      name: { type: String, default: "Howrah" },
      country: { type: String, default: "India" },
      latitude: { type: Number, default: 22.5958 },
      longitude: { type: Number, default: 88.2636 },
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
