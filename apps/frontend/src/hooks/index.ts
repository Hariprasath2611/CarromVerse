import { useAuthStore } from '../store/authStore.js';
import { useGameSetupStore } from '../store/gameSetupStore.js';
import { useGameSessionStore } from '../store/gameSessionStore.js';
import { useEconomyStore } from '../store/economyStore.js';
import { useSettingsStore } from '../store/settingsStore.js';

export function useActiveMatch() {
  const session = useGameSessionStore();
  const setup = useGameSetupStore();

  return {
    mode: setup.gameMode,
    variant: setup.gameVariant,
    targetScore: setup.targetScore,
    players: setup.players,
    activePlayerIndex: session.activePlayerIndex,
    scores: session.scores,
    isMatchOver: session.isMatchOver,
    winner: session.winner,
  };
}

export function useCurrentPlayer() {
  const { players, activePlayerIndex } = useActiveMatch();
  return players[activePlayerIndex] || players[0];
}

export { useAuthStore, useGameSetupStore, useGameSessionStore, useEconomyStore, useSettingsStore };
