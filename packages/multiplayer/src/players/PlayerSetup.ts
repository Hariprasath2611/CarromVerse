import {
  AssignedCoinType,
  GameMode,
  Player,
  PlayerPosition,
  PlayerSeat,
  TeamId,
} from '@carromverse/shared-types';
import { AvatarRegistry } from './AvatarRegistry.js';

export interface SeatLayout {
  seat: PlayerSeat;
  position: PlayerPosition;
  positionLabel: string;
  defaultName: string;
  defaultAvatar: string;
  defaultCoinType: AssignedCoinType;
  teamId?: TeamId;
  teamLabel?: string;
}

export class PlayerSetup {
  public static getSeatLayoutForMode(
    mode: GameMode,
    options?: { teamAName?: string; teamBName?: string }
  ): SeatLayout[] {
    const teamAName = options?.teamAName || 'Team A';
    const teamBName = options?.teamBName || 'Team B';

    switch (mode) {
      case 'two_player_individual':
        return [
          {
            seat: 0,
            position: 'bottom',
            positionLabel: 'South (Bottom)',
            defaultName: 'Player 1',
            defaultAvatar: '👑',
            defaultCoinType: 'white',
          },
          {
            seat: 2,
            position: 'top',
            positionLabel: 'North (Top)',
            defaultName: 'Player 2',
            defaultAvatar: '🐯',
            defaultCoinType: 'black',
          },
        ];

      case 'three_player_individual':
        return [
          {
            seat: 0,
            position: 'bottom',
            positionLabel: 'South (Bottom)',
            defaultName: 'Player 1',
            defaultAvatar: '👑',
            defaultCoinType: 'any',
          },
          {
            seat: 1,
            position: 'right',
            positionLabel: 'East (Right)',
            defaultName: 'Player 2',
            defaultAvatar: '🐯',
            defaultCoinType: 'any',
          },
          {
            seat: 2,
            position: 'top',
            positionLabel: 'North (Top)',
            defaultName: 'Player 3',
            defaultAvatar: '🦅',
            defaultCoinType: 'any',
          },
        ];

      case 'four_player_team':
        return [
          {
            seat: 0,
            position: 'bottom',
            positionLabel: 'South (Bottom)',
            defaultName: `${teamAName} (P1)`,
            defaultAvatar: '👑',
            defaultCoinType: 'white',
            teamId: 'team_a',
            teamLabel: teamAName,
          },
          {
            seat: 1,
            position: 'right',
            positionLabel: 'East (Right)',
            defaultName: `${teamBName} (P1)`,
            defaultAvatar: '🐯',
            defaultCoinType: 'black',
            teamId: 'team_b',
            teamLabel: teamBName,
          },
          {
            seat: 2,
            position: 'top',
            positionLabel: 'North (Top)',
            defaultName: `${teamAName} (P2)`,
            defaultAvatar: '🦅',
            defaultCoinType: 'white',
            teamId: 'team_a',
            teamLabel: teamAName,
          },
          {
            seat: 3,
            position: 'left',
            positionLabel: 'West (Left)',
            defaultName: `${teamBName} (P2)`,
            defaultAvatar: '🦁',
            defaultCoinType: 'black',
            teamId: 'team_b',
            teamLabel: teamBName,
          },
        ];

      case 'four_player_individual':
      default:
        return [
          {
            seat: 0,
            position: 'bottom',
            positionLabel: 'South (Bottom)',
            defaultName: 'Player 1',
            defaultAvatar: '👑',
            defaultCoinType: 'any',
          },
          {
            seat: 1,
            position: 'right',
            positionLabel: 'East (Right)',
            defaultName: 'Player 2',
            defaultAvatar: '🐯',
            defaultCoinType: 'any',
          },
          {
            seat: 2,
            position: 'top',
            positionLabel: 'North (Top)',
            defaultName: 'Player 3',
            defaultAvatar: '🦅',
            defaultCoinType: 'any',
          },
          {
            seat: 3,
            position: 'left',
            positionLabel: 'West (Left)',
            defaultName: 'Player 4',
            defaultAvatar: '🦁',
            defaultCoinType: 'any',
          },
        ];
    }
  }

  public static createInitialPlayersForMode(
    mode: GameMode,
    options?: {
      customNames?: Record<number, string>;
      customAvatars?: Record<number, string>;
      teamAName?: string;
      teamBName?: string;
    }
  ): Player[] {
    const layouts = this.getSeatLayoutForMode(mode, options);

    return layouts.map((layout) => ({
      id: `player_${layout.seat}`,
      name: options?.customNames?.[layout.seat] || layout.defaultName,
      avatarUrl: options?.customAvatars?.[layout.seat] || layout.defaultAvatar,
      type: 'human' as const,
      seat: layout.seat,
      position: layout.position,
      teamId: layout.teamId,
      assignedCoinType: layout.defaultCoinType,
      isReady: true,
      score: 0,
      fouls: 0,
    }));
  }
}

