import { create } from 'zustand';
import {
  GameConfiguration,
  GameResult,
  GameScore,
  Player,
  PlayerTurn,
  QueenStatus,
  ShotResult,
  ShotSettlementInput,
} from '@carromverse/shared-types';
import {
  CarromRulesEngine,
  CarromStateMachine,
  SettledShotEvaluation,
} from '@carromverse/game-logic';
import { SyncService } from '../services/sync/syncService';

interface GameSessionState {
  stateMachine: CarromStateMachine | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTurn: PlayerTurn | null;
  scores: Record<string, GameScore>;
  queenStatus: QueenStatus;
  lastShotResult: ShotResult | null;
  lastSettledEvaluation: SettledShotEvaluation | null;
  gameResult: GameResult | null;

  startSession: (config: GameConfiguration, players: Player[]) => void;
  processSettledShot: (input: ShotSettlementInput) => SettledShotEvaluation | null;
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
  lastSettledEvaluation: null,
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
      lastSettledEvaluation: null,
      gameResult: null,
    });
  },

  processSettledShot: (input) => {
    const sm = get().stateMachine;
    if (!sm) return null;

    const evalResult = sm.processShotSettlement(input);
    const session = sm.getSessionState();

    set({
      scores: session.scores,
      lastSettledEvaluation: evalResult,
      queenStatus: evalResult.queenStatusAfter,
      currentTurn: evalResult.nextTurn ?? session.currentTurn,
      gameResult: evalResult.matchResult ?? null,
      isPlaying: !evalResult.isMatchOver,
    });

    return evalResult;
  },

  recordPhysicalShot: (pocketedCoins, strikerPocketed) => {
    const sm = get().stateMachine;
    if (!sm) return null;

    const evalResult = sm.processShotSettlement({
      pocketedCoins: pocketedCoins.map((c) => ({ id: c.id ?? '', type: c.type ?? 'white' })),
      strikerPocketed,
    });
    const session = sm.getSessionState();

    const shotResult: ShotResult = {
      pocketedCoins: evalResult.pocketedCoins.map((c) => c.type as any),
      pocketedCoinIds: evalResult.pocketedCoins.map((c) => c.id),
      foulCommitted: evalResult.foulOccurred,
      foulType: evalResult.primaryFoulType,
      fouls: evalResult.fouls,
      queenPocketedThisShot: evalResult.pocketedCoins.some((c) => c.type === 'queen'),
      queenCoveredThisShot: evalResult.queenCoveredThisShot,
      queenReturnedToCenter: evalResult.queenReturnedToCenter,
      extraTurnEarned: evalResult.extraTurnEarned,
      penaltyCoinsDue: evalResult.fouls.reduce((acc, f) => acc + f.penaltyCoins, 0),
      coinsToReturnToBoard: evalResult.coinsToReturnToBoard,
    };

    set({
      scores: session.scores,
      lastShotResult: shotResult,
      lastSettledEvaluation: evalResult,
      queenStatus: evalResult.queenStatusAfter,
      currentTurn: evalResult.nextTurn ?? session.currentTurn,
      gameResult: evalResult.matchResult ?? null,
      isPlaying: !evalResult.isMatchOver,
    });

    return shotResult;
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
      lastSettledEvaluation: null,
    }),
}));
