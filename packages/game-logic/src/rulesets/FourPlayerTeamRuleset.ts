import { CoinType, GameMode, GameVariant, Player, PlayerId, TeamId } from '@carromverse/shared-types';
import { IRuleset, RulesetOptions, WinEvaluationContext, WinEvaluationResult } from './Ruleset.js';

export class FourPlayerTeamRuleset implements IRuleset {
  public readonly mode: GameMode = 'four_player_team';
  public readonly variant: GameVariant = 'classic_carrom';
  public readonly name: string = '4-Player Doubles (2 vs 2)';
  public readonly description: string = 'Partners sit opposite each other (Team A vs Team B). Shared score, shared coin ownership, and strategic partner cover.';
  public readonly requiresQueenCover: boolean = true;
  public readonly whiteCoinPoints: number;
  public readonly blackCoinPoints: number;
  public readonly queenPoints: number;
  public readonly targetScore: number;
  public readonly maxRounds: number;
  public readonly foulPenaltyCoins: number;
  public readonly foulPenaltyPoints: number;

  constructor(options?: Partial<RulesetOptions>) {
    this.whiteCoinPoints = options?.whiteCoinPoints ?? 10;
    this.blackCoinPoints = options?.blackCoinPoints ?? 5;
    this.queenPoints = options?.queenPoints ?? 25;
    this.targetScore = options?.targetScore ?? 25;
    this.maxRounds = options?.maxRounds ?? 8;
    this.foulPenaltyCoins = options?.foulPenaltyCoins ?? 1;
    this.foulPenaltyPoints = options?.foulPenaltyPoints ?? 0;
  }

  public isAssignedCoin(player: Player, coinType: CoinType): boolean {
    if (coinType === 'queen') return false;
    // Team A (seats 0 & 2) assigned white, Team B (seats 1 & 3) assigned black
    if (player.teamId === 'team_a') return coinType === 'white';
    if (player.teamId === 'team_b') return coinType === 'black';
    return player.assignedCoinType === coinType;
  }

  public isOpponentCoin(player: Player, coinType: CoinType): boolean {
    if (coinType === 'queen') return false;
    if (player.teamId === 'team_a') return coinType === 'black';
    if (player.teamId === 'team_b') return coinType === 'white';
    return player.assignedCoinType !== coinType && player.assignedCoinType !== 'any';
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

  public canCoverQueen(player: Player, queenPocketedByPlayerId?: PlayerId, queenPocketedByTeamId?: TeamId): boolean {
    if (queenPocketedByTeamId) {
      return player.teamId === queenPocketedByTeamId;
    }
    return player.id === queenPocketedByPlayerId;
  }

  public evaluateWin(context: WinEvaluationContext): WinEvaluationResult {
    const { teamScores, coinsOnBoard, queenStatus, currentRound, players } = context;

    // 1. Target score evaluation for teams
    if (teamScores) {
      for (const [tId, tScore] of Object.entries(teamScores)) {
        if (tScore.points >= this.targetScore) {
          const teamId = tId as TeamId;
          const winningTeamName = teamId === 'team_a' ? 'Team A' : 'Team B';
          return {
            hasWinner: true,
            winningTeamId: teamId,
            winnerName: winningTeamName,
            isDraw: false,
            reason: `${winningTeamName} reached target score of ${this.targetScore}`,
          };
        }
      }
    }

    // 2. All assigned team coins cleared & Queen satisfied
    const queenStillUncovered = queenStatus === 'unpocketed' || queenStatus === 'returned_to_board';
    const remainingWhite = coinsOnBoard.filter((c) => c.state === 'on_board' && c.type === 'white').length;
    const remainingBlack = coinsOnBoard.filter((c) => c.state === 'on_board' && c.type === 'black').length;

    if (remainingWhite === 0 && !queenStillUncovered) {
      return {
        hasWinner: true,
        winningTeamId: 'team_a',
        winnerName: 'Team A',
        isDraw: false,
        reason: 'Team A cleared all White coins and satisfied Queen',
      };
    }

    if (remainingBlack === 0 && !queenStillUncovered) {
      return {
        hasWinner: true,
        winningTeamId: 'team_b',
        winnerName: 'Team B',
        isDraw: false,
        reason: 'Team B cleared all Black coins and satisfied Queen',
      };
    }

    // 3. Board cleared or max rounds reached
    const activeCoins = coinsOnBoard.filter((c) => c.state === 'on_board');
    if (activeCoins.length === 0 || currentRound >= this.maxRounds) {
      const scoreA = teamScores?.team_a?.points ?? 0;
      const scoreB = teamScores?.team_b?.points ?? 0;

      if (scoreA > scoreB) {
        return {
          hasWinner: true,
          winningTeamId: 'team_a',
          winnerName: 'Team A',
          isDraw: false,
          reason: 'Team A won with higher total points',
        };
      } else if (scoreB > scoreA) {
        return {
          hasWinner: true,
          winningTeamId: 'team_b',
          winnerName: 'Team B',
          isDraw: false,
          reason: 'Team B won with higher total points',
        };
      } else {
        return {
          hasWinner: true,
          isDraw: true,
          reason: 'Doubles match ended in a draw with tied scores',
        };
      }
    }

    return { hasWinner: false, isDraw: false };
  }
}
