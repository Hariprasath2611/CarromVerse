# CarromVerse Authentication Flow

Detailed specification of the Firebase Authentication handshake, token validation pipeline, and guest player support (Phase 2.1).

---

## 1. Authentication Architecture

```
[ Mobile Frontend: React Native ]
  │
  ├─ 1. User signs in with Firebase Auth (Email/Pass or Anonymous)
  │    └── auth.currentUser.getIdToken() -> Firebase ID Token (JWT)
  │
  ├─ 2. Connects to Backend via WebSocket (Colyseus)
  │    └── client.joinOrCreate('carrom_room', { token: idToken, ... })
  │
  v
[ Colyseus Room: onAuth(client, options) ]
  │
  ├─ 3. Extracts Bearer token from options or request headers
  │
  ├─ 4. Passes token to FirebaseAuthService.verifyIdToken(token)
  │    ├─ Check 1: Expiration (exp > now)
  │    ├─ Check 2: Valid Subject (sub / uid present)
  │    ├─ Check 3: Issuer matches securetoken.google.com/<projectId>
  │    └─ Check 4: Audience matches <projectId>
  │
  ├─ 5. If Valid:
  │    └── Returns DecodedFirebaseToken { uid, email, displayName, picture }
  │    └── Connection is accepted; user bound to Session & Seat
  │
  └─ 6. If Invalid / Expired / Missing:
       └── Throws ServerError(401 / 403, 'Invalid or expired authentication token')
       └── WebSocket connection is rejected and closed immediately
```

---

## 2. Key Security Principles

1. **Never Trust Client-Submitted User IDs**:
   - The user ID (`uid`) is NEVER taken from the client's options payload.
   - The user ID is strictly extracted from the cryptographically verified JWT payload (`sub`).
2. **Server-Side Credentials Isolation**:
   - Firebase Admin service account keys (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) reside exclusively on the backend server environment.
   - Frontend bundles only contain client-facing API keys (`EXPO_PUBLIC_FIREBASE_API_KEY`).
3. **Offline Guest Compatibility**:
   - Offline pass-and-play matches (1v1, Points Carrom, FFA, 2v2 doubles) require zero authentication.
   - Online multiplayer rooms strictly require valid Firebase authentication.
4. **Token Expiration Handling**:
   - Firebase ID tokens expire after 1 hour.
   - `getCurrentUserIdToken(true)` forces a token refresh before joining multiplayer rooms.

