import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { MatchesController } from './matches.controller.js';

export function createMatchesRouter(controller = new MatchesController()) {
  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const path = req.path || '';
    const method = req.method || 'GET';

    if (method === 'POST' && (path === '' || path === '/')) {
      await controller.recordMatch(req, res);
      return true;
    }

    if (method === 'GET' && (path === '' || path === '/')) {
      await controller.getMatches(req, res);
      return true;
    }

    return false;
  };
}
