import { create } from 'zustand';
import {
  GameConfiguration,
  GameResult,
  GameScore,
  Player,
  PlayerTurn,
  QueenStatus,
  ShotResult,
} from '@carromverse/shared-types';
import { CarromStateMachine, createDefaultGameConfig } from '@carromverse/game-logic';
import { SyncService } from '../services/sync/syncService';

interface GameSessionState {
  stateMachine: CarromStateMachine | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTurn: PlayerTurn | null;
  scores: Record<string, GameScore>;
  queenStatus: QueenStatus;
  lastShotResult: ShotResult | null;
  gameResult: GameResult | null;

  startSession: (config: GameConfiguration, players: Player[]) => void;
  recordPhysicalShot: (pocketedCoins: any[], strikerPocketed: boolean) => ShotResult | null;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
}

export const useGameSessionStore = create<GameSessionState>((set, get) => ({
  stateMachine: null,
  isPlaying: false,
  isPaused: false,
  currentTurn: null,
  scores: {},
  queenStatus: 'unpocketed',
  lastShotResult: null,
  gameResult: null,

  startSession: (config, players) => {
    const sm = new CarromStateMachine(config, players);
    const session = sm.getSessionState();

    // Listen to state machine events
    sm.on('TURN_CHANGED', ({ activePlayerId, turnNumber }) => {
      set((s) => ({
        currentTurn: s.currentTurn
          ? { ...s.currentTurn, activePlayerId, turnNumber }
          : null,
      }));
    });

    sm.on('QUEEN_STATUS_CHANGED', ({ status }) => {
      set({ queenStatus: status });
    });

    sm.on('MATCH_COMPLETED', ({ result }) => {
      set({ gameResult: result, isPlaying: false });
      // Record completed match locally and trigger offline sync
      SyncService.recordCompletedMatch(result).catch((err) => {
        console.warn('[GameSessionStore] Failed to record completed match:', err);
      });
    });

    set({
      stateMachine: sm,
      isPlaying: true,
      isPaused: false,
      currentTurn: session.currentTurn,
      scores: session.scores,
      queenStatus: 'unpocketed',
      lastShotResult: null,
      gameResult: null,
    });
  },

  recordPhysicalShot: (pocketedCoins, strikerPocketed) => {
    const sm = get().stateMachine;
    if (!sm) return null;

    const result = sm.processShot(pocketedCoins, strikerPocketed);
    const session = sm.getSessionState();

    set({
      scores: session.scores,
      lastShotResult: result,
      queenStatus: session.queenStatus,
      currentTurn: session.currentTurn,
    });

    return result;
  },

  pauseSession: () => set({ isPaused: true }),
  resumeSession: () => set({ isPaused: false }),
  endSession: () =>
    set({
      stateMachine: null,
      isPlaying: false,
      isPaused: false,
      currentTurn: null,
      lastShotResult: null,
    }),
}));
