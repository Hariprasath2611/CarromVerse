# Frontend Developer Guide

Welcome to the CarromVerse Frontend team! This guide explains how to develop, test, and contribute to the mobile application (`apps/frontend`).

## Quickstart

```bash
# Navigate to monorepo root
cd D:\work\CarromVerse

# Start Expo dev server
npm run start --workspace=@carromverse/frontend

# Launch web preview
npm run web --workspace=@carromverse/frontend
```

## Directory Structure
- `app/`: Expo Router file-based routing.
- `src/components/`: Reusable UI elements (`Button`, `Card`, `Modal`, `PlayerAvatar`, `PhaserCarromView`).
- `src/stores/`: Zustand stores (`useGameSetupStore`, `useGameSessionStore`, etc.).
- `src/constants/theme.ts`: UI colors, padding, typography tokens.
- `src/hooks/`: Custom gameplay and lifecycle hooks.
- `src/navigation/`: Route definitions and path constants.

## Key Principles
1. **Separation of Concerns**: UI screens must not contain physics or board rendering logic. All game physics is encapsulated in `@carromverse/game-engine`.
2. **State Management**: Use Zustand stores for global match status and pass-and-play handovers.
3. **Bridge Communication**: When interacting with the game canvas, send structured JSON events (`SET_STRIKER_POSITION`, `EXECUTE_SHOT`, `PAUSE_GAME`) through `PhaserCarromView`.
4. **Offline Resilience**: Matches must play smoothly offline without an active internet connection. Offline match outcomes are saved to SQLite via `LocalDatabaseService`.
