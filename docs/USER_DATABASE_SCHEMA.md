# CarromVerse — User Database Schema Reference

## 1. Overview

CarromVerse supports two database backends:
1. **Cloud Firestore (Primary Cloud Storage):** Document-oriented NoSQL storage for scalable real-time sync and client subscriptions.
2. **PostgreSQL (Enterprise Relational Storage):** Relational schema for direct SQL queries, ACID compliance, and analytical reporting.

---

## 2. Cloud Firestore Schema

### 2.1 Collection: `users`
- **Document ID:** `userId` (Firebase Auth UID)
- **Document Structure:**
```typescript
interface FirestoreUserProfileDocument {
  userId: string;                   // Document key
  displayName: string;              // Player public display name (1-30 chars)
  username: string;                 // Lowercase unique handle (3-20 chars)
  email: string;                    // Account email address
  avatarUrl: string | null;         // CDN URL, Base64 data URI, or preset emoji
  accountCreatedAt: Timestamp;       // Account registration time
  lastUpdatedAt: Timestamp;          // Last profile update timestamp
  accountStatus: 'active' | 'suspended' | 'banned'; // Moderation status
  playerLevel: number;              // Current progression level
  totalMatches: number;             // Lifetime completed matches
  totalWins: number;                // Lifetime victories
  totalLosses: number;              // Lifetime defeats
  totalDraws: number;               // Lifetime draws
  totalCoinsPocketed: number;       // Total pieces sunk
  totalFouls: number;               // Total fouls committed
}
```

### 2.2 Collection: `usernames` (Atomic Registry)
To ensure immediate consistency and eliminate race conditions when two players claim identical usernames concurrently:
- **Document ID:** `lowercase_username` (e.g., `hariprasath`)
- **Document Structure:**
```typescript
interface FirestoreUsernameDocument {
  username: string;       // Lowercase username
  userId: string;         // Owning user UID
  reservedAt: Timestamp;  // Reservation timestamp
}
```

### 2.3 Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Profiles
    match /users/{userId} {
      // Anyone can read public fields, but sensitive fields are protected
      allow read: if true;
      
      // Only the authenticated user can update their own profile document
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Unique Username Registry
    match /usernames/{username} {
      allow read: if true;
      allow create: if request.auth != null && !exists(/databases/$(database)/documents/usernames/$(username));
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## 3. PostgreSQL Relational Schema (DDL)

```sql
-- 1. Create Enums
CREATE TYPE account_status_enum AS ENUM ('active', 'suspended', 'banned');

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(128) PRIMARY KEY,
    display_name VARCHAR(64) NOT NULL,
    username VARCHAR(32) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    avatar_url TEXT NULL,
    account_created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    account_status account_status_enum NOT NULL DEFAULT 'active',
    player_level INT NOT NULL DEFAULT 1,
    total_matches INT NOT NULL DEFAULT 0,
    total_wins INT NOT NULL DEFAULT 0,
    total_losses INT NOT NULL DEFAULT 0,
    total_draws INT NOT NULL DEFAULT 0,
    total_coins_pocketed INT NOT NULL DEFAULT 0,
    total_fouls INT NOT NULL DEFAULT 0
);

-- 3. Case-Insensitive Unique Index on Username
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower 
    ON users (LOWER(username));

-- 4. Usernames Reservation Table (for fast availability checking & atomic locks)
CREATE TABLE IF NOT EXISTS username_reservations (
    username_lower VARCHAR(32) PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reserved_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Auto-update Trigger for last_updated_at
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_last_updated
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp_column();
```

