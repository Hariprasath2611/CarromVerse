import { GameResult, Player, PlayerSeat } from '@carromverse/shared-types';

export interface MatchLiveSummary {
  activeSeat: PlayerSeat;
  activePlayerName: string;
  isGameOver: boolean;
  scores: Record<string, number>;
  winner?: Player;
  result?: GameResult;
}

export class MatchStatusTracker {
  private activeSeat: PlayerSeat = 0;
  private isGameOver = false;
  private scores: Map<string, number> = new Map();
  private winner?: Player;

  public setActiveSeat(seat: PlayerSeat): void {
    this.activeSeat = seat;
  }

  public updateScore(playerId: string, score: number): void {
    this.scores.set(playerId, score);
  }

  public setGameOver(winner?: Player): void {
    this.isGameOver = true;
    this.winner = winner;
  }

  public getSummary(players: Player[]): MatchLiveSummary {
    const activePlayer = players.find((p) => p.seat === this.activeSeat) || players[0];
    const scoresObj: Record<string, number> = {};
    for (const p of players) {
      scoresObj[p.id] = this.scores.get(p.id) ?? p.score ?? 0;
    }

    return {
      activeSeat: this.activeSeat,
      activePlayerName: activePlayer.name,
      isGameOver: this.isGameOver,
      scores: scoresObj,
      winner: this.winner,
    };
  }
}
