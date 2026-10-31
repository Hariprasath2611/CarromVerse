import {
  GameMode,
  Player,
  PlayerId,
  PlayerSeat,
  PlayerTurn,
  TurnPhase,
} from '@carromverse/shared-types';

export class TurnManager {
  private mode: GameMode;
  private players: Player[];
  private currentTurnIndex: number = 0;
  private turnCounter: number = 1;
  private timeLimitSeconds: number;
  private isLocked: boolean = false;
  private eliminatedPlayerIds: Set<PlayerId> = new Set();
  private currentTurn: PlayerTurn;

  constructor(mode: GameMode, players: Player[], timeLimitSeconds: number = 25) {
    this.mode = mode;
    this.players = [...players].sort((a, b) => a.seat - b.seat);
    this.timeLimitSeconds = timeLimitSeconds;

    const initial = this.players[0];
    this.currentTurn = {
      turnNumber: 1,
      activePlayerId: initial ? initial.id : '',
      activeSeat: initial ? initial.seat : 0,
      phase: 'positioning',
      turnStartTime: Date.now(),
      timeRemainingSeconds: timeLimitSeconds,
      strikerPlaced: false,
      shotTaken: false,
    };
  }

  public getActivePlayer(): Player {
    if (this.players.length === 0) {
      throw new Error('No players registered in TurnManager');
    }
    const active = this.players[this.currentTurnIndex % this.players.length];
    if (this.eliminatedPlayerIds.has(active.id)) {
      this.advanceTurn(false);
      return this.players[this.currentTurnIndex % this.players.length];
    }
    return active;
  }

  public getActiveSeat(): PlayerSeat {
    return this.getActivePlayer().seat;
  }

  public getCurrentTurn(): PlayerTurn {
    return { ...this.currentTurn };
  }

  public lockTurn(): void {
    this.isLocked = true;
    this.currentTurn.phase = 'simulating';
  }

  public unlockTurn(): void {
    this.isLocked = false;
    this.currentTurn.phase = 'positioning';
  }

  public isTurnLocked(): boolean {
    return this.isLocked;
  }

  public setTurnPhase(phase: TurnPhase): void {
    this.currentTurn.phase = phase;
  }

  public createInitialTurn(): PlayerTurn {
    const active = this.getActivePlayer();
    this.currentTurn = {
      turnNumber: this.turnCounter,
      activePlayerId: active.id,
      activeSeat: active.seat,
      phase: 'positioning',
      turnStartTime: Date.now(),
      timeRemainingSeconds: this.timeLimitSeconds,
      strikerPlaced: false,
      shotTaken: false,
    };
    return { ...this.currentTurn };
  }

  public advanceTurn(earnedExtraTurn: boolean = false): PlayerTurn {
    this.isLocked = false;

    if (!earnedExtraTurn && this.mode !== 'practice') {
      let attempts = 0;
      do {
        this.currentTurnIndex = (this.currentTurnIndex + 1) % this.players.length;
        attempts++;
      } while (
        this.eliminatedPlayerIds.has(this.players[this.currentTurnIndex].id) &&
        attempts < this.players.length
      );
    }

    this.turnCounter += 1;
    const active = this.getActivePlayer();

    this.currentTurn = {
      turnNumber: this.turnCounter,
      activePlayerId: active.id,
      activeSeat: active.seat,
      phase: 'positioning',
      turnStartTime: Date.now(),
      timeRemainingSeconds: this.timeLimitSeconds,
      strikerPlaced: false,
      shotTaken: false,
    };

    return { ...this.currentTurn };
  }

  public eliminatePlayer(playerId: PlayerId): void {
    this.eliminatedPlayerIds.add(playerId);
  }

  public isPlayerEliminated(playerId: PlayerId): boolean {
    return this.eliminatedPlayerIds.has(playerId);
  }

  public getTurnOrder(): PlayerSeat[] {
    switch (this.mode) {
      case 'two_player_individual':
        return [0, 2];
      case 'three_player_individual':
        return [0, 1, 2];
      case 'four_player_team':
        return [0, 1, 2, 3];
      case 'four_player_individual':
        return [0, 1, 2, 3];
      case 'practice':
      default:
        return [0];
    }
  }

  public getTurnNumber(): number {
    return this.turnCounter;
  }
}
