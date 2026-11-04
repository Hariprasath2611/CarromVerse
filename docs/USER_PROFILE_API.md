# CarromVerse — User Profile API Reference

## 1. Overview & Base URL

All endpoints conform to REST conventions, JSON request/response formats, and standard HTTP status codes.

- **Base URL:** `/api/v1`
- **Default Content-Type:** `application/json`

---

## 2. Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| `GET` | `/profile/me` | Yes (Bearer) | Get current authenticated user profile (auto-creates if missing) |
| `PATCH` | `/profile/me` | Yes (Bearer) | Update current user display name and/or username |
| `GET` | `/players/:userId` | No (Public) | View sanitized public player profile & gaming statistics |
| `GET` | `/usernames/:username/availability` | No (Public) | Check if username meets rules and is available |
| `POST` | `/profile/avatar` | Yes (Bearer) | Upload custom avatar (Base64) or set avatar preset/URL |
| `DELETE` | `/profile/avatar` | Yes (Bearer) | Remove avatar and reset to default initials |

---

## 3. Endpoint Specifications

### 3.1 Get Current Profile
`GET /api/v1/profile/me`

#### Headers
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "userId": "usr_99812739",
    "displayName": "Hariprasath",
    "username": "hariprasath",
    "email": "hari@carromverse.io",
    "avatarUrl": "https://cdn.carromverse.io/avatars/usr_99812739.png",
    "accountCreatedAt": "2026-11-04T10:00:00.000Z",
    "lastUpdatedAt": "2026-11-04T12:00:00.000Z",
    "accountStatus": "active",
    "playerLevel": 7,
    "totalMatches": 42,
    "totalWins": 31,
    "totalLosses": 10,
    "totalDraws": 1,
    "totalCoinsPocketed": 348,
    "totalFouls": 6
  }
}
```

#### Error Responses
- `401 Unauthorized`: Missing, invalid, or expired authentication token.

---

### 3.2 Update Current Profile
`PATCH /api/v1/profile/me`

#### Headers
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

#### Request Body
```json
{
  "displayName": "Hari Striker",
  "username": "hari_striker"
}
```
*Note: Both fields are optional, but at least one must be provided.*

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "userId": "usr_99812739",
    "displayName": "Hari Striker",
    "username": "hari_striker",
    "email": "hari@carromverse.io",
    "avatarUrl": "https://cdn.carromverse.io/avatars/usr_99812739.png",
    "accountCreatedAt": "2026-11-04T10:00:00.000Z",
    "lastUpdatedAt": "2026-11-04T13:45:00.000Z",
    "accountStatus": "active",
    "playerLevel": 7,
    "totalMatches": 42,
    "totalWins": 31,
    "totalLosses": 10,
    "totalDraws": 1,
    "totalCoinsPocketed": 348,
    "totalFouls": 6
  }
}
```

#### Error Responses
- `400 Bad Request`: Invalid display name (must be 1–30 characters) or invalid username format.
- `401 Unauthorized`: Token missing or invalid.
- `409 Conflict`: Username is already taken by another player or is a reserved system word.

---

### 3.3 Get Public Player Profile
`GET /api/v1/players/:userId`

#### Headers
*None required.*

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "userId": "usr_99812739",
    "displayName": "Hari Striker",
    "username": "hari_striker",
    "avatarUrl": "https://cdn.carromverse.io/avatars/usr_99812739.png",
    "playerLevel": 7,
    "totalMatches": 42,
    "totalWins": 31,
    "totalLosses": 10,
    "totalDraws": 1,
    "totalCoinsPocketed": 348,
    "totalFouls": 6,
    "winRate": 74
  }
}
```
*Notice: Private data (`email`, `accountStatus`, `accountCreatedAt`, `lastUpdatedAt`) is stripped from public profile responses.*

#### Error Responses
- `404 Not Found`: Player with the given `userId` does not exist.

---

### 3.4 Check Username Availability
`GET /api/v1/usernames/:username/availability`

#### Headers
*None required.*

#### Response — Available (200 OK)
```json
{
  "success": true,
  "data": {
    "username": "striker_king",
    "available": true
  }
}
```

#### Response — Unavailable / Reserved (200 OK)
```json
{
  "success": true,
  "data": {
    "username": "admin",
    "available": false,
    "reason": "This username is reserved and cannot be used"
  }
}
```

---

### 3.5 Upload or Set Avatar
`POST /api/v1/profile/avatar`

#### Headers
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
Content-Type: application/json
```

#### Request Body — Option A: Preset or Image URL
```json
{
  "avatarUrl": "👑"
}
```

#### Request Body — Option B: Custom Base64 Upload
```json
{
  "avatarData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "mimeType": "image/png"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "avatarUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

#### Error Responses
- `400 Bad Request`: Payload missing data, unsupported image format (allowed: JPEG, PNG, WEBP), or exceeds 2MB size limit.
- `401 Unauthorized`: Token missing or expired.

---

### 3.6 Remove Avatar
`DELETE /api/v1/profile/avatar`

#### Headers
```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "message": "Avatar removed successfully",
    "avatarUrl": null
  }
}
```

