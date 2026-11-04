import { HttpRequest, HttpResponse } from '../middleware/types.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { createAuthRouter } from '../modules/auth/auth.routes.js';
import { createUsersRouter } from '../modules/users/users.routes.js';
import { createMatchesRouter } from '../modules/matches/matches.routes.js';
import { createLeaderboardsRouter } from '../modules/leaderboards/leaderboards.routes.js';
import { createMultiplayerRouter } from '../modules/multiplayer/multiplayer.routes.js';
import {
  createPlayersRouter,
  createProfileRouter,
  createUsernamesRouter,
} from '../modules/profile/profile.routes.js';

export function createApiRouter() {
  const authRouter = createAuthRouter();
  const usersRouter = createUsersRouter();
  const matchesRouter = createMatchesRouter();
  const leaderboardsRouter = createLeaderboardsRouter();
  const multiplayerRouter = createMultiplayerRouter();
  const profileRouter = createProfileRouter();
  const playersRouter = createPlayersRouter();
  const usernamesRouter = createUsernamesRouter();

  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const originalPath = req.path || '';

    // Route dispatch based on subpath
    if (originalPath.startsWith('/auth')) {
      req.path = originalPath.substring(5);
      return authRouter(req, res);
    }

    // Phase 2.2 Profile Endpoints
    if (originalPath.startsWith('/profile')) {
      req.path = originalPath.substring(8);
      return profileRouter(req, res);
    }

    if (originalPath.startsWith('/players')) {
      req.path = originalPath.substring(8);
      return playersRouter(req, res);
    }

    if (originalPath.startsWith('/usernames')) {
      req.path = originalPath.substring(10);
      return usernamesRouter(req, res);
    }

    if (originalPath.startsWith('/users')) {
      req.path = originalPath.substring(6);
      return usersRouter(req, res);
    }

    if (originalPath.startsWith('/matches')) {
      req.path = originalPath.substring(8);
      return matchesRouter(req, res);
    }

    if (originalPath.startsWith('/leaderboards')) {
      req.path = originalPath.substring(13);
      return leaderboardsRouter(req, res);
    }

    if (originalPath.startsWith('/multiplayer')) {
      req.path = originalPath.substring(12);
      return multiplayerRouter(req, res);
    }

    res.status(404).json(
      ResponseFormatter.error(`Endpoint not found: ${originalPath}`, 'NOT_FOUND')
    );
    return true;
  };
}
