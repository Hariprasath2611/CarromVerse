import { Coin, GameConfiguration, GameResult, GameScore, Player, PlayerId } from '@carromverse/shared-types';

export class ScoreManager {
  private config: GameConfiguration;
  private scores: Record<PlayerId, GameScore> = {};

  constructor(config: GameConfiguration, players: Player[]) {
    this.config = config;
    for (const p of players) {
      this.scores[p.id] = {
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
    }
  }

  public getScore(playerId: PlayerId): GameScore | undefined {
    return this.scores[playerId];
  }

  public getAllScores(): Record<PlayerId, GameScore> {
    return { ...this.scores };
  }

  public recordPocketedCoin(playerId: PlayerId, coin: Coin): void {
    const s = this.scores[playerId];
    if (!s) return;

    if (coin.type === 'white') {
      s.whiteCoinsPocketed += 1;
      s.points += this.config.whiteCoinPoints;
    } else if (coin.type === 'black') {
      s.blackCoinsPocketed += 1;
      s.points += this.config.blackCoinPoints;
    } else if (coin.type === 'queen') {
      s.queenPocketed = true;
      s.points += this.config.queenPoints;
    }
  }

  public recordFoul(playerId: PlayerId, penaltyDue: number): void {
    const s = this.scores[playerId];
    if (!s) return;

    s.fouls += 1;
    s.penaltiesDue += penaltyDue;
    // Optional point deduction depending on variant
    s.points = Math.max(0, s.points - penaltyDue * this.config.blackCoinPoints);
  }

  public checkWinner(
    players: Player[],
    remainingCoins: Coin[],
    roundCount: number
  ): { hasWinner: boolean; winner?: Player; isDraw?: boolean } {
    // 1. Check if all target coins on board are cleared
    const onBoardCoins = remainingCoins.filter((c) => c.state === 'on_board');
    const boardCleared = onBoardCoins.length === 0;

    // 2. Check if any player has reached targetScore
    for (const p of players) {
      const score = this.scores[p.id];
      if (score && score.points >= this.config.targetScore) {
        return { hasWinner: true, winner: p };
      }
    }

    if (boardCleared || roundCount >= this.config.maxRounds) {
      // Highest score wins
      let highestScore = -1;
      let winningPlayer: Player | undefined;
      let isDraw = false;

      for (const p of players) {
        const score = this.scores[p.id]?.points ?? 0;
        if (score > highestScore) {
          highestScore = score;
          winningPlayer = p;
          isDraw = false;
        } else if (score === highestScore) {
          isDraw = true;
        }
      }

      if (isDraw) {
        return { hasWinner: true, isDraw: true };
      }

      return { hasWinner: true, winner: winningPlayer };
    }

    return { hasWinner: false };
  }
}

