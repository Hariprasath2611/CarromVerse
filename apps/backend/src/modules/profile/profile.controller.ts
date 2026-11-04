import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { ResponseFormatter } from '../../utils/responseFormatter.js';
import { ProfileService } from './profile.service.js';

export class ProfileController {
  private service: ProfileService;

  constructor() {
    this.service = ProfileService.getInstance();
  }

  /**
   * GET /api/v1/profile/me
   * Retrieves caller's private profile.
   */
  public getMe = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    if (!req.user || !req.user.id) {
      res.status(401).json(ResponseFormatter.error('Authentication required', 'UNAUTHORIZED'));
      return;
    }

    try {
      const profile = await this.service.getProfile(req.user.id, req.user);
      res.status(200).json(ResponseFormatter.success(profile));
    } catch (err: any) {
      res.status(500).json(ResponseFormatter.error('Failed to retrieve profile', 'INTERNAL_ERROR', err?.message));
    }
  };

  /**
   * PATCH /api/v1/profile/me
   * Updates caller's profile (displayName, username, avatarUrl).
   */
  public updateMe = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    if (!req.user || !req.user.id) {
      res.status(401).json(ResponseFormatter.error('Authentication required', 'UNAUTHORIZED'));
      return;
    }

    const body = (req.body as any) || {};

    try {
      const updated = await this.service.updateProfile(req.user.id, {
        displayName: body.displayName,
        username: body.username,
        avatarUrl: body.avatarUrl,
      });
      res.status(200).json(ResponseFormatter.success(updated));
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('USERNAME_CONFLICT')) {
        res.status(409).json(ResponseFormatter.error(msg.replace('USERNAME_CONFLICT: ', ''), 'CONFLICT'));
      } else if (msg.includes('VALIDATION_ERROR')) {
        res.status(400).json(ResponseFormatter.error(msg.replace('VALIDATION_ERROR: ', ''), 'BAD_REQUEST'));
      } else {
        res.status(400).json(ResponseFormatter.error(msg || 'Failed to update profile', 'BAD_REQUEST'));
      }
    }
  };

  /**
   * GET /api/v1/players/:userId
   * Public gaming profile retrieval.
   */
  public getPublicPlayer = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const userId = req.params?.userId || (req.path ? req.path.replace(/^\//, '') : '');
    if (!userId) {
      res.status(400).json(ResponseFormatter.error('User ID parameter is required', 'BAD_REQUEST'));
      return;
    }

    try {
      const publicProfile = await this.service.getPublicProfile(userId);
      if (!publicProfile) {
        res.status(404).json(ResponseFormatter.error(`Player ${userId} not found`, 'NOT_FOUND'));
        return;
      }

      res.status(200).json(ResponseFormatter.success(publicProfile));
    } catch (err: any) {
      res.status(500).json(ResponseFormatter.error('Failed to retrieve player', 'INTERNAL_ERROR', err?.message));
    }
  };

  /**
   * GET /api/v1/usernames/:username/availability
   * Checks whether a username is available.
   */
  public checkUsernameAvailability = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const username = req.params?.username || (req.path ? req.path.split('/')[1] : '');
    if (!username) {
      res.status(400).json(ResponseFormatter.error('Username parameter is required', 'BAD_REQUEST'));
      return;
    }

    try {
      const currentUserId = req.user?.id;
      const result = await this.service.checkUsernameAvailability(username, currentUserId);
      res.status(200).json(ResponseFormatter.success(result));
    } catch (err: any) {
      res.status(500).json(ResponseFormatter.error('Failed to check username', 'INTERNAL_ERROR', err?.message));
    }
  };

  /**
   * POST /api/v1/profile/avatar
   * Updates or uploads avatar image.
   */
  public uploadAvatar = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    if (!req.user || !req.user.id) {
      res.status(401).json(ResponseFormatter.error('Authentication required', 'UNAUTHORIZED'));
      return;
    }

    const body = (req.body as any) || {};

    try {
      const result = await this.service.updateAvatar(req.user.id, {
        avatarUrl: body.avatarUrl,
        imageBase64: body.imageBase64,
        mimeType: body.mimeType,
      });
      res.status(200).json(ResponseFormatter.success(result));
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('INVALID_IMAGE_FORMAT') || msg.includes('IMAGE_TOO_LARGE') || msg.includes('VALIDATION_ERROR')) {
        res.status(400).json(ResponseFormatter.error(msg, 'BAD_REQUEST'));
      } else {
        res.status(500).json(ResponseFormatter.error('Failed to update avatar', 'INTERNAL_ERROR', msg));
      }
    }
  };

  /**
   * DELETE /api/v1/profile/avatar
   * Removes custom avatar.
   */
  public deleteAvatar = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    if (!req.user || !req.user.id) {
      res.status(401).json(ResponseFormatter.error('Authentication required', 'UNAUTHORIZED'));
      return;
    }

    try {
      const result = await this.service.deleteAvatar(req.user.id);
      res.status(200).json(ResponseFormatter.success(result));
    } catch (err: any) {
      res.status(500).json(ResponseFormatter.error('Failed to remove avatar', 'INTERNAL_ERROR', err?.message));
    }
  };
}
