import { CoinType, GameMode, GameVariant, Player, PlayerId } from '@carromverse/shared-types';
import { IRuleset, RulesetOptions, WinEvaluationContext, WinEvaluationResult } from './Ruleset.js';

export class FourPlayerIndividualRuleset implements IRuleset {
  public readonly mode: GameMode = 'four_player_individual';
  public readonly variant: GameVariant = 'points_carrom';
  public readonly name: string = '4-Player Free-for-All';
  public readonly description: string = 'Four individual players competing around the four sides of the board.';
  public readonly requiresQueenCover: boolean;
  public readonly whiteCoinPoints: number;
  public readonly blackCoinPoints: number;
  public readonly queenPoints: number;
  public readonly targetScore: number;
  public readonly maxRounds: number;
  public readonly foulPenaltyCoins: number;
  public readonly foulPenaltyPoints: number;

  constructor(options?: Partial<RulesetOptions>) {
    this.requiresQueenCover = options?.requiresQueenCover ?? false;
    this.whiteCoinPoints = options?.whiteCoinPoints ?? 10;
    this.blackCoinPoints = options?.blackCoinPoints ?? 5;
    this.queenPoints = options?.queenPoints ?? 25;
    this.targetScore = options?.targetScore ?? 50;
    this.maxRounds = options?.maxRounds ?? 8;
    this.foulPenaltyCoins = options?.foulPenaltyCoins ?? 1;
    this.foulPenaltyPoints = options?.foulPenaltyPoints ?? 5;
  }

  public isAssignedCoin(player: Player, coinType: CoinType): boolean {
    if (player.assignedCoinType === 'any') return true;
    if (coinType === 'queen') return false;
    return player.assignedCoinType === coinType;
  }

  public isOpponentCoin(player: Player, coinType: CoinType): boolean {
    if (player.assignedCoinType === 'any') return false;
    if (coinType === 'queen') return false;
    return player.assignedCoinType !== coinType;
  }

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

  public canCoverQueen(player: Player, queenPocketedByPlayerId?: PlayerId): boolean {
    if (!this.requiresQueenCover) return true;
    return player.id === queenPocketedByPlayerId;
  }

  public evaluateWin(context: WinEvaluationContext): WinEvaluationResult {
    const { players, scores, coinsOnBoard, currentRound } = context;

    for (const p of players) {
      const score = scores[p.id];
      if (score && score.points >= this.targetScore) {
        return {
          hasWinner: true,
          winnerPlayerId: p.id,
          winnerName: p.name,
          isDraw: false,
          reason: `Target score of ${this.targetScore} reached`,
        };
      }
    }

    const activeCoins = coinsOnBoard.filter((c) => c.state === 'on_board');
    if (activeCoins.length === 0 || currentRound >= this.maxRounds) {
      let highestScore = -Infinity;
      let winningPlayer: Player | undefined;
      let isDraw = false;

      for (const p of players) {
        const score = scores[p.id]?.points ?? 0;
        if (score > highestScore) {
          highestScore = score;
          winningPlayer = p;
          isDraw = false;
        } else if (score === highestScore) {
          isDraw = true;
        }
      }

      if (isDraw) {
        return {
          hasWinner: true,
          isDraw: true,
          reason: 'Draw with tied scores among top players',
        };
      }

      return {
        hasWinner: true,
        winnerPlayerId: winningPlayer?.id,
        winnerName: winningPlayer?.name,
        isDraw: false,
        reason: activeCoins.length === 0 ? 'All coins cleared from board' : 'Maximum rounds reached',
      };
    }

    return { hasWinner: false, isDraw: false };
  }
}
