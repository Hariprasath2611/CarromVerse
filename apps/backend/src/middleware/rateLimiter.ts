import { HttpRequest, HttpResponse, NextFunction } from './types.js';
import { SERVER_CONFIG } from '../config/server.config.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(req: HttpRequest, res: HttpResponse, next: NextFunction): void {
  const ip = req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const entry = requestCounts.get(ip);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, {
      count: 1,
      resetAt: now + SERVER_CONFIG.rateLimitWindowMs,
    });
    next();
    return;
  }

  entry.count++;
  if (entry.count > SERVER_CONFIG.rateLimitMaxRequests) {
    res.status(429).json(
      ResponseFormatter.error(
        'Too many requests, please slow down',
        'RATE_LIMIT_EXCEEDED'
      )
    );
    return;
  }

  next();
}

