import { GameResult } from '@carromverse/shared-types';
import { BaseService } from '../../services/base.service.js';

export class MatchesService extends BaseService {
  private matches: GameResult[] = [];

  constructor() {
    super('MatchesService');
  }

  public async recordMatch(result: GameResult): Promise<GameResult> {
    this.log(`Recording match outcome for session ${result.sessionId}`);
    this.matches.push(result);
    return result;
  }

  public async getMatches(limit = 20): Promise<GameResult[]> {
    return this.matches.slice(-limit).reverse();
  }

  public async getMatchById(id: string): Promise<GameResult | undefined> {
    return this.matches.find((m) => m.id === id);
  }
}
