# 💬 OpenChat — Simple Public Messaging

A clean, modern, mobile-friendly open messaging application. No login, no accounts, no personas required. Anyone on the web can read and post messages, and all posts are saved permanently on disk.

---

## ✨ Features

- **Permanent Message Storage**:
  - All messages are immediately saved to disk on the server in `server/data/messages.json`.
  - Cached in `localStorage` so messages appear instantaneously on any device or reload.
  - Posts remain on the site permanently for anyone on the web to see.

- **No Sign-In / No Persona Required**:
  - Instant access. As soon as you open the page, you're in the chat room.
  - You can write your name or keep the auto-assigned guest name right in the input bar.

- **Clean, Normal Messaging Experience**:
  - Clean message bubbles with sender names, colorful avatar initials, and timestamps.
  - Standard emojis (`😊`, `😂`, `❤️`, `👍`, `🔥`, `🎉`, etc.) and text shortcuts (`:)`, `<3`, `xD`).
  - Image / photo attachments with click-to-expand lightbox view.
  - Real-time live updates via WebSockets and multi-tab sync.

- **100% Mobile Friendly**:
  - Dynamic viewport height (`100dvh`) with safe-area padding for mobile browsers (iOS Safari, Android Chrome).
  - Pinned bottom input bar with comfortable touch targets.
  - Responsive design that looks great on phones, tablets, and desktops.

- **Completely Silent**:
  - 0dB audio — no sound effects or chimes.

---

## 🚀 How to Run

```bash
# In the project directory:
npm start
```
Then open [http://localhost:3000](http://localhost:3000) in your web browser.

### For Development (with live-reload):
```bash
npm run dev
```
Runs Vite on port 5173 with proxying to the server on port 3000.
