import { HttpRequest, HttpResponse, NextFunction } from './types.js';
import { Logger } from '../utils/logger.js';

export function requestLogger(req: HttpRequest, res: HttpResponse, next: NextFunction): void {
  const start = Date.now();
  const method = req.method || 'GET';
  const url = req.url || '/';

  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.info(`${method} ${url} ${res.statusCode} - ${duration}ms`);
  });

  next();
}

