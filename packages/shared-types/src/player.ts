/**
 * Player identity, seating, and role types for CarromVerse.
 */

export type PlayerId = string;

export type TeamId = 'team_a' | 'team_b';

export type PlayerSeat = 0 | 1 | 2 | 3;

export type PlayerPosition = 'bottom' | 'top' | 'left' | 'right';

export type PlayerType = 'human' | 'bot' | 'guest';

export type AssignedCoinType = 'white' | 'black' | 'any';

export interface Player {
  id: PlayerId;
  name: string;
  avatarUrl?: string;
  type: PlayerType;
  seat: PlayerSeat;
  position: PlayerPosition;
  teamId?: TeamId;
  assignedCoinType: AssignedCoinType;
  isReady: boolean;
  score: number;
  fouls: number;
}

export interface PlayerSetupInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  type: PlayerType;
  seat: PlayerSeat;
  teamId?: TeamId;
}

