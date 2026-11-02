import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { UsersController } from './users.controller.js';

export function createUsersRouter(controller = new UsersController()) {
  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const path = req.path || '';
    const method = req.method || 'GET';

    if (method === 'GET' && (path === '/profile' || path === '/me')) {
      await controller.getProfile(req, res);
      return true;
    }

    return false;
  };
}

