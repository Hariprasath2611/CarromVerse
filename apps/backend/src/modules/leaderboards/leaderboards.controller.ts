import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { ResponseFormatter } from '../../utils/responseFormatter.js';
import { LeaderboardsService } from './leaderboards.service.js';
import { LeaderboardScope } from './leaderboards.types.js';

export class LeaderboardsController {
  private leaderboardsService: LeaderboardsService;

  constructor(leaderboardsService = new LeaderboardsService()) {
    this.leaderboardsService = leaderboardsService;
  }

  public getLeaderboard = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const scope = (req.query?.scope as LeaderboardScope) || 'weekly';
    const entries = await this.leaderboardsService.getLeaderboard(scope);
    res.status(200).json(ResponseFormatter.success({ scope, entries }));
  };
}

