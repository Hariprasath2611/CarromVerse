import { BaseService } from '../../services/base.service.js';
import { UserDto } from './users.types.js';

export class UsersService extends BaseService {
  private users: Map<string, UserDto> = new Map();

  constructor() {
    super('UsersService');
    // Pre-populate demo user
    this.users.set('usr_default', {
      id: 'usr_default',
      username: 'CarromChampion',
      email: 'player@carromverse.io',
      avatar: '👑',
      level: 5,
      xp: 1250,
      coins: 15000,
      gems: 50,
      matchesPlayed: 25,
      matchesWon: 18,
    });
  }

  public async getProfile(userId: string): Promise<UserDto | undefined> {
    this.log(`Fetching profile for ${userId}`);
    return this.users.get(userId) || this.users.get('usr_default');
  }

  public async updateStats(userId: string, won: boolean): Promise<UserDto> {
    let user = this.users.get(userId);
    if (!user) {
      user = {
        id: userId,
        username: 'Player',
        email: 'user@carromverse.io',
        avatar: '🐯',
        level: 1,
        xp: 0,
        coins: 1000,
        gems: 10,
        matchesPlayed: 0,
        matchesWon: 0,
      };
      this.users.set(userId, user);
    }

    user.matchesPlayed++;
    if (won) {
      user.matchesWon++;
      user.xp += 100;
      user.coins += 250;
    } else {
      user.xp += 25;
      user.coins += 50;
    }
    user.level = Math.floor(user.xp / 250) + 1;
    return user;
  }
}
