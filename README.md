<<<<<<< HEAD
```
weatherGpt
├─ backend
│  ├─ .env
│  ├─ Chat.js
│  ├─ models
│  │  └─ Chat.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ server.js
│  └─ test-client.js
├─ frontend
│  ├─ .oxlintrc.json
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  └─ services
│  │     └─ api.js
│  └─ vite.config.js
└─ LICENSE

```

```
weatherGpt
├─ backend
│  ├─ .env
│  ├─ middleware
│  │  └─ auth.js
│  ├─ models
│  │  ├─ Chat.js
│  │  └─ User.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  └─ auth.js
│  ├─ server.js
│  └─ test-client.js
├─ frontend
│  ├─ .oxlintrc.json
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  └─ services
│  │     └─ api.js
│  └─ vite.config.js
├─ LICENSE
└─ README.md

```
=======
# WeatherGPT — Neumorphic Frontend + Original Backend

This package keeps the supplied backend code unchanged and replaces only the frontend UI/application.

Frontend goals:
- ChatGPT-style WeatherGPT experience
- Dark neumorphic visual system based on the supplied design reference
- Component-first structure under `frontend/src/components`
- Socket.IO streaming chat with the existing backend
- Login/register using the existing backend auth routes
- Backend chat history integration
- Forecast/dashboard data using Open-Meteo without exposing backend secrets
- Responsive layout

See `frontend/README.md` for setup.
>>>>>>> 0ec5b96493d34b085eff99d68c612fdfb978abd6
