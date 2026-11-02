import { useAuthStore } from '../store/authStore.js';
import { useGameSetupStore } from '../store/gameSetupStore.js';
import { useGameSessionStore } from '../store/gameSessionStore.js';
import { useEconomyStore } from '../store/economyStore.js';
import { useSettingsStore } from '../store/settingsStore.js';

export function useActiveMatch() {
  const session = useGameSessionStore();
  const setup = useGameSetupStore();

  return {
    mode: setup.selectedMode,
    targetPoints: setup.targetPoints,
    players: setup.players,
    currentTurn: session.currentTurn,
    scores: session.scores,
    matchStatus: session.matchStatus,
    isMatchOver: session.matchStatus === 'COMPLETED',
    gameResult: session.gameResult,
    isHandoverPending: session.isHandoverPending,
    nextPlayerToHandover: session.nextPlayerToHandover,
  };
}

export function useCurrentPlayer() {
  const session = useGameSessionStore();
  const setup = useGameSetupStore();
  const activePlayerId = session.currentTurn?.activePlayerId;
  return setup.players.find((p) => p.id === activePlayerId) || setup.players[0];
}

export { useAuthStore, useGameSetupStore, useGameSessionStore, useEconomyStore, useSettingsStore };
