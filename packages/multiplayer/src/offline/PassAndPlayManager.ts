import { Player, PlayerSeat } from '@carromverse/shared-types';
import { SeatManager } from './SeatManager.js';

export interface HandoverPrompt {
  fromSeat: PlayerSeat;
  toSeat: PlayerSeat;
  nextPlayerName: string;
  nextPlayerAvatar: string;
  seatDirection: string;
  isConfirmed: boolean;
}

export class PassAndPlayManager {
  private confirmationRequired: boolean;

  constructor(confirmationRequired = true) {
    this.confirmationRequired = confirmationRequired;
  }

  public setConfirmationRequired(enabled: boolean): void {
    this.confirmationRequired = enabled;
  }

  public isConfirmationRequired(): boolean {
    return this.confirmationRequired;
  }

  public createHandoverPrompt(
    fromPlayer: Player,
    toPlayer: Player
  ): HandoverPrompt {
    return {
      fromSeat: fromPlayer.seat,
      toSeat: toPlayer.seat,
      nextPlayerName: toPlayer.name,
      nextPlayerAvatar: toPlayer.avatarUrl,
      seatDirection: SeatManager.getSeatDirectionLabel(toPlayer.seat),
      isConfirmed: !this.confirmationRequired,
    };
  }
}
