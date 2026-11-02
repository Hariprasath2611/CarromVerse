# @carromverse/backend

CarromVerse Backend API and WebSocket services built with TypeScript and Node.js.

## Modules & Architecture
- `src/config/`: Environment variables, database configs, and server settings
- `src/middleware/`: Request logging, rate limiting, authentication, error handling
- `src/modules/`:
  - `auth/`: Authentication, token generation, credentials verification
  - `users/`: Player profiles, stats, levels, match records
  - `matches/`: Online and offline match synchronization & history
  - `leaderboards/`: Ranked ladders, daily, weekly, and all-time boards
  - `multiplayer/`: Room lifecycle, lobby matchmaking, game rooms
- `src/websocket/`: WebSocket server abstraction and room connection manager
- `src/routes/`: Health and `/api/v1` route dispatchers
- `src/utils/`: Standardized JSON response formatters and logger

## Getting Started
```bash
# Build TypeScript
npm run build --workspace=@carromverse/backend

# Run automated tests
npm run test --workspace=@carromverse/backend

# Start backend server (defaults to port 4000)
npm run start --workspace=@carromverse/backend
```

## API Endpoints
- `GET /health`: Health and uptime check
- `POST /api/v1/auth/login`: User login / guest session
- `POST /api/v1/auth/register`: User registration
- `GET /api/v1/auth/status`: Session and token verification
- `GET /api/v1/users/profile`: Current user profile and statistics
- `GET /api/v1/matches`: Match history
- `POST /api/v1/matches`: Record match result
- `GET /api/v1/leaderboards`: Top ranking players
- `POST /api/v1/multiplayer/rooms`: Create multiplayer room
- `GET /api/v1/multiplayer/rooms`: List public multiplayer rooms

