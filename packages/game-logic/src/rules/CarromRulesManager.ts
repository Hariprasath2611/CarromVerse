import {
  Coin,
  CoinType,
  FoulType,
  GameConfiguration,
  Player,
  QueenStatus,
  ShotResult,
  Vector2D,
} from '@carromverse/shared-types';
import { distance } from '@carromverse/shared-utils';
import { BASELINE_DEFINITIONS, BaselineSegment } from '../config/board.config.js';

export interface ShotEvaluationInput {
  player: Player;
  pocketedCoins: Coin[];
  strikerPocketed: boolean;
  queenStatus: QueenStatus;
  queenPocketedByPlayerId?: string;
}

export class CarromRulesManager {
  private config: GameConfiguration;

  constructor(config: GameConfiguration) {
    this.config = config;
  }

  /**
   * Validate that the striker is placed strictly inside the legal baseline zone for the player's seat.
   */
  public isStrikerPlacementValid(seat: Player['seat'], position: Vector2D, coinsOnBoard: Coin[]): { isValid: boolean; reason?: string } {
    const baseline: BaselineSegment | undefined = BASELINE_DEFINITIONS[seat];
    if (!baseline) {
      return { isValid: false, reason: 'Invalid player baseline seat' };
    }

    const { strikerRadius, coinRadius } = this.config.boardDimensions;

    // Check collision with any existing coin on the board
    for (const coin of coinsOnBoard) {
      if (coin.state === 'on_board') {
        const dist = distance(position, coin.position);
        if (dist < strikerRadius + coinRadius) {
          return { isValid: false, reason: 'Striker cannot overlap with a coin on the board' };
        }
      }
    }

    // Verify coordinates stay within the bounds of the baseline segment
    const minX = Math.min(baseline.start.x, baseline.end.x) - strikerRadius;
    const maxX = Math.max(baseline.start.x, baseline.end.x) + strikerRadius;
    const minY = Math.min(baseline.start.y, baseline.end.y) - strikerRadius;
    const maxY = Math.max(baseline.start.y, baseline.end.y) + strikerRadius;

    if (position.x < minX || position.x > maxX || position.y < minY || position.y > maxY) {
      return { isValid: false, reason: 'Striker must be placed within your baseline' };
    }

    return { isValid: true };
  }

  /**
   * Evaluates a completed physical shot according to standard carrom rules:
   * - Evaluates fouls (striker pocketed)
   * - Evaluates queen pocketing and cover rules
   * - Calculates extra turns
   * - Determines penalty coins
   */
  public evaluateShot(input: ShotEvaluationInput): ShotResult {
    const { player, pocketedCoins, strikerPocketed, queenStatus, queenPocketedByPlayerId } = input;
    const pocketedTypes = pocketedCoins.map((c) => c.type);
    const pocketedIds = pocketedCoins.map((c) => c.id);

    let foulCommitted = false;
    let foulType: FoulType | undefined;
    let extraTurnEarned = false;
    let queenPocketedThisShot = false;
    let queenCoveredThisShot = false;
    let queenReturnedToCenter = false;
    let penaltyCoinsDue = 0;

    // 1. Check Striker Foul (pocketing the striker)
    if (strikerPocketed) {
      foulCommitted = true;
      foulType = 'striker_pocketed';
      penaltyCoinsDue = this.config.foulPenaltyCoins;
    }

    // 2. Queen evaluation
    const queenWasPocketed = pocketedTypes.includes('queen');

    if (queenWasPocketed) {
      queenPocketedThisShot = true;
    }

    // Handling Queen Cover logic for classic / team modes
    if (this.config.queenCoverRequired) {
      if (queenStatus === 'pending_cover') {
        // Player previously pocketed queen. To cover it, they must pocket one of their assigned coins
        const pocketedAssignedCoin = pocketedCoins.some(
          (c) => player.assignedCoinType === 'any' || c.type === player.assignedCoinType
        );

        if (pocketedAssignedCoin && !foulCommitted) {
          queenCoveredThisShot = true;
          extraTurnEarned = true;
        } else {
          // Failed to cover the Queen
          queenReturnedToCenter = true;
        }
      } else if (queenWasPocketed) {
        // Queen was just pocketed this turn
        // Check if a cover coin was also pocketed in the very same shot
        const pocketedAssignedCoin = pocketedCoins.some(
          (c) => c.type !== 'queen' && (player.assignedCoinType === 'any' || c.type === player.assignedCoinType)
        );

        if (pocketedAssignedCoin && !foulCommitted) {
          queenCoveredThisShot = true;
          extraTurnEarned = true;
        } else if (!foulCommitted) {
          // Queen stays pocketed, player gets extra turn to try to cover it
          extraTurnEarned = true;
        } else {
          // Foul was committed alongside pocketing queen -> Queen returns to center
          queenReturnedToCenter = true;
        }
      }
    }

    // 3. Normal coin pocketing & Extra Turn calculation
    if (!foulCommitted) {
      const pocketedOwnCoin = pocketedCoins.some(
        (c) => player.assignedCoinType === 'any' || c.type === player.assignedCoinType
      );

      if (pocketedOwnCoin || queenPocketedThisShot || queenCoveredThisShot) {
        extraTurnEarned = true;
      }
    }

    return {
      pocketedCoins: pocketedTypes,
      pocketedCoinIds: pocketedIds,
      foulCommitted,
      foulType,
      queenPocketedThisShot,
      queenCoveredThisShot,
      queenReturnedToCenter,
      extraTurnEarned,
      penaltyCoinsDue,
    };
  }
}
