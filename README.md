# CarromVerse 🎯

> **A Premium Mobile Carrom Game with Authentic Physics & Offline-First Architecture**

CarromVerse brings the classic tabletop board game of Carrom to mobile devices with physics calibrated using Matter.js and Phaser 3, designed with an offline-first architecture supporting 2-player, 3-player, 4-player individual, and 4-player 2v2 team matches.

---

## 🏗️ System Architecture

CarromVerse is organized as a scalable monorepo separating mobile presentation, game engine simulation, game logic rules, and shared types:

```
CarromVerse/
├── apps/
│   └── mobile/              # Expo Router mobile app (React Native + TypeScript)
├── packages/
│   ├── shared-types/        # Shared data contracts (Player, Turn, Score, etc.)
│   ├── shared-utils/        # Vector math, UUID, validation, event emitters
│   ├── game-logic/          # Pure TypeScript Carrom rules & turn rotation
│   └── game-engine/         # Phaser 3 + Matter.js physics & bridge protocol
├── docs/
│   ├── ARCHITECTURE.md      # Detailed system architecture & WebView analysis
│   ├── FIREBASE_SETUP.md    # Step-by-step Firebase console guide
│   └── DEVELOPMENT_ROADMAP.md # Phase 1 & Phase 2 milestones
├── firestore.rules          # Cloud Firestore production security rules
├── storage.rules            # Firebase Storage security rules
└── .env.example             # Client environment template
```

---

## ⚡ Technology Stack

- **Mobile Framework:** React Native with Expo SDK 58 & TypeScript
- **Navigation:** Expo Router (file-based routing)
- **Game Engine:** Phaser 3 & Matter.js (decoupled WebView bridge architecture)
- **State Management:** Zustand (isolated orthogonal stores; zero physics in React state)
- **Local Storage:**
  - `@react-native-async-storage/async-storage` for fast preferences and session caching
  - `expo-sqlite` (Write-Ahead Logging) for structured match records and offline sync queues
- **Backend Services:** Firebase Authentication, Cloud Firestore, Firebase Storage
- **Styling:** Premium Dark Theme (Obsidian, Mahogany, Imperial Gold) with pure StyleSheet-based CSS-in-JS

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.x or 22.x / 24.x
- npm >= 10.x or pnpm >= 9.x
- Expo Go app on iOS/Android or an emulator/simulator

### 2. Installation
Install all monorepo dependencies from the project root:
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Follow the [Firebase Setup Guide](docs/FIREBASE_SETUP.md) to generate your client configuration keys and insert them into `.env`.

> [!NOTE]
> The application will run immediately in **Offline Guest Mode** even without Firebase keys configured.

### 4. Running the Application
Start the Expo development server:
```bash
npm start
```
Run on Android emulator:
```bash
npm run android
```
Run on iOS simulator:
```bash
npm run ios
```
Run in Web browser:
```bash
npm run web
```

---

## 📖 Documentation

- [Detailed Architecture & Game Engine Analysis](docs/ARCHITECTURE.md)
- [Firebase Setup & Security Rules Guide](docs/FIREBASE_SETUP.md)
- [Full Development Roadmap](docs/DEVELOPMENT_ROADMAP.md)

---

## 📜 Current Status

- **Current Milestone:** Phase 1.1 — Project Foundation & Firebase Integration (Completed)
- **Next Milestone:** Phase 1.2 — UI/UX & Interactive Design System

