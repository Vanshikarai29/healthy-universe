# 🌿 Healthy Universe
### Healthcare Social Network — Startup Project

---

## 📁 Project Structure

```
healthy-universe/
│
├── index.html          ← Main entry point (all pages)
│
├── css/
│   ├── styles.css      ← Base styles, sidebar, feed, layout
│   └── components.css  ← Explore, notifications, profile, modal
│
├── js/
│   ├── data.js         ← Posts & notifications data
│   └── app.js          ← All interactivity & rendering logic
│
└── README.md           ← This file
```

---

## 🚀 How to Run

**No build tools needed.** Just open in a browser:

```bash
# Option 1 — Double click
open index.html

# Option 2 — Local server (recommended)
cd healthy-universe
python3 -m http.server 3000
# Visit → http://localhost:3000
```

> ⚠️ Requires internet connection for Google Fonts & Unsplash images.

---

## 🖥️ Pages

| Page | Description |
|------|-------------|
| **Home Feed** | Social feed of posts from healthcare professionals |
| **Explore** | Search, filter tabs, trending topics, suggested creators |
| **Create Post** | Modal with category chips, hashtags, trusted toggle |
| **Notifications** | Activity feed with icon badges |
| **Profile** | Banner, stats, bio, tags, post grid |

---

## ✨ Features

- ✅ Like / Unlike posts with live count update
- ✅ Save / Unsave posts
- ✅ Follow / Unfollow creators
- ✅ Clickable trending topic cards
- ✅ Filter tabs on Explore page
- ✅ Create Post modal with category selection
- ✅ Trusted Content toggle
- ✅ Notifications — mark individual or all as read
- ✅ Profile tabs (Posts / Saved / About)
- ✅ Grid / List view toggle
- ✅ Toast notifications for all actions
- ✅ ESC key closes modal
- ✅ Responsive layout

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary | `#1DB954` (Healthy Green) |
| Background | `#f0f2f5` |
| Card | `#ffffff` |
| Text | `#111827` |
| Muted | `#6b7280` |
| Radius | `14px` |
| Font | DM Sans (Google Fonts) |

---

## 💡 Startup Concept

**Healthy Universe** is a verified-first healthcare social platform where doctors, nutritionists, fitness coaches, and mental health professionals share evidence-based content. The **"Trusted Content"** stamp solves the medical misinformation problem rampant on generic social networks.

**Target Users:** Healthcare professionals & health-conscious individuals  
**Monetization:** Creator subscriptions · Promoted trusted content · Analytics dashboard  
**Key Differentiator:** Verified credentials + Trusted Content system

---

*Startup Project — Built with HTML, CSS & Vanilla JS. Zero dependencies.*
