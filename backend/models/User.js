import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    preferences: {
      language: { type: String, default: "English" },
      unit: { type: String, enum: ["metric", "imperial"], default: "metric" },
      theme: { type: String, enum: ["light", "dark"], default: "light" },
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
