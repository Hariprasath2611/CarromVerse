# CarromVerse Project Structure

This document outlines the directory structure, package boundaries, and architectural segregation of the CarromVerse monorepo.

## Monorepo Layout

```
CarromVerse/
│
├── apps/
│   ├── frontend/             # Mobile application (React Native, Expo SDK 58, Expo Router, Zustand)
│   └── backend/              # Server API & WebSocket architecture (Node.js, TypeScript, REST)
│
├── packages/
│   ├── game-engine/          # Phaser 3 + Matter.js physics simulation, rendering & WebView bridge
│   ├── game-logic/           # Pure carrom rules engine, turn state machine, fouls, scoring
│   ├── multiplayer/          # Offline seat configurations, pass-and-play, team validation, sessions
│   ├── shared-types/         # Single source of truth for TypeScript interfaces, enums, DTOs
│   └── shared-utils/         # Math, formatting, validation, and ID generation utilities
│
├── database/
│   ├── firebase/             # Cloud Firestore & Storage rules, indexes, and configs
│   ├── sqlite/               # Local mobile offline SQLite schemas, migrations, seeds
│   ├── postgresql/           # Relational cloud database schemas, migrations, seeds
│   ├── schemas/              # Unified schema overview
│   └── documentation/        # Database technical reference guides
│
├── infrastructure/
│   ├── docker/               # Dockerfile.backend & docker-compose.yml (Backend, Postgres, Redis)
│   ├── deployment/           # Deployment guides for mobile EAS and cloud backends
│   ├── environments/         # Environment variable templates (.dev, .staging, .prod)
│   └── scripts/              # Automated build, setup, and test scripts (PowerShell & Bash)
│
├── docs/                     # Architecture, onboarding, and developer guides
├── tests/                    # Top-level E2E, integration, and performance benchmarks
├── tsconfig.base.json        # Base TypeScript compiler settings shared across packages
├── package.json              # Monorepo workspaces definition and root lifecycle scripts
└── README.md                 # Primary project overview and quickstart
```

## Architectural Boundaries & Dependency Flow

```
[apps/frontend] ---> [@carromverse/game-engine] ---> [@carromverse/game-logic]
       │                         │                               │
       v                         v                               v
[@carromverse/multiplayer] -------------------------> [@carromverse/shared-types]
       │                                                         ^
       v                                                         │
[apps/backend] ---------------------------------------------------+
       │
       v
[@carromverse/shared-utils]
```

### Dependency Rules:
1. `packages/shared-types` has zero internal dependencies. All packages may depend on it.
2. `packages/shared-utils` depends only on `shared-types`.
3. `packages/game-logic` is completely decoupled from rendering frameworks (no Phaser or React Native imports).
4. `packages/multiplayer` handles seating, handover, and team rules independently of rendering.
5. `packages/game-engine` communicates with `apps/frontend` through the serialized JSON WebView Bridge.
