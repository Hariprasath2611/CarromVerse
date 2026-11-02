# CarromVerse Offline Gameplay Guide

Comprehensive user and developer guide for CarromVerse's offline multiplayer experience (Phase 1.7 Final).

---

## 1. Supported Game Modes

CarromVerse provides 4 pass-and-play offline multiplayer game configurations designed for 1 device with zero network dependence:

| Mode | Name | Players | Coin Ownership | Target Score | Seating Sequence |
|---|---|---|---|---|---|
| **Mode 1** | Two-Player Individual (1v1) | 2 | Player 1 (White), Player 2 (Black) | 25 Pts (default) or Board Clear | Bottom (Seat 0) vs Top (Seat 2) |
| **Mode 2** | Three-Player Individual (Points) | 3 | Anyone pockets any coin | 50 Pts (default) | Seats 0 &rarr; 1 &rarr; 2 |
| **Mode 3** | Four-Player Individual (FFA) | 4 | Anyone pockets any coin | 50 Pts (default) | Clockwise: 0 &rarr; 1 &rarr; 2 &rarr; 3 |
| **Mode 4** | Four-Player Team (2v2 Doubles) | 4 (2 teams) | Team A (White), Team B (Black) | 25 Pts (default) | Alternating: A1(0) &rarr; B1(1) &rarr; A2(2) &rarr; B2(3) |

---

## 2. Controls and Input Mechanisms

### A. Striker Positioning
- **Fine Adjustment Buttons**: Use `◀` and `▶` nudge buttons to step the striker across the legal baseline in fine increments.
- **Direct Drag**: Tap and slide the baseline thumb marker directly across the baseline track.
- **Baseline Clearance**: The striker cannot overlap the corner red baseline circles or violate baseline boundaries.

### B. Aiming & Power
- **Drag-to-Aim**: Pull backwards from the striker on the board to set the angle and shot strength.
- **Power Indicator Bar**: Real-time HUD bar displays power from 0% to 100% with color gradations:
  - **Emerald Green (0% - 44%)**: Delicate placement & nudges.
  - **Amber Gold (45% - 79%)**: Standard pocketing & cut shots.
  - **Crimson Red (80% - 100%)**: Heavy break shots & bank rebounds.
- **Dedicated Shoot Button**: Alternatively tap the primary `SHOOT` button to fire at the current aim vector and power setting.

---

## 3. Rules & Scoring

### Coin Points
- **White Coin**: 10 Points
- **Black Coin**: 5 Points (or 10 Points in Points Carrom)
- **Queen (Red)**: 25 Points (Requires cover)

### Queen Cover Rules
1. A player pocketing the Queen must cover it by pocketing one of their assigned coins on the same shot or the immediately following shot.
2. If the covering shot fails (dry shot), the Queen is returned to the center circle.
3. If a foul is committed while pocketing the Queen or covering it, the Queen returns to the center circle immediately.

### Fouls and Penalties
- **Striker Pocketed (Scratch)**: Penalty of 1 banked coin (returned to center circle) and forfeiture of turn.
- **Due Penalty**: If a player has no banked coins when committing a foul, a "due penalty" is logged and deducted immediately upon the player's next legal pocket.
- **Turn Timer Expiration**: Default 25-second shot clock. Expiration counts as a dry shot and forfeits the turn to the next player.

---

## 4. Pass-and-Play Handover Flow
When a turn transitions between players on the same device:
1. A handover prompt modal appears displaying the incoming player's name, avatar emoji, and assigned coin type.
2. The incoming player taps **READY / START TURN** to confirm device handoff.
3. Audio chime `HANDOVER` plays and the striker resets to the incoming player's legal baseline position.
4. Optional toggle in Match Settings allows bypassing handover confirmation for rapid speed-play.
