import cron from "node-cron";
import Twilio from "twilio";
import webPush from "web-push";
import User from "../models/User.js";

const twilioClient = Twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

webPush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY,
);

export function initAlertWorker() {
  cron.schedule("*/15 * * * *", async () => {
    console.log("🔍 Running weather alert check...");
    try {
      const users = await User.find({
        $or: [
          { "alertSettings.smsEnabled": true },
          { "alertSettings.pushEnabled": true },
        ],
      });

      for (const user of users) {
        if (!user.savedLocation?.latitude) continue;

        const { latitude, longitude, name: locationName } = user.savedLocation;
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation_probability,wind_speed_10m&forecast_hours=3`,
        );
        const data = await res.json();

        const maxRainProb = Math.max(
          ...(data.hourly?.precipitation_probability || [0]),
        );
        const maxWind = Math.max(...(data.hourly?.wind_speed_10m || [0]));

        if (maxRainProb >= 85 || maxWind > 55) {
          const alertMessage = `⚠️ [WeatherGPT Alert] Severe weather expected in ${locationName} within 2-3 hours! Rain chance: ${maxRainProb}%, Max wind: ${maxWind} km/h.`;

          // 1. Send SMS via Twilio
          if (user.alertSettings.smsEnabled && user.phone) {
            try {
              await twilioClient.messages.create({
                body: alertMessage,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.phone,
              });
              console.log(`📱 SMS sent to ${user.phone}`);
            } catch (err) {
              console.error(`SMS Error (${user.phone}):`, err.message);
            }
          }

          // 2. Send Browser Web Push
          if (user.alertSettings.pushEnabled && user.pushSubscription) {
            try {
              const payload = JSON.stringify({
                title: "WeatherGPT Alert",
                body: alertMessage,
              });
              await webPush.sendNotification(user.pushSubscription, payload);
              console.log(`🔔 Web Push sent to ${user.name}`);
            } catch (err) {
              console.error(`Push Error (${user.name}):`, err.message);
            }
          }
        }
      }
    } catch (error) {
      console.error("Alert worker error:", error);
    }
  });
}
