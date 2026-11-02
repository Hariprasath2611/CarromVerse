import { Server as HttpServer } from 'http';
import { Server, matchMaker } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { CarromRoom } from '../rooms/CarromRoom.js';
import { Logger } from '../utils/logger.js';

export class ColyseusGameServer {
  private colyseusServer: Server | null = null;
  private isRunning: boolean = false;

  public attach(httpServer: HttpServer): Server {
    const transport = new WebSocketTransport({
      server: httpServer,
      pingInterval: 5000,
      pingMaxRetries: 3,
    });

    this.colyseusServer = new Server({
      transport,
      gracefullyShutdown: false, // We control shutdown lifecycle directly
    });

    // Register Carrom multiplayer room
    this.colyseusServer.define('carrom_room', CarromRoom);

    this.isRunning = true;
    Logger.info('⚡ [Colyseus] Multiplayer Game Server initialized and attached to HTTP server');
    Logger.info('⚡ [Colyseus] Registered room definition: carrom_room');

    return this.colyseusServer;
  }

  public async close(): Promise<void> {
    if (this.colyseusServer && this.isRunning) {
      Logger.info('[Colyseus] Gracefully shutting down Colyseus Game Server...');
      try {
        await this.colyseusServer.gracefullyShutdown();
        this.isRunning = false;
        Logger.info('[Colyseus] Colyseus Game Server stopped cleanly.');
      } catch (err: any) {
        Logger.error(`[Colyseus] Error during shutdown: ${err.message}`);
      }
    }
  }

  public async getRoomCount(): Promise<number> {
    try {
      const rooms = await matchMaker.query({ name: 'carrom_room' });
      return rooms.length;
    } catch {
      return 0;
    }
  }

  public getRawServer(): Server | null {
    return this.colyseusServer;
  }
}

