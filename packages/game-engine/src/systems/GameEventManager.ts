import { PhysicsEventType } from '../physics/PhysicsEvents.js';

export type EventListener<T = any> = (payload: T) => void;

export class GameEventManager {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private hostBridgeSender?: (type: string, payload: any) => void;

  constructor(hostBridgeSender?: (type: string, payload: any) => void) {
    this.hostBridgeSender = hostBridgeSender;
  }

  public on<T = any>(event: PhysicsEventType | string, listener: EventListener<T>): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  public off<T = any>(event: PhysicsEventType | string, listener: EventListener<T>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(listener);
    }
  }

  public emit<T = any>(event: PhysicsEventType | string, payload?: T): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error(`[GameEventManager] Error in listener for ${event}:`, err);
        }
      });
    }

    // Forward high-level game-critical physics events to React Native
    if (this.hostBridgeSender) {
      this.forwardToHost(event, payload);
    }
  }

  private forwardToHost(event: string, payload: any): void {
    // Only forward major lifecycle events, avoid spamming frame-level updates
    const forwardedEvents = [
      'physics:shot_started',
      'physics:object_pocketed',
      'physics:striker_pocketed',
      'physics:all_objects_stopped',
      'physics:shot_settled',
    ];

    if (forwardedEvents.includes(event)) {
      const typeName = event.replace('physics:', '').toUpperCase();
      this.hostBridgeSender?.(typeName, payload);
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

