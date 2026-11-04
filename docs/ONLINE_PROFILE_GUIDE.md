# CarromVerse — Online Player Identity & Profile Guide

## 1. Overview & Architecture

Phase 2.2 establishes the persistent player identity and profile management subsystem for CarromVerse. The architecture separates private authentication metadata from public gaming personas and guarantees a seamless cross-device identity while keeping guest/offline play fully autonomous.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT DEVICES                                    |
|                                                                                   |
|  +--------------------+        +---------------------+      +------------------+  |
|  | Guest / Offline    |        | Authenticated User  |      | Edit Profile     |  |
|  | (SQLite / Storage) |        | (Zustand UserStore) |      | Real-time Check  |  |
|  +---------+----------+        +----------+----------+      +--------+---------+  |
+------------|------------------------------|--------------------------|------------+
             |                              | Firebase ID Token        |
             v                              v                          v
+------------------------+      +---------------------------------------------------+
| Local SQLite / Storage |      |                 CARROMVERSE BACKEND               |
| No Network Required    |      |                                                   |
+------------------------+      |  +---------------------------------------------+  |
                                |  | AuthMiddleware (Firebase ID Token Check)     |  |
                                |  +----------------------+----------------------+  |
                                |                         | Decoded req.user        |
                                |                         v                         |
                                |  +---------------------------------------------+  |
                                |  | ProfileController & ProfileService          |  |
                                |  | - Auto Profile Hydration                   |  |
                                |  | - Atomic Username Index                     |  |
                                |  | - Avatar MIME & 2MB Size Validation         |  |
                                |  | - Public Profile Sanitization               |  |
                                |  +----------------------+----------------------+  |
                                +-------------------------|-------------------------+
                                                          v
                                        +------------------------------------+
                                        | Cloud Firestore / Database Cluster |
                                        | - /users/{userId}                  |
                                        | - /usernames/{username} (Unique)   |
                                        +------------------------------------+
```

---

## 2. Profile Lifecycle

### 2.1 Creation & First-Time Login
1. When a player registers or logs in via Firebase Authentication, the client receives a Firebase ID Token.
2. The client requests `GET /api/v1/profile/me` with the `Authorization: Bearer <idToken>` header.
3. If no profile exists for the authenticated user, the backend automatically initializes a default profile with:
   - Initial Level 1
   - 0 Matches, 0 Wins, 0 Losses, 0 Draws, 0 Fouls, 0 Coins Pocketed
   - Derived or default username (`user_<random>` or sanitized display name)
   - Account status: `active`
   - Timestamps: `accountCreatedAt`, `lastUpdatedAt`
4. The atomic username registry claims the username to guarantee global uniqueness.

### 2.2 Hydration & Offline Resilience
- The client-side `useUserStore` caches the user profile in local storage (`LocalStorageService`).
- On app launch, the cached profile renders instantly (0ms latency).
- Simultaneously, a background request to `GET /api/v1/profile/me` revalidates and refreshes the data.
- If network connection is unavailable or offline, the cached profile and local stats remain functional.

---

## 3. Dual Identity Architecture: Online vs. Guest Play

CarromVerse maintains an intentional dual-identity model:
1. **Registered Players (Online Identity):**
   - Verified via Firebase ID Tokens.
   - Synchronized career statistics (matches, win rates, fouls, coins pocketed).
   - Global unique username with `@username` tag.
   - Custom avatar or preset emojis.
   - Eligible for upcoming Phase 2.3+ online matchmaking and leaderboards.
2. **Guest Players (Offline Autonomous Identity):**
   - Completely functional with zero network connectivity or credentials.
   - Stored in SQLite (`LocalDatabaseService`) with local match history and statistics.
   - No forced login prompts or blockers for Pass & Play or Practice mode.
   - Can upgrade to an online account at any time via `ProfileScreen` -> "SIGN IN / REGISTER".

---

## 4. Frontend Profile Experience

### 4.1 Profile Screen (`app/(tabs)/profile.tsx`)
- Displays player avatar with gold border, display name, unique `@username`, and player level badge.
- Displays full 6-metric statistics grid:
  - Total Matches
  - Total Wins
  - Win Rate (%)
  - Total Draws
  - Total Coins Pocketed
  - Total Fouls
- Offers navigation to "EDIT PROFILE", "MATCH HISTORY", and a secure "LOG OUT" dialog.

### 4.2 Edit Profile Screen (`app/edit-profile.tsx`)
- **Live Avatar Selector:** Select from default presets (`👑`, `🐯`, `🦅`, `🦁`, `🐉`, `⚡`, `🎯`, `🔥`, `💎`, `🏆`, `🛡️`, `⭐`), custom image URLs, or reset to initials.
- **Display Name Input:** 1–30 characters, alphanumeric and spaces supported.
- **Debounced Username Checker:** Live debounced (450ms) validation against `GET /api/v1/usernames/:username/availability`:
  - Instant visual feedback: green checkmark if available, red warning if taken or reserved.
- **Linked Account Email:** Read-only reference for account security.

