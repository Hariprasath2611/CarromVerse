import {
  CoinType,
  GameScore,
  Player,
  PlayerId,
  TeamId,
  TeamScore,
} from '@carromverse/shared-types';
import { IRuleset } from '../rulesets/Ruleset.js';

export interface ScoreHistoryEntry {
  turnNumber: number;
  playerId: PlayerId;
  teamId?: TeamId;
  pointsDelta: number;
  totalPoints: number;
  pocketedCoins: CoinType[];
  foulPenalty: number;
  timestamp: number;
}

export class ScoringEngine {
  private ruleset: IRuleset;
  private playerScores: Record<PlayerId, GameScore> = {};
  private teamScores?: Record<TeamId, TeamScore>;
  private history: ScoreHistoryEntry[] = [];

  constructor(ruleset: IRuleset, players: Player[]) {
    this.ruleset = ruleset;

    const isTeamMode = ruleset.mode === 'four_player_team';
    if (isTeamMode) {
      this.teamScores = {
        team_a: {
          teamId: 'team_a',
          points: 0,
          playerIds: [],
          whiteCoinsPocketed: 0,
          blackCoinsPocketed: 0,
          queenPocketed: false,
        },
        team_b: {
          teamId: 'team_b',
          points: 0,
          playerIds: [],
          whiteCoinsPocketed: 0,
          blackCoinsPocketed: 0,
          queenPocketed: false,
        },
      };
    }

    for (const p of players) {
      this.playerScores[p.id] = {
        playerId: p.id,
        teamId: p.teamId,
        points: 0,
        whiteCoinsPocketed: 0,
        blackCoinsPocketed: 0,
        queenPocketed: false,
        fouls: 0,
        penaltiesDue: 0,
        extraTurnsEarned: 0,
      };

      if (isTeamMode && p.teamId && this.teamScores?.[p.teamId]) {
        this.teamScores[p.teamId].playerIds.push(p.id);
      }
    }
  }

  public recordShotCoins(
    shooter: Player,
    pocketedCoins: CoinType[],
    queenCoveredThisShot: boolean
  ): { playerDelta: number; teamDelta: number } {
    let playerDelta = 0;
    const score = this.playerScores[shooter.id];

    for (const coinType of pocketedCoins) {
      if (coinType === 'white') {
        const pts = this.ruleset.getPointsForCoin('white');
        playerDelta += pts;
        if (score) {
          score.whiteCoinsPocketed += 1;
        }
        if (this.teamScores && shooter.teamId && this.teamScores[shooter.teamId]) {
          this.teamScores[shooter.teamId].whiteCoinsPocketed += 1;
        }
      } else if (coinType === 'black') {
        const pts = this.ruleset.getPointsForCoin('black');
        playerDelta += pts;
        if (score) {
          score.blackCoinsPocketed += 1;
        }
        if (this.teamScores && shooter.teamId && this.teamScores[shooter.teamId]) {
          this.teamScores[shooter.teamId].blackCoinsPocketed += 1;
        }
      } else if (coinType === 'queen' && queenCoveredThisShot) {
        // Official SGFI Law 78: 21-point cap
        // "If the score of the winner of a board is 21 or more, he shall not be entitled to the points for Queen."
        const currentPoints = score?.points ?? 0;
        const pts = currentPoints >= 21 ? 0 : this.ruleset.getPointsForCoin('queen');
        playerDelta += pts;
        if (score) {
          score.queenPocketed = true;
        }
        if (this.teamScores && shooter.teamId && this.teamScores[shooter.teamId]) {
          this.teamScores[shooter.teamId].queenPocketed = true;
        }
      }
    }

    if (score) {
      score.points += playerDelta;
    }

    let teamDelta = 0;
    if (this.teamScores && shooter.teamId && this.teamScores[shooter.teamId]) {
      this.teamScores[shooter.teamId].points += playerDelta;
      teamDelta = playerDelta;
    }

    return { playerDelta, teamDelta };
  }

  public deductPenaltyPoints(shooter: Player, points: number): void {
    if (points <= 0) return;
    const score = this.playerScores[shooter.id];
    if (score) {
      score.points = Math.max(0, score.points - points);
    }

    if (this.teamScores && shooter.teamId && this.teamScores[shooter.teamId]) {
      this.teamScores[shooter.teamId].points = Math.max(0, this.teamScores[shooter.teamId].points - points);
    }
  }

  public recordFoul(shooter: Player, penaltyDueCount: number): void {
    const score = this.playerScores[shooter.id];
    if (score) {
      score.fouls += 1;
      score.penaltiesDue += penaltyDueCount;
    }
  }

  public recordExtraTurn(shooter: Player): void {
    const score = this.playerScores[shooter.id];
    if (score) {
      score.extraTurnsEarned += 1;
    }
  }

  public recordHistory(
    turnNumber: number,
    shooter: Player,
    pointsDelta: number,
    pocketedCoins: CoinType[],
    foulPenalty: number
  ): void {
    this.history.push({
      turnNumber,
      playerId: shooter.id,
      teamId: shooter.teamId,
      pointsDelta,
      totalPoints: this.playerScores[shooter.id]?.points ?? 0,
      pocketedCoins,
      foulPenalty,
      timestamp: Date.now(),
    });
  }

  public getPlayerScore(playerId: PlayerId): GameScore | undefined {
    return this.playerScores[playerId];
  }

  public getAllPlayerScores(): Record<PlayerId, GameScore> {
    return { ...this.playerScores };
  }

  public getTeamScores(): Record<TeamId, TeamScore> | undefined {
    return this.teamScores ? { ...this.teamScores } : undefined;
  }

  public getScoreHistory(): ScoreHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Official SGFI/ICF Board Scoring (Laws 75-79):
   * 1. Winner of the board receives 1 point for each opponent C/M remaining on the board.
   * 2. If the winner covered the Queen, they receive 3 bonus points (subject to 21-point cap).
   * 3. If winner had 21 or more points prior to board settlement, Queen bonus is 0.
   * 4. Loser gets 0 points for the board.
   */
  public settleBoardOutcome(params: {
    winner: Player;
    coinsOnBoard: { type: CoinType; state: string }[];
    queenCoveredByWinner: boolean;
  }): {
    winnerPoints: number;
    remainingOpponentCoins: number;
    queenBonus: number;
  } {
    const { winner, coinsOnBoard, queenCoveredByWinner } = params;
    const remainingOpponentCoins = coinsOnBoard.filter(
      (c) => c.state === 'on_board' && this.ruleset.isOpponentCoin(winner, c.type)
    ).length;

    const currentScore = this.playerScores[winner.id]?.points ?? 0;
    const queenBonus =
      queenCoveredByWinner && currentScore < 21 ? this.ruleset.getPointsForCoin('queen') : 0;
    const totalPoints = remainingOpponentCoins + queenBonus;

    const score = this.playerScores[winner.id];
    if (score) {
      score.points += totalPoints;
      if (queenCoveredByWinner) {
        score.queenPocketed = true;
      }
    }

    if (this.teamScores && winner.teamId && this.teamScores[winner.teamId]) {
      this.teamScores[winner.teamId].points += totalPoints;
      if (queenCoveredByWinner) {
        this.teamScores[winner.teamId].queenPocketed = true;
      }
    }

    return {
      winnerPoints: totalPoints,
      remainingOpponentCoins,
      queenBonus,
    };
  }
}

