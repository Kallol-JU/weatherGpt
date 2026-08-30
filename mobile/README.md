# WeatherGPT Native Mobile

Expo SDK 54 / React Native mobile frontend for WeatherGPT.

## Structure

- `components/` reusable UI components
- `screens/` app screens
- `services/` backend/API integration
- `theme/` colors, spacing and typography
- `utils/` small helpers

## Run

```powershell
cd mobile
npm install
npx expo start -c
```

This project is designed for Expo Go 54.

## Frontend environment

Create `.env`:

```env
EXPO_PUBLIC_API_URL=http://YOUR-PC-IP:5000
```

Do not put Gemini, MongoDB or JWT secrets in this file.

## Backend

The backend is intentionally not modified by this mobile frontend package.

The API adapter currently expects:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/chat`
- `GET /api/history`

If the existing backend uses Socket.IO for chat instead of `/api/chat`, change only `services/api.js` and keep the UI/components unchanged.

## Voice

The microphone control is deliberately inside `ChatInput`, not a separate screen.

Expo Go can provide the voice UI and text-to-speech, but real speech-to-text generally requires a native speech-recognition module/development build. The UI is structured so that speech recognition can be added later without changing the chat layout.
