# Game Logic Developer Guide

Welcome to the CarromVerse Game Logic team! This guide explains the pure TypeScript rules engine, state machine, and scoring systems (`packages/game-logic`).

## Quickstart

```bash
# Build game logic package
npm run build --workspace=@carromverse/game-logic

# Run rules and state machine tests
npm run test --workspace=@carromverse/game-logic
```

## Directory Structure
- `src/rules/`: Core rules managers and configuration.
- `src/rulesets/`: Modular game rulesets:
  - `StandardTwoPlayerRuleset.ts`: 1v1 white vs black coin assignment.
  - `ThreePlayerRuleset.ts`: Points Carrom with circular turn rotation (0 -> 1 -> 2 -> 0).
  - `FourPlayerIndividualRuleset.ts`: Free-for-all 4-player points carrom.
  - `FourPlayerTeamRuleset.ts`: 2v2 Doubles with team alternation and shared points.
- `src/turns/`: `TurnManager.ts` managing active seat, turn timeout, and rotation.
- `src/scoring/`: `ScoringEngine.ts` tracking points, Queen bonus (25 pts), and dues.
- `src/penalties/`: `FoulManager.ts` handling striker scratches, due penalties, and penalty coin placement.
- `src/state/`: `CarromStateMachine.ts` deterministic state machine for shot lifecycles.

## Core Rules Engine Rules
1. **Queen Cover**: Pocketing the Queen transitions state to `pending_cover`. The player must pocket an assigned coin on the subsequent shot (or in the same shot) to cover. If cover fails, Queen returns to center.
2. **Fouls**: Pocketing the striker incurs a penalty coin and passes the turn. If player has 0 banked coins, penalty is recorded as due.
3. **Turn Bonus**: Pocketing at least 1 legal coin without a foul awards an extra shot.

