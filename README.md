# 🌌 StudentVerse — Your Academic Universe

> **State-of-the-Art Cinematic Student Workspace & Dashboard**
> Built with HTML5, Vanilla Modern CSS, JavaScript (ES6+), Web Audio API, Three.js & GSAP.

---

## ✨ Features & Architecture

* **🔮 3D Three.js Book Portal**: Procedural leather & gold filigree 3D book cover with real-time lighting, interactive hover physics, and smooth camera dive transitions (`index.html`).
* **📊 Unified Reactive State Engine (`js/store.js`)**: Single source of truth managing Profile, Academics, Goals, Timetable, Wellness, and Activity feeds across all pages in real-time.
* **🎓 Dynamic GPA & CGPA Calculator (`academics.html`)**: Real-time course grade simulator with credit weight multiplier and live syllabus topic checkboxes.
* **▦ Interactive Weekly Timetable (`timetable.html`)**: Interactive class matrix with day filtering and customizable subject, room, professor, and color modal editor.
* **🎯 Category Goals Tracker (`goals.html`)**: Interactive progress sliders with +10%/-10%/Done triggers and category filters (`Academics`, `Project`, `Personal`, `Wellness`).
* **⏱ Focus Sanctuary & Pomodoro Engine (`wellness.html`)**: Working 25m/5m/15m countdown timer with procedural Web Audio ambient noise generators (Rain, Space Drone, White Noise), mood log, and daily water intake tracker.
* **💳 3D Holographic ID Card (`profile.html`)**: Mouse-tilt physics, profile editor with instant cross-page sync, and full JSON Backup/Restore suite.
* **⚡ Global Command Palette (`Ctrl + K` / `Cmd + K`)**: Keyboard-driven quick search to jump between pages and trigger instant actions from anywhere.
* **📱 Progressive Web App (PWA) & Offline Ready**: Service worker (`sw.js`) and `manifest.json` for installable desktop/mobile experience with 100% offline support.

---

## 🚀 How to Run Locally

You don't need any complex build steps! Simply:

1. Double-click `index.html` in your file explorer, OR
2. Use VS Code Live Server / Python HTTP Server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
3. Open `http://localhost:8000` or `http://localhost:3000` in your browser.

---

## 🌐 1-Click Free Deployment Guide

### Option 1: Vercel (Recommended)
1. Push this folder to a GitHub repository or drag-and-drop into [Vercel Dashboard](https://vercel.com).
2. The included `vercel.json` will automatically configure clean URLs and caching headers.

### Option 2: Netlify
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop this project folder.
3. The included `_redirects` file will handle routing automatically.

### Option 3: GitHub Pages
1. Push code to GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Branch**, select `main` (or `master`) and root `/` folder, then click **Save**.

---

## 📁 Project Directory Layout

```
StudentVerse/
├── assets/
│   └── icons/
│       └── favicon.svg           # High-res SVG favicon & PWA icon
├── css/
│   ├── base.css                  # Design tokens, variables, resets & scrollbars
│   ├── sidebar.css               # Unified sidebar, topbar & mobile drawer
│   ├── components.css            # Modals, toasts, command palette (Ctrl+K), badges
│   ├── dashboard.css             # Dashboard widgets & workload analytics
│   ├── academics.css             # GPA summary & course checklist styles
│   ├── timetable.css             # Weekly schedule matrix styles
│   ├── goals.css                 # Goals tracker & category filter styles
│   ├── wellness.css              # Pomodoro timer, mood & water ring styles
│   └── profile.css               # 3D ID Card & profile form styles
├── js/
│   ├── store.js                  # Centralized LocalStorage State Engine
│   ├── audio.js                  # Web Audio API Sound Synthesizer
│   ├── app.js                    # Global Coordinator, Command Palette & Toasts
│   ├── dashboard.js              # Dashboard data-binding
│   ├── academics.js              # GPA Calculator & syllabus tracker
│   ├── timetable.js              # Weekly schedule controller
│   ├── goals.js                  # Goals controller & progress sliders
│   ├── wellness.js               # Pomodoro timer & ambient noise player
│   └── profile.js                # Profile editor, 3D ID card & JSON backup
├── index.html                    # 3D Three.js Book Entrance
├── dashboard.html                # Main Dashboard Hub
├── academics.html                # Academics & GPA Calculator
├── timetable.html                # Interactive Timetable
├── goals.html                    # Goals & Milestones
├── wellness.html                 # Wellness & Pomodoro Sanctuary
├── profile.html                  # Student Identity & 3D ID Card
├── manifest.json                 # Web App Manifest
├── sw.js                         # Offline Service Worker
├── vercel.json                   # Vercel Deployment Configuration
└── _redirects                    # Netlify & Cloudflare Redirects
```
