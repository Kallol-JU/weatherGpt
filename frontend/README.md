# WeatherGPT Frontend

This frontend is designed around the provided WeatherGPT backend without modifying the backend code.

## Run

Open this folder in VS Code:

```text
WeatherGPT-Neumorphic-Full-Frontend/
└── frontend/
```

Install and run:

```powershell
npm.cmd install
npm.cmd run dev
```

## Backend connection

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

Use the same port configured by `backend/.env` (`PORT`).

Start the backend separately:

```powershell
cd ..\backend
npm.cmd install
node server.js
```

## What is connected

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/history` with Bearer token
- Socket.IO `send_prompt`
- Socket.IO `receive_reply_chunk`
- Socket.IO `receive_reply_done`
- Browser-side geocoding + Open-Meteo forecast for dashboard visualizations

The backend was intentionally left unchanged.

## Important backend environment

The supplied backend code reads these values:

- `PORT`
- `GEMINI_API_KEY`
- `MONGO_URI`
- `JWT_SECRET`
- `OPENWEATHER_API_KEY`

Keep these secrets in `backend/.env`, never in the React frontend.
