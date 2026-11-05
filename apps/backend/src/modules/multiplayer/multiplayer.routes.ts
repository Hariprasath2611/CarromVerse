import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { authMiddleware } from '../../middleware/authMiddleware.js';
import { MultiplayerController } from './multiplayer.controller.js';
import { PrivateRoomController } from './privateRoom.controller.js';

export function createMultiplayerRouter(
  controller = new MultiplayerController(),
  privateRoomController = new PrivateRoomController()
) {
  return async (req: HttpRequest, res: HttpResponse): Promise<boolean> => {
    const path = req.path || '';
    const method = req.method || 'GET';

    // 1. POST /multiplayer/private/create
    if (method === 'POST' && (path === '/private/create' || path === '/private/create/')) {
      await authMiddleware(req, res, async () => {
        await privateRoomController.createPrivateRoom(req, res);
      });
      return true;
    }

    // 2. GET /multiplayer/private/:roomCode/lookup
    const lookupMatch = path.match(/^\/private\/([a-zA-Z0-9_-]+)\/lookup\/?$/);
    if (method === 'GET' && lookupMatch) {
      req.params = { ...req.params, roomCode: lookupMatch[1] };
      await privateRoomController.lookupRoomCode(req, res);
      return true;
    }

    // 3. POST /multiplayer/private/:roomCode/verify-password
    const verifyMatch = path.match(/^\/private\/([a-zA-Z0-9_-]+)\/verify-password\/?$/);
    if (method === 'POST' && verifyMatch) {
      req.params = { ...req.params, roomCode: verifyMatch[1] };
      await privateRoomController.verifyPassword(req, res);
      return true;
    }

    // Existing fallback endpoints
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
