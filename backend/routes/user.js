import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Fetch current user preferences, phone, and alert settings
router.get("/settings", protect, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      preferences: user.preferences,
      phone: user.phone,
      alertSettings: user.alertSettings,
      savedLocation: user.savedLocation,
    });
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update general preferences (language, unit, theme)
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

// Update emergency alert settings, phone number, push subscription, and location
router.post("/alert-settings", protect, async (req, res) => {
  try {
    const { phone, alertSettings, pushSubscription, savedLocation } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          ...(phone !== undefined && { phone }),
          ...(alertSettings && { alertSettings }),
          ...(pushSubscription && { pushSubscription }),
          ...(savedLocation && { savedLocation }),
        },
      },
      { new: true },
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json({
      success: true,
      phone: updatedUser.phone,
      alertSettings: updatedUser.alertSettings,
      savedLocation: updatedUser.savedLocation,
    });
  } catch (error) {
    console.error("Update Alert Settings Error:", error);
    res.status(500).json({ error: "Failed to update alert settings" });
  }
});

// Fetch public VAPID key for web push subscriptions
router.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || "" });
});

export default router;
