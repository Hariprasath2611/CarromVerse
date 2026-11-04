import { IncomingMessage, ServerResponse } from 'http';
import { HttpRequest, HttpResponse, Middleware } from './middleware/types.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createHealthRouter } from './routes/health.router.js';
import { createApiRouter } from './routes/api.router.js';
import { ResponseFormatter } from './utils/responseFormatter.js';
import { ENV } from './config/env.config.js';

export class App {
  private middlewares: Middleware[] = [];
  private healthRouter = createHealthRouter();
  private apiRouter = createApiRouter();

  constructor() {
    this.use(requestLogger);
    this.use(rateLimiter);
  }

  public use(middleware: Middleware): void {
    this.middlewares.push(middleware);
  }

  public handleRequest = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const httpReq = req as HttpRequest;
    const httpRes = res as HttpResponse;

    // Enhance response with status and json helpers
    httpRes.status = function (code: number) {
      this.statusCode = code;
      return this;
    };
    httpRes.json = function (data: unknown) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
    };
    httpRes.send = function (data: string) {
      this.end(data);
    };

    // Set CORS headers
    httpRes.setHeader('Access-Control-Allow-Origin', ENV.corsOrigin);
    httpRes.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    httpRes.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (httpReq.method === 'OPTIONS') {
      httpRes.status(204).send('');
      return;
    }

    // Parse URL and Query parameters
    const parsedUrl = new URL(httpReq.url || '/', `http://${httpReq.headers.host || 'localhost'}`);
    httpReq.path = parsedUrl.pathname;
    httpReq.query = Object.fromEntries(parsedUrl.searchParams.entries());

    // Parse JSON body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(httpReq.method || '')) {
      try {
        const bodyChunks: Buffer[] = [];
        for await (const chunk of httpReq) {
          bodyChunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
        }
        const bodyStr = Buffer.concat(bodyChunks).toString();
        httpReq.body = bodyStr ? JSON.parse(bodyStr) : {};
      } catch (err) {
        httpRes.status(400).json(ResponseFormatter.error('Malformed JSON body', 'BAD_REQUEST', err));
        return;
      }
    }

    try {
      // Execute middleware chain
      for (const middleware of this.middlewares) {
        let nextCalled = false;
        await middleware(httpReq, httpRes, () => {
          nextCalled = true;
        });
        if (!nextCalled) return; // Middleware short-circuited response
      }

      // Check Health routes
      if (this.healthRouter(httpReq, httpRes)) {
        return;
      }

      // Check /api/v1 routes
      if (httpReq.path.startsWith('/api/v1')) {
        httpReq.path = httpReq.path.substring(7);
        await this.apiRouter(httpReq, httpRes);
        return;
      }

      // 404 for unhandled paths
      httpRes.status(404).json(
        ResponseFormatter.error(`Route ${httpReq.method} ${parsedUrl.pathname} not found`, 'NOT_FOUND')
      );
    } catch (err) {
      errorHandler(err, httpReq, httpRes, () => {});
    }
  };
}

export function createApp(): App {
  return new App();
}

