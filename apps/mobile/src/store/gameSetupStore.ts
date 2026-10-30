import { create } from 'zustand';
import { GameMode, Player, PlayerCount, PlayerPosition, PlayerSeat } from '@carromverse/shared-types';

export interface GameSetupState {
  selectedMode: GameMode;
  playerCount: PlayerCount;
  players: Player[];
  boardTheme: 'classic' | 'emerald' | 'mahogany';
  targetPoints: number;
  turnTimeLimitSec: number;

  setGameMode: (mode: GameMode) => void;
  setPlayerCount: (count: PlayerCount) => void;
  updatePlayerName: (seat: PlayerSeat, name: string) => void;
  updatePlayerAvatar: (seat: PlayerSeat, avatar: string) => void;
  setBoardTheme: (theme: 'classic' | 'emerald' | 'mahogany') => void;
  setTargetPoints: (points: number) => void;
  setTurnTimeLimitSec: (seconds: number) => void;
  resetSetup: () => void;
}

const DEFAULT_AVATARS: Record<number, string> = {
  0: '👑',
  1: '🐯',
  2: '🦅',
  3: '🦁',
};

function generateInitialPlayers(mode: GameMode): Player[] {
  const positions: PlayerPosition[] = ['bottom', 'right', 'top', 'left'];

  switch (mode) {
    case 'two_player_individual':
      return [
        {
          id: 'player_0',
          name: 'Player 1',
          avatarUrl: DEFAULT_AVATARS[0],
          type: 'human',
          seat: 0,
          position: 'bottom',
          assignedCoinType: 'white',
          isReady: true,
          score: 0,
          fouls: 0,
        },
        {
          id: 'player_1',
          name: 'Player 2',
          avatarUrl: DEFAULT_AVATARS[1],
          type: 'human',
          seat: 2,
          position: 'top',
          assignedCoinType: 'black',
          isReady: true,
          score: 0,
          fouls: 0,
        },
      ];

    case 'three_player_individual':
      return [
        {
          id: 'player_0',
          name: 'Player 1',
          avatarUrl: DEFAULT_AVATARS[0],
          type: 'human',
          seat: 0,
          position: 'bottom',
          assignedCoinType: 'any',
          isReady: true,
          score: 0,
          fouls: 0,
        },
        {
          id: 'player_1',
          name: 'Player 2',
          avatarUrl: DEFAULT_AVATARS[1],
          type: 'human',
          seat: 1,
          position: 'right',
          assignedCoinType: 'any',
          isReady: true,
          score: 0,
          fouls: 0,
        },
        {
          id: 'player_2',
          name: 'Player 3',
          avatarUrl: DEFAULT_AVATARS[2],
          type: 'human',
          seat: 2,
          position: 'top',
          assignedCoinType: 'any',
          isReady: true,
          score: 0,
          fouls: 0,
        },
      ];

    case 'four_player_team':
      return [
        {
          id: 'player_0',
          name: 'Team A (P1)',
          avatarUrl: DEFAULT_AVATARS[0],
          type: 'human',
          seat: 0,
          position: 'bottom',
          teamId: 'team_a',
          assignedCoinType: 'white',
          isReady: true,
          score: 0,
          fouls: 0,
        },
        {
          id: 'player_1',
          name: 'Team B (P1)',
          avatarUrl: DEFAULT_AVATARS[1],
          type: 'human',
          seat: 1,
          position: 'right',
          teamId: 'team_b',
          assignedCoinType: 'black',
          isReady: true,
          score: 0,
          fouls: 0,
        },
        {
          id: 'player_2',
          name: 'Team A (P2)',
          avatarUrl: DEFAULT_AVATARS[2],
          type: 'human',
          seat: 2,
          position: 'top',
          teamId: 'team_a',
          assignedCoinType: 'white',
          isReady: true,
          score: 0,
          fouls: 0,
        },
        {
          id: 'player_3',
          name: 'Team B (P2)',
          avatarUrl: DEFAULT_AVATARS[3],
          type: 'human',
          seat: 3,
          position: 'left',
          teamId: 'team_b',
          assignedCoinType: 'black',
          isReady: true,
          score: 0,
          fouls: 0,
        },
      ];

    case 'four_player_individual':
      return [0, 1, 2, 3].map((seat) => ({
        id: `player_${seat}`,
        name: `Player ${seat + 1}`,
        avatarUrl: DEFAULT_AVATARS[seat],
        type: 'human' as const,
        seat: seat as PlayerSeat,
        position: positions[seat],
        assignedCoinType: 'any' as const,
        isReady: true,
        score: 0,
        fouls: 0,
      }));

    case 'practice':
    default:
      return [
        {
          id: 'player_solo',
          name: 'Solo Player',
          avatarUrl: DEFAULT_AVATARS[0],
          type: 'human',
          seat: 0,
          position: 'bottom',
          assignedCoinType: 'any',
          isReady: true,
          score: 0,
          fouls: 0,
        },
      ];
  }
}

export const useGameSetupStore = create<GameSetupState>((set) => ({
  selectedMode: 'two_player_individual',
  playerCount: 2,
  players: generateInitialPlayers('two_player_individual'),
  boardTheme: 'classic',
  targetPoints: 25,
  turnTimeLimitSec: 25,

  setGameMode: (mode: GameMode) => {
    const players = generateInitialPlayers(mode);
    set({
      selectedMode: mode,
      playerCount: players.length as PlayerCount,
      players,
    });
  },

  setPlayerCount: (count: PlayerCount) => {
    let mode: GameMode = 'two_player_individual';
    if (count === 3) mode = 'three_player_individual';
    else if (count === 4) mode = 'four_player_individual';
    const players = generateInitialPlayers(mode);
    set({
      selectedMode: mode,
      playerCount: count,
      players,
    });
  },

  updatePlayerName: (seat: PlayerSeat, name: string) => {
    set((state) => ({
      players: state.players.map((p) => (p.seat === seat ? { ...p, name } : p)),
    }));
  },

  updatePlayerAvatar: (seat: PlayerSeat, avatar: string) => {
    set((state) => ({
      players: state.players.map((p) => (p.seat === seat ? { ...p, avatarUrl: avatar } : p)),
    }));
  },

  setBoardTheme: (theme: 'classic' | 'emerald' | 'mahogany') => {
    set({ boardTheme: theme });
  },

  setTargetPoints: (points: number) => {
    set({ targetPoints: points });
  },

  setTurnTimeLimitSec: (seconds: number) => {
    set({ turnTimeLimitSec: seconds });
  },

  resetSetup: () => {
    set({
      selectedMode: 'two_player_individual',
      playerCount: 2,
      players: generateInitialPlayers('two_player_individual'),
      boardTheme: 'classic',
      targetPoints: 25,
      turnTimeLimitSec: 25,
    });
  },
}));


