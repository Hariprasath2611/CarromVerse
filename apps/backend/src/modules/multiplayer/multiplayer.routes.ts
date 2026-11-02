import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { MultiplayerController } from './multiplayer.controller.js';

export function createMultiplayerRouter(controller = new MultiplayerController()) {
  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const path = req.path || '';
    const method = req.method || 'GET';

    if (method === 'POST' && (path === '/rooms' || path === '/rooms/create')) {
      await controller.createRoom(req, res);
      return true;
    }

    if (method === 'GET' && path === '/rooms') {
      await controller.getRooms(req, res);
      return true;
    }

    return false;
  };
}

