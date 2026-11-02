# CarromVerse Database Architecture

Complete database ownership, entity relationship design, and data persistence strategy for offline and online gameplay (Phase 2.1).

---

## 1. Multi-Tier Database Topology

CarromVerse implements a polyglot persistence architecture aligned with gameplay domains:

```
+-------------------------------------------------------------------------------+
|                            CLIENT MOBILE STORAGE                              |
|                                                                               |
|  [ SQLite (expo-sqlite WAL Mode) ]                                            |
|    - Offline match history records (offline_matches)                          |
|    - Offline player profiles & guest stats                                    |
|    - Local sync queue for offline games awaiting cloud synchronization        |
+-------------------------------------------------------------------------------+
                                        |
                            Async Cloud Sync (HTTPS)
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                             CLOUD PERSISTENCE                                 |
|                                                                               |
|  [ Cloud Firestore (NoSQL Document Store) ]                                   |
|    - User profiles: users/{userId}                                            |
|    - User statistics & win rates: users/{userId}/gameStatistics               |
|    - Global real-time leaderboards: leaderboards/{scope}                      |
|                                                                               |
|  [ PostgreSQL (Relational Warehouse & Match Records) ]                        |
|    - Matches audit log: matches (session_id, mode, winner, scores, duration)  |
|    - Match participants: match_players (match_id, user_id, seat, fouls)       |
|    - Player historical rankings & ELO tracking                                |
|                                                                               |
|  [ Redis (Phase 2.8+ Real-Time Presence & Room Indexing) ]                    |
|    - Active player presence & heartbeat tokens                                |
|    - Distributed Colyseus room directory                                     |
+-------------------------------------------------------------------------------+
```

---

## 2. PostgreSQL Schema & Migration Structure

Located in `database/postgresql/migrations/`:

### Migration 001: Initial Core Tables
```sql
-- Online Player Profiles
CREATE TABLE IF NOT EXISTS players (
    user_id VARCHAR(128) PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(255),
    avatar_url VARCHAR(512),
    level INT DEFAULT 1,
    experience BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Multiplayer Matches Archive
CREATE TABLE IF NOT EXISTS online_matches (
    match_id VARCHAR(64) PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL,
    game_mode VARCHAR(32) NOT NULL,
    target_score INT NOT NULL,
    winner_user_id VARCHAR(128) REFERENCES players(user_id),
    winning_team_id VARCHAR(16),
    is_draw BOOLEAN DEFAULT FALSE,
    duration_seconds INT NOT NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match Participants & Stats
CREATE TABLE IF NOT EXISTS match_participants (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(64) REFERENCES online_matches(match_id) ON DELETE CASCADE,
    user_id VARCHAR(128) REFERENCES players(user_id),
    seat INT NOT NULL,
    team_id VARCHAR(16),
    final_score INT DEFAULT 0,
    fouls_committed INT DEFAULT 0,
    coins_pocketed INT DEFAULT 0,
    queen_pocketed BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_match_participants_user ON match_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_online_matches_winner ON online_matches(winner_user_id);
```

---

## 3. Data Ownership & Security Boundaries

1. **Client Ownership**: The mobile client owns local SQLite offline cache only. The client cannot write directly to PostgreSQL.
2. **Server Ownership**: The Node.js backend server is the **only entity** with credentials to write match outcomes to PostgreSQL.
3. **Firestore Security Rules**: Role-based access ensures users can only mutate their own profile documents (`request.auth.uid == userId`). Match documents can only be written by the server backend.
