# CarromVerse — Comprehensive Development Roadmap

This roadmap tracks the development lifecycle of **CarromVerse**, divided into offline-focused Phase 1 milestones and future online multiplayer Phase 2 milestones.

---

## Phase 1 — Premium Offline Carrom (Current Scope)

### ✅ Phase 1.1 — Project Foundation & Firebase Integration (COMPLETED)
- [x] Monorepo workspace configuration (`apps/mobile`, `packages/shared-types`, `packages/shared-utils`, `packages/game-logic`, `packages/game-engine`).
- [x] Clean Expo Router file-based navigation foundation.
- [x] Firebase Client SDK integration (Auth, Firestore, Storage) with `.env` validation.
- [x] Offline-First storage foundation:
  - [x] AsyncStorage for settings, audio, and player preferences.
  - [x] SQLite database with Write-Ahead Logging for local match records and offline sync queues.
  - [x] Network connectivity detection & automatic cloud sync engine.
- [x] Pure Carrom Game Logic package:
  - [x] 2-Player, 3-Player, 4-Player Individual, and 4-Player Team (2v2) configurations.
  - [x] Queen pocketing and covering state machine.
  - [x] Turn rotation logic and foul penalty calculations.
- [x] Phaser 3 + Matter.js Game Engine package:
  - [x] Physical material definitions (calibrated bounciness, friction, and air damping).
  - [x] Decoupled WebView Bridge protocol specification.
- [x] Zustand state management (isolated stores, no physics in React state).
- [x] Temporary premium dark theme with custom StyleSheet-based UI components.
- [x] Security rule definitions (`firestore.rules` and `storage.rules`).
- [x] Complete technical documentation.

---

### ⏳ Phase 1.2 — UI/UX & Interactive Design System (NEXT)
- [ ] Premium design system implementation:
  - [ ] Polished mahogany and ivory aesthetic styling.
  - [ ] Smooth transitions and micro-interactions using React Native Reanimated.
  - [ ] High-fidelity splash and onboarding animations.
- [ ] Complete Game Setup UI:
  - [ ] Player count selection screen (2P, 3P, 4P Individual, 4P Team).
  - [ ] Local player seat assignment and avatar selection.
  - [ ] Board skin and striker customizer previews.
- [ ] Game HUD & In-Game Overlays:
  - [ ] Live turn indicator banner with countdown timer animation.
  - [ ] Scoreboards with Queen status indicator badge.
  - [ ] In-game pause menu, foul alerts, and match conclusion summary modal.

---

### ⏳ Phase 1.3 — Game Engine & Physics Implementation
- [ ] WebView Phaser 3 container integration inside React Native.
- [ ] Matter.js physical body fine-tuning:
  - [ ] Precision collision resolution for coin clusters in center circle.
  - [ ] Smooth striker drag slider along player baseline.
  - [ ] Slingshot and directional aiming guide with bounce raycasting.
- [ ] Procedural asset generation or texture loading for polished wooden board and ivory coins.
- [ ] Pocket sensor drop animations and visual particle effects.

---

### ⏳ Phase 1.4 — Offline Gameplay Modes & AI Bot Players
- [ ] Complete 2-Player Individual offline mode.
- [ ] Complete 3-Player Free-for-All points carrom mode.
- [ ] Complete 4-Player Individual mode.
- [ ] Complete 4-Player Team mode (2 vs 2 partner coordination).
- [ ] Solo Practice mode with unlimited turns and shot resets.
- [ ] Optional local AI bot opponent with calibrated accuracy and power heuristics.

---

### ⏳ Phase 1.5 — Audio, Haptics, Local Persistence & EAS Build
- [ ] Dynamic sound effects (wood-on-wood collision intensities, cushion rebounds, pocket sinks).
- [ ] Background ambient music with volume sliders.
- [ ] React Native haptic feedback on shot release, pocketing, and fouls.
- [ ] Full local match history viewer with search and statistics filters.
- [ ] Production EAS build pipeline for Android (APK/AAB) and iOS (IPA).

---

## Phase 2 — Real-Time Online Multiplayer (Future Scope)

> [!IMPORTANT]
> The Phase 1.1 architecture was designed specifically to allow Phase 2 integration without restructuring the application.

- [ ] **Player Identity & Social:**
  - [ ] Google & Apple sign-in integration.
  - [ ] Friends list, presence indicators (Online / In-Game / Offline), and direct invites.
  - [ ] Cloud-hosted user profile avatars.
- [ ] **Private Rooms & Matchmaking:**
  - [ ] Create private room with 6-character room codes.
  - [ ] Share room invite links.
  - [ ] Quick match automatic matchmaking based on player skill/level.
- [ ] **Real-Time Multiplayer Synchronizer:**
  - [ ] Real-time game state synchronization via WebSockets / Firebase Realtime / WebRTC.
  - [ ] Input prediction, lag compensation, and authoritative turn validation.
  - [ ] Reconnection handling for transient network interruptions.
- [ ] **In-Game Communication:**
  - [ ] Real-time animated stickers and reactions.
  - [ ] Quick chat preset phrases.
- [ ] **Global Leaderboards & Seasons:**
  - [ ] Weekly and all-time global player rankings.
  - [ ] Seasonal tournaments and trophy progression.

