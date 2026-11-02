# CarromVerse Online Architecture

Comprehensive architectural specification for the online multiplayer infrastructure of CarromVerse (Phase 2.1).

---

## 1. System Architecture Overview

CarromVerse Online Multiplayer is designed around a **Server-Authoritative, State-Synchronized Architecture** powered by Node.js, Colyseus, and WebSockets:

```
+-------------------------------------------------------------------------------+
|                             CLIENT TIER (Mobile)                              |
|                                                                               |
|  [ React Native UI & Zustand Stores ]                                         |
|    - authStore: Firebase ID tokens & player identity                          |
|    - networkStore: Connection state & room subscriptions                      |
|                                                                               |
|  [ Network Layer: NetworkService.ts & Colyseus.js ]                           |
|    - WebSocket connection management & auth handshake                         |
|    - Client-side prediction & optimistic aim rendering                       |
|                                                                               |
|  [ In-Engine Phaser WebView ]                                                 |
|    - Visual board rendering, animations, local tactile feedback               |
+---------------------------------------+---------------------------------------+
                                        |
                   Secure WebSocket (WSS) & HTTPS
                   - Colyseus Protocol
                   - Bearer Firebase JWT
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                             SERVER TIER (Node.js)                             |
|                                                                               |
|  [ Colyseus Server & Room Management ]                                        |
|    - CarromRoom.ts: Room lifecycle (onCreate, onAuth, onJoin, onLeave)        |
|    - RoomStateSchema.ts: @colyseus/schema delta binary synchronization        |
|    - PlayerSession.ts: Online session & connection lifecycle                  |
|                                                                               |
|  [ Security & Auth Gateway ]                                                  |
|    - FirebaseAuthService: Server-side token verification                      |
|    - RateLimiter & InputValidator: Malformed payload sanitization             |
|                                                                               |
|  [ Authoritative Simulation & Rules Engine ]                                  |
|    - @carromverse/game-logic: Pure TypeScript rules state machine             |
|    - Headless Physics: Server validates shot trajectory, velocity, & pockets  |
+---------------------------------------+---------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                            PERSISTENCE & DATABASE                             |
|                                                                               |
|  - Cloud Firestore: Online player profiles & global leaderboards              |
|  - PostgreSQL: Match records, audit logs, and competitive rankings            |
|  - Redis (Phase 2.8+): Distributed room discovery and match presence          |
+-------------------------------------------------------------------------------+
```

---

## 2. Server-Authoritative Principles

In online multiplayer, the client is treated as an untrusted input terminal:

1. **Clients Submit Intent Only**:
   - `PLACE_STRIKER { offsetRatio: number }`
   - `EXECUTE_SHOT { powerRatio: number, aimAngle: number }`
   - `LEAVE_MATCH {}`
2. **Server Validates & Simulates**:
   - The server validates whether the requesting client has the active turn (`activeSeat`).
   - The server validates that striker placement is within the legal baseline bounds.
   - The server simulates or validates the physical shot outcome.
   - The server executes the authoritative Carrom rules engine (`@carromverse/game-logic`).
3. **Clients Never Submit Authoritative Outcomes**:
   - Clients CANNOT submit coin coordinates, pocket events, turn switches, foul assignments, or winner claims.
   - Any client attempting to claim points or victory directly is rejected and disconnected.

---

## 3. Communication Pathways

| Channel | Protocol | Purpose | Payload Format |
|---|---|---|---|
| **Health & Discovery** | HTTPS / REST | Server health check, version checks, match history queries | JSON (`ApiResponse<T>`) |
| **Authentication** | HTTPS / WSS | Firebase ID token exchange & handshake | Bearer JWT |
| **Real-time Gameplay** | WSS (Colyseus) | Room join, state delta streaming, shot inputs | Colyseus binary schema |
| **Local Offline** | In-Memory | 1v1, 3P, FFA, 2v2 pass-and-play matches | Direct Zustand state machine |

---

## 4. Separation from Offline Gameplay

CarromVerse maintains strict separation between offline pass-and-play and online multiplayer:

- **Offline Store (`gameSessionStore.ts`)**: Runs entirely on the device with zero network dependencies. Uses in-memory state machine.
- **Online Store (`networkStore.ts`)**: Manages remote Colyseus room connections, network statuses (`DISCONNECTED`, `CONNECTING`, `CONNECTED`), and synchronizes authoritative server state.
- Offline features continue to function seamlessly even when the backend is offline or the mobile device has no internet connection.
