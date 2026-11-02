# Backend Developer Guide

Welcome to the CarromVerse Backend team! This guide explains the backend architecture, module development, and API testing (`apps/backend`).

## Quickstart

```bash
# Build TypeScript
npm run build --workspace=@carromverse/backend

# Run test suite
npm run test --workspace=@carromverse/backend

# Start development server
npm run backend
```

## Directory Structure
- `src/config/`: Environment configuration, server settings, and database parameters.
- `src/middleware/`: Logging, authentication, error handling, rate limiting.
- `src/modules/`: Domain modules:
  - `auth/`: Authentication services, token verification, input validators.
  - `users/`: Player profiles, XP, match statistics.
  - `matches/`: Match outcome synchronization.
  - `leaderboards/`: Ranked player ratings and tiers.
  - `multiplayer/`: Room creation, room codes, lobby state.
- `src/websocket/`: Low-latency WebSocket room manager and socket server.
- `src/app.ts`: HTTP request handler and middleware pipeline.
- `src/server.ts`: HTTP listener and graceful shutdown lifecycle.

## Adding a New Endpoint
1. Define the DTO types in `src/modules/<module>/<module>.types.ts`.
2. Add business logic to `src/modules/<module>/<module>.service.ts`.
3. Add request/response handler in `src/modules/<module>/<module>.controller.ts`.
4. Register the sub-path in `src/modules/<module>/<module>.routes.ts`.
5. Add automated tests in `apps/backend/tests/backend.test.mjs`.

