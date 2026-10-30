import { create } from 'zustand';
import { GameMode, Player, PlayerCount, PlayerPosition, PlayerSeat } from '@carromverse/shared-types';
import { createDefaultGameConfig } from '@carromverse/game-logic';

interface GameSetupState {
  selectedMode: GameMode;
  playerCount: PlayerCount;
  players: Player[];

  setGameMode: (mode: GameMode) => void;
  updatePlayerName: (seat: PlayerSeat, name: string) => void;
  resetSetup: () => void;
}

function generateInitialPlayers(mode: GameMode): Player[] {
  const positions: PlayerPosition[] = ['bottom', 'right', 'top', 'left'];

  switch (mode) {
    case 'two_player_individual':
      return [
        {
          id: 'player_0',
          name: 'Player 1',
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
        type: 'human',
        seat: seat as PlayerSeat,
        position: positions[seat],
        assignedCoinType: 'any',
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

  setGameMode: (mode: GameMode) => {
    const players = generateInitialPlayers(mode);
    set({
      selectedMode: mode,
      playerCount: players.length as PlayerCount,
      players,
    });
  },

  updatePlayerName: (seat: PlayerSeat, name: string) => {
    set((state) => ({
      players: state.players.map((p) => (p.seat === seat ? { ...p, name } : p)),
    }));
  },

  resetSetup: () => {
    set({
      selectedMode: 'two_player_individual',
      playerCount: 2,
      players: generateInitialPlayers('two_player_individual'),
    });
  },
}));

