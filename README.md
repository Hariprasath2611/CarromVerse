# CarromVerse 🎯

> **A Premium Mobile Carrom Game with Authentic Physics & Offline-First Architecture**

CarromVerse brings the classic tabletop board game of Carrom to mobile devices with authentic substepping physics calibrated using Matter.js and Phaser 3, an offline-first architecture supporting 2-player, 3-player, 4-player individual, and 4-player 2v2 team matches, and a scalable cloud backend.

---

## 🏗️ Four-Tier Architecture

CarromVerse is organized into a scalable monorepo separating Frontend, Backend, Game Engine, and Database layers:

```
CarromVerse/
│
├── apps/
│   ├── frontend/             # Mobile App (React Native, Expo SDK 58, Expo Router, Zustand, WebView)
│   └── backend/              # Cloud Backend (Node.js, TypeScript, REST API, WebSocket Room Gateway)
│
├── packages/
│   ├── game-engine/          # Matter.js Physics & Phaser 3 Board Renderer
│   ├── game-logic/           # Pure Carrom Rules Engine, Scoring, Fouls & State Machine
│   ├── multiplayer/          # Offline Seating, Pass-and-Play Handover, Team Seating Validation
│   ├── shared-types/         # Centralized TypeScript interfaces, types, and DTO contracts
│   └── shared-utils/         # 2D Vector Math, ID Generators, Validators, and Formatters
│
├── database/
│   ├── firebase/             # Cloud Firestore & Storage Security Rules & Indexes
│   ├── sqlite/               # Local Mobile SQLite Match History Schemas & Migrations
│   ├── postgresql/           # Cloud Relational Database Schema & Migrations
│   ├── schemas/              # Unified Schema Documentation
│   └── documentation/        # Technical Database Engine Reference Guides
│
├── infrastructure/
│   ├── docker/               # Dockerfile.backend & docker-compose.yml (Backend, Postgres, Redis)
│   ├── deployment/           # Deployment guides for mobile EAS and cloud backends
│   ├── environments/         # Environment templates (.development, .staging, .production)
│   └── scripts/              # Cross-platform build and test automation scripts
│
├── docs/                     # 10 Architecture and Developer Guides
├── tests/                    # Top-level E2E, integration, and performance benchmarks
├── tsconfig.base.json        # Shared TypeScript configuration
├── package.json              # Monorepo workspaces definition
└── README.md
```

---

## ⚡ Technology Stack

- **Frontend:** React Native 0.88, Expo SDK 58, Expo Router v3, Zustand, WebView
- **Backend:** Node.js, TypeScript, REST API, WebSocket Gateway
- **Game Engine:** Phaser 3 & Matter.js with zero-gravity substepping simulation
- **Rules Engine:** Pure TypeScript deterministic Carrom State Machine
- **Databases:** Local SQLite (expo-sqlite WAL), Cloud Firestore, Firebase Storage, PostgreSQL
- **Design Tokens:** Deep Green `#07261C` / `#0E4A33`, Emerald `#2BD67B`, Imperial Gold `#E9B949`

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.x or 22.x
- npm >= 10.x

### 2. Installation & Build
```bash
# Install dependencies across all workspaces
npm install

# Build all packages and backend
npm run build
```

### 3. Verify Codebase
```bash
# Typecheck all workspaces
npm run typecheck

# Run all automated test suites
npm run test
```

### 4. Running the Frontend (Mobile App)
```bash
# Start Expo development server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios

# Run in Web browser
npm run web
```

### 5. Running the Backend (Server)
```bash
npm run backend
```
Access `http://localhost:4000/health` to confirm the backend is online.

---

## 📖 Documentation Index

- [Project Structure & Workspace Boundaries](docs/PROJECT_STRUCTURE.md)
- [System Architecture Specification](docs/ARCHITECTURE.md)
- [Frontend Developer Guide](docs/FRONTEND_GUIDE.md)
- [Backend Developer Guide](docs/BACKEND_GUIDE.md)
- [Game Engine Developer Guide](docs/GAME_ENGINE_GUIDE.md)
- [Game Logic Developer Guide](docs/GAME_LOGIC_GUIDE.md)
- [Database Developer Guide](docs/DATABASE_GUIDE.md)
- [API Contracts & Envelopes](docs/API_CONTRACTS.md)
- [Development Setup & Onboarding](docs/DEVELOPMENT_SETUP.md)
- [Contributing Guidelines](docs/CONTRIBUTING.md)
