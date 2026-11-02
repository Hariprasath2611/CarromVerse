# CarromVerse API Contracts

Standard response envelope for all endpoints:
```json
{
  "success": true,
  "data": {},
  "timestamp": "2026-11-02T10:00:00.000Z"
}
```

Error response envelope:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description",
    "details": null
  },
  "timestamp": "2026-11-02T10:00:00.000Z"
}
```

---

## 1. Health Endpoints

### `GET /health`
Returns service uptime and health status.
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "status": "ok",
      "uptime": 124.5,
      "service": "carromverse-backend",
      "version": "1.0.0"
    }
  }
  ```

---

## 2. Authentication Endpoints

### `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "player@carromverse.io",
    "password": "optionalPassword123"
  }
  ```
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "token": "cv_token_usr_123_1793460000",
      "user": {
        "id": "usr_123",
        "email": "player@carromverse.io",
        "username": "player",
        "createdAt": "2026-11-02T10:00:00.000Z"
      }
    }
  }
  ```

### `POST /api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "email": "champion@carromverse.io",
    "username": "CarromMaster",
    "password": "secretPassword123"
  }
  ```
- **Response `201`**:
  ```json
  {
    "success": true,
    "data": {
      "token": "cv_token_usr_456_1793460000",
      "user": {
        "id": "usr_456",
        "email": "champion@carromverse.io",
        "username": "CarromMaster",
        "createdAt": "2026-11-02T10:00:00.000Z"
      }
    }
  }
  ```

---

## 3. User Endpoints

### `GET /api/v1/users/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "id": "usr_default",
      "username": "CarromChampion",
      "email": "player@carromverse.io",
      "avatar": "👑",
      "level": 5,
      "xp": 1250,
      "coins": 15000,
      "gems": 50,
      "matchesPlayed": 25,
      "matchesWon": 18
    }
  }
  ```

---

## 4. Match Endpoints

### `POST /api/v1/matches`
Records a completed match outcome.
- **Request Body**:
  ```json
  {
    "result": {
      "id": "match_123",
      "sessionId": "sess_456",
      "mode": "two_player_individual",
      "variant": "standard",
      "winnerId": "player_0",
      "winnerName": "Player 1",
      "isDraw": false,
      "finalScores": {},
      "durationSeconds": 180,
      "totalTurns": 12,
      "startedAt": "2026-11-02T09:57:00.000Z",
      "completedAt": "2026-11-02T10:00:00.000Z",
      "isSynced": true,
      "syncAttemptCount": 1
    }
  }
  ```
- **Response `201`**: Success envelope returning saved match.

### `GET /api/v1/matches?limit=10`
Returns recent recorded matches.

---

## 5. Leaderboard Endpoints

### `GET /api/v1/leaderboards?scope=weekly`
- **Response `200`**:
  ```json
  {
    "success": true,
    "data": {
      "scope": "weekly",
      "entries": [
        {
          "rank": 1,
          "userId": "u_1",
          "username": "StrikerKing",
          "avatar": "👑",
          "score": 2840,
          "tier": "Grandmaster"
        }
      ]
    }
  }
  ```

---

## 6. Multiplayer Room Endpoints

### `POST /api/v1/multiplayer/rooms`
- **Request Body**:
  ```json
  {
    "mode": "two_player_individual",
    "hostId": "usr_host_1",
    "hostName": "Grandmaster",
    "isPrivate": false
  }
  ```
- **Response `201`**:
  ```json
  {
    "success": true,
    "data": {
      "roomId": "room_xyz123",
      "roomCode": "ABC123",
      "mode": "two_player_individual",
      "hostId": "usr_host_1",
      "hostName": "Grandmaster",
      "maxPlayers": 2,
      "currentPlayers": 1,
      "isPrivate": false,
      "status": "waiting",
      "createdAt": "2026-11-02T10:00:00.000Z"
    }
  }
  ```

