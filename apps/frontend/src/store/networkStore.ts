import { create } from 'zustand';
import { ConnectionStatus, NetworkErrorEvent } from '../services/network/network.types';
import { MultiplayerNetworkService } from '../services/network/NetworkService';

interface NetworkState {
  status: ConnectionStatus;
  currentRoomId: string | null;
  latencyMs: number;
  lastError: NetworkErrorEvent | null;
  isOnlineMode: boolean;

  // Actions
  initialize: () => () => void;
  setOnlineMode: (enabled: boolean) => void;
  connect: (url?: string) => void;
  disconnect: () => void;
  clearError: () => void;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  status: 'DISCONNECTED',
  currentRoomId: null,
  latencyMs: 0,
  lastError: null,
  isOnlineMode: false,

  initialize: () => {
    const networkService = MultiplayerNetworkService.getInstance();

    const unsubStatus = networkService.onStatusChange((status) => {
      const room = networkService.getCurrentRoom();
      set({
        status,
        currentRoomId: room?.roomId || null,
        latencyMs: networkService.getLatency(),
      });
    });

    const unsubError = networkService.onError((errorEvent) => {
      set({ lastError: errorEvent });
    });

    return () => {
      unsubStatus();
      unsubError();
    };
  },

  setOnlineMode: (enabled: boolean) => {
    set({ isOnlineMode: enabled });
  },

  connect: (url?: string) => {
    try {
      MultiplayerNetworkService.getInstance().connect(url);
    } catch (err: any) {
      set({
        lastError: {
          code: 'CONNECT_ERROR',
          message: err?.message || 'Connection failed',
          timestamp: Date.now(),
        },
      });
    }
  },

  disconnect: () => {
    MultiplayerNetworkService.getInstance().disconnect();
    set({
      status: 'DISCONNECTED',
      currentRoomId: null,
      isOnlineMode: false,
    });
  },

  clearError: () => {
    set({ lastError: null });
  },
}));
