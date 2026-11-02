import { Logger } from '../utils/logger.js';

export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected log(message: string, meta?: unknown): void {
    Logger.info(`[${this.serviceName}] ${message}`, meta);
  }

  protected logError(message: string, error?: unknown): void {
    Logger.error(`[${this.serviceName}] ${message}`, error);
  }
}

