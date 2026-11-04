import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { ProfileController } from './profile.controller.js';
import { ResponseFormatter } from '../../utils/responseFormatter.js';

export function createProfileRouter() {
  const controller = new ProfileController();

  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const path = req.path || '';
    const method = req.method || 'GET';

    // 1. GET & PATCH /api/v1/profile/me
    if (path === '/me' || path === '/me/') {
      if (method === 'GET') {
        await authMiddleware(req, res, async () => {
          await controller.getMe(req, res);
        });
        return true;
      }
      if (method === 'PATCH') {
        await authMiddleware(req, res, async () => {
          await controller.updateMe(req, res);
        });
        return true;
      }
      res.status(405).json(ResponseFormatter.error(`Method ${method} not allowed on /profile/me`, 'METHOD_NOT_ALLOWED'));
      return true;
    }

    // 2. POST & DELETE /api/v1/profile/avatar
    if (path === '/avatar' || path === '/avatar/') {
      if (method === 'POST') {
        await authMiddleware(req, res, async () => {
          await controller.uploadAvatar(req, res);
        });
        return true;
      }
      if (method === 'DELETE') {
        await authMiddleware(req, res, async () => {
          await controller.deleteAvatar(req, res);
        });
        return true;
      }
      res.status(405).json(ResponseFormatter.error(`Method ${method} not allowed on /profile/avatar`, 'METHOD_NOT_ALLOWED'));
      return true;
    }

    return false;
  };
}

export function createPlayersRouter() {
  const controller = new ProfileController();

  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const path = req.path || '';
    const method = req.method || 'GET';

    // GET /api/v1/players/:userId
    if (method === 'GET') {
      const match = path.match(/^\/([^/]+)\/?$/);
      if (match) {
        req.params = { userId: decodeURIComponent(match[1]) };
        await controller.getPublicPlayer(req, res);
        return true;
      }
    }

    return false;
  };
}

export function createUsernamesRouter() {
  const controller = new ProfileController();

  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const path = req.path || '';
    const method = req.method || 'GET';

    // GET /api/v1/usernames/:username/availability
    if (method === 'GET') {
      const match = path.match(/^\/([^/]+)\/availability\/?$/);
      if (match) {
        req.params = { username: decodeURIComponent(match[1]) };
        await controller.checkUsernameAvailability(req, res);
        return true;
      }
    }

    return false;
  };
}
