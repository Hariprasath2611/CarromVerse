import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateEmail,
  validatePassword,
  validateUsername,
  distance,
  clamp,
  degToRad,
  radToDeg,
  generateUUID,
  generateMatchId,
  generateSessionId,
  formatDuration,
} from '../dist/index.js';

describe('CarromVerse Shared Utils Tests', () => {
  it('validateEmail correctly validates email formats', () => {
    assert.strictEqual(validateEmail('player@carromverse.com').isValid, true);
    assert.strictEqual(validateEmail('invalid-email').isValid, false);
    assert.strictEqual(validateEmail('').isValid, false);
  });

  it('validatePassword ensures minimum 6 characters', () => {
    assert.strictEqual(validatePassword('123456').isValid, true);
    assert.strictEqual(validatePassword('12345').isValid, false);
    assert.strictEqual(validatePassword('').isValid, false);
  });

  it('validateUsername enforces length and alphanumeric characters', () => {
    assert.strictEqual(validateUsername('StrikerPro_1').isValid, true);
    assert.strictEqual(validateUsername('ab').isValid, false); // < 3 chars
    assert.strictEqual(validateUsername('bad name with spaces!').isValid, false);
  });

  it('Math utilities calculate accurately', () => {
    assert.strictEqual(distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
    assert.strictEqual(clamp(15, 0, 10), 10);
    assert.strictEqual(clamp(-5, 0, 10), 0);
    assert.strictEqual(clamp(7, 0, 10), 7);
    assert.strictEqual(Math.round(radToDeg(Math.PI)), 180);
    assert.strictEqual(degToRad(180), Math.PI);
  });

  it('ID generators produce valid non-empty tokens', () => {
    const uuid = generateUUID();
    assert.strictEqual(typeof uuid, 'string');
    assert.strictEqual(uuid.length > 20, true);

    const matchId = generateMatchId();
    assert.strictEqual(matchId.startsWith('match_'), true);

    const sessionId = generateSessionId();
    assert.strictEqual(sessionId.startsWith('session_'), true);
  });

  it('formatDuration formats mm:ss accurately', () => {
    assert.strictEqual(formatDuration(0), '00:00');
    assert.strictEqual(formatDuration(65), '01:05');
    assert.strictEqual(formatDuration(360), '06:00');
  });
});

