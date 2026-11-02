import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { ResponseFormatter } from '../../utils/responseFormatter.js';
import { MultiplayerService } from './multiplayer.service.js';
import { CreateRoomRequestDto } from './room.types.js';

export class MultiplayerController {
  private multiplayerService: MultiplayerService;

  constructor(multiplayerService = new MultiplayerService()) {
    this.multiplayerService = multiplayerService;
  }

  public createRoom = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const body = req.body as CreateRoomRequestDto;
    if (!body?.mode || !body?.hostId || !body?.hostName) {
      res.status(400).json(ResponseFormatter.error('mode, hostId, and hostName are required', 'VALIDATION_FAILED'));
      return;
    }

    try {
      const room = await this.multiplayerService.createRoom(body);
      res.status(201).json(ResponseFormatter.success(room));
    } catch (err) {
      res.status(500).json(ResponseFormatter.error('Failed to create room', 'ROOM_CREATION_FAILED', err));
    }
  };

  public getRooms = async (_req: HttpRequest, res: HttpResponse): Promise<void> => {
    const rooms = await this.multiplayerService.getAvailableRooms();
    res.status(200).json(ResponseFormatter.success(rooms));
  };
}
