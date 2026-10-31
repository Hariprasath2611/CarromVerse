import {
  CoinType,
  Player,
  PlayerId,
  QueenStatus,
  TeamId,
} from '@carromverse/shared-types';
import { IRuleset } from '../rulesets/Ruleset.js';

export interface QueenEvaluationInput {
  shooter: Player;
  queenPocketedThisShot: boolean;
  assignedCoinsPocketedCount: number;
  foulOccurred: boolean;
}

export interface QueenShotResult {
  status: QueenStatus;
  queenCoveredThisShot: boolean;
  queenReturnedToBoard: boolean;
  isFailedCover: boolean;
  queenRetainedByPlayerId?: PlayerId;
  queenRetainedByTeamId?: TeamId;
}

export class QueenManager {
  private status: QueenStatus = 'unpocketed';
  private pocketedByPlayerId?: PlayerId;
  private pocketedByTeamId?: TeamId;
  private pendingTurnNumber?: number;
  private ruleset: IRuleset;

  constructor(ruleset: IRuleset) {
    this.ruleset = ruleset;
  }

  public getStatus(): QueenStatus {
    return this.status;
  }

  public getPocketedByPlayerId(): PlayerId | undefined {
    return this.pocketedByPlayerId;
  }

  public getPocketedByTeamId(): TeamId | undefined {
    return this.pocketedByTeamId;
  }

  public isCovered(): boolean {
    return this.status === 'covered';
  }

  public isPendingCover(): boolean {
    return this.status === 'pending_cover';
  }

  public isOnBoard(): boolean {
    return this.status === 'unpocketed' || this.status === 'returned_to_board';
  }

  /**
   * Evaluates Queen state transition based on the single settled shot transaction.
   */
  public evaluateShot(input: QueenEvaluationInput): QueenShotResult {
    const { shooter, queenPocketedThisShot, assignedCoinsPocketedCount, foulOccurred } = input;

    let queenCoveredThisShot = false;
    let queenReturnedToBoard = false;
    let isFailedCover = false;

    // Mode does not require queen cover (e.g. freestyle/points carrom)
    if (!this.ruleset.requiresQueenCover) {
      if (queenPocketedThisShot && !foulOccurred) {
        this.status = 'covered';
        this.pocketedByPlayerId = shooter.id;
        this.pocketedByTeamId = shooter.teamId;
        return {
          status: this.status,
          queenCoveredThisShot: true,
          queenReturnedToBoard: false,
          isFailedCover: false,
          queenRetainedByPlayerId: shooter.id,
          queenRetainedByTeamId: shooter.teamId,
        };
      } else if (queenPocketedThisShot && foulOccurred) {
        this.status = 'returned_to_board';
        return {
          status: this.status,
          queenCoveredThisShot: false,
          queenReturnedToBoard: true,
          isFailedCover: false,
        };
      }

      return {
        status: this.status,
        queenCoveredThisShot: false,
        queenReturnedToBoard: false,
        isFailedCover: false,
        queenRetainedByPlayerId: this.pocketedByPlayerId,
        queenRetainedByTeamId: this.pocketedByTeamId,
      };
    }

    // Classic / Cover required logic
    if (this.status === 'pending_cover') {
      // Current shot is the cover attempt
      const canCover = this.ruleset.canCoverQueen(
        shooter,
        this.pocketedByPlayerId,
        this.pocketedByTeamId
      );

      if (canCover && assignedCoinsPocketedCount > 0 && !foulOccurred) {
        // Success: Queen is covered!
        this.status = 'covered';
        queenCoveredThisShot = true;
      } else {
        // Failed to cover: Queen returned to board
        this.status = 'returned_to_board';
        this.pocketedByPlayerId = undefined;
        this.pocketedByTeamId = undefined;
        queenReturnedToBoard = true;
        isFailedCover = true;
      }
    } else if (queenPocketedThisShot) {
      // Queen was pocketed in this shot
      if (foulOccurred) {
        // Foul on queen shot -> immediately returned to center
        this.status = 'returned_to_board';
        queenReturnedToBoard = true;
      } else if (assignedCoinsPocketedCount > 0) {
        // Immediate Cover: Pocketed Queen AND assigned coin in the SAME shot!
        this.status = 'covered';
        this.pocketedByPlayerId = shooter.id;
        this.pocketedByTeamId = shooter.teamId;
        queenCoveredThisShot = true;
      } else {
        // Queen pocketed alone -> becomes pending cover
        this.status = 'pending_cover';
        this.pocketedByPlayerId = shooter.id;
        this.pocketedByTeamId = shooter.teamId;
      }
    }

    return {
      status: this.status,
      queenCoveredThisShot,
      queenReturnedToBoard,
      isFailedCover,
      queenRetainedByPlayerId: this.pocketedByPlayerId,
      queenRetainedByTeamId: this.pocketedByTeamId,
    };
  }

  /**
   * When queen returned to board is placed back physically, reset status to unpocketed.
   */
  public resetToUnpocketed(): void {
    if (this.status === 'returned_to_board') {
      this.status = 'unpocketed';
      this.pocketedByPlayerId = undefined;
      this.pocketedByTeamId = undefined;
    }
  }

  public reset(): void {
    this.status = 'unpocketed';
    this.pocketedByPlayerId = undefined;
    this.pocketedByTeamId = undefined;
  }
}
