import {
  CoinType,
  FoulDetail,
  FoulType,
  Player,
  PlayerId,
} from '@carromverse/shared-types';
import { IRuleset } from '../rulesets/Ruleset.js';

export interface FoulDetectionInput {
  player: Player;
  strikerPocketed: boolean;
  pocketedCoinTypes: CoinType[];
  isFailedQueenCover: boolean;
  isBaselinePlacementViolated?: boolean;
  contactOccurred?: boolean;
  playerPocketedCoinsCount: number; // how many coins the player has in hand / banked
  coinsOverboard?: { id?: string; type: CoinType }[];
  isPrematureQueenPocket?: boolean;
}

export interface FoulEvaluationResult {
  hasFoul: boolean;
  fouls: FoulDetail[];
  primaryFoulType?: FoulType;
  penaltyCoinsToReturnNow: number;
  penaltyCoinsAddedToDue: number;
  penaltyPointsDeducted: number;
}

export class FoulManager {
  private ruleset: IRuleset;
  private penaltiesDueMap: Record<PlayerId, number> = {};
  private foulsCountMap: Record<PlayerId, number> = {};

  constructor(ruleset: IRuleset, players: Player[]) {
    this.ruleset = ruleset;
    for (const p of players) {
      this.penaltiesDueMap[p.id] = 0;
      this.foulsCountMap[p.id] = 0;
    }
  }

  public detectFouls(input: FoulDetectionInput): FoulEvaluationResult {
    const {
      player,
      strikerPocketed,
      pocketedCoinTypes,
      isFailedQueenCover,
      isBaselinePlacementViolated,
      contactOccurred,
      playerPocketedCoinsCount,
    } = input;

    const fouls: FoulDetail[] = [];
    let penaltyCoins = 0;
    let penaltyPoints = 0;

    // 1. Striker Pocketed (Scratch) – SGFI Law 88 & 89
    if (strikerPocketed) {
      let desc = 'Striker was pocketed (Scratch foul)';
      const pocketedOwn = pocketedCoinTypes.some((t) => this.ruleset.isAssignedCoin(player, t));
      const pocketedQueen = pocketedCoinTypes.includes('queen');
      if (pocketedOwn) {
        desc = 'Striker and own carromman pocketed together (Scratch + C/M penalty - Law 89a)';
      } else if (pocketedQueen) {
        desc = 'Striker and Queen pocketed together (Scratch + Queen returned - Law 89c)';
      }

      fouls.push({
        type: 'striker_pocketed',
        description: desc,
        penaltyCoins: this.ruleset.foulPenaltyCoins,
        penaltyPoints: this.ruleset.foulPenaltyPoints,
      });
      penaltyCoins += this.ruleset.foulPenaltyCoins;
      penaltyPoints += this.ruleset.foulPenaltyPoints;
    }

    // 2. Failed Queen Cover
    if (isFailedQueenCover) {
      fouls.push({
        type: 'queen_failed_cover',
        description: 'Failed to cover the Queen with an assigned coin',
        penaltyCoins: 0, // Queen itself returns to board
        penaltyPoints: 0,
      });
    }

    // 2b. Premature Queen Pocket (SGFI Law 56 & 57)
    if (input.isPrematureQueenPocket) {
      fouls.push({
        type: 'illegal_queen_pocket',
        description: 'Queen pocketed without prior banked carromman (SGFI Law 56/57)',
        penaltyCoins: 0, // Queen returns to center circle
        penaltyPoints: 0,
      });
    }

    // 3. Baseline placement violation
    if (isBaselinePlacementViolated) {
      fouls.push({
        type: 'striker_not_on_baseline',
        description: 'Striker was shot from outside legal baseline bounds',
        penaltyCoins: this.ruleset.foulPenaltyCoins,
        penaltyPoints: this.ruleset.foulPenaltyPoints,
      });
      penaltyCoins += this.ruleset.foulPenaltyCoins;
      penaltyPoints += this.ruleset.foulPenaltyPoints;
    }

    // 4. Coins Overboard (SGFI Chapter XII)
    if (input.coinsOverboard && input.coinsOverboard.length > 0) {
      fouls.push({
        type: 'coin_overboard',
        description: `${input.coinsOverboard.length} coin(s) flew overboard and returned to center`,
        penaltyCoins: 0,
        penaltyPoints: 0,
      });
    }

    // 4. Strict opponent coin foul (if enabled in ruleset)
    // If strict mode is on and only opponent coin was pocketed
    const onlyOpponentCoin =
      pocketedCoinTypes.length > 0 &&
      pocketedCoinTypes.every((t) => this.ruleset.isOpponentCoin(player, t));

    if (this.ruleset.mode === 'two_player_individual' && onlyOpponentCoin) {
      // In competitive play, pocketing ONLY opponent coin counts as a foul or immediate turn loss
      fouls.push({
        type: 'opponent_coin_pocketed',
        description: "Pocketed only opponent's coin",
        penaltyCoins: 0, // Opponent keeps the coin; shooter loses turn
        penaltyPoints: 0,
      });
    }

    // 5. Contact check (if contact reporting is explicitly provided and false)
    if (contactOccurred === false) {
      fouls.push({
        type: 'no_contact',
        description: 'Striker failed to make contact with any coin',
        penaltyCoins: 0,
        penaltyPoints: 0,
      });
    }

    const hasFoul = fouls.length > 0;
    let returnNow = 0;
    let addToDue = 0;

    if (hasFoul) {
      this.foulsCountMap[player.id] = (this.foulsCountMap[player.id] ?? 0) + fouls.length;

      if (penaltyCoins > 0) {
        // Check if player has pocketed coins on hand to pay the penalty immediately
        if (playerPocketedCoinsCount >= penaltyCoins) {
          returnNow = penaltyCoins;
        } else {
          returnNow = Math.max(0, playerPocketedCoinsCount);
          addToDue = penaltyCoins - returnNow;
          this.penaltiesDueMap[player.id] = (this.penaltiesDueMap[player.id] ?? 0) + addToDue;
        }
      }
    }

    return {
      hasFoul,
      fouls,
      primaryFoulType: fouls[0]?.type,
      penaltyCoinsToReturnNow: returnNow,
      penaltyCoinsAddedToDue: addToDue,
      penaltyPointsDeducted: penaltyPoints,
    };
  }

  /**
   * Settle any outstanding due penalty when player pockets newly acquired coins.
   */
  public settleDuePenalty(playerId: PlayerId, newlyPocketedCount: number): number {
    const due = this.penaltiesDueMap[playerId] ?? 0;
    if (due <= 0 || newlyPocketedCount <= 0) return 0;

    const settled = Math.min(due, newlyPocketedCount);
    this.penaltiesDueMap[playerId] = due - settled;
    return settled;
  }

  public getPenaltiesDue(playerId: PlayerId): number {
    return this.penaltiesDueMap[playerId] ?? 0;
  }

  public getFoulsCount(playerId: PlayerId): number {
    return this.foulsCountMap[playerId] ?? 0;
  }

  public reset(): void {
    for (const key of Object.keys(this.penaltiesDueMap)) {
      this.penaltiesDueMap[key] = 0;
      this.foulsCountMap[key] = 0;
    }
  }
}

