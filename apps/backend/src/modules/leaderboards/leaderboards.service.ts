import { BaseService } from '../../services/base.service.js';
import { LeaderboardEntryDto, LeaderboardScope } from './leaderboards.types.js';

export class LeaderboardsService extends BaseService {
  constructor() {
    super('LeaderboardsService');
  }

  public async getLeaderboard(_scope: LeaderboardScope = 'weekly'): Promise<LeaderboardEntryDto[]> {
    return [
      { rank: 1, userId: 'u_1', username: 'StrikerKing', avatar: '👑', score: 2840, tier: 'Grandmaster' },
      { rank: 2, userId: 'u_2', username: 'CarromMaster', avatar: '🐯', score: 2610, tier: 'Master' },
      { rank: 3, userId: 'u_3', username: 'PocketAce', avatar: '🦅', score: 2450, tier: 'Master' },
      { rank: 4, userId: 'u_4', username: 'FalconStrike', avatar: '🦁', score: 2190, tier: 'Diamond' },
      { rank: 5, userId: 'u_5', username: 'QueenSniper', avatar: '⚡', score: 1980, tier: 'Diamond' },
    ];
  }
}
