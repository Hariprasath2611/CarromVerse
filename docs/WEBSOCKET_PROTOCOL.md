# CarromVerse WebSocket Protocol Specification

Formal definition of the WebSocket communication protocol, message schemas, and events between the mobile client and the Colyseus backend (Phase 2.1).

---

## 1. Transport & Wire Format

- **Protocol**: WebSocket over TLS (`wss://`) or standard WebSocket (`ws://` in local dev).
- **Sub-protocol**: Colyseus Protocol v0.15.
- **State Synchronization**: Delta-compressed binary schema serialization via `@colyseus/schema`.
- **Message Serialization**: Msgpack / Binary for real-time actions; JSON fallback for debug environments.

---

## 2. Room State Schema (`CarromRoomState`)

The room state schema is synchronized automatically to all subscribed clients:

```typescript
class CarromRoomState extends Schema {
  roomId: string;
  status: 'WAITING' | 'READY' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED' | 'CLOSED';
  gameMode: 'two_player_individual' | 'three_player_individual' | 'four_player_individual' | 'four_player_team';
  maxPlayers: number;
  activeSeat: number;           // Current turn (0, 1, 2, or 3)
  turnNumber: number;
  queenStatus: 'on_board' | 'pending_cover' | 'covered';
  hostUserId: string;
  turnTimeLimitSeconds: number;
  targetScore: number;
  strikerOffset: number;        // Clamped normalized baseline offset [-0.92, 0.92]
  players: MapSchema<PlayerSchema>;
  scores: MapSchema<number>;
}
```

---

## 3. Client-to-Server Messages (Upstream)

| Message Type | Parameters | Authorization | Description |
|---|---|---|---|
| `SET_READY` | `{ isReady?: boolean }` | Any connected player | Signals readiness to start match |
| `PLACE_STRIKER` | `{ offsetRatio: number }` | Active turn player | Sets striker baseline position |
| `EXECUTE_SHOT` | `{ powerRatio: number, aimAngle: number }` | Active turn player | Fires striker at specified power & angle |
| `PAUSE_MATCH` | `{}` | Room Host only | Toggles match pause state |

---

## 4. Server-to-Client Broadcast Events (Downstream)

| Event Type | Payload | Description |
|---|---|---|
| `MATCH_STARTED` | `{ gameMode: string, activeSeat: number }` | Fired when all players ready and match begins |
| `STRIKER_POSITION_UPDATED` | `{ seat: number, offset: number }` | Real-time striker drag updates |
| `SHOT_EXECUTED` | `{ seat: number, powerRatio: number, aimAngle: number, strikerOffset: number }` | Authoritative shot trigger |
| `MATCH_PAUSE_TOGGLED` | `{ status: string }` | Pause / resume alert |
| `PLAYER_DISCONNECTED` | `{ seat: number, displayName: string }` | Notice that player connection dropped |
| `ERROR` | `{ code: string, message: string }` | Action rejection notice (e.g. `NOT_YOUR_TURN`) |

