import { CandidateShot } from '../types/ShotTypes.js';
import { BotPersonality } from '../types/BotTypes.js';
import { ExecutableShotParams, ShootingController } from './ShootingController.js';
import { StrikerPositioning } from './StrikerPositioning.js';
import { CoinSnapshot } from '../types/ShotTypes.js';
import { PlayerSeat } from '@carromverse/shared-types';

export class BotShotExecutor {
  /**
   * Prepares the full executable shot instructions from a selected candidate shot.
   */
  public static prepareExecution(
    shot: CandidateShot,
    seat: PlayerSeat,
    personality: BotPersonality,
    activeCoins: CoinSnapshot[],
    seed?: number
  ): ExecutableShotParams {
    // 1. Resolve striker offset ensuring zero coin overlap
    const validOffset = StrikerPositioning.resolveValidOffset(seat, shot.strikerOffset, activeCoins);

    // 2. Calibrate aiming angle and power based on difficulty
    const executable = ShootingController.calibrateShot(
      shot.aimAngle,
      shot.powerRatio,
      validOffset,
      personality,
      seed
    );

    return executable;
  }
}

