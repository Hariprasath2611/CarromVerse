# CarromVerse — Private Multiplayer Rooms & Room Code Management Guide

## 1. Overview & Architecture

Phase 2.3 delivers a complete private multiplayer room and room code management system for CarromVerse. Players can create private rooms, configure game modes, board themes, target points, and optional passwords, receive human-readable 6-character room codes, share them natively, and gather in a real-time synchronized Colyseus lobby before starting matches.

```
+---------------------------------------------------------------------------------------------------+
|                                          CLIENT APPLICATIONS                                      |
|                                                                                                   |
|  +--------------------+        +---------------------+        +--------------------------------+  |
|  | Multiplayer Hub    |        | Create Room Screen  |        | Join Room Screen               |  |
|  | - Create or Join   |        | - Mode, Score, Pwd  |        | - 6-char Code Input            |  |
|  +---------+----------+        +----------+----------+        +---------------+----------------+  |
|            |                              |                                   |                   |
|            +------------------------------+-----------------------------------+                   |
|                                           |                                                       |
|                                           v                                                       |
|                        +-------------------------------------+                                    |
|                        | Real-Time Multiplayer Room Lobby    |                                    |
|                        | - Room Code & Native Share Sheet    |                                    |
|                        | - Table Seating (N, S, E, W)        |                                    |
|                        | - Ready / Not Ready Toggle          |                                    |
|                        | - Host Controls (Mode, Kick, Start) |                                    |
|                        +------------------+------------------+                                    |
+-------------------------------------------|-------------------------------------------------------+
                                            |
                                            | WebSocket Sync + REST Endpoints
                                            v
+---------------------------------------------------------------------------------------------------+
|                                         CARROMVERSE BACKEND                                       |
|                                                                                                   |
|  +-------------------------------------+        +----------------------------------------------+  |
|  | RoomCodeService                     |        | PrivateRoomRegistry                          |  |
|  | - 6-char length                     |        | - Code <-> Colyseus Room ID Mapping          |  |
|  | - 31-char unambiguous alphabet      |        | - SHA-256 Salted Password Hashing            |  |
|  | - Case-insensitive normalization    |        | - Rate Limiter (Brute-Force Protection)      |  |
|  +------------------+------------------+        | - Idle Room Expiration & Invalidation        |  |
|                     |                           +-----------------------+----------------------+  |
|                     v                                                   |                         |
|  +----------------------------------------------------------------------+----------------------+  |
|  | Colyseus Game Server & CarromRoom Handler                                                   |  |
|  | - onAuth: Firebase Bearer Verification, Room Password Check, Duplicate Connection Guard     |  |
|  | - onJoin: Dynamic Seat & Team Allocation (1v1, 3-Player Points, 4-Player Free-For-All, 2v2) |  |
|  | - State Handlers: SET_READY, CHANGE_GAME_MODE, CHANGE_SETTINGS, SWITCH_TEAM, KICK_PLAYER    |  |
|  | - START_MATCH: Authoritative Capacity & All-Ready Verification                             |  |
|  | - Host Transfer Policy: Automatic promotion of next connected player upon host disconnect  |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Room Code Management

### 2.1 Format & Generation
- **Length:** 6 characters
- **Alphabet:** `23456789ABCDEFGHJKMNPQRSTUVWXYZ` (31 characters)
- **Design Decisions:**
  - Omits ambiguous characters (`0`, `O`, `1`, `I`, `L`) to eliminate user transcription errors on mobile.
  - Case-insensitive lookup (normalized to uppercase before checking).
  - Entropy: $31^6 = 887,503,681$ active combinations.
  - Generated using cryptographically secure random bytes with collision retry loops.

### 2.2 Rate Limiting & Brute-Force Protection
- The room lookup endpoint (`GET /api/v1/multiplayer/private/:roomCode/lookup`) is protected by client-identifier rate limiting.
- Maximum 25 lookup/verification attempts per minute.
- Attempts exceeding the threshold are rejected with `429 Too Many Requests`.

---

## 3. Supported Game Configurations

| Game Mode | Player Capacity | Seating Arrangement | Team Configuration |
|---|---|---|---|
| `two_player_individual` | 2 | Seat 0 (South - White) vs. Seat 2 (North - Black) | None |
| `three_player_individual` | 3 | Seat 0, Seat 1 (East), Seat 2 (North) | None (Points Carrom) |
| `four_player_individual` | 4 | Seats 0, 1, 2, 3 | None (Free For All) |
| `four_player_team` | 4 | Seats 0, 1, 2, 3 | Team A: Seats 0 & 2 (White)<br>Team B: Seats 1 & 3 (Black) |

---

## 4. Room Lifecycle States

The room lifecycle state machine is strictly enforced on the server:

```
[CREATED] ---> [WAITING] <---> [READY] ---> [STARTING] ---> [IN_PROGRESS] ---> [COMPLETED]
                   |              |                                                |
                   v              v                                                v
               [CLOSED]       [CLOSED]                                         [CLOSED]
                   |              |
                   v              v
               [EXPIRED]      [EXPIRED]
