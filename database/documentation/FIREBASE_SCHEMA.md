# Cloud Firestore Schema Documentation

## Collections

### 1. `users/{userId}`
- `userId`: string (Firebase Auth UID)
- `email`: string
- `username`: string
- `avatar`: string (emoji or URL)
- `createdAt`: ISO 8601 string
- `updatedAt`: ISO 8601 string

### 2. `gameStatistics/{userId}`
- `userId`: string
- `level`: number
- `xp`: number
- `coins`: number
- `gems`: number
- `matchesPlayed`: number
- `matchesWon`: number
- `winRate`: number (calculated)

### 3. `matches/{matchId}`
- `matchId`: string (unique identifier)
- `sessionId`: string
- `userId`: string (submitting user UID)
- `playerIds`: string[] (all participant IDs)
- `mode`: string ('two_player_individual' | 'three_player_individual' | 'four_player_team' | 'four_player_individual')
- `winnerId`: string | null
- `durationSeconds`: number
- `totalTurns`: number
- `finalScores`: map of player scores
- `completedAt`: ISO 8601 string

