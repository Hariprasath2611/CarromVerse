export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  public static log(level: LogLevel, message: string, meta?: unknown): void {
    const timestamp = new Date().toISOString();
    const formattedMeta = meta ? ` | ${JSON.stringify(meta)}` : '';
    console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${formattedMeta}`);
  }

  public static info(message: string, meta?: unknown): void {
    this.log('info', message, meta);
  }

  public static warn(message: string, meta?: unknown): void {
    this.log('warn', message, meta);
  }

  public static error(message: string, meta?: unknown): void {
    this.log('error', message, meta);
  }

  public static debug(message: string, meta?: unknown): void {
    if (process.env.DEBUG) {
      this.log('debug', message, meta);
    }
  }
}
