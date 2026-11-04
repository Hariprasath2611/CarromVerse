# CarromVerse — Authentication Guide

## 1. Overview & Principles

CarromVerse uses Firebase Authentication on client applications and enforces server-side validation using Firebase Admin SDK on the backend. 

### Core Security Rules:
1. **Never Trust Client-Supplied User IDs:** The backend never trusts a `userId` or `uid` query parameter or body property. The authenticated identity is strictly derived from verified cryptographically signed Firebase ID tokens.
2. **Bearer Token Authentication:** All protected endpoints require an `Authorization: Bearer <idToken>` header.
3. **Session Rejection:** Expired tokens, malformed tokens, or revoked sessions yield immediate `401 Unauthorized` responses.
4. **Preserve Offline Access:** Unauthenticated players can play Pass & Play, AI Practice, and view local stats without ever being blocked by an auth barrier.

---

## 2. Authentication Flow

```
+-----------------------------------------------------------------------------------+
| CLIENT (React Native / Expo)                                                      |
|                                                                                   |
| 1. User enters Email & Password                                                   |
| 2. firebase.auth().signInWithEmailAndPassword(...)                                |
|    <-- Firebase Auth returns FirebaseUser & ID Token                              |
| 3. AuthStore saves session and dispatches token to API client                     |
+-----------------------------------------------------------------------------------+
                                   |
                                   | HTTP Request with Authorization: Bearer <token>
                                   v
+-----------------------------------------------------------------------------------+
| BACKEND (Node.js / Express / Colyseus)                                            |
|                                                                                   |
| 1. AuthMiddleware extracts token from req.headers.authorization                    |
| 2. FirebaseAuthService verifies token via Firebase Admin SDK                      |
|    - Checks signature, expiration (exp), audience (aud), and issuer (iss)         |
| 3. On success: populates req.user:                                                |
|      req.user = { id, email, displayName, username, picture }                     |
| 4. Controller processes business logic using req.user.id                          |
+-----------------------------------------------------------------------------------+
```

---

## 3. Token Handling & Verification

### 3.1 Backend Middleware Implementation
Located at `apps/backend/src/middleware/authMiddleware.ts`:
- Rejects requests without `Authorization` header with `401 Unauthorized`.
- Extracts Bearer token string.
- Passes token to `FirebaseAuthService.getInstance().verifyIdToken(token)`.
- If expired (`token_expired` or timestamp $> \text{exp}$), returns `401 Unauthorized` (`Token has expired`).
- If token is invalid or signature fails, returns `401 Unauthorized` (`Invalid authentication token`).

### 3.2 Structured Fallback / Dev Verification
In local development or test suites where Google Cloud credentials may not be configured, `FirebaseAuthService` supports structured JWT verification:
- Decodes JWT header and payload.
- Verifies expiration timestamp (`payload.exp * 1000 > Date.now()`).
- Validates token format (`header.payload.signature`).
- Extracts `sub`, `email`, `name`, and custom claims safely.

---

## 4. Session Validation & Logout

### 4.1 Token Refresh
- Firebase ID tokens expire after 1 hour (3600 seconds).
- The client SDK automatically refreshes the token in the background.
- `profileApi.ts` fetches the latest valid token before dispatching API requests:
```ts
const currentUser = auth.currentUser;
if (currentUser) {
  const token = await currentUser.getIdToken();
  headers['Authorization'] = `Bearer ${token}`;
}
```

### 4.2 Logout Procedure
1. User confirms logout in `ProfileScreen`.
2. `useAuthStore.getState().logout()` calls Firebase `signOut(auth)`.
3. `useUserStore.getState().clearUser()` purges memory state and local storage caches.
4. Screen state resets to guest mode with zero lingering credentials.

---

## 5. Password Reset & Account Recovery
- Supported via `sendPasswordReset(email)` in `firebase.auth.ts`.
- Firebase dispatches an official password reset link directly to the verified email address.
- Reset state is managed entirely through secure OOB (out-of-band) Firebase handlers.

