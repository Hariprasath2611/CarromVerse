# Database Schemas Overview

CarromVerse employs a multi-tier database model:
1. **Local SQLite Storage**: Fast, persistent offline match history and sync queue on mobile devices (`database/sqlite/`).
2. **Cloud Firestore**: Real-time user document profiles, statistics, and synced match records (`database/firebase/`).
3. **Relational PostgreSQL (Planned/Target)**: Future high-throughput match analytics, seasonal leaderboards, and tournament brackets (`database/postgresql/`).

