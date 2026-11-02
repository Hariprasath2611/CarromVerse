# Game Engine Developer Guide

Welcome to the CarromVerse Game Engine team! This guide explains how to develop and test physics simulation, collision mechanics, and board rendering (`packages/game-engine`).

## Quickstart

```bash
# Build engine package
npm run build --workspace=@carromverse/game-engine

# Run engine & physics tests
npm run test --workspace=@carromverse/game-engine
```

## Directory Structure
- `src/board/`: Board configuration, baseline coordinates for each seat (0, 1, 2, 3), pocket sensors.
- `src/physics/`: Matter.js substepping physics simulation:
  - `PhysicsConfig.ts`: Zero gravity, coin mass, striker mass, restitution ratios.
  - `CollisionCategories.ts`: Category masks for walls, coins, striker, and pocket sensors.
  - `CollisionManager.ts`: Contact detection and momentum transfer.
- `src/rendering/` & `src/renderer/`: Textures, board lighting, shadows, and sprite generation.
- `src/scenes/`: Phaser scenes (`CarromBoardScene`, `BootScene`).
- `src/bridge/`: `phaserHtmlGenerator.ts` generates self-contained HTML embedding Matter.js and Phaser inside React Native WebView.

## Physics Criteria & Acceptance
- Restitution: Coin-to-coin `0.88`, striker-to-wood `0.65`.
- Substepping: Multi-step physics integration prevents tunneling even at 350+ cm/s break shots.
- Stop Distance: High-velocity shots must settle within ~45–55 cm.
- Zero Leaks: Bodies must be properly pooled or disposed upon pocketing.

