import { createServer } from 'http';
import { createApp } from './app.js';
import { SERVER_CONFIG } from './config/server.config.js';
import { Logger } from './utils/logger.js';
import { SocketServer } from './websocket/socketServer.js';
import { ColyseusGameServer } from './websocket/colyseusServer.js';

export function startServer() {
  const app = createApp();
  const server = createServer(app.handleRequest);
  const socketServer = new SocketServer();
  const colyseusServer = new ColyseusGameServer();

  // Attach Colyseus multiplayer room transport
  colyseusServer.attach(server);

  // Attach standard WebSocket gateway
  socketServer.attach(server);

  server.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, () => {
    Logger.info(
      `🚀 CarromVerse Backend Server listening at http://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}`
    );
    Logger.info(`Health check available at http://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}/health`);
    Logger.info(`API v1 routes at http://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}/api/v1`);
    Logger.info(`Colyseus room registered: carrom_room`);
  });

  const shutdown = async () => {
    Logger.info('Shutting down server gracefully...');
    await colyseusServer.close();
    socketServer.close();
    server.close(() => {
      Logger.info('Server terminated cleanly.');
      process.exit(0);
    });

    setTimeout(() => {
      Logger.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, SERVER_CONFIG.shutdownTimeoutMs);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return { server, app, socketServer, colyseusServer };
}

// Auto-start when executed directly
if (process.argv[1]?.endsWith('server.js') || process.argv[1]?.endsWith('server.ts')) {
  startServer();
}

