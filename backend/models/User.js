import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },

    // Web Push / FCM Subscription object for browser push notifications
    pushSubscription: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    preferences: {
      language: { type: String, default: "English" },
      unit: { type: String, enum: ["metric", "imperial"], default: "metric" },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },

    // Emergency alert toggles
    alertSettings: {
      smsEnabled: { type: Boolean, default: false },
      pushEnabled: { type: Boolean, default: true },
      thunderstorm: { type: Boolean, default: true },
      heavyRain: { type: Boolean, default: true },
      highAqi: { type: Boolean, default: true },
      extremeHeat: { type: Boolean, default: true },
    },

    // Primary location monitored by background cron jobs for emergency alerts
    savedLocation: {
      name: { type: String, default: "Howrah" },
      country: { type: String, default: "India" },
      latitude: { type: Number, default: 22.5958 },
      longitude: { type: Number, default: 88.2636 },
    },

    // Broad sector category for system-level alert customization
    sector: {
      type: String,
      enum: [
        "Agriculture",
        "Fisheries & Maritime",
        "Construction & Labor",
        "Logistics & Transport",
        "Public Safety",
        "Urban & General",
      ],
      default: "Urban & General",
    },

    // Specific job role or custom domain (e.g., "Rice Farmer", "Delivery Agent")
    customDomain: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },
  },
  { timestamps: true },
);

// Prevents model re-compilation error in development hot-reloading
export default mongoose.models.User || mongoose.model("User", userSchema);
