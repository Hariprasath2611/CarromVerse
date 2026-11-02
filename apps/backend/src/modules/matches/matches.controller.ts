import { HttpRequest, HttpResponse } from '../../middleware/types.js';
import { ResponseFormatter } from '../../utils/responseFormatter.js';
import { MatchesService } from './matches.service.js';

export class MatchesController {
  private matchesService: MatchesService;

  constructor(matchesService = new MatchesService()) {
    this.matchesService = matchesService;
  }

  public recordMatch = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const body = req.body as { result?: any };
    if (!body?.result) {
      res.status(400).json(ResponseFormatter.error('Match result object is required', 'VALIDATION_FAILED'));
      return;
    }

    try {
      const saved = await this.matchesService.recordMatch(body.result);
      res.status(201).json(ResponseFormatter.success(saved));
    } catch (err) {
      res.status(500).json(ResponseFormatter.error('Failed to save match result', 'MATCH_SAVE_ERROR', err));
    }
  };

  public getMatches = async (req: HttpRequest, res: HttpResponse): Promise<void> => {
    const limit = req.query?.limit ? parseInt(req.query.limit, 10) : 20;
    const list = await this.matchesService.getMatches(limit);
    res.status(200).json(ResponseFormatter.success(list));
  };
}
