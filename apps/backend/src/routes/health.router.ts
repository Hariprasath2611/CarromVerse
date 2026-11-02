import { HttpRequest, HttpResponse } from '../middleware/types.js';
import { ResponseFormatter } from '../utils/responseFormatter.js';

export function createHealthRouter() {
  return (req: HttpRequest, res: HttpResponse): boolean => {
    const path = req.path || '';
    if (path === '/health' || path === '/healthz' || path === '/status') {
      res.status(200).json(
        ResponseFormatter.success({
          status: 'ok',
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          service: 'carromverse-backend',
          version: '1.0.0',
        })
      );
      return true;
    }
    return false;
  };
}

