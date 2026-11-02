import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { LeaderboardsController } from './leaderboards.controller.js';

export function createLeaderboardsRouter(controller = new LeaderboardsController()) {
  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const path = req.path || '';
    const method = req.method || 'GET';

    if (method === 'GET' && (path === '' || path === '/')) {
      await controller.getLeaderboard(req, res);
      return true;
    }

    return false;
  };
}
