# @carromverse/frontend

CarromVerse Mobile Frontend Application built with React Native, Expo SDK 58, Expo Router, Zustand, and Phaser 3 inside WebView.

## Architecture & Directory Structure
- `app/`: Expo Router routes and file-based screens
  - `(auth)/`: Login, registration, forgot password
  - `(tabs)/`: Bottom tab screens (Home, Customize, Friends, Leaderboard, Profile)
  - `game-board.tsx`: Interactive carrom match screen embedding WebView
  - `game-config.tsx`: Match configuration & target points
  - `game-mode.tsx`: 2-Player, 3-Player, 4-Player mode selection
  - `player-selection.tsx`: Seat selection, avatars, and pass-and-play setup
  - `lobby.tsx`: Offline match lobby & ready check
  - `game-result.tsx`: Victory presentation, score recap, rematch
  - `match-history.tsx`: Local SQLite match history & sync
- `src/`:
  - `components/`: Reusable Atomic & Molecule UI components
  - `constants/`: Tokens, colors, typography, theme
  - `services/`: SQLite local DB, Firebase services, offline sync
  - `stores/`: Zustand state management (Auth, Economy, GameSession, GameSetup, Settings, User)
  - `theme/`: Theme tokens and layout presets
  - `navigation/`: Route paths and constants
  - `hooks/`: Custom gameplay and lifecycle hooks
  - `contexts/`: React context providers
  - `types/`: Shared domain and UI types

## Getting Started
```bash
# Start Expo development server
npm run start --workspace=@carromverse/frontend

# Run on Android emulator / device
npm run android --workspace=@carromverse/frontend

# Run on iOS simulator / device
npm run ios --workspace=@carromverse/frontend

# Run on Web
npm run web --workspace=@carromverse/frontend

# Run TypeScript checks
npm run typecheck --workspace=@carromverse/frontend
```

