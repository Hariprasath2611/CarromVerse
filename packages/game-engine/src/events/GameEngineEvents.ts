import { BridgeEvent } from './BridgeProtocol.js';

export interface GameEngineEventsMap {
  BRIDGE_EVENT: BridgeEvent;
  ENGINE_READY: void;
  ENGINE_PAUSED: void;
  ENGINE_RESUMED: void;
  ENGINE_DESTROYED: void;
}
