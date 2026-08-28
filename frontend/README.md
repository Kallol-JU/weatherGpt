# WeatherGPT Frontend

A ChatGPT-style conversational weather frontend for the SIH WeatherGPT project.

## What is implemented

1. Welcome / onboarding experience
2. ChatGPT-like conversation layer
3. Forecast layer with current conditions and 7-day forecast
4. Weather alerts and safety layer
5. Location selection
6. Domain advisories (farming, aviation, marine, urban)
7. Climate / historical analytics layer
8. Voice interaction UI
9. Conversation history
10. Preferences, language toggle, dark mode, responsive mobile UI

The home screen intentionally stays simple. Detailed weather information appears as part of the conversation or when the user opens a dedicated layer.

## Run

```bash
npm install
npm run dev
```

If PowerShell blocks `npm.ps1` on Windows, use:

```powershell
npm.cmd install
npm.cmd run dev
```

## Backend handoff

`src/services/api.js` contains the frontend API adapter.

Create `.env` from `.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

The expected adapter endpoints are currently:

- `POST /api/chat`
- `GET /api/weather?location=...`

These can be changed in `src/services/api.js` once the backend contract is finalized.

Until the backend is connected, the chat uses local demo responses so the complete UI can be demonstrated without an API key.
