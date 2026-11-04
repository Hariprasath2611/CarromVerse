import { IncomingMessage, ServerResponse } from 'http';

export interface HttpRequest extends IncomingMessage {
  path?: string;
  query?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  user?: { id: string; email: string; username?: string; displayName?: string; picture?: string };
}

export interface HttpResponse extends ServerResponse {
  status(statusCode: number): this;
  json(data: unknown): void;
  send(data: string): void;
}

export type NextFunction = (err?: unknown) => void;
export type Middleware = (req: HttpRequest, res: HttpResponse, next: NextFunction) => void | Promise<void>;

