# 3:17 — Mobile Mystery Investigation Game

> **"Every phone has a story."**

**3:17** is an immersive, tactile mobile detective investigation game built with React, TypeScript, and Vite. Rather than presenting a generic puzzle or visual novel interface, **3:17** places players in the shoes of an investigator inspecting a recovered smartphone belonging to a vanished data analyst in the middle of a dark investigation room.

---

## 🔍 Game Experience & Architecture

```
INVESTIGATION ROOM
  │
  ├─── 2.5D INVESTIGATION DESK (Physical Interactive Props)
  │     ├── Sarah's Recovered Phone (ITEM 01 in Evidence Sleeve)
  │     ├── Manila Case Dossier (#001 — Confidentially Stamped)
  │     ├── Investigator's Field Notebook (Spiral-bound Questions & Facts)
  │     ├── City Transit & Surveillance Grid Map
  │     ├── Micro-Cassette Audio Recorder & Wire
  │     ├── Vintage Desk Lamp (Togglable Warm Tungsten Light Cone)
  │     └── Official Accusation & Theory Report Folder
  │
  ├─── NOVA OS (Sarah's Fictional Smartphone Interface)
  │     ├── Lock Screen (03:17 Ambient Clock, Incoming Notifications & Decrypt)
  │     ├── Messages App (Conversations with Alex, Maya, Ryan, Daniel, Unknown)
  │     ├── Photos / Gallery App (10 authentic personal photos + EXIF metadata)
  │     ├── Call Logs & Voicemails (Suspicious calls & recordings)
  │     ├── Transit Maps & Geolocation Pins
  │     ├── Notes & Secret Journal Entries
  │     └── Vault / Encrypted Files (Passcode-protected evidence)
  │
  └─── WALL-MOUNTED INVESTIGATION CORKBOARD
        ├── Physical Pushpins & Red Thread Links
        ├── Sparse Non-Spoiler State 0 Progression
        ├── Dynamic Clue Connection & Contradiction Mechanic
        └── Real-time Case Timeline Discovery
```

---

## ✨ Features

- **No Card-Based UI Dashboard**: Built as an authentic 2.5D physical environment with natural prop overlaps, directional lighting, and realistic tactile lift interactions.
- **Authoritative 42-Asset Visual Library**: Complete production assets including canonical character portraits, real personal phone gallery imagery, location and surveillance clues, NOVA wallpapers, and cinematic case art.
- **Interactive Phone OS**: Explore Sarah's smartphone across Messages, Photos, Phone, Maps, Notes, Browser, Files, and Voice Memos.
- **Procedural Acoustic Sound Engine**: Synthesized physical audio cues via the Web Audio API for desk lamp toggling, paper rustling, spiral notebook flipping, cassette clicks, corkboard pushpins, clue discoveries, and deduction fanfares with zero external audio file dependencies.
- **Deduction & Contradiction System**: Connect two pieces of logged evidence on the physical corkboard to generate logical investigative insights.
- **Accusation & Theory Builder**: File the final formal case report with suspect identification, motive, timeline evidence, and escape route.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Vanilla CSS with 2.5D perspective transforms, dynamic lighting overlays, and responsive mobile chassis container
- **Audio**: Web Audio API procedural acoustic sound synthesizer
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm / yarn / pnpm

### Installation & Local Run

```bash
# Clone the repository
git clone https://github.com/LakhanSingh07/three-seventeen.git

# Navigate to project directory
cd three-seventeen

# Install dependencies
npm install

# Start local dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production

```bash
npm run build
```

---

## 📜 License

Private & Confidential • Copyright (c) 2026. All rights reserved.
