import { GameMode, PlayerPosition, PlayerSeat } from '@carromverse/shared-types';

export const SEAT_DIRECTION_LABELS: Record<PlayerSeat, string> = {
  0: 'South (Bottom)',
  1: 'East (Right)',
  2: 'North (Top)',
  3: 'West (Left)',
};

export class SeatManager {
  public static getSeatDirectionLabel(seat: PlayerSeat): string {
    return SEAT_DIRECTION_LABELS[seat] || 'Unknown';
  }

  public static getNextSeat(currentSeat: PlayerSeat, activeSeats: PlayerSeat[]): PlayerSeat {
    if (!activeSeats || activeSeats.length === 0) return currentSeat;
    const sorted = [...activeSeats].sort((a, b) => a - b);
    const currentIndex = sorted.indexOf(currentSeat);
    if (currentIndex === -1) return sorted[0];
    return sorted[(currentIndex + 1) % sorted.length];
  }

  public static getOppositeSeat(seat: PlayerSeat): PlayerSeat {
    return ((seat + 2) % 4) as PlayerSeat;
  }

  public static getActiveSeatsForMode(mode: GameMode): PlayerSeat[] {
    switch (mode) {
      case 'two_player_individual':
        return [0, 2];
      case 'three_player_individual':
        return [0, 1, 2];
      case 'four_player_team':
      case 'four_player_individual':
      default:
        return [0, 1, 2, 3];
    }
  }

  public static getPositionForSeat(seat: PlayerSeat): PlayerPosition {
    switch (seat) {
      case 0:
        return 'bottom';
      case 1:
        return 'right';
      case 2:
        return 'top';
      case 3:
        return 'left';
      default:
        return 'bottom';
    }
  }
}
