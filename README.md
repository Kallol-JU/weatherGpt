# WeatherGPT

WeatherGPT is an AI-powered, Indian government-compliant meteorological disaster management and weather forecasting web application designed for the Indian territory. It combines real-time weather metrics with a conversational AI assistant, location-based mapping, sector-specific advisories, and automated emergency weather alerts.

## 🔗 Live Demo

- **Frontend Application:** [https://weather-gpt-gamma.vercel.app/](https://weather-gpt-gamma.vercel.app/)
- **Backend API Service:** [https://weathergpt-backend-5p0l.onrender.com](https://weathergpt-backend-5p0l.onrender.com)

---

## What is WeatherGPT Basically?

WeatherGPT acts as an intelligent digital assistant for citizens, farmers, and administrators. It provides:

- **Conversational AI Weather Guidance:** Ask questions about current conditions, upcoming storms, or weather terminology and receive real-time streaming answers powered by Google Gemini and live OpenWeather data.
- **Severe Weather & Disaster Alerts:** Automatic background monitoring that checks weather thresholds and pushes emergency SMS/browser notifications if severe conditions (high winds or heavy rain) are detected.
- **Sector-Specific Advisories:** IMD-aligned recommendations tailored for industries like agriculture, aviation, and marine operations.
- **Climate & Historical Analytics:** 20-year trend tracking and temperature analytics for any given location.

---

## How to Use the Website

1. **Access the App:** Open the live Vercel link in any modern browser.
2. **Set Your Location:**
   - The app will automatically attempt to detect your location via browser GPS.
   - You can also click the location search bar in the top navigation to search for any city or region.
3. **Explore the Dashboard & Tabs:**
   - **Chat Panel:** Type weather questions or click quick-prompt chips (_"Current weather"_, _"5 day forecast"_, _"Weather alerts"_) to talk directly with the AI.
   - **Forecast & Trends:** View hourly and 5-day breakdowns or multi-year temperature trends.
   - **Advisories & Climate:** Access government-compliant guidelines and maps.
4. **Sign In / Create an Account:**
   - Click **Sign In / Sign Up** on the top right to register with your phone number and email.
   - Logging in enables chat history tracking, custom location memory, and automated emergency SMS alerts.
5. **Customize Settings:** Open the settings panel (gear icon) to toggle Dark Mode, switch temperature units ($^\circ\text{C}$ / $^\circ\text{F}$), or change the assistant language (English, Hindi, Bengali, Tamil, Telugu).

---

## Local Development & Setup

If you want to run the project locally on your machine:

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/Kallol-JU/weatherGpt.git](https://github.com/Kallol-JU/weatherGpt.git)
   cd weatherGpt
   ```
   Configure the Backend:
   cd backend
   npm install
   Create a .env file in the backend/ directory containing your keys (PORT, MONGO_URI, JWT_SECRET, GEMINI_API_KEY, OPENWEATHER_API_KEY, MAPTILER_API_KEY, Twilio credentials, and VAPID keys).
   Start the server:
   npm run dev
   Configure the Frontend:
   cd ../frontend
   npm install
   Start the Vite development server:
   npm run dev
   Open http://localhost:5173 in your browser.
