import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// fetching current user pref
router.get("/settings", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// updating user pref
router.put("/settings", protect, async (req, res) => {
  try {
    const { language, unit, theme } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (language) user.preferences.language = language;
    if (unit) user.preferences.unit = unit;
    if (theme) user.preferences.theme = theme;

    await user.save();

    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    console.error("Update Settings Error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
