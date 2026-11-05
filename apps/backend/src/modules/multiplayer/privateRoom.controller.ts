import { matchMaker } from 'colyseus';
import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { ResponseFormatter } from '../../utils/responseFormatter.js';
import { PrivateRoomRegistry } from './privateRoom.registry.js';
import { RoomCodeService } from './roomCode.service.js';
import { Logger } from '../../utils/logger.js';
import { CreatePrivateRoomDto } from '@carromverse/shared-types';

export class PrivateRoomController {
  private registry = PrivateRoomRegistry.getInstance();

  /**
   * POST /api/v1/multiplayer/private/create
   * Authenticated endpoint to reserve and spin up a Colyseus private room with a unique room code.
   */
  public createPrivateRoom = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json(ResponseFormatter.error('Authentication required', 'UNAUTHORIZED'));
        return;
      }

      const body = (req.body || {}) as CreatePrivateRoomDto;
      const gameMode = body.gameMode || 'two_player_individual';
      const boardTheme = body.boardTheme || 'classic';
      const targetScore = body.targetScore || 25;
      const turnTimeLimitSeconds = body.turnTimeLimitSeconds || 25;
      const password = body.password ? body.password.trim() : undefined;

      // Generate guaranteed unique room code
      const roomCode = this.registry.generateUniqueRoomCode();

      // Spin up Colyseus room
      const roomListing = await matchMaker.createRoom('carrom_room', {
        gameMode,
        roomCode,
        isPrivate: true,
        password,
        boardTheme,
        targetScore,
        turnTimeLimitSeconds,
        teamAName: body.teamAName,
        teamBName: body.teamBName,
        hostUserId: user.id,
        hostDisplayName: user.displayName || user.username || 'Host',
      });

      const registered = this.registry.getRoomById(roomListing.roomId);

      Logger.info(`[PrivateRoomController] Created room ${roomCode} for host ${user.id}`);

      res.status(201).json(
        ResponseFormatter.success({
          roomId: roomListing.roomId,
          roomCode: registered?.roomCode || roomCode,
          gameMode,
          maxPlayers: registered?.maxPlayers || 2,
          hasPassword: Boolean(password),
          boardTheme,
        })
      );
    } catch (err: any) {
      Logger.error(`[PrivateRoomController] Failed to create private room: ${err.message}`);
      res.status(500).json(ResponseFormatter.error('Failed to create private room', 'ROOM_CREATION_FAILED', err.message));
    }
  };

  /**
   * GET /api/v1/multiplayer/private/:roomCode/lookup
   * Rate-limited endpoint to verify room code existence, status, capacity, and password requirement.
   */
  public lookupRoomCode = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || 'unknown';

      // Rate limit check
      if (!this.registry.checkAndRecordLookupRateLimit(clientIp)) {
        res.status(429).json(
          ResponseFormatter.error(
            'Too many room lookup attempts. Please wait a moment before trying again.',
            'RATE_LIMIT_EXCEEDED'
          )
        );
        return;
      }

      const rawCode = req.params?.roomCode || '';
      const normalized = RoomCodeService.normalizeCode(rawCode);

      if (!RoomCodeService.isValidCode(normalized)) {
        res.status(400).json(
          ResponseFormatter.error('Invalid room code format. Room codes are 6 alphanumeric characters.', 'INVALID_CODE_FORMAT')
        );
        return;
      }

      const room = this.registry.getRoomByCode(normalized);
      if (!room || room.status === 'CLOSED' || room.status === 'EXPIRED') {
        res.status(404).json(
          ResponseFormatter.error('Room not found or code has expired. Please check the code and try again.', 'ROOM_NOT_FOUND')
        );
        return;
      }

      res.status(200).json(
        ResponseFormatter.success({
          roomCode: room.roomCode,
          roomId: room.roomId,
          exists: true,
          status: room.status,
          gameMode: room.gameMode,
          maxPlayers: room.maxPlayers,
          currentPlayers: room.currentPlayers,
          hasPassword: room.hasPassword,
          hostDisplayName: room.hostDisplayName,
          boardTheme: room.boardTheme,
        })
      );
    } catch (err: any) {
      Logger.error(`[PrivateRoomController] Error during room lookup: ${err.message}`);
      res.status(500).json(ResponseFormatter.error('Failed to look up room', 'LOOKUP_FAILED', err.message));
    }
  };

  /**
   * POST /api/v1/multiplayer/private/:roomCode/verify-password
   * Verify password before connecting via WebSocket.
   */
  public verifyPassword = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || 'unknown';

      if (!this.registry.checkAndRecordLookupRateLimit(clientIp)) {
        res.status(429).json(
          ResponseFormatter.error('Too many attempts. Please wait a moment.', 'RATE_LIMIT_EXCEEDED')
        );
        return;
      }

      const rawCode = req.params?.roomCode || '';
      const body = (req.body || {}) as { password?: string };
      const password = body.password;

      if (typeof password !== 'string') {
        res.status(400).json(ResponseFormatter.error('Password string is required', 'VALIDATION_FAILED'));
        return;
      }

      const normalized = RoomCodeService.normalizeCode(rawCode);
      const room = this.registry.getRoomByCode(normalized);

      if (!room) {
        res.status(404).json(ResponseFormatter.error('Room not found', 'ROOM_NOT_FOUND'));
        return;
      }

      if (!room.hasPassword) {
        res.status(200).json(ResponseFormatter.success({ valid: true, requiresPassword: false }));
        return;
      }

      const isValid = this.registry.verifyPassword(normalized, password.trim());
      res.status(200).json(ResponseFormatter.success({ valid: isValid, requiresPassword: true }));
    } catch (err: any) {
      Logger.error(`[PrivateRoomController] Error verifying room password: ${err.message}`);
      res.status(500).json(ResponseFormatter.error('Failed to verify password', 'VERIFICATION_FAILED'));
    }
  };
}
