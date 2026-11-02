# CarromVerse Backend Setup Guide

Developer setup and operational guide for running the CarromVerse Node.js & Colyseus multiplayer backend.

---

## 1. Prerequisites

- **Node.js**: `v20.x` or `v22.x` (LTS)
- **npm**: `v10.x+`
- **TypeScript**: `v5.6.x`
- **Environment**: Linux, macOS, or Windows

---

## 2. Directory Structure (`apps/backend`)

```
apps/backend/
├── src/
│   ├── auth/                 # Firebase Admin token verification service
│   ├── config/               # Server, environment, database configs
│   ├── middleware/           # Request logger, rate limiter, error handler, auth middleware
│   ├── modules/              # Health, users, matches, and multiplayer HTTP routers
│   ├── rooms/                # Colyseus room definitions & schema models
│   │   ├── CarromRoom.ts     # Authoritative multiplayer Carrom room
│   │   ├── schema/           # @colyseus/schema state definitions
│   │   │   ├── PlayerSchema.ts
│   │   │   └── CarromRoomState.ts
│   ├── services/             # Session management & simulation services
│   ├── types/                # Backend internal types & request envelopes
│   ├── utils/                # Logger, response formatter, token parser
│   ├── websocket/            # Colyseus server initialization & transport binding
│   ├── app.ts                # HTTP app & route dispatcher
│   └── server.ts             # Process entrypoint & graceful shutdown
├── tests/                    # Backend API & WebSocket unit/integration tests
├── package.json
└── tsconfig.json
```

---

## 3. Environment Variables

Create `.env` inside `apps/backend/` or configure process environment:

```env
PORT=4000
HOST=0.0.0.0
NODE_ENV=development
CORS_ORIGIN=*
SHUTDOWN_TIMEOUT_MS=10000

# Firebase Admin Configuration (Server-Side Only)
FIREBASE_PROJECT_ID=carromverse-dev
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@carromverse-dev.iam.gserviceaccount.com
# Private key should be single-line with literal \n escapes
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7..."
```

---

## 4. Running the Backend

### Development Mode (with hot reload / direct ts execution)
```bash
# From repository root
npm run backend

# Or from apps/backend directory
cd apps/backend
npm run dev
```

### Production Build & Run
```bash
# Build TypeScript
npm run build --workspace=@carromverse/backend

# Start production server
npm start --workspace=@carromverse/backend
```

### Verifying Server Health
```bash
curl http://localhost:4000/health
```
Expected response:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 12.4,
    "timestamp": "2026-11-02T10:35:00.000Z",
    "version": "1.0.0",
    "activeRooms": 0,
    "connectedClients": 0
  }
}
```
