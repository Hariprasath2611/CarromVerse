export type EventCallback<T = any> = (payload: T) => void;

export class TypedEventEmitter<TMap extends Record<string, any>> {
  private listeners: { [K in keyof TMap]?: Set<EventCallback<TMap[K]>> } = {};

  public on<K extends keyof TMap>(event: K, listener: EventCallback<TMap[K]>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(listener);

    return () => this.off(event, listener);
  }

  public off<K extends keyof TMap>(event: K, listener: EventCallback<TMap[K]>): void {
    const set = this.listeners[event];
    if (set) {
      set.delete(listener);
      if (set.size === 0) {
        delete this.listeners[event];
      }
    }
  }

  public emit<K extends keyof TMap>(event: K, payload: TMap[K]): void {
    const set = this.listeners[event];
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in event listener for ${String(event)}:`, error);
        }
      });
    }
  }

  public removeAllListeners(): void {
    this.listeners = {};
  }
}

