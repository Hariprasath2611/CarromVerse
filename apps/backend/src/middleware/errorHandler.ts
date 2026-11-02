import { HttpRequest, HttpResponse, NextFunction } from './types.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { Logger } from '../utils/logger.js';

export function errorHandler(
  err: unknown,
  req: HttpRequest,
  res: HttpResponse,
  _next: NextFunction
): void {
  const message = err instanceof Error ? err.message : 'Unknown server error occurred';
  Logger.error(`Unhandled error during ${req.method} ${req.url}: ${message}`);

  res.status(500).json(
    ResponseFormatter.error(
      message,
      'INTERNAL_SERVER_ERROR',
      process.env.NODE_ENV === 'development' ? err : undefined
    )
  );
}

