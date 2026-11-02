# CarromVerse Testing Guide

Comprehensive guide to automated testing, physics verification, rules engine validation, and regression suites for CarromVerse (Phase 1.7 Final).

---

## 1. Test Architecture

The repository maintains automated test suites across all packages:

| Package | Test Files | Scope | Test Count |
|---|---|---|---|
| `@carromverse/game-engine` | `game-engine.test.mjs`, `physics-acceptance.test.mjs`, `full-offline-multiplayer-integration.test.mjs`, `audio-and-animations.test.mjs` | Physics equations, Matter.js collisions, zero gravity, board geometry, pass-and-play integration, audio synthesis | 33 |
| `@carromverse/game-logic` | `rules-engine.test.mjs` | 1v1, Points Carrom, FFA, 2v2 doubles, Queen cover state machine, due penalties, deduplication | 41 |
| `@carromverse/multiplayer` | `*.test.mjs` | Seat allocation, avatar registry, team validation, turn rotation | 5 |
| `@carromverse/shared-utils` | `utils.test.mjs` | Math utilities, email/username validation, formatters | 6 |
| `@carromverse/backend` | `*.test.mjs` | Health, auth routes, lobby rooms, match recording, user levels | 9 |
| **Total Automated Tests** | | | **94 Passing (100%)** |

---

## 2. Running Tests

### Run All Monorepo Tests
```bash
npm test
```

### Run Package Specific Tests
```bash
# Game Engine tests
npm test --workspace=@carromverse/game-engine

# Game Logic rules tests
npm test --workspace=@carromverse/game-logic

# Multiplayer tests
npm test --workspace=@carromverse/multiplayer

# Backend tests
npm test --workspace=@carromverse/backend
```

### Run Typecheck
```bash
npm run typecheck --workspaces --if-present
```

---

## 3. Physics Acceptance Test Matrix

The physics engine is audited against rigorous physical criteria (`physics-acceptance.test.mjs`):

| Test Criterion | Requirement | Verification Method | Status |
|---|---|---|---|
| **Equal Coin Collision** | Effective restitution ~0.88 | Head-on collision at 100 cm/s; measure outgoing velocities | **PASS** |
| **Striker into Coin** | Momentum transfer matching 3:1 mass ratio | 100 cm/s striker into stationary coin; outgoing coin 141 cm/s | **PASS** |
| **Break Shot at 350 cm/s** | Zero tunneling, no coordinate NaN, spread >60 cm | Max impulse applied to center cluster; monitor 300 frames | **PASS** |
| **Wall Cushion Rebound** | 45° incidence rebounds at 45° ±2°, restitution 0.60–0.70 | Ballistic trajectory against wooden frame cushion | **PASS** |
| **Stopping Distance** | Stops in 0.9–1.2s, distance 45–55 cm | Striker fired at 100 cm/s with damping 0.035 | **PASS** |
| **Stability Under Stress** | 100 consecutive max-speed shots; 0 body leaks, 0 NaN | Automated simulation loop over 3,000 physics sub-steps | **PASS** |

---

## 4. Device and Manual QA Checklist

For manual QA testing on Android/iOS emulators and physical devices:

- [ ] **1:1 Square Board Aspect Ratio**: Verify board maintains strict square aspect ratio on both phones (16:9, 19.5:9, 20:9) and tablets (4:3, 16:10).
- [ ] **Touch Drag Responsiveness**: Aim line tracks finger position with zero visual jitter or lag.
- [ ] **Audio Spatial Volume**: Striker hits produce tactile wood clicks whose loudness directly corresponds to impact velocity.
- [ ] **Queen Cover Flow**: Pocketing Queen turns HUD status to `👑 COVER QUEEN`. Missing the cover shot returns Queen to the center circle.
- [ ] **Turn Handover**: Handover modal displays correct incoming player name and avatar; tapping ready resets striker to active player's baseline.
- [ ] **Offline Execution**: Enable Airplane mode on device; launch app; verify all 4 offline multiplayer modes function flawlessly without network requests.

