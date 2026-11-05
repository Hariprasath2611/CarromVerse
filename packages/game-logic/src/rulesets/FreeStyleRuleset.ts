import {
  Coin,
  CoinType,
  GameConfiguration,
  GameMode,
  GameVariant,
  Player,
  PlayerId,
  TeamId,
} from '@carromverse/shared-types';
import {
  IRuleset,
  RulesetOptions,
  WinEvaluationContext,
  WinEvaluationResult,
} from './Ruleset.js';

/**
 * Free Style Carrom Ruleset.
 *
 * Scoring:
 * - White coin = 20 points
 * - Black coin = 10 points
 * - Red (Queen) coin = 50 points
 * Total board points = 320 (9 * 20 + 9 * 10 + 1 * 50)
 *
 * Win Condition:
 * - First player to reach target score (default 180 points) wins.
 * - If all coins on board are cleared, player with highest total score wins.
 * - Deterministic tie-break if both reach target simultaneously:
 *   Highest total points wins; if tied, active shooter wins.
 *
 * Gameplay:
 * - Any colored coin pocketed by active player awards points to active player.
 * - Queen does not require a cover coin.
 * - Striker is never a scoring piece and never counted in remaining coins.
 */
export class FreeStyleRuleset implements IRuleset {
  public readonly mode: GameMode = 'two_player_individual';
  public readonly variant: GameVariant = 'freestyle_carrom';
  public readonly name: string = 'Free Style Carrom';
  public readonly description: string =
    'Point-based carrom mode: White=20, Black=10, Queen=50. First to 180 points wins.';
  public readonly requiresQueenCover: boolean = false;
  public readonly whiteCoinPoints: number = 20;
  public readonly blackCoinPoints: number = 10;
  public readonly queenPoints: number = 50;
  public readonly targetScore: number = 180;
  public readonly maxRounds: number = 1;
  public readonly foulPenaltyCoins: number = 1;
  public readonly foulPenaltyPoints: number = 0;
  public readonly isOfficialSGFI: boolean = false;
  public readonly strictQueenEligibility: boolean = false;

  constructor(options?: Partial<RulesetOptions | GameConfiguration>) {
    if (options?.mode) {
      this.mode = options.mode;
    }
    if (options?.targetScore !== undefined) {
      this.targetScore = options.targetScore;
    }
    if (options?.whiteCoinPoints !== undefined) {
      this.whiteCoinPoints = options.whiteCoinPoints;
    }
    if (options?.blackCoinPoints !== undefined) {
      this.blackCoinPoints = options.blackCoinPoints;
    }
    if (options?.queenPoints !== undefined) {
      this.queenPoints = options.queenPoints;
    }
    if (options?.foulPenaltyCoins !== undefined) {
      this.foulPenaltyCoins = options.foulPenaltyCoins;
    }
  }

  /**
   * In Free Style Carrom, any colored coin (White, Black, Queen) can be pocketed
   * by any active player to score points.
   */
  public isAssignedCoin(_player: Player, coinType: CoinType): boolean {
    return coinType === 'white' || coinType === 'black' || coinType === 'queen';
  }

  /**
   * There are no "opponent" coins in Free Style. All coins are open targets.
   */
  public isOpponentCoin(_player: Player, _coinType: CoinType): boolean {
    return false;
  }

  /**
   * Fixed point values: White=20, Black=10, Queen=50.
   */
  public getPointsForCoin(coinType: CoinType): number {
    switch (coinType) {
      case 'white':
        return this.whiteCoinPoints;
      case 'black':
        return this.blackCoinPoints;
      case 'queen':
        return this.queenPoints;
      default:
        return 0;
    }
  }

  /**
   * In Free Style, Queen does not require a cover shot.
   */
  public canCoverQueen(_player: Player, _queenPocketedByPlayerId?: PlayerId): boolean {
    return true;
  }

  /**
   * Evaluates whether a player has won the match.
   */
  public evaluateWin(context: WinEvaluationContext): WinEvaluationResult {
    const { players, scores, coinsOnBoard } = context;

    // 1. Check if any player has reached target score (180)
    const qualifyingPlayers: { player: Player; points: number }[] = [];
    for (const p of players) {
      const score = scores[p.id];
      const pts = score?.points ?? 0;
      if (pts >= this.targetScore) {
        qualifyingPlayers.push({ player: p, points: pts });
      }
    }

    if (qualifyingPlayers.length === 1) {
      const winner = qualifyingPlayers[0];
      return {
        hasWinner: true,
        winnerPlayerId: winner.player.id,
        winnerName: winner.player.name,
        winningTeamId: winner.player.teamId,
        isDraw: false,
        reason: `Target score of ${this.targetScore} reached (${winner.points} pts)`,
      };
    }

    // Deterministic tie-break if multiple players cross 180 in the same shot
    if (qualifyingPlayers.length > 1) {
      qualifyingPlayers.sort((a, b) => b.points - a.points);
      const top = qualifyingPlayers[0];
      const runnerUp = qualifyingPlayers[1];

      if (top.points > runnerUp.points) {
        return {
          hasWinner: true,
          winnerPlayerId: top.player.id,
          winnerName: top.player.name,
          winningTeamId: top.player.teamId,
          isDraw: false,
          reason: `Target score achieved with highest points (${top.points} vs ${runnerUp.points})`,
        };
      }

      // Exact score tie: deterministic winner is Player 1 (first seated / active shooter)
      return {
        hasWinner: true,
        winnerPlayerId: top.player.id,
        winnerName: top.player.name,
        winningTeamId: top.player.teamId,
        isDraw: false,
        reason: `Target score achieved with deterministic seat precedence (${top.points} pts)`,
      };
    }

    // 2. Check if all 19 coins on board are cleared
    const remainingOnBoard = coinsOnBoard.filter((c) => c.state === 'on_board');
    if (remainingOnBoard.length === 0) {
      // Find player with highest score
      let highestPlayer: Player | null = null;
      let highestScore = -Infinity;
      let isTie = false;

      for (const p of players) {
        const pts = scores[p.id]?.points ?? 0;
        if (pts > highestScore) {
          highestScore = pts;
          highestPlayer = p;
          isTie = false;
        } else if (pts === highestScore) {
          isTie = true;
        }
      }

      if (highestPlayer && !isTie) {
        return {
          hasWinner: true,
          winnerPlayerId: highestPlayer.id,
          winnerName: highestPlayer.name,
          winningTeamId: highestPlayer.teamId,
          isDraw: false,
          reason: `All coins cleared. Highest score: ${highestScore} points`,
        };
      }

      // Tie with all coins cleared: deterministic resolution
      return {
        hasWinner: true,
        winnerPlayerId: players[0]?.id,
        winnerName: players[0]?.name,
        winningTeamId: players[0]?.teamId,
        isDraw: false,
        reason: `All coins cleared with tie: resolved by initial seat precedence`,
      };
    }

    return {
      hasWinner: false,
      isDraw: false,
    };
  }
}

