# NaviGreat — Frontend

> **Navigate to greatness.** A mentorship platform that connects ambitious engineering students with verified seniors from IITs, NITs, and top universities for 1‑on‑1 guidance.

NaviGreat lets students find and book sessions with mentors, chat in real time, and join live classes — while mentors build their profile, schedule sessions, share resources, and earn. This repository is the **React web client**; it talks to the [NaviGreat backend](https://github.com/prabhatsingh9893/navigreat-backend-98) over REST + WebSockets.

<p align="left">
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white">
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-realtime-010101?logo=socketdotio&logoColor=white">
</p>

---

## ✨ Features

### For students
- **Discover mentors** — search and filter by branch (CSE, ECE, Mechanical…), with verified badges and session fees.
- **Rich mentor profiles** — bio, expertise, "what you'll get", schedule, and recorded sessions.
- **Book priority 1‑on‑1 sessions** — secure checkout via Paytm (sandbox‑ready).
- **Real‑time chat** — message any mentor, with online status, typing indicators, read receipts, and voice notes.
- **Student dashboard** — track booking requests (pending / confirmed), manage your profile.

### For mentors
- **Mentor dashboard** — verification status, session fee, and uploaded resources at a glance.
- **Multi‑chat inbox** — every student who messages or books you appears in one sidebar, sorted by recency with unread badges.
- **Schedule live classes** and **upload content** (YouTube lectures) for students.
- **Join live sessions** via the integrated Zoom Meeting SDK.

### Platform‑wide
- 🎨 **"Summit" design system** — an ownable teal → cyan → gold identity, applied consistently across every page.
- 🌗 **Light & dark mode** throughout, with `prefers-reduced-motion` support.
- 📱 **Responsive** — works from mobile to desktop.
- 🔐 **Auth** — email/password and Google Sign‑In (Firebase).

---

## 🧱 Tech stack

| Area | Technology |
|------|-----------|
| Framework | **React 19** + **Vite 7** |
| Styling | **Tailwind CSS 3** + a custom design-token layer (`src/index.css`) |
| Routing | **react-router-dom 7** (HashRouter) |
| State | **Redux** + redux-thunk, React Context (theme) |
| Realtime | **socket.io-client** |
| Auth | **Firebase** (Google OAuth) + JWT from the backend |
| Animation | **Framer Motion** |
| Icons | **lucide-react** |
| Notifications | **react-hot-toast** |
| Live video | **@zoom/meetingsdk** |

---

## 🏗️ Architecture

```
┌────────────────────────┐        REST  /api/*           ┌────────────────────────┐
│  navigreat-frontend-98 │  ───────────────────────────▶ │  navigreat-backend-98  │
│  (this repo · React)   │        WebSocket /socket.io    │  (Express · MongoDB)   │
│                        │  ◀─────────────────────────── │                        │
└────────────────────────┘                                └────────────────────────┘
```

- In **development**, Vite proxies `/api` and `/socket.io` to `http://localhost:5000` (see `vite.config.js`), so there are no CORS headaches.
- In **production**, the client points at the hosted backend (`src/config.js`).
- The app uses **hash routing** (`/#/mentors`), so it deploys cleanly to static hosts without server rewrites.

---

## 🚀 Getting started

### Prerequisites
- **Node.js ≥ 18**
- The **[backend](https://github.com/prabhatsingh9893/navigreat-backend-98)** running locally on port `5000` (for full functionality)

### 1. Clone & install
```bash
git clone https://github.com/prabhatsingh9893/navigreat-frontend-98.git
cd navigreat-frontend-98
npm install
```

### 2. Configure environment
Create a `.env` file in the project root (optional — only needed for push notifications and Zoom live sessions):

```env
# Firebase Cloud Messaging key for web push notifications
VITE_FIREBASE_VAPID_KEY=your_firebase_vapid_key

# Zoom Meeting SDK client id for live sessions
VITE_ZOOM_CLIENT_ID=your_zoom_client_id
```

> Firebase web config lives in `src/firebaseConfig.js`. Replace the values there with your own Firebase project if you're deploying your own instance.

### 3. Run
```bash
npm run dev
```
Open **http://localhost:5173**. Make sure the backend is also running so login, mentors, chat, etc. work.

---

## 📜 Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server (with API/socket proxy) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## 📁 Project structure

```
src/
├── assets/            # Logos & images
├── components/        # Shared UI — Header, Footer, AuthLayout, Avatar, Animations, SkeletonLoader…
├── context/           # ThemeContext (light/dark)
├── pages/             # Route screens
│   ├── HomePage.jsx        AboutPage.jsx       ContactPage.jsx
│   ├── LoginPage.jsx       SignupPage.jsx      MentorSignupPage.jsx
│   ├── MentorsPage.jsx     MentorProfile.jsx   ChatPage.jsx
│   ├── DashboardPage.jsx   LiveSession.jsx     AdminPage.jsx …
├── utils/             # security, upload helpers
├── config.js          # API base URL (dev proxy vs prod)
├── firebaseConfig.js  # Firebase init
├── index.css          # Tailwind + the Summit design system
├── App.jsx            # Routes + layout shell
└── main.jsx           # Entry (Router, ThemeProvider, MotionConfig)
```

---

## 🎨 Design system — "Summit"

The UI is built on a small set of tokens defined in `src/index.css`:

- **Primary** teal `#0d9488` → **secondary** cyan `#0891b2` → **sky** `#0ea5e9` (the core gradient)
- **Accent** gold/amber `#f59e0b` for highlights (sparkles, stars, ratings)
- Reusable utilities: `.btn-primary`, `.btn-secondary`, `.input-premium`, `.feature-card`, `.text-gradient-blue`, mesh‑gradient backgrounds, and glassmorphism helpers

Every page supports light and dark mode and respects the user's reduced‑motion preference.

---

## ☁️ Deployment

The app is a static SPA and deploys to **Vercel** (config in `vercel.json`) or any static host:

```bash
npm run build      # outputs dist/
```

Set production env vars (`VITE_*`) in your host's dashboard, and ensure `src/config.js` points at your deployed backend URL.

---

## 🤝 Contributing

1. Fork the repo and create a feature branch: `git checkout -b feature/your-idea`
2. Make your changes (keep them on‑brand — see the Summit tokens above)
3. Run `npm run build` and `npm run lint` to verify
4. Commit, push, and open a Pull Request describing what changed and why

---

## 🔗 Related

- **Backend:** https://github.com/prabhatsingh9893/navigreat-backend-98

---

<p align="center">Made with 💚 for students chasing big goals.</p>
