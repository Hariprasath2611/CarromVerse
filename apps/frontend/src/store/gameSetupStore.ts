import { create } from 'zustand';
import {
  GameMode,
  Player,
  PlayerCount,
  PlayerSeat,
} from '@carromverse/shared-types';
import {
  createInitialPlayersForMode,
  validatePlayerConfiguration,
  getSeatLayoutForMode,
} from '@carromverse/game-logic';
import { LocalStorageService } from '../services/storage/localStorageService';

export interface GameSetupState {
  selectedMode: GameMode;
  playerCount: PlayerCount;
  players: Player[];
  boardTheme: 'classic' | 'emerald' | 'mahogany';
  targetPoints: number;
  turnTimeLimitSec: number;
  handoverConfirmationEnabled: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  teamAName: string;
  teamBName: string;
  recentNames: string[];

  setGameMode: (mode: GameMode) => void;
  setPlayerCount: (count: PlayerCount) => void;
  updatePlayerName: (seat: PlayerSeat, name: string) => void;
  updatePlayerAvatar: (seat: PlayerSeat, avatar: string) => void;
  togglePlayerReady: (seat: PlayerSeat) => void;
  setTeamAName: (name: string) => void;
  setTeamBName: (name: string) => void;
  swapTeamPlayers: (seatA: PlayerSeat, seatB: PlayerSeat) => void;
  setBoardTheme: (theme: 'classic' | 'emerald' | 'mahogany') => void;
  setTargetPoints: (points: number) => void;
  setTurnTimeLimitSec: (seconds: number) => void;
  setHandoverConfirmationEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  loadRecentNames: () => Promise<void>;
  validateSetup: () => { isValid: boolean; error?: string };
  resetSetup: () => void;
}

export const useGameSetupStore = create<GameSetupState>((set, get) => ({
  selectedMode: 'two_player_individual',
  playerCount: 2,
  players: createInitialPlayersForMode('two_player_individual'),
  boardTheme: 'classic',
  targetPoints: 25,
  turnTimeLimitSec: 25,
  handoverConfirmationEnabled: true,
  soundEnabled: true,
  musicEnabled: true,
  teamAName: 'Team A',
  teamBName: 'Team B',
  recentNames: [],

  loadRecentNames: async () => {
    const recent = await LocalStorageService.getRecentPlayerNames();
    set({ recentNames: recent });
  },

  setGameMode: (mode: GameMode) => {
    const { teamAName, teamBName } = get();
    const players = createInitialPlayersForMode(mode, { teamAName, teamBName });
    const count: PlayerCount =
      mode === 'two_player_individual' ? 2 : mode === 'three_player_individual' ? 3 : 4;

    set({
      selectedMode: mode,
      playerCount: count,
      players,
    });
  },

  setPlayerCount: (count: PlayerCount) => {
    let mode: GameMode = 'two_player_individual';
    if (count === 3) mode = 'three_player_individual';
    else if (count === 4) mode = 'four_player_individual';

    const { teamAName, teamBName } = get();
    const players = createInitialPlayersForMode(mode, { teamAName, teamBName });
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
    // Save non-default custom name to local storage
    if (name.trim()) {
      LocalStorageService.saveRecentPlayerName(name.trim()).catch(() => {});
    }
  },

  updatePlayerAvatar: (seat: PlayerSeat, avatar: string) => {
    set((state) => ({
      players: state.players.map((p) => (p.seat === seat ? { ...p, avatarUrl: avatar } : p)),
    }));
  },

  togglePlayerReady: (seat: PlayerSeat) => {
    set((state) => ({
      players: state.players.map((p) =>
        p.seat === seat ? { ...p, isReady: !p.isReady } : p
      ),
    }));
  },

  setTeamAName: (name: string) => {
    const newName = name.trim() || 'Team A';
    set((state) => ({
      teamAName: newName,
      players: state.players.map((p) => {
        if (p.teamId === 'team_a') {
          return {
            ...p,
            name: p.name.startsWith('Team A')
              ? `${newName} (Seat ${p.seat})`
              : p.name,
          };
        }
        return p;
      }),
    }));
  },

  setTeamBName: (name: string) => {
    const newName = name.trim() || 'Team B';
    set((state) => ({
      teamBName: newName,
      players: state.players.map((p) => {
        if (p.teamId === 'team_b') {
          return {
            ...p,
            name: p.name.startsWith('Team B')
              ? `${newName} (Seat ${p.seat})`
              : p.name,
          };
        }
        return p;
      }),
    }));
  },

  swapTeamPlayers: (seatA: PlayerSeat, seatB: PlayerSeat) => {
    set((state) => {
      const idxA = state.players.findIndex((p) => p.seat === seatA);
      const idxB = state.players.findIndex((p) => p.seat === seatB);
      if (idxA === -1 || idxB === -1) return state;

      const playerA = state.players[idxA];
      const playerB = state.players[idxB];

      const newPlayers = [...state.players];
      newPlayers[idxA] = {
        ...playerA,
        seat: playerB.seat,
        position: playerB.position,
        teamId: playerB.teamId,
        assignedCoinType: playerB.assignedCoinType,
      };
      newPlayers[idxB] = {
        ...playerB,
        seat: playerA.seat,
        position: playerA.position,
        teamId: playerA.teamId,
        assignedCoinType: playerA.assignedCoinType,
      };

      return { players: newPlayers };
    });
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

  setHandoverConfirmationEnabled: (enabled: boolean) => {
    set({ handoverConfirmationEnabled: enabled });
  },

  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
  },

  setMusicEnabled: (enabled: boolean) => {
    set({ musicEnabled: enabled });
  },

  validateSetup: () => {
    const { selectedMode, players } = get();
    return validatePlayerConfiguration(selectedMode, players);
  },

  resetSetup: () => {
    set({
      selectedMode: 'two_player_individual',
      playerCount: 2,
      players: createInitialPlayersForMode('two_player_individual'),
      boardTheme: 'classic',
      targetPoints: 25,
      turnTimeLimitSec: 25,
      handoverConfirmationEnabled: true,
      soundEnabled: true,
      musicEnabled: true,
      teamAName: 'Team A',
      teamBName: 'Team B',
    });
  },
}));
