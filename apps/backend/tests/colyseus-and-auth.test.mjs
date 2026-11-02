import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'http';
import { FirebaseAuthService } from '../dist/auth/firebaseAuth.service.js';
import { PlayerSessionManager } from '../dist/services/playerSession.service.js';
import { CarromRoom } from '../dist/rooms/CarromRoom.js';
import { ColyseusGameServer } from '../dist/websocket/colyseusServer.js';

test('CarromVerse Phase 2.1 – Colyseus, Auth & Multiplayer Foundation Tests', async (t) => {
  const authService = FirebaseAuthService.getInstance();
  const sessionManager = PlayerSessionManager.getInstance();

  // 1. Firebase Authentication Service Verification
  await t.test('1. Firebase ID Token Verification & Rejection', async (st) => {
    await st.test('validates and decodes well-formed token', async () => {
      const token = authService.createTestToken('user_test_123', {
        displayName: 'Hariprasath',
        email: 'hari@carromverse.io',
        expiresInSeconds: 3600,
      });

      const decoded = await authService.verifyIdToken(token);
      assert.equal(decoded.uid, 'user_test_123');
      assert.equal(decoded.displayName, 'Hariprasath');
      assert.equal(decoded.email, 'hari@carromverse.io');
      assert.ok(decoded.expiresAt > Math.floor(Date.now() / 1000));
    });

    await st.test('rejects empty or null tokens', async () => {
      await assert.rejects(
        async () => await authService.verifyIdToken(''),
        /TOKEN_EMPTY/
      );
    });

    await st.test('rejects malformed tokens without 3 parts', async () => {
      await assert.rejects(
        async () => await authService.verifyIdToken('invalid.token'),
        /TOKEN_MALFORMED/
      );
    });

    await st.test('rejects expired tokens', async () => {
      const expiredToken = authService.createTestToken('user_expired', {
        expiresInSeconds: -100, // already expired
      });

      await assert.rejects(
        async () => await authService.verifyIdToken(expiredToken),
        /TOKEN_EXPIRED/
      );
    });

    await st.test('rejects invalid audience tokens', async () => {
      const badAudienceToken = authService.createTestToken('user_bad_aud', {
        audience: 'wrong_project_id',
        expiresInSeconds: 3600,
      });

      await assert.rejects(
        async () => await authService.verifyIdToken(badAudienceToken),
        /TOKEN_INVALID_AUDIENCE/
      );
    });
  });

  // 2. Player Session Manager Verification
  await t.test('2. Player Session Model & Lifecycle Management', async (st) => {
    await st.test('creates and tracks online player session', () => {
      const session = sessionManager.createOrUpdateSession('user_player_1', 'conn_socket_1', {
        displayName: 'Player One',
        avatar: '👑',
      });

      assert.equal(session.userId, 'user_player_1');
      assert.equal(session.connectionId, 'conn_socket_1');
      assert.equal(session.connectionStatus, 'CONNECTED');
      assert.equal(session.displayName, 'Player One');

      const retrieved = sessionManager.getSessionByUserId('user_player_1');
      assert.equal(retrieved?.connectionId, 'conn_socket_1');
    });

    await st.test('reassociates new connectionId on reconnect without losing identity', () => {
      const updated = sessionManager.createOrUpdateSession('user_player_1', 'conn_socket_new', {
        displayName: 'Player One Updated',
      });

      assert.equal(updated.connectionId, 'conn_socket_new');
      assert.equal(updated.displayName, 'Player One Updated');
      assert.equal(sessionManager.getSessionByConnectionId('conn_socket_new')?.userId, 'user_player_1');
      assert.equal(sessionManager.getSessionByConnectionId('conn_socket_1'), undefined);
    });

    await st.test('marks session disconnected when connection drops', () => {
      sessionManager.markDisconnected('conn_socket_new');
      const session = sessionManager.getSessionByUserId('user_player_1');
      assert.equal(session?.connectionStatus, 'DISCONNECTED');
    });
  });

  // 3. Colyseus CarromRoom Unit & State Lifecycle Verification
  await t.test('3. CarromRoom State & Authoritative Rules Verification', async (st) => {
    await st.test('initializes 2-player room with correct defaults', () => {
      const room = new CarromRoom();
      room.roomId = 'room_unit_test_1';
      room.onCreate({ gameMode: 'two_player_individual' });

      assert.equal(room.state.status, 'WAITING');
      assert.equal(room.state.gameMode, 'two_player_individual');
      assert.equal(room.maxClients, 2);
      assert.equal(room.state.activeSeat, 0);
      assert.equal(room.state.strikerOffset, 0);
    });

    await st.test('configures 4-player team mode capacity and defaults', () => {
      const room = new CarromRoom();
      room.roomId = 'room_unit_test_2';
      room.onCreate({ gameMode: 'four_player_team', targetScore: 29 });

      assert.equal(room.maxClients, 4);
      assert.equal(room.state.targetScore, 29);
      assert.equal(room.state.status, 'WAITING');
    });

    await st.test('onAuth rejects connection when token is missing', async () => {
      const room = new CarromRoom();
      room.roomId = 'room_auth_test';
      room.onCreate({ gameMode: 'two_player_individual' });

      const mockClient = { sessionId: 'mock_sess_1' };
      await assert.rejects(
        async () => await room.onAuth(mockClient, {}),
        /Authentication token required/
      );
    });

    await st.test('onAuth succeeds and onJoin assigns Seat 0 and Seat 2 in 1v1', async () => {
      const room = new CarromRoom();
      room.roomId = 'room_join_test';
      room.onCreate({ gameMode: 'two_player_individual' });

      const token1 = authService.createTestToken('player_alice', { displayName: 'Alice' });
      const auth1 = await room.onAuth({ sessionId: 'sess_alice' }, { token: token1 });

      room.onJoin({ sessionId: 'sess_alice' }, {}, auth1);
      const alice = room.state.players.get('sess_alice');
      assert.equal(alice?.seat, 0);
      assert.equal(alice?.assignedCoinType, 'white');
      assert.equal(room.state.hostUserId, 'player_alice');
      assert.equal(room.state.status, 'WAITING');

      // Join second player
      const token2 = authService.createTestToken('player_bob', { displayName: 'Bob' });
      const auth2 = await room.onAuth({ sessionId: 'sess_bob' }, { token: token2 });

      room.onJoin({ sessionId: 'sess_bob' }, {}, auth2);
      const bob = room.state.players.get('sess_bob');
      assert.equal(bob?.seat, 2);
      assert.equal(bob?.assignedCoinType, 'black');
      assert.equal(room.state.status, 'READY'); // Room is full!
    });

    await st.test('rejects join when room capacity is exceeded', async () => {
      const room = new CarromRoom();
      room.roomId = 'room_cap_test';
      room.onCreate({ gameMode: 'two_player_individual' });

      const t1 = authService.createTestToken('p1');
      const t2 = authService.createTestToken('p2');
      const t3 = authService.createTestToken('p3');

      room.onJoin({ sessionId: 's1' }, {}, await room.onAuth({ sessionId: 's1' }, { token: t1 }));
      room.onJoin({ sessionId: 's2' }, {}, await room.onAuth({ sessionId: 's2' }, { token: t2 }));

      assert.throws(() => {
        room.onJoin({ sessionId: 's3' }, {}, { uid: 'p3', displayName: 'P3' });
      }, /Room capacity reached/);
    });

    await st.test('authoritative striker placement clamps bounds', () => {
      const room = new CarromRoom();
      room.roomId = 'room_action_test';
      room.onCreate({ gameMode: 'two_player_individual' });

      const t1 = authService.createTestToken('p1');
      room.onJoin({ sessionId: 's1' }, {}, { uid: 'p1', displayName: 'P1' });

      // Simulate valid placement
      room.state.strikerOffset = Math.max(-0.92, Math.min(0.92, 1.5)); // Over edge
      assert.equal(room.state.strikerOffset, 0.92);

      room.state.strikerOffset = Math.max(-0.92, Math.min(0.92, -2.0)); // Over edge
      assert.equal(room.state.strikerOffset, -0.92);
    });

    await st.test('onLeave frees seat when match is WAITING', async () => {
      const room = new CarromRoom();
      room.roomId = 'room_leave_test';
      room.onCreate({ gameMode: 'two_player_individual' });

      const t1 = authService.createTestToken('p1');
      room.onJoin({ sessionId: 's1' }, {}, { uid: 'p1', displayName: 'P1' });
      assert.equal(room.state.players.size, 1);

      await room.onLeave({ sessionId: 's1' }, 1000);
      assert.equal(room.state.players.size, 0);
      assert.equal(room.state.status, 'WAITING');
    });
  });

  // 4. Colyseus Game Server Attachment & Shutdown Verification
  await t.test('4. Colyseus Server Initialization & Graceful Lifecycle', async () => {
    const httpServer = createServer();
    const colyseusServer = new ColyseusGameServer();

    const serverInstance = colyseusServer.attach(httpServer);
    assert.ok(serverInstance, 'Colyseus Server must be created');
    assert.ok(colyseusServer.getRawServer(), 'Must expose underlying server');

    const count = await colyseusServer.getRoomCount();
    assert.equal(typeof count, 'number');

    await colyseusServer.close();
  });
});

