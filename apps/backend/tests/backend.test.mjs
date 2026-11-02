import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createApp } from '../dist/app.js';

test('Backend Server Integration Tests', async (t) => {
  const app = createApp();
  const server = createServer(app.handleRequest);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  t.after(() => {
    server.close();
  });

  await t.test('GET /health returns 200 and ok status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'ok');
    assert.equal(body.data.service, 'carromverse-backend');
  });

  await t.test('POST /api/v1/auth/login validates email and logs in', async () => {
    const badRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'invalid-email' }),
    });
    assert.equal(badRes.status, 400);

    const goodRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'champion@carromverse.io' }),
    });
    assert.equal(goodRes.status, 200);
    const body = await goodRes.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    assert.equal(body.data.user.email, 'champion@carromverse.io');
  });

  await t.test('GET /api/v1/leaderboards returns ranked players', async () => {
    const res = await fetch(`${baseUrl}/api/v1/leaderboards`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data.entries));
    assert.ok(body.data.entries.length > 0);
  });

  await t.test('POST and GET /api/v1/multiplayer/rooms manages rooms', async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/multiplayer/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'two_player_individual',
        hostId: 'host_123',
        hostName: 'Grandmaster',
      }),
    });
    assert.equal(createRes.status, 201);
    const createBody = await createRes.json();
    assert.equal(createBody.success, true);
    assert.equal(createBody.data.maxPlayers, 2);

    const listRes = await fetch(`${baseUrl}/api/v1/multiplayer/rooms`);
    assert.equal(listRes.status, 200);
    const listBody = await listRes.json();
    assert.equal(listBody.success, true);
    assert.ok(listBody.data.length >= 1);
  });
});
