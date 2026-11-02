# CarromVerse System Architecture

CarromVerse is engineered as a high-performance, modular carrom gaming ecosystem separated into four distinct domains:
1. **Frontend**: Mobile UI, screens, state management, and pass-and-play orchestration (`apps/frontend`).
2. **Backend**: REST API, authentication, match syncing, and WebSocket room management (`apps/backend`).
3. **Game Engine**: Physics simulation, collision resolution, and board rendering (`packages/game-engine`, `packages/game-logic`, `packages/multiplayer`).
4. **Database**: Offline SQLite persistence, real-time Cloud Firestore, and scalable PostgreSQL (`database/`).

---

## 1. Frontend Architecture (`apps/frontend`)
- **Framework**: React Native 0.88 + Expo SDK 58 (Expo Router v3).
- **Styling & Tokens**: Emerald green `#07261C` / `#0E4A33` with gold/brass `#E9B949` accents.
- **State Stores (Zustand)**:
  - `authStore`: User session, guest sign-in, tokens.
  - `gameSetupStore`: Mode selection, players, seat assignments, match targets.
  - `gameSessionStore`: Active match lifecycle, current turn, scores, pass-and-play handovers.
  - `economyStore`: Coins, gems, level XP progression.
  - `settingsStore`: Audio, haptics, controls.
- **Bridge Integration**: Embeds Phaser 3 inside React Native WebView (`PhaserCarromView.tsx`) via two-way JSON message serialization.

---

## 2. Backend Architecture (`apps/backend`)
- **Runtime**: Node.js + TypeScript.
- **Routing & Controllers**: Modular structure with `/health` and `/api/v1` routes:
  - `auth`: Guest & user authentication, JWT issuance.
  - `users`: User profiles, XP, match stats.
  - `matches`: Match outcome synchronization.
  - `leaderboards`: Ranked leaderboards across scopes.
  - `multiplayer`: Room creation, room codes, lobby state.
- **WebSocket Gateway**: Dedicated `SocketServer` and `RoomManager` designed for low-latency multiplayer rooms.

---

## 3. Game Engine & Physics Architecture
- **Renderer**: Phaser 3 Canvas / WebGL.
- **Physics**: Matter.js substepping physics engine:
  - Zero gravity.
  - Restitution calibrated to Indian tournament carrom boards (`0.88` coin-to-coin, `0.65` striker-to-wood).
  - Friction and air resistance tuned to stop high-speed shots naturally within 45–55 cm.
  - Substepping prevents tunneling at 350+ cm/s shot velocities.
- **Rules Engine (`@carromverse/game-logic`)**:
  - Deterministic state machine (`READY` -> `AIMING` -> `SHOOTING` -> `SETTLING` -> `EVALUATING`).
  - Supports 1v1, 3-Player Points Carrom, 4-Player FFA, and 4-Player 2v2 Doubles.
  - Complete Queen cover rules (immediate cover, pending cover, return to center on failed cover).
  - Strict foul handling: striker scratch, wrong coin, due penalty settlement.

---

## 4. Database & Storage Architecture
- **Mobile SQLite**: Encrypted, local WAL-mode SQLite database tracking offline matches and queuing unsynced games.
- **Cloud Firestore**: Real-time cloud documents with granular role-based security rules.
- **Firebase Storage**: Profile pictures and customizable board cosmetic assets.
- **PostgreSQL**: Scalable relational schema for high-throughput match queries and competitive seasons.

---

## 5. Audio & Visual Effects Architecture
- **Dual-Tier Audio**:
  - React Native `AudioManager`: UI feedback, ambient background music, and handover alerts.
  - In-Engine Web Audio: Zero-latency collision wood clicks, frame cushion thuds, and pocketing chimes directly inside Phaser.
- **Visual Feedback**:
  - Striker blast wave ring upon release.
  - Kinetic spark particle bursts on high-speed coin collisions.
  - Golden starburst flare upon Queen pocketing.
  - Warning red pulse and floating score toast upon fouls.
- **Bridge Throttling**: Micro-collisions below velocity thresholds are handled purely in-engine to guarantee 60 FPS performance without React Native thread congestion.
