import { HttpRequest, HttpResponse, NextFunction } from './types.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';
import { FirebaseAuthService } from '../auth/firebaseAuth.service.js';

export async function authMiddleware(req: HttpRequest, res: HttpResponse, next: NextFunction): Promise<void> {
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

  try {
    const authService = FirebaseAuthService.getInstance();
    const decoded = await authService.verifyIdToken(token);

    req.user = {
      id: decoded.uid,
      email: decoded.email || '',
      displayName: decoded.displayName || '',
      username: decoded.displayName || decoded.uid,
      picture: decoded.picture,
    };
    next();
  } catch (err: any) {
    const message = err?.message || 'Token verification failed';
    res.status(401).json(ResponseFormatter.error(message, 'UNAUTHORIZED'));
  }
}
