import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { EventEmitter } from 'node:events';
import { createApp } from '../dist/app.js';
import { AuthService } from '../dist/modules/auth/auth.service.js';
import { AuthValidator } from '../dist/modules/auth/auth.validator.js';
import { UsersService } from '../dist/modules/users/users.service.js';
import { MatchesService } from '../dist/modules/matches/matches.service.js';
import { LeaderboardsService } from '../dist/modules/leaderboards/leaderboards.service.js';
import { MultiplayerService } from '../dist/modules/multiplayer/multiplayer.service.js';
import { RoomManager } from '../dist/websocket/roomManager.js';

// Helper to simulate in-memory HTTP requests without TCP binding
function invokeApp(app, method, url, body = null, headers = {}) {
  return new Promise((resolve) => {
    const bodyBuffer = body
      ? Buffer.from(typeof body === 'string' ? body : JSON.stringify(body))
      : Buffer.alloc(0);

    const req = Readable.from(body ? [bodyBuffer] : []);
    req.method = method;
    req.url = url;
    req.headers = { host: 'localhost', ...headers };
    req.socket = { remoteAddress: '127.0.0.1' };

    let statusCode = 200;
    const responseHeaders = {};
    let responseBody = '';

    const res = new EventEmitter();
    res.setHeader = (key, val) => {
      responseHeaders[key.toLowerCase()] = val;
    };
    res.getHeader = (key) => responseHeaders[key.toLowerCase()];
    res.end = (chunk) => {
      if (chunk) responseBody += chunk;
      res.emit('finish');
      let parsed = null;
      try {
        parsed = JSON.parse(responseBody);
      } catch {
        parsed = responseBody;
      }
      resolve({
        statusCode: res.statusCode || statusCode,
        headers: responseHeaders,
        body: parsed,
      });
    };

    app.handleRequest(req, res);
  });
}

test('Backend Module & API Tests', async (t) => {
  const app = createApp();

  await t.test('GET /health returns status ok', async () => {
    const res = await invokeApp(app, 'GET', '/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'ok');
    assert.equal(res.body.data.service, 'carromverse-backend');
  });

  await t.test('POST /api/v1/auth/login validates and logs in', async () => {
    const badRes = await invokeApp(app, 'POST', '/api/v1/auth/login', { email: 'invalid' });
    assert.equal(badRes.statusCode, 400);

    const goodRes = await invokeApp(app, 'POST', '/api/v1/auth/login', { email: 'player@carromverse.io' });
    assert.equal(goodRes.statusCode, 200);
    assert.equal(goodRes.body.success, true);
    assert.ok(goodRes.body.data.token);
    assert.equal(goodRes.body.data.user.email, 'player@carromverse.io');
  });

  await t.test('GET /api/v1/leaderboards returns ranked entries', async () => {
    const res = await invokeApp(app, 'GET', '/api/v1/leaderboards');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.entries));
    assert.ok(res.body.data.entries.length > 0);
  });

  await t.test('POST and GET /api/v1/multiplayer/rooms manages room lifecycle', async () => {
    const createRes = await invokeApp(app, 'POST', '/api/v1/multiplayer/rooms', {
      mode: 'two_player_individual',
      hostId: 'host_p1',
      hostName: 'Grandmaster',
    });
    assert.equal(createRes.statusCode, 201);
    assert.equal(createRes.body.success, true);
    assert.equal(createRes.body.data.maxPlayers, 2);

    const listRes = await invokeApp(app, 'GET', '/api/v1/multiplayer/rooms');
    assert.equal(listRes.statusCode, 200);
    assert.equal(listRes.body.success, true);
    assert.ok(listRes.body.data.length >= 1);
  });

  await t.test('AuthValidator validates emails and passwords correctly', () => {
    assert.equal(AuthValidator.validateLogin({ email: 'bad' }).isValid, false);
    assert.equal(AuthValidator.validateLogin({ email: 'good@test.com' }).isValid, true);
  });

  await t.test('UsersService tracks and levels up player statistics', async () => {
    const service = new UsersService();
    const user = await service.updateStats('usr_test', true);
    assert.equal(user.matchesPlayed, 1);
    assert.equal(user.matchesWon, 1);
    assert.equal(user.xp, 100);
  });

  await t.test('MatchesService records match history in memory', async () => {
    const service = new MatchesService();
    await service.recordMatch({
      id: 'match_1',
      sessionId: 'sess_1',
      mode: 'two_player_individual',
      variant: 'points',
      isDraw: false,
      finalScores: {},
      durationSeconds: 120,
      totalTurns: 10,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      isSynced: true,
      syncAttemptCount: 1,
    });
    const matches = await service.getMatches();
    assert.equal(matches.length, 1);
    assert.equal(matches[0].id, 'match_1');
  });

  await t.test('RoomManager registers clients and assigns rooms', () => {
    const rm = new RoomManager();
    rm.registerClient('c_1', 'u_1');
    rm.joinRoom('room_alpha', 'c_1');
    assert.deepEqual(rm.getRoomClients('room_alpha'), ['c_1']);
    rm.leaveRoom('room_alpha', 'c_1');
    assert.deepEqual(rm.getRoomClients('room_alpha'), []);
  });
});
