# CarromVerse — Profile & Identity Security Guide

## 1. Authentication & Token Verification

### 1.1 Strict Identity Derivation
- **Core Requirement:** Client-supplied identifiers in query parameters, request bodies, or route headers are never trusted.
- **Enforcement:** The backend middleware extracts the cryptographic JWT signature from `Authorization: Bearer <idToken>`.
- The `req.user` payload contains the verified `id` (Firebase UID). All profile mutations, queries, and file updates are bounded to `req.user.id`.

### 1.2 Token Expiry & Revocation
- Expired tokens fail validation immediately (`401 Unauthorized`).
- Revoked tokens are detected by Firebase Admin SDK during token verification.

---

## 2. Public vs. Private Data Isolation

To comply with privacy standards and GDPR recommendations:
- The public profile endpoint (`GET /api/v1/players/:userId`) returns a sanitized `PublicPlayerProfile` object.
- **Exposed Public Fields:** `userId`, `displayName`, `username`, `avatarUrl`, `playerLevel`, `totalMatches`, `totalWins`, `totalLosses`, `totalDraws`, `totalCoinsPocketed`, `totalFouls`, `winRate`.
- **Protected / Hidden Private Fields:** `email`, `accountStatus`, `accountCreatedAt`, `lastUpdatedAt`, IP address, and session state are strictly stripped before returning to the caller.

---

## 3. Server-Side Username Validation & Reservation Attacks

To prevent impersonation, injection, and offensive names:
1. **Length Bounds:** 3 to 20 characters (`/^[a-zA-Z0-9_]{3,20}$/`).
2. **Character Set:** Strict alphanumeric and underscores only. Whitespace, HTML characters (`<`, `>`, `"`), and SQL injection delimiters are rejected.
3. **Reserved Words:** A centralized blacklist prevents impersonating system staff:
   - `admin`, `administrator`, `moderator`, `mod`, `carromverse`, `official`, `support`, `root`, `system`, `guest`, `null`, `undefined`.
4. **Atomic Claiming:** Username claims are executed atomically against a dedicated case-insensitive index to prevent race conditions when two clients claim identical handles simultaneously.

---

## 4. Avatar Upload Security

### 4.1 Payload Size Limit
- Avatar uploads are strictly constrained to a maximum of **2 MB** (2,097,152 bytes).
- Payloads exceeding 2 MB are rejected with `400 Bad Request` (`Avatar payload exceeds maximum 2MB size limit`).

### 4.2 MIME Type Whitelisting
- Supported MIME types are limited to:
  - `image/jpeg`
  - `image/png`
  - `image/webp`
- Executable files, SVG scripts (`<svg onload="...">`), HTML, and binary executables are rejected with `400 Bad Request`.

---

## 5. Network & API Transport Security

1. **CORS Headers:** Restricted to configured client origins, with preflight `OPTIONS` support for `GET, POST, PUT, PATCH, DELETE`.
2. **Security Headers:**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `X-XSS-Protection: 1; mode=block`
3. **Graceful Offline Mode:** If backend services or networks become unreachable, client applications fallback to local SQLite storage and cached memory stores, preventing cascading application crashes.
