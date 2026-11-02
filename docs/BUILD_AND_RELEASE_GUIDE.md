# CarromVerse Build & Release Guide

Comprehensive production build, configuration, and release engineering guide for CarromVerse (Phase 1.7 Final).

---

## 1. Prerequisites & Environment Setup

- **Node.js**: `v20.x` or `v22.x` (LTS)
- **Package Manager**: `npm` v10+ (configured for workspaces)
- **Expo CLI**: `~58.0.x`
- **TypeScript**: `v5.6.x` / `v6.0.x`
- **Target OS**: Android 10+ (API level 29+), iOS 15.0+

---

## 2. Monorepo Build Pipeline

The project uses modular npm workspaces:

```bash
# 1. Install dependencies
npm install

# 2. Build shared packages (TypeScript to JavaScript)
npm run build --workspaces --if-present

# 3. Verify types across all workspaces
npm run typecheck --workspaces --if-present

# 4. Execute all automated test suites
npm test
```

---

## 3. Expo & React Native Build Commands

From `apps/frontend/`:

### Local Development Server
```bash
cd apps/frontend
npx expo start
```

### Web Export (HTML5 Canvas Preview)
```bash
cd apps/frontend
npx expo start --web
```

### Android APK / AAB Build (EAS)
```bash
cd apps/frontend
# Configure EAS project
npx eas-cli init

# Build preview APK for direct sideloading and testing
npx eas-cli build --platform android --profile preview

# Build production Android App Bundle (AAB) for Google Play
npx eas-cli build --platform android --profile production
```

### iOS Archive Build (EAS)
```bash
cd apps/frontend
# Build iOS IPA for TestFlight
npx eas-cli build --platform ios --profile production
```

---

## 4. WebView Asset Inlining & Bundling

To ensure **100% offline functionality without internet**:
1. All Phaser 3 runtime scripts, Matter.js physics algorithms, board SVG vector geometry, coin rendering textures, and Web Audio synthesizers are bundled directly into `generateCarromPhaserHtml()` in `@carromverse/game-engine`.
2. The HTML is injected into `react-native-webview` via the `html` source parameter (`{ html: htmlContent }`).
3. No external CDN requests (`<script src="...">` or remote fonts) are made during gameplay, guaranteeing complete functionality in offline / airplane mode.

---

## 5. Memory Management & Cleanup Best Practices

To prevent memory leaks across successive matches:
- **`carromRef.current.resetBoard()`**: Clears all dynamic coin bodies and re-instances the center cluster in-place without reloading the WebView DOM.
- **`carromRef.current.pauseGame()` / `resumeGame()`**: Suspends Phaser ticker and Matter physics step when pause menu, stickers modal, or app backgrounding occurs.
- **Audio Cleanup**: `AudioManager.getInstance().stopMusic()` releases active audio nodes when navigating away from the game screen.
- **Zustand Reset**: `abandonSession()` and `endSession()` cleanly tear down match state machines and timer intervals.

