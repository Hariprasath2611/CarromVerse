import { GameMode, Player, PlayerId, PlayerSeat, PlayerTurn } from '@carromverse/shared-types';

export class TurnManager {
  private mode: GameMode;
  private players: Player[];
  private currentTurnIndex: number = 0;
  private turnCounter: number = 1;
  private timeLimitSeconds: number;

  constructor(mode: GameMode, players: Player[], timeLimitSeconds: number = 25) {
    this.mode = mode;
    this.players = [...players].sort((a, b) => a.seat - b.seat);
    this.timeLimitSeconds = timeLimitSeconds;
  }

  public getActivePlayer(): Player {
    if (this.players.length === 0) {
      throw new Error('No players registered in TurnManager');
    }
    return this.players[this.currentTurnIndex % this.players.length];
  }

  public getTurnOrder(): PlayerSeat[] {
    switch (this.mode) {
      case 'two_player_individual':
        // Seated at Bottom (0) and Top (2)
        return [0, 2];
      case 'three_player_individual':
        // Seated at 0, 1, 2
        return [0, 1, 2];
      case 'four_player_team':
        // Team A (0, 2), Team B (1, 3). Alternates A -> B -> A -> B
        return [0, 1, 2, 3];
      case 'four_player_individual':
        return [0, 1, 2, 3];
      case 'practice':
      default:
        return [0];
    }
  }

  public createInitialTurn(): PlayerTurn {
    const activePlayer = this.getActivePlayer();
    return {
      turnNumber: this.turnCounter,
      activePlayerId: activePlayer.id,
      activeSeat: activePlayer.seat,
      phase: 'positioning',
      turnStartTime: Date.now(),
      timeRemainingSeconds: this.timeLimitSeconds,
      strikerPlaced: false,
      shotTaken: false,
    };
  }

  public advanceTurn(earnedExtraTurn: boolean = false): PlayerTurn {
    if (!earnedExtraTurn && this.mode !== 'practice') {
      this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
    }

    this.turnCounter += 1;
    const activePlayer = this.getActivePlayer();

    return {
      turnNumber: this.turnCounter,
      activePlayerId: activePlayer.id,
      activeSeat: activePlayer.seat,
      phase: 'positioning',
      turnStartTime: Date.now(),
      timeRemainingSeconds: this.timeLimitSeconds,
      strikerPlaced: false,
      shotTaken: false,
    };
  }

  public getTurnNumber(): number {
    return this.turnCounter;
  }
}

