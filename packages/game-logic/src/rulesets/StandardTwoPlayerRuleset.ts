import { CoinType, GameMode, GameVariant, Player, PlayerId } from '@carromverse/shared-types';
import { IRuleset, RulesetOptions, WinEvaluationContext, WinEvaluationResult } from './Ruleset.js';

export class StandardTwoPlayerRuleset implements IRuleset {
  public readonly mode: GameMode = 'two_player_individual';
  public readonly variant: GameVariant = 'classic_carrom';
  public readonly name: string = '2-Player Classic Rules';
  public readonly description: string = 'Standard competitive 1v1 carrom rules with White vs Black and Queen cover requirement.';
  public readonly requiresQueenCover: boolean = true;
  public readonly whiteCoinPoints: number;
  public readonly blackCoinPoints: number;
  public readonly queenPoints: number;
  public readonly targetScore: number;
  public readonly maxRounds: number;
  public readonly foulPenaltyCoins: number;
  public readonly foulPenaltyPoints: number;
  public readonly allowStrictOpponentCoinFoul: boolean;

  constructor(options?: Partial<RulesetOptions>) {
    this.whiteCoinPoints = options?.whiteCoinPoints ?? 10;
    this.blackCoinPoints = options?.blackCoinPoints ?? 5;
    this.queenPoints = options?.queenPoints ?? 25;
    this.targetScore = options?.targetScore ?? 25;
    this.maxRounds = options?.maxRounds ?? 8;
    this.foulPenaltyCoins = options?.foulPenaltyCoins ?? 1;
    this.foulPenaltyPoints = options?.foulPenaltyPoints ?? 0;
    this.allowStrictOpponentCoinFoul = options?.allowStrictOpponentCoinFoul ?? false;
  }

  public isAssignedCoin(player: Player, coinType: CoinType): boolean {
    if (coinType === 'queen') return false;
    if (player.assignedCoinType === 'any') return true;
    return player.assignedCoinType === coinType;
  }

  public isOpponentCoin(player: Player, coinType: CoinType): boolean {
    if (coinType === 'queen') return false;
    if (player.assignedCoinType === 'any') return false;
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
    // Only the player who pocketed the queen can cover it on their turn
    return player.id === queenPocketedByPlayerId;
  }

  public evaluateWin(context: WinEvaluationContext): WinEvaluationResult {
    const { players, scores, coinsOnBoard, queenStatus, currentRound } = context;

    // 1. Check if any player has reached target score
    for (const p of players) {
      const score = scores[p.id];
      if (score && score.points >= this.targetScore) {
        return {
          hasWinner: true,
          winnerPlayerId: p.id,
          winnerName: p.name,
          isDraw: false,
          reason: `Target score of ${this.targetScore} points achieved`,
        };
      }
    }

    // 2. Check if all assigned coins for a player are cleared
    for (const p of players) {
      const assignedType = p.assignedCoinType;
      if (assignedType === 'white' || assignedType === 'black') {
        const remainingAssigned = coinsOnBoard.filter((c) => c.state === 'on_board' && c.type === assignedType);
        const queenStillUncovered = queenStatus === 'unpocketed' || queenStatus === 'returned_to_board';

        // In standard carrom, a player cannot win if the queen is still on board/uncovered unless their last coin covers the queen
        if (remainingAssigned.length === 0 && !queenStillUncovered) {
          return {
            hasWinner: true,
            winnerPlayerId: p.id,
            winnerName: p.name,
            isDraw: false,
            reason: `All assigned ${assignedType} coins pocketed and Queen satisfied`,
          };
        }
      }
    }

    // 3. Board cleared or max rounds reached -> highest score wins
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
          reason: activeCoins.length === 0 ? 'Board cleared with tied scores' : 'Max rounds reached with tied scores',
        };
      }

      return {
        hasWinner: true,
        winnerPlayerId: winningPlayer?.id,
        winnerName: winningPlayer?.name,
        isDraw: false,
        reason: activeCoins.length === 0 ? 'Board cleared with highest score' : 'Max rounds reached with highest score',
      };
    }

    return { hasWinner: false, isDraw: false };
  }
}
