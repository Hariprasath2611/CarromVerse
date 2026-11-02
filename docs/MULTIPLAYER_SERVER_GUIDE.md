# CarromVerse Multiplayer Server Guide

Comprehensive operational and engineering guide for the Colyseus game server and authoritative multiplayer rooms (Phase 2.1).

---

## 1. Colyseus Room Architecture

The multiplayer server is built on **Colyseus v0.15+** with WebSocket transport:

- **Room Definition**: `carrom_room` registered to `CarromRoom.ts`.
- **State Synchronization**: Uses `@colyseus/schema` for binary delta-compression. Only mutated fields are transmitted to clients over the wire.
- **Clock Rate**: 20 Hz simulation tick interval (50 ms patches) with client-side interpolation.

```
+-------------------------------------------------------------------+
|                        CarromRoom Lifecycle                       |
|                                                                   |
| 1. onCreate(options)                                              |
|    - Configures gameMode (1v1, 3P, FFA, 2v2)                      |
|    - Initializes CarromRoomState schema                           |
|    - Registers authoritative action handlers (SHOOT, PLACE)       |
|                                                                   |
| 2. onAuth(client, options, request)                               |
|    - Validates Bearer Firebase ID token with FirebaseAuthService  |
|    - Rejects unauthenticated connections (401/403)                |
|    - Returns verified DecodedFirebaseToken                        |
|                                                                   |
| 3. onJoin(client, options, auth)                                  |
|    - Allocates next legal seat & team assignment                  |
|    - Creates PlayerSchema instance in room state                  |
|    - Registers connection with PlayerSessionManager               |
|    - Advances room status: WAITING -> READY (when full)           |
|                                                                   |
| 4. onLeave(client, consented)                                     |
|    - Updates isConnected = false                                  |
|    - WAITING state: frees seat; removes player immediately        |
|    - IN_PROGRESS state: starts reconnection grace period (Ph 2.8) |
|                                                                   |
| 5. onDispose()                                                    |
|    - Cleans up state, closes timers, marks status: CLOSED         |
+-------------------------------------------------------------------+
```

---

## 2. Server-Authoritative Action Handlers

Clients interact with the server strictly via structured messages:

### A. `SET_READY`
- **Sender**: Any connected player in room.
- **Payload**: `{ isReady?: boolean }`
- **Behavior**: Toggles ready flag. When all `maxClients` are marked ready, the room automatically transitions `status = 'IN_PROGRESS'` and broadcasts `MATCH_STARTED`.

### B. `PLACE_STRIKER`
- **Sender**: Active turn player.
- **Payload**: `{ offsetRatio: number }`
- **Authoritative Validation**:
  - Rejects if requesting client does not hold `activeSeat`.
  - Rejects if `offsetRatio` is NaN or non-number.
  - Clamps offset to legal baseline boundary `[-0.92, 0.92]`.
- **Broadcast**: Dispatches `STRIKER_POSITION_UPDATED` to other clients in room.

### C. `EXECUTE_SHOT`
- **Sender**: Active turn player.
- **Payload**: `{ powerRatio: number, aimAngle: number }`
- **Authoritative Validation**:
  - Rejects if requesting client is not active turn.
  - Rejects if match is not `IN_PROGRESS`.
  - Enforces power ratio bounds `[0.05, 1.0]`.
- **Broadcast**: Dispatches `SHOT_EXECUTED` with authoritative coordinates and power.

### D. `PAUSE_MATCH`
- **Sender**: Room host only.
- **Behavior**: Toggles `status = 'PAUSED'` or `'IN_PROGRESS'`.

---

## 3. Server-Side Game Simulation & Rules Engine Compatibility

CarromVerse packages are designed with modular separation:

1. **`@carromverse/game-logic`**:
   - 100% pure TypeScript.
   - Zero DOM or browser dependencies (`window`, `document`, Canvas).
   - Runs directly inside Node.js on the server to calculate authoritative turn switching, Queen cover status, fouls, and scores.
2. **`@carromverse/game-engine` Headless Physics**:
   - Matter.js substepping physics engine runs headlessly in Node.js.
   - Browser-specific rendering (Phaser 3 Canvas/WebGL) is decoupled from the physics equations and state machine.
   - Server computes authoritative trajectories and validates client aim vectors.

---

## 4. Scaling & Multi-Node Strategy (Phase 2.8 Preparation)

- **Local Driver (`LocalDriver`)**: Used for single-instance development and integration testing.
- **Redis Driver (`RedisDriver` & `RedisPresence`)**: Ready for multi-process or clustered container deployments on Kubernetes or Railway, enabling horizontal scaling across multiple instances without room cross-talk.
