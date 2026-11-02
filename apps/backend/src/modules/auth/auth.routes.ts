import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { AuthController } from './auth.controller.js';

export function createAuthRouter(controller = new AuthController()) {
  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const path = req.path || '';
    const method = req.method || 'GET';

    if (method === 'POST' && path === '/login') {
      await controller.login(req, res);
      return true;
    }

    if (method === 'POST' && path === '/register') {
      await controller.register(req, res);
      return true;
    }

    if (method === 'GET' && path === '/status') {
      controller.getStatus(req, res);
      return true;
    }

    return false;
  };
}

