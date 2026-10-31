import { create } from 'zustand';
import {
  GameConfiguration,
  GameResult,
  GameScore,
  OfflineMatchStatus,
  Player,
  PlayerTurn,
  QueenStatus,
  ShotResult,
  ShotSettlementInput,
} from '@carromverse/shared-types';
import {
  CarromStateMachine,
  SettledShotEvaluation,
} from '@carromverse/game-logic';
import { SyncService } from '../services/sync/syncService';

interface GameSessionState {
  stateMachine: CarromStateMachine | null;
  matchStatus: OfflineMatchStatus;
  isPlaying: boolean;
  isPaused: boolean;
  activePlayers: Player[];
  savedConfig: GameConfiguration | null;
  currentTurn: PlayerTurn | null;
  scores: Record<string, GameScore>;
  queenStatus: QueenStatus;
  lastShotResult: ShotResult | null;
  lastSettledEvaluation: SettledShotEvaluation | null;
  gameResult: GameResult | null;

  // Pass-and-play handover state
  isHandoverPending: boolean;
  nextPlayerToHandover: Player | null;

  startSession: (config: GameConfiguration, players: Player[]) => void;
  confirmHandover: () => void;
  processSettledShot: (input: ShotSettlementInput) => SettledShotEvaluation | null;
  recordPhysicalShot: (pocketedCoins: any[], strikerPocketed: boolean) => ShotResult | null;
  pauseSession: () => void;
  resumeSession: () => void;
  restartSession: () => void;
  abandonSession: () => void;
  endSession: () => void;
}

export const useGameSessionStore = create<GameSessionState>((set, get) => ({
  stateMachine: null,
  matchStatus: 'READY',
  isPlaying: false,
  isPaused: false,
  activePlayers: [],
  savedConfig: null,
  currentTurn: null,
  scores: {},
  queenStatus: 'unpocketed',
  lastShotResult: null,
  lastSettledEvaluation: null,
  gameResult: null,
  isHandoverPending: false,
  nextPlayerToHandover: null,

  startSession: (config, players) => {
    const sm = new CarromStateMachine(config, players);
    const session = sm.getSessionState();

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
      set({
        gameResult: result,
        isPlaying: false,
        matchStatus: 'COMPLETED',
        isHandoverPending: false,
        nextPlayerToHandover: null,
      });

      SyncService.recordCompletedMatch(result).catch((err) => {
        console.warn('[GameSessionStore] Failed to record completed match:', err);
      });
    });

    set({
      stateMachine: sm,
      matchStatus: 'IN_PROGRESS',
      isPlaying: true,
      isPaused: false,
      activePlayers: players,
      savedConfig: config,
      currentTurn: session.currentTurn,
      scores: session.scores,
      queenStatus: 'unpocketed',
      lastShotResult: null,
      lastSettledEvaluation: null,
      gameResult: null,
      isHandoverPending: false,
      nextPlayerToHandover: null,
    });
  },

  confirmHandover: () => {
    set({
      isHandoverPending: false,
      nextPlayerToHandover: null,
      matchStatus: 'IN_PROGRESS',
    });
  },

  processSettledShot: (input) => {
    const sm = get().stateMachine;
    if (!sm) return null;

    const prevTurn = get().currentTurn;
    const evalResult = sm.processShotSettlement(input);
    const session = sm.getSessionState();
    const nextTurn = evalResult.nextTurn ?? session.currentTurn;

    // Check if player changed and handover modal should show
    const config = get().savedConfig;
    const handoverEnabled = config?.handoverConfirmationEnabled !== false;
    const playerSwitched =
      !evalResult.isMatchOver &&
      prevTurn &&
      nextTurn &&
      nextTurn.activePlayerId !== prevTurn.activePlayerId;

    let nextPlayer: Player | null = null;
    let handoverPending = false;
    let matchStatus: OfflineMatchStatus = get().matchStatus;

    if (playerSwitched && handoverEnabled) {
      nextPlayer = get().activePlayers.find((p) => p.id === nextTurn.activePlayerId) || null;
      handoverPending = true;
      matchStatus = 'PLAYER_HANDOVER';
    } else if (evalResult.isMatchOver) {
      matchStatus = 'COMPLETED';
    }

    set({
      scores: session.scores,
      lastSettledEvaluation: evalResult,
      queenStatus: evalResult.queenStatusAfter,
      currentTurn: nextTurn,
      gameResult: evalResult.matchResult ?? null,
      isPlaying: !evalResult.isMatchOver,
      isHandoverPending: handoverPending,
      nextPlayerToHandover: nextPlayer,
      matchStatus,
    });

    return evalResult;
  },

  recordPhysicalShot: (pocketedCoins, strikerPocketed) => {
    const sm = get().stateMachine;
    if (!sm) return null;

    const prevTurn = get().currentTurn;
    const evalResult = sm.processShotSettlement({
      pocketedCoins: pocketedCoins.map((c) => ({ id: c.id ?? '', type: c.type ?? 'white' })),
      strikerPocketed,
    });
    const session = sm.getSessionState();
    const nextTurn = evalResult.nextTurn ?? session.currentTurn;

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

    // Check if player switched
    const config = get().savedConfig;
    const handoverEnabled = config?.handoverConfirmationEnabled !== false;
    const playerSwitched =
      !evalResult.isMatchOver &&
      prevTurn &&
      nextTurn &&
      nextTurn.activePlayerId !== prevTurn.activePlayerId;

    let nextPlayer: Player | null = null;
    let handoverPending = false;
    let matchStatus: OfflineMatchStatus = get().matchStatus;

    if (playerSwitched && handoverEnabled) {
      nextPlayer = get().activePlayers.find((p) => p.id === nextTurn.activePlayerId) || null;
      handoverPending = true;
      matchStatus = 'PLAYER_HANDOVER';
    } else if (evalResult.isMatchOver) {
      matchStatus = 'COMPLETED';
    }

    set({
      scores: session.scores,
      lastShotResult: shotResult,
      lastSettledEvaluation: evalResult,
      queenStatus: evalResult.queenStatusAfter,
      currentTurn: nextTurn,
      gameResult: evalResult.matchResult ?? null,
      isPlaying: !evalResult.isMatchOver,
      isHandoverPending: handoverPending,
      nextPlayerToHandover: nextPlayer,
      matchStatus,
    });

    return shotResult;
  },

  pauseSession: () => set({ isPaused: true, matchStatus: 'PAUSED' }),
  resumeSession: () => set({ isPaused: false, matchStatus: 'IN_PROGRESS' }),

  restartSession: () => {
    const { savedConfig, activePlayers } = get();
    if (savedConfig && activePlayers.length > 0) {
      // Re-initialize players with 0 scores and 0 fouls
      const cleanPlayers = activePlayers.map((p) => ({
        ...p,
        score: 0,
        fouls: 0,
        isReady: true,
      }));
      get().startSession(savedConfig, cleanPlayers);
    }
  },

  abandonSession: () => {
    set({
      matchStatus: 'ABANDONED',
      isPlaying: false,
      isPaused: false,
      isHandoverPending: false,
      nextPlayerToHandover: null,
    });
  },

  endSession: () =>
    set({
      stateMachine: null,
      matchStatus: 'COMPLETED',
      isPlaying: false,
      isPaused: false,
      activePlayers: [],
      savedConfig: null,
      currentTurn: null,
      lastShotResult: null,
      lastSettledEvaluation: null,
      isHandoverPending: false,
      nextPlayerToHandover: null,
    }),
}));
