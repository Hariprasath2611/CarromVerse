import { HttpRequest, HttpResponse, NextFunction } from './types.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

export function authMiddleware(req: HttpRequest, res: HttpResponse, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(ResponseFormatter.error('Missing or invalid authorization header', 'UNAUTHORIZED'));
    return;
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    res.status(401).json(ResponseFormatter.error('Invalid token payload', 'UNAUTHORIZED'));
    return;
  }

  // Demo / Dev token parser (substitutable with Firebase Auth or JWT verification)
  try {
    req.user = {
      id: 'usr_authenticated',
      email: 'player@carromverse.io',
      username: 'CarromChampion',
    };
    next();
  } catch (err) {
    res.status(401).json(ResponseFormatter.error('Token verification failed', 'UNAUTHORIZED', err));
  }
}