```

1. **`CREATED` / `WAITING`**: Room initialized, awaiting players to join.
2. **`READY`**: Room has reached full capacity (`players.size === maxPlayers`) AND all connected players have marked themselves ready (`isReady === true`).
3. **`STARTING`**: Host triggered match start; countdown timer broadcast to all connected clients.
4. **`IN_PROGRESS`**: Match running, board locked, striker turns activated.
5. **`CLOSED`**: All players left or room closed by host.
6. **`EXPIRED`**: Inactive idle room cleaned up after 30 minutes.

---

## 5. Host Authority & Disconnect Policy

### 5.1 Host Permissions
- Change game mode before match start.
- Change board theme, target score (10–100), and turn time limits (10–60s).
- Kick / remove non-host players from room.
- Rebalance teams and seat assignments.
- Trigger `START_MATCH` when room status is `READY`.

### 5.2 Host Disconnect Recovery
- If the host disconnects before the match starts:
  1. The server identifies the remaining connected players sorted by seat index.
  2. The next eligible player is automatically promoted to Host (`isHost = true`, `state.hostUserId = nextPlayer.userId`).
  3. The server broadcasts a `HOST_TRANSFERRED` event with the new host's identity.
  4. The global `PrivateRoomRegistry` updates its host record.
- If all players leave, the room is cleanly disposed and its room code is invalidated.

---

## 6. Native Room Code Sharing

CarromVerse uses the device's native sharing sheet (`Share.share` in React Native):
- **Title:** "CarromVerse Room Invitation"
- **Message:** `"Join my CarromVerse match! Room Code: {ROOM_CODE} ({MODE}). Open CarromVerse and enter the room code to play!"`
- **Security:** Private room passwords and authentication tokens are strictly excluded from the shared text.

---

## 7. REST & WebSocket API Reference

### REST Endpoints
- `POST /api/v1/multiplayer/private/create`: Reserves room and generates code (Auth required).
- `GET /api/v1/multiplayer/private/:roomCode/lookup`: Fetches public room metadata and password requirement (Rate-limited).
- `POST /api/v1/multiplayer/private/:roomCode/verify-password`: Checks password before connecting (Rate-limited).

### Colyseus Client Messages
- `SET_READY`: Toggle readiness state (`{ isReady?: boolean }`).
- `CHANGE_GAME_MODE`: Update game mode (`{ gameMode: GameMode }`).
- `CHANGE_SETTINGS`: Update board theme, timer, target score.
- `SWITCH_TEAM`: Switch between Team A and Team B in 2v2 doubles.
- `KICK_PLAYER`: Host removes target client (`{ targetSessionId: string }`).
- `START_MATCH`: Host initiates match countdown.
- `PLACE_STRIKER`: Authoritative striker baseline positioning.
- `EXECUTE_SHOT`: Authoritative shot impulse with power ratio and aim angle.

