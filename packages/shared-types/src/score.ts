import { PlayerId, TeamId } from './player.js';

export interface GameScore {
  playerId: PlayerId;
  teamId?: TeamId;
  points: number;
  whiteCoinsPocketed: number;
  blackCoinsPocketed: number;
  queenPocketed: boolean;
  fouls: number;
  penaltiesDue: number;
  extraTurnsEarned: number;
}

export interface TeamScore {
  teamId: TeamId;
  points: number;
  playerIds: PlayerId[];
  whiteCoinsPocketed: number;
  blackCoinsPocketed: number;
  queenPocketed: boolean;
}
