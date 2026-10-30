import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NetworkState } from '@carromverse/shared-types';

export class NetworkService {
  private static currentState: NetworkState = {
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'unknown',
  };

  private static listeners: Set<(state: NetworkState) => void> = new Set();
  private static isListening: boolean = false;

  public static initialize(): void {
    if (this.isListening) return;
    this.isListening = true;

    NetInfo.addEventListener((state: NetInfoState) => {
      this.currentState = {
        isConnected: !!state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: (state.type as any) || 'unknown',
      };

      this.listeners.forEach((listener) => {
        try {
          listener(this.currentState);
        } catch (err) {
          console.error('[NetworkService] Listener error:', err);
        }
      });
    });
  }

  public static getState(): NetworkState {
    return { ...this.currentState };
  }

  public static isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable !== false;
  }

  public static addListener(callback: (state: NetworkState) => void): () => void {
    this.listeners.add(callback);
    callback(this.currentState);
    return () => this.listeners.delete(callback);
  }
}
