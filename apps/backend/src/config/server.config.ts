import { ENV } from './env.config.js';

export const SERVER_CONFIG = {
  port: ENV.port,
  host: ENV.host,
  apiVersion: 'v1',
  rateLimitMaxRequests: 100,
  rateLimitWindowMs: 60 * 1000,
  shutdownTimeoutMs: 5000,
};

