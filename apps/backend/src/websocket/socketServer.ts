import { Server as HttpServer } from 'http';
import { Logger } from '../utils/logger.js';
import { RoomManager } from './roomManager.js';

export class SocketServer {
  private roomManager: RoomManager;
  private isRunning = false;

  constructor(roomManager = new RoomManager()) {
    this.roomManager = roomManager;
  }

  public attach(server: HttpServer): void {
    this.isRunning = true;
    Logger.info('WebSocket architecture initialized on HTTP server');

    // Upgrade handler stub for future WebSocket / Colyseus server integration
    server.on('upgrade', (_req, socket, _head) => {
      Logger.debug('WebSocket upgrade requested');
      // Ready for WS library binding (e.g. ws, colyseus, socket.io)
      socket.write('HTTP/1.1 501 Not Implemented\r\n\r\n');
      socket.destroy();
    });
  }

  public getRoomManager(): RoomManager {
    return this.roomManager;
  }

  public close(): void {
    this.isRunning = false;
    Logger.info('WebSocket server closed');
  }
}
