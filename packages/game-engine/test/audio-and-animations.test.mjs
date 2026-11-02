import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCarromPhaserHtml } from '../dist/bridge/phaserHtmlGenerator.js';

test('CarromVerse Phase 1.7 – Audio, Visual Effects & Performance Verification', async (t) => {
  await t.test('1. In-engine Web Audio Procedural Synthesis Verification', () => {
    const html = generateCarromPhaserHtml({
      themeId: 'classic',
      strikerSkin: 'brass',
      activeSeat: 0,
      canvasSize: 800,
    });

    assert.ok(html.includes('playWoodClick'), 'Phaser template must include playWoodClick synthesizer');
    assert.ok(html.includes('playCushionThud'), 'Phaser template must include playCushionThud synthesizer');
    assert.ok(html.includes('playPocketSound'), 'Phaser template must include playPocketSound synthesizer');
    assert.ok(html.includes('playShootSound'), 'Phaser template must include playShootSound synthesizer');
    assert.ok(html.includes('AudioContext'), 'Synthesizer must leverage Web Audio API AudioContext');
  });

  await t.test('2. Visual Effects & Animation Systems Verification', () => {
    const html = generateCarromPhaserHtml({
      themeId: 'forest',
      strikerSkin: 'emerald',
      activeSeat: 0,
      canvasSize: 800,
    });

    assert.ok(html.includes('createShotBlastRing'), 'Must render striker release shockwave blast ring');
    assert.ok(html.includes('createCollisionSpark'), 'Must render kinetic collision spark particles');
    assert.ok(html.includes('createQueenStarburst'), 'Must render golden starburst for Queen pocketing');
    assert.ok(html.includes('createFoulRipple'), 'Must render crimson foul warning ripple');
    assert.ok(html.includes('processQueuedPocketRemovals'), 'Must perform pocket sink and scale-down animation');
  });

  await t.test('3. Bridge Throttling & Message Listener Verification', () => {
    const html = generateCarromPhaserHtml({
      themeId: 'royal',
      strikerSkin: 'ruby',
      activeSeat: 1,
      canvasSize: 800,
    });

    assert.ok(html.includes('SET_AUDIO_CONFIG'), 'Must register SET_AUDIO_CONFIG bridge handler');
    assert.ok(html.includes('PAUSE_GAME'), 'Must register PAUSE_GAME bridge handler');
    assert.ok(html.includes('RESUME_GAME'), 'Must register RESUME_GAME bridge handler');
    // Ensure collision throttling is present to prevent frame rate drops on break shots
    assert.ok(html.includes('lastBridgeCollisionTime'), 'Must implement rate limiting on collision bridge messages');
  });

  await t.test('4. Aspect Ratio & Canvas Geometry Verification', () => {
    const html = generateCarromPhaserHtml({
      themeId: 'forest',
      strikerSkin: 'emerald',
      activeSeat: 0,
      canvasSize: 800,
    });

    assert.ok(html.includes('width: 800') || html.includes('CANVAS_SIZE = 800'), 'Must enforce strict 1:1 square canvas');
    assert.ok(html.includes('Phaser.Scale.FIT'), 'Must use Phaser Scale.FIT mode to prevent screen distortion');
  });
});
