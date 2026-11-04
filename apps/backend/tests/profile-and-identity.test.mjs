import test from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { EventEmitter } from 'node:events';
import { App } from '../dist/app.js';
import { FirebaseAuthService } from '../dist/auth/firebaseAuth.service.js';
import { ProfileService } from '../dist/modules/profile/profile.service.js';

// In-memory HTTP simulator (immune to TCP socket sandbox restrictions)
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

test('CarromVerse Phase 2.2 – Online Player Identity & Profile Management Tests', async (t) => {
  const authService = FirebaseAuthService.getInstance();
  const profileService = ProfileService.getInstance();
  const app = new App();

  // Valid test token for user_test_123
  const validToken = authService.createTestToken('user_test_123', {
    displayName: 'Hariprasath',
    email: 'hari@carromverse.io',
    expiresInSeconds: 3600,
  });

  // Expired token
  const expiredToken = authService.createTestToken('user_test_123', {
    expiresInSeconds: -30,
  });

  // 1. Authentication & Token Verification Tests
  await t.test('1. Authentication Middleware & Security Verification', async (st) => {
    await st.test('rejects request with missing Authorization header (401)', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/profile/me');
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'UNAUTHORIZED');
    });

    await st.test('rejects request with malformed Authorization token (401)', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/profile/me', null, {
        authorization: 'Bearer invalid.jwt.token',
      });
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.success, false);
    });

    await st.test('rejects request with expired Firebase ID token (401)', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/profile/me', null, {
        authorization: `Bearer ${expiredToken}`,
      });
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.success, false);
      assert.match(res.body.error.message, /TOKEN_EXPIRED/);
    });

    await st.test('allows request with valid Firebase ID token (200)', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/profile/me', null, {
        authorization: `Bearer ${validToken}`,
      });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.userId, 'user_test_123');
      assert.equal(res.body.data.username, 'Hariprasath');
    });
  });

  // 2. Profile Retrieval & Auto-Initialization Tests
  await t.test('2. Profile Retrieval & Auto-Creation', async (st) => {
    await st.test('auto-creates profile for first-time login user', async () => {
      const newUserId = `user_new_${Date.now()}`;
      const newToken = authService.createTestToken(newUserId, {
        displayName: 'New Gamer',
        email: 'newgamer@carromverse.io',
      });

      const res = await invokeApp(app, 'GET', '/api/v1/profile/me', null, {
        authorization: `Bearer ${newToken}`,
      });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.userId, newUserId);
      assert.equal(res.body.data.displayName, 'New Gamer');
      assert.equal(res.body.data.playerLevel, 1);
      assert.equal(res.body.data.accountStatus, 'active');
      assert.ok(res.body.data.username.startsWith('NewGamer') || res.body.data.username.startsWith('Player'));
    });

    await st.test('retrieves seeded profile with stats', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/profile/me', null, {
        authorization: `Bearer ${validToken}`,
      });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.totalMatches, 48);
      assert.equal(res.body.data.totalWins, 34);
      assert.equal(res.body.data.totalCoinsPocketed, 286);
      assert.equal(res.body.data.accountStatus, 'active');
    });
  });

  // 3. Username Management & Validation Tests
  await t.test('3. Username Management, Availability & Validation', async (st) => {
    await st.test('identifies available valid username', async () => {
      const uniqueName = `Striker_${Date.now().toString().slice(-4)}`;
      const res = await invokeApp(app, 'GET', `/api/v1/usernames/${uniqueName}/availability`);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.available, true);
      assert.equal(res.body.data.username, uniqueName);
    });

    await st.test('rejects already taken username', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/usernames/Hariprasath/availability');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.available, false);
      assert.match(res.body.data.reason, /already taken/);
    });

    await st.test('rejects reserved username: admin', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/usernames/admin/availability');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.available, false);
      assert.match(res.body.data.reason, /reserved/);
    });

    await st.test('rejects reserved username: carromverse', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/usernames/CarromVerse/availability');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.available, false);
      assert.match(res.body.data.reason, /reserved/);
    });

    await st.test('rejects invalid character username (symbols)', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/usernames/player@carrom/availability');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.available, false);
      assert.match(res.body.data.reason, /letters, numbers, and underscores/);
    });

    await st.test('rejects too short username (< 3 chars)', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/usernames/hi/availability');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.available, false);
      assert.match(res.body.data.reason, /at least 3 characters/);
    });

    await st.test('rejects too long username (> 20 chars)', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/usernames/super_long_username_exceeding_20_chars/availability');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.available, false);
      assert.match(res.body.data.reason, /cannot exceed 20 characters/);
    });
  });

  // 4. Profile Updates & Duplicate Username Conflict Tests
  await t.test('4. Profile Updates (PATCH /profile/me)', async (st) => {
    await st.test('updates display name successfully', async () => {
      const res = await invokeApp(app, 'PATCH', '/api/v1/profile/me', { displayName: 'Hari The Pro' }, {
        authorization: `Bearer ${validToken}`,
        'content-type': 'application/json',
      });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.displayName, 'Hari The Pro');
    });

    await st.test('rejects display name exceeding 30 characters (400)', async () => {
      const res = await invokeApp(app, 'PATCH', '/api/v1/profile/me', { displayName: 'A'.repeat(35) }, {
        authorization: `Bearer ${validToken}`,
        'content-type': 'application/json',
      });
      assert.equal(res.statusCode, 400);
    });

    await st.test('rejects duplicate username conflict with 409 Conflict', async () => {
      // Attempt to take RameshMendis's username
      const res = await invokeApp(app, 'PATCH', '/api/v1/profile/me', { username: 'RameshMendis' }, {
        authorization: `Bearer ${validToken}`,
        'content-type': 'application/json',
      });
      assert.equal(res.statusCode, 409);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'CONFLICT');
      assert.match(res.body.error.message, /already taken/);
    });
  });

  // 5. Avatar Management Tests
  await t.test('5. Avatar Management (Upload, Validation & Removal)', async (st) => {
    await st.test('updates avatar to preset string / URL', async () => {
      const res = await invokeApp(app, 'POST', '/api/v1/profile/avatar', { avatarUrl: '🦁' }, {
        authorization: `Bearer ${validToken}`,
        'content-type': 'application/json',
      });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.avatarUrl, '🦁');

      // Verify on profile
      const profRes = await invokeApp(app, 'GET', '/api/v1/profile/me', null, {
        authorization: `Bearer ${validToken}`,
      });
      assert.equal(profRes.body.data.avatarUrl, '🦁');
    });

    await st.test('uploads valid base64 custom avatar', async () => {
      const smallPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      const res = await invokeApp(app, 'POST', '/api/v1/profile/avatar', {
        imageBase64: smallPngBase64,
        mimeType: 'image/png',
      }, {
        authorization: `Bearer ${validToken}`,
        'content-type': 'application/json',
      });
      assert.equal(res.statusCode, 200);
      assert.ok(res.body.data.avatarUrl.startsWith('data:image/png;base64,'));
    });

    await st.test('rejects unsupported image mime type (400)', async () => {
      const res = await invokeApp(app, 'POST', '/api/v1/profile/avatar', {
        imageBase64: 'fakecontent',
        mimeType: 'application/pdf',
      }, {
        authorization: `Bearer ${validToken}`,
        'content-type': 'application/json',
      });
      assert.equal(res.statusCode, 400);
      assert.match(res.body.error.message, /JPEG, PNG, or WEBP/);
    });

    await st.test('rejects avatar upload exceeding 2MB size limit (400)', async () => {
      // 2.5 MB of dummy base64
      const largeBase64 = 'A'.repeat(Math.ceil((2.5 * 1024 * 1024 * 4) / 3));
      const res = await invokeApp(app, 'POST', '/api/v1/profile/avatar', {
        imageBase64: largeBase64,
        mimeType: 'image/jpeg',
      }, {
        authorization: `Bearer ${validToken}`,
        'content-type': 'application/json',
      });
      assert.equal(res.statusCode, 400);
      assert.match(res.body.error.message, /exceeds the 2MB limit/);
    });

    await st.test('removes avatar via DELETE /profile/avatar', async () => {
      const res = await invokeApp(app, 'DELETE', '/api/v1/profile/avatar', null, {
        authorization: `Bearer ${validToken}`,
      });
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.data.avatarUrl, null);

      // Verify on profile
      const profRes = await invokeApp(app, 'GET', '/api/v1/profile/me', null, {
        authorization: `Bearer ${validToken}`,
      });
      assert.equal(profRes.body.data.avatarUrl, null);
    });
  });

  // 6. Public Player Profile Retrieval
  await t.test('6. Public Player Profile Retrieval (GET /players/:userId)', async (st) => {
    await st.test('retrieves public profile without exposing private auth data', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/players/user_test_123');
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.userId, 'user_test_123');
      assert.equal(res.body.data.username, 'Hariprasath');
      assert.equal(res.body.data.totalWins, 34);

      // Verify private fields are NOT present
      assert.equal(res.body.data.email, undefined);
      assert.equal(res.body.data.accountStatus, undefined);
    });

    await st.test('returns 404 for non-existent player ID', async () => {
      const res = await invokeApp(app, 'GET', '/api/v1/players/user_non_existent_999');
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.equal(res.body.error.code, 'NOT_FOUND');
    });
  });

  // 7. Match Progression & Level Scaling
  await t.test('7. Match Statistics & Player Level Progression', async (st) => {
    const updated = await profileService.recordMatch('user_test_123', {
      won: true,
      coinsPocketed: 5,
      fouls: 1,
    });

    assert.equal(updated.totalMatches, 49);
    assert.equal(updated.totalWins, 35);
    assert.equal(updated.totalCoinsPocketed, 291);
    assert.equal(updated.totalFouls, 7);
    assert.ok(updated.playerLevel >= 7);
  });
});
