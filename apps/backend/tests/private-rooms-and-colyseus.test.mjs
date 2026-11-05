import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { EventEmitter } from 'node:events';
import { App } from '../dist/app.js';
import { FirebaseAuthService } from '../dist/auth/firebaseAuth.service.js';
import { RoomCodeService } from '../dist/modules/multiplayer/roomCode.service.js';
import { PrivateRoomRegistry } from '../dist/modules/multiplayer/privateRoom.registry.js';
import { CarromRoom } from '../dist/rooms/CarromRoom.js';

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

test('CarromVerse Phase 2.3 – Private Multiplayer Rooms & Room Code Management Tests', async (t) => {
  const authService = FirebaseAuthService.getInstance();
  const registry = PrivateRoomRegistry.getInstance();
  const app = new App();

  // Reset registry before test suite
  registry.clearAll();

  // ==========================================
  // 1. Room Code Generation & Normalization
  // ==========================================
  await t.test('1. RoomCodeService Generation, Entropy & Normalization', async (st) => {
    await st.test('generates valid 6-character room codes', () => {
      const code = RoomCodeService.generateCode();
      assert.equal(code.length, 6);
      assert.ok(RoomCodeService.isValidCode(code));
    });

    await st.test('excludes ambiguous characters (0, O, 1, I, L)', () => {
      for (let i = 0; i < 200; i++) {
        const code = RoomCodeService.generateCode();
        assert.ok(!/[0O1IL]/.test(code), `Code ${code} must not contain ambiguous chars`);
      }
    });

    await st.test('normalizes user input (spaces, dashes, lowercase)', () => {
      assert.equal(RoomCodeService.normalizeCode('cv-8m4k'), 'CV8M4K');
      assert.equal(RoomCodeService.normalizeCode(' W7 K 9 M 2 '), 'W7K9M2');
      assert.equal(RoomCodeService.normalizeCode('ab_cd-ef'), 'ABCDEF');
    });

    await st.test('validates case-insensitively and rejects invalid lengths', () => {
      assert.ok(RoomCodeService.isValidCode('ab2345'));
      assert.ok(!RoomCodeService.isValidCode('12345')); // too short
      assert.ok(!RoomCodeService.isValidCode('1234567')); // too long
      assert.ok(!RoomCodeService.isValidCode('ABC!@#')); // invalid symbols
    });

    await st.test('produces high entropy with zero collisions across 500 samples', () => {
      const set = new Set();
      for (let i = 0; i < 500; i++) {
        const code = RoomCodeService.generateCode();
        assert.ok(!set.has(code), `Collision detected on code ${code}`);
        set.add(code);
      }
      assert.equal(set.size, 500);
    });
  });

  // ==========================================
  // 2. PrivateRoomRegistry & Password Security
  // ==========================================
  await t.test('2. PrivateRoomRegistry Lifecycle & Password Verification', async (st) => {
    await st.test('generates guaranteed unique room codes', () => {
      const code = registry.generateUniqueRoomCode();
      assert.equal(code.length, 6);
      assert.ok(RoomCodeService.isValidCode(code));
    });

    await st.test('hashes and securely verifies room passwords', () => {
      const { hash, salt } = registry.hashPassword('carrom123');
      assert.ok(hash && salt);

      // Register room with password
      const roomCode = registry.generateUniqueRoomCode();
      registry.registerRoom({
        roomId: 'room_pwd_test',
        roomCode,
        hostUserId: 'usr_host',
        hostDisplayName: 'Host User',
        gameMode: 'two_player_individual',
        maxPlayers: 2,
        currentPlayers: 1,
        hasPassword: true,
        passwordHash: hash,
        passwordSalt: salt,
        boardTheme: 'classic',
        targetScore: 25,
        turnTimeLimitSeconds: 25,
        status: 'WAITING',
      });

      assert.ok(registry.verifyPassword(roomCode, 'carrom123'), 'Must verify correct password');
      assert.ok(!registry.verifyPassword(roomCode, 'wrong_pass'), 'Must reject wrong password');
      assert.ok(!registry.verifyPassword('NON_EXISTENT', 'carrom123'), 'Must reject non-existent code');
    });

    await st.test('enforces rate limiting for room code lookups', () => {
      const testIp = '192.168.1.99';
      // First 25 lookups allowed
      for (let i = 0; i < 25; i++) {
        assert.ok(registry.checkAndRecordLookupRateLimit(testIp), `Lookup ${i + 1} should be allowed`);
      }
      // 26th lookup must be blocked
      assert.ok(!registry.checkAndRecordLookupRateLimit(testIp), '26th lookup should exceed limit');
    });

    await st.test('invalidates and removes rooms cleanly', () => {
      const code = registry.generateUniqueRoomCode();
      registry.registerRoom({
        roomId: 'room_removal_test',
        roomCode: code,
        hostUserId: 'u1',
        hostDisplayName: 'H',
        gameMode: 'two_player_individual',
        maxPlayers: 2,
        currentPlayers: 1,
        hasPassword: false,
        boardTheme: 'classic',
        targetScore: 25,
        turnTimeLimitSeconds: 25,
        status: 'WAITING',
      });

      assert.ok(registry.getRoomByCode(code));
      registry.removeRoom('room_removal_test');
      assert.equal(registry.getRoomByCode(code), undefined);
      assert.equal(registry.getRoomById('room_removal_test'), undefined);
    });
  });

  // ==========================================
  // 3. REST API: Private Room Endpoints
  // ==========================================
  await t.test('3. Private Room REST API Endpoints', async (st) => {
    const validToken = authService.createTestToken('usr_host_api', {
      displayName: 'Hari Host',
      email: 'host@carromverse.io',
      expiresInSeconds: 3600,
    });

    await st.test('POST /api/v1/multiplayer/private/create rejects unauthenticated request (401)', async () => {
      const res = await invokeApp(app, 'POST', '/api/v1/multiplayer/private/create', {
        gameMode: 'two_player_individual',
      });
      assert.equal(res.statusCode, 401);
    });

    let createdRoomCode = '';
    await st.test('POST /api/v1/multiplayer/private/create creates room for authenticated user', async () => {
      const res = await invokeApp(
        app,
        'POST',
        '/api/v1/multiplayer/private/create',
        {
          gameMode: 'four_player_team',
          targetScore: 29,
          boardTheme: 'emerald',
          password: 'secret_match',
        },
        { authorization: `Bearer ${validToken}` }
      );

      assert.equal(res.statusCode, 201);
      assert.ok(res.body.success);
      assert.ok(res.body.data.roomId);
      assert.ok(res.body.data.roomCode);
      assert.equal(res.body.data.gameMode, 'four_player_team');
      assert.equal(res.body.data.hasPassword, true);

      createdRoomCode = res.body.data.roomCode;
    });

    await st.test('GET /api/v1/multiplayer/private/:roomCode/lookup returns 400 on malformed code', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/multiplayer/private/BAD_CODE_TOO_LONG/lookup');
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.error.code, 'INVALID_CODE_FORMAT');
    });

    await st.test('GET /api/v1/multiplayer/private/:roomCode/lookup returns 404 for non-existent code', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/multiplayer/private/ZZZZZZ/lookup');
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.error.code, 'ROOM_NOT_FOUND');
    });

    await st.test('GET /api/v1/multiplayer/private/:roomCode/lookup returns sanitized metadata for active room', async () => {
      const res = await invokeApp(app, 'GET', `/api/v1/multiplayer/private/${createdRoomCode.toLowerCase()}/lookup`);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.roomCode, createdRoomCode);
      assert.equal(res.body.data.gameMode, 'four_player_team');
      assert.equal(res.body.data.maxPlayers, 4);
      assert.equal(res.body.data.hasPassword, true);
      assert.equal(res.body.data.hostDisplayName, 'Hari Host');
    });

    await st.test('POST /api/v1/multiplayer/private/:roomCode/verify-password verifies correctly', async () => {
      // Wrong password
      const badRes = await invokeApp(app, 'POST', `/api/v1/multiplayer/private/${createdRoomCode}/verify-password`, {
        password: 'wrong_password',
      });
      assert.equal(badRes.statusCode, 200);
      assert.equal(badRes.body.data.valid, false);

      // Correct password
      const goodRes = await invokeApp(app, 'POST', `/api/v1/multiplayer/private/${createdRoomCode}/verify-password`, {
        password: 'secret_match',
      });
      assert.equal(goodRes.statusCode, 200);
      assert.equal(goodRes.body.data.valid, true);
    });
  });

  // ==========================================
  // 4. Colyseus CarromRoom In-Engine Lifecycle & Rules
  // ==========================================
  await t.test('4. Colyseus Private Room Authoritative State & Multi-Client Rules', async (st) => {
    const hostToken = authService.createTestToken('usr_host_1', { displayName: 'HostPlayer' });
    const p2Token = authService.createTestToken('usr_player_2', { displayName: 'PlayerTwo' });
    const p3Token = authService.createTestToken('usr_player_3', { displayName: 'PlayerThree' });
    const p4Token = authService.createTestToken('usr_player_4', { displayName: 'PlayerFour' });

    function createMockClient(sessionId) {
      const sent = [];
      const c = {
        sessionId,
        send: (type, data) => sent.push({ type, data }),
        enqueueRaw: () => {},
        raw: () => {},
        leave: () => {},
        sent,
      };
      return c;
    }

    function dispatchMessage(targetRoom, client, messageType, payload = {}) {
      const handler = targetRoom.onMessageEvents?.events[messageType]?.[0];
      if (handler) {
        handler(client, payload);
      }
    }

    let room;
    let roomCode;
    let clientHost;
    let clientP2;
    let clientP3;
    let clientP4;

    await st.test('Host creates private password-protected room', () => {
      room = new CarromRoom();
      room.roomId = 'room_multi_test_1';
      room.onCreate({
        gameMode: 'two_player_individual',
        password: 'secure',
        boardTheme: 'rosewood',
        targetScore: 25,
      });

      assert.equal(room.state.status, 'WAITING');
      assert.equal(room.state.gameMode, 'two_player_individual');
      assert.equal(room.state.hasPassword, true);
      assert.equal(room.state.boardTheme, 'rosewood');
      assert.ok(room.state.roomCode);

      roomCode = room.state.roomCode;
      assert.ok(registry.getRoomByCode(roomCode));
    });

    await st.test('onAuth rejects client with incorrect room password', async () => {
      const mockClient = createMockClient('client_bad_pwd');
      await assert.rejects(
        async () => await room.onAuth(mockClient, { token: p2Token, password: 'incorrect_pass' }),
        /Incorrect room password/
      );
    });

    await st.test('Host joins room and receives Seat 0 with Host status', async () => {
      clientHost = createMockClient('sess_host');
      room.clients.push(clientHost);
      const authHost = await room.onAuth(clientHost, { token: hostToken, password: 'secure' });
      room.onJoin(clientHost, {}, authHost);

      const hostPlayer = room.state.players.get('sess_host');
      assert.ok(hostPlayer);
      assert.equal(hostPlayer.isHost, true);
      assert.equal(hostPlayer.seat, 0);
      assert.equal(room.state.hostUserId, 'usr_host_1');
      assert.equal(room.state.players.size, 1);
    });

    await st.test('onAuth rejects duplicate user join for already connected player', async () => {
      const duplicateClient = createMockClient('sess_host_dup');
      await assert.rejects(
        async () => await room.onAuth(duplicateClient, { token: hostToken, password: 'secure' }),
        /User is already connected to this room/
      );
    });

    await st.test('Player 2 joins with correct password, receives Seat 2', async () => {
      clientP2 = createMockClient('sess_p2');
      room.clients.push(clientP2);
      const authP2 = await room.onAuth(clientP2, { token: p2Token, password: 'secure' });
      room.onJoin(clientP2, {}, authP2);

      const p2 = room.state.players.get('sess_p2');
      assert.ok(p2);
      assert.equal(p2.isHost, false);
      assert.equal(p2.seat, 2);
      assert.equal(p2.assignedCoinType, 'black');
      assert.equal(room.state.players.size, 2);
    });

    await st.test('Third player rejected when room capacity is 2', async () => {
      const clientRejected = createMockClient('sess_p3_rejected');
      const authP3 = await room.onAuth(clientRejected, { token: p3Token, password: 'secure' });
      assert.throws(() => {
        room.onJoin(clientRejected, {}, authP3);
      }, /Room is already full/);
    });

    await st.test('Non-host cannot perform host-only actions (START_MATCH / KICK)', () => {
      clientP2.sent.length = 0;
      dispatchMessage(room, clientP2, 'START_MATCH');

      const err = clientP2.sent.find((m) => m.type === 'ERROR');
      assert.ok(err);
      assert.equal(err.data.code, 'NOT_AUTHORIZED');
    });

    await st.test('Host changes game mode to four_player_team (reallocates seats and expands capacity)', () => {
      dispatchMessage(room, clientHost, 'CHANGE_GAME_MODE', { gameMode: 'four_player_team' });

      assert.equal(room.state.gameMode, 'four_player_team');
      assert.equal(room.state.maxPlayers, 4);
      assert.equal(room.maxClients, 4);

      // Verify seats reallocated
      const host = room.state.players.get('sess_host');
      const p2 = room.state.players.get('sess_p2');
      assert.equal(host?.seat, 0);
      assert.equal(host?.teamId, 'team_a');
      assert.equal(p2?.seat, 1);
      assert.equal(p2?.teamId, 'team_b');
    });

    await st.test('Player 3 and Player 4 join the 4-player team room', async () => {
      clientP3 = createMockClient('sess_p3');
      room.clients.push(clientP3);
      const authP3 = await room.onAuth(clientP3, { token: p3Token, password: 'secure' });
      room.onJoin(clientP3, {}, authP3);

      clientP4 = createMockClient('sess_p4');
      room.clients.push(clientP4);
      const authP4 = await room.onAuth(clientP4, { token: p4Token, password: 'secure' });
      room.onJoin(clientP4, {}, authP4);

      assert.equal(room.state.players.size, 4);
      const p3 = room.state.players.get('sess_p3');
      const p4 = room.state.players.get('sess_p4');

      assert.equal(p3?.seat, 2);
      assert.equal(p3?.teamId, 'team_a'); // Partner with host (seat 0)
      assert.equal(p4?.seat, 3);
      assert.equal(p4?.teamId, 'team_b'); // Partner with p2 (seat 1)
    });

    await st.test('SWITCH_TEAM enforces 2-players-per-team constraint', () => {
      clientP3.sent.length = 0;
      // Player 3 (team_a) attempts to switch to team_b which already has p2 and p4 (2 players)
      dispatchMessage(room, clientP3, 'SWITCH_TEAM', { targetTeam: 'team_b' });

      const err = clientP3.sent.find((m) => m.type === 'ERROR');
      assert.ok(err);
      assert.equal(err.data.code, 'TEAM_FULL');
    });

    await st.test('START_MATCH fails when players are not ready', () => {
      clientHost.sent.length = 0;
      dispatchMessage(room, clientHost, 'START_MATCH');

      const err = clientHost.sent.find((m) => m.type === 'ERROR');
      assert.ok(err);
      assert.equal(err.data.code, 'PLAYERS_NOT_READY');
    });

    await st.test('All players set ready -> room status becomes READY', () => {
      dispatchMessage(room, clientHost, 'SET_READY', { isReady: true });
      dispatchMessage(room, clientP2, 'SET_READY', { isReady: true });
      dispatchMessage(room, clientP3, 'SET_READY', { isReady: true });
      dispatchMessage(room, clientP4, 'SET_READY', { isReady: true });

      assert.equal(room.state.status, 'READY');
    });

    await st.test('Host kicks Player 4 -> player removed, readiness drops back to WAITING', async () => {
      clientP4.sent.length = 0;
      dispatchMessage(room, clientHost, 'KICK_PLAYER', { targetSessionId: 'sess_p4' });

      const kickedMsg = clientP4.sent.find((m) => m.type === 'KICKED_FROM_ROOM');
      assert.ok(kickedMsg, 'Player 4 should receive kicked notification');

      await room.onLeave(clientP4, 4001);

      assert.equal(room.state.players.size, 3);
      assert.equal(room.state.status, 'WAITING');
    });

    await st.test('Host disconnects -> host authority automatically transferred to Player 2', async () => {
      await room.onLeave(clientHost, 1000);

      assert.equal(room.state.players.size, 2);
      assert.equal(room.state.hostUserId, 'usr_player_2');

      const p2 = room.state.players.get('sess_p2');
      assert.equal(p2?.isHost, true);
    });

    await st.test('Remaining players leave -> room disposes and invalidates code', async () => {
      await room.onLeave(clientP2, 1000);
      await room.onLeave(clientP3, 1000);

      room.onDispose();

      assert.equal(room.state.status, 'CLOSED');
      assert.equal(registry.getRoomByCode(roomCode), undefined);
    });
  });
});
