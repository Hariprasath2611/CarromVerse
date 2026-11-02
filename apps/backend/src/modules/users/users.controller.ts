import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { ResponseFormatter } from '../../utils/responseFormatter.js';
import { UsersService } from './users.service.js';

export class UsersController {
  private usersService: UsersService;

  constructor(usersService = new UsersService()) {
    this.usersService = usersService;
  }

  public getProfile = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const userId = req.params?.id || req.user?.id || 'usr_default';
    const profile = await this.usersService.getProfile(userId);
    if (!profile) {
      res.status(404).json(ResponseFormatter.error('User not found', 'USER_NOT_FOUND'));
      return;
    }
    res.status(200).json(ResponseFormatter.success(profile));
  };
}
