import { BoardThemeId, StrikerSkin } from '../types/GameTypes.js';
import { PHASER_MIN_JS } from './phaserBundle.js';

export interface PhaserHtmlOptions {
  themeId?: BoardThemeId | string;
  strikerSkin?: StrikerSkin | string;
  activeSeat?: number;
  canvasSize?: number;
  debugOverlay?: boolean;
}

export function generateCarromPhaserHtml(options: PhaserHtmlOptions = {}): string {
  const initialTheme = options.themeId || 'classic';
  const initialSkin = options.strikerSkin || 'royal';
  const initialSeat = options.activeSeat ?? 0;
  const canvasSize = options.canvasSize || 840;
  const initialDebug = options.debugOverlay ?? false;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>CarromVerse Game Engine</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      touch-action: none;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: radial-gradient(circle, #3D100A 0%, #1A0503 100%);
      display: flex;
      justify-content: center;
      align-items: center;
    }
    #carrom-game-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    canvas {
      display: block;
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.95);
      border-radius: 8px;
    }
  </style>
  <script>
    window.onerror = function(msg, url, line, col, err) {
      var payload = {
        message: msg ? String(msg) : 'Unknown script error',
        url: url,
        line: line,
        col: col,
        error: err ? String(err) : ''
      };
      try {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ENGINE_ERROR', payload: payload }));
        } else if (window.parent && window.parent.postMessage) {
          window.parent.postMessage(JSON.stringify({ type: 'ENGINE_ERROR', payload: payload }), '*');
        }
      } catch (e) {}
    };
  </script>
  <script>
${PHASER_MIN_JS}
  </script>
</head>
<body>
  <div id="carrom-game-container"></div>

  <script>
    (function() {
      // 1. PHYSICAL CONSTANTS (Calibrated to B = 382 reference layout)
      var B = 382;
      var BOARD_PX = ${canvasSize};
      var SCALE_B = BOARD_PX / B;
      var PX_PER_CM = 0.017 * BOARD_PX; // 0.017 * boardFrameWidthPx

      var COIN_RADIUS_PX = 10 * SCALE_B; // 0.02618 B (diameter 20)
      var COIN_MASS = 5.0;

      var STRIKER_RADIUS_PX = 14.8 * SCALE_B; // 0.03874 B (diameter 29.6)
      var STRIKER_MASS = 15.0; // 3:1 mass ratio

      var POCKET_RADIUS_PX = 16.4 * SCALE_B; // 0.04293 B (~0.043 B)
      var POCKET_CAPTURE_RADIUS = POCKET_RADIUS_PX * 0.85; // 0.85 * visible radius
      var POCKET_SUCTION_RADIUS = POCKET_RADIUS_PX * 1.20;

      var WALL_THICKNESS_PX = 5.0 * PX_PER_CM;

      var STRIKER_MIN_SPEED_CM_S = 35.0;
      var STRIKER_MAX_SPEED_CM_S = 260.0;
      var REST_SPEED_THRESHOLD_CM_S = 2.0;
      var ANGULAR_REST_THRESHOLD = 0.05;

      var FRICTION_DECEL_CM_S2 = 125.0;
      var VISCOUS_DAMPING = 0.25;
      var ANGULAR_DAMPING_PER_SEC = 8.0;

      var COIN_RESTITUTION = 0.82;
      var WALL_BOUNCE_DAMPING = 0.58;

      var BASE_DT_SEC = 1 / 60;
      var FIXED_DT_MS = 1000 / 60;
      var MAX_SUBSTEPS = 10;
      var SETTLED_COOLDOWN_MS = 300;

      // Collision Categories
      var CAT_WALL    = 0x0001;
      var CAT_COIN    = 0x0002;
      var CAT_STRIKER = 0x0004;
      var CAT_POCKET  = 0x0008;

      var MASK_WALL    = CAT_COIN | CAT_STRIKER;
      var MASK_COIN    = CAT_WALL | CAT_COIN | CAT_STRIKER | CAT_POCKET;
      var MASK_STRIKER = CAT_WALL | CAT_COIN | CAT_POCKET;
      var MASK_POCKET  = CAT_COIN | CAT_STRIKER;

      var DEBUG_OVERLAY = ${initialDebug};

      // THEMES
      var BOARD_THEMES = {
        classic: {
          id: 'classic',
          frameColor: '#8B5226',
          frameAccent: '#5A3012',
          frameInnerCushion: '#5A3012',
          surfaceBg: '#EBCB93',
          surfaceGrain: '#C8A97A',
          markingsColor: '#6B3A1A',
          cornerCapColor: '#2BD67B',
          endMarkerFillColor: '#2BD67B',
          endMarkerRingColor: '#FFD84A',
          pocketRimColor: '#FFD84A',
          arrowColor: '#FF7A00'
        },
        mahogany: {
          id: 'mahogany',
          frameColor: '#38160E',
          frameAccent: '#C9943B',
          frameInnerCushion: '#220D07',
          surfaceBg: '#E5CBA7',
          surfaceGrain: '#CEAF85',
          markingsColor: '#5C2807',
          pocketRimColor: '#A87C28',
          cornerBracketColor: '#E87A1E',
          cornerBracketHighlight: '#FFB04D',
          baselineDiscColor: '#D97706',
          baselineDiscOutline: '#4A1E06',
          arrowColor: '#FF9800'
        },
        emerald: {
          id: 'emerald',
          frameColor: '#071810',
          frameAccent: '#2BD67B',
          frameInnerCushion: '#064E3B',
          surfaceBg: '#0F261B',
          surfaceGrain: '#163828',
          markingsColor: '#4ADE80',
          pocketRimColor: '#16A34A',
          baselineCircleColor: '#D8344A',
          baselineDotColor: '#4ADE80',
          greenRingColor: '#2BD67B',
          redAccentColor: '#D8344A',
          arrowColor: '#22C55E'
        },
        forest: {
          id: 'forest',
          frameColor: '#071810',
          frameAccent: '#0D3322',
          frameInnerCushion: '#064E3B',
          surfaceBg: '#0F261B',
          markingsColor: '#4ADE80',
          pocketRimColor: '#16A34A',
          baselineCircleColor: '#16A34A',
          baselineDotColor: '#4ADE80',
          arrowColor: '#22C55E'
        },
        royal: {
          id: 'royal',
          frameColor: '#2A0D08',
          frameAccent: '#4A1D13',
          frameInnerCushion: '#33100B',
          surfaceBg: '#1E1B4B',
          markingsColor: '#C7D2FE',
          pocketRimColor: '#D97706',
          baselineCircleColor: '#EF4444',
          baselineDotColor: '#F87171',
          arrowColor: '#818CF8'
        },
        marble: {
          id: 'marble',
          frameColor: '#1E293B',
          frameAccent: '#334155',
          frameInnerCushion: '#0F172A',
          surfaceBg: '#F1F5F9',
          markingsColor: '#475569',
          pocketRimColor: '#64748B',
          baselineCircleColor: '#DC2626',
          baselineDotColor: '#EF4444',
          arrowColor: '#334155'
        },
        gold: {
          id: 'gold',
          frameColor: '#181409',
          frameAccent: '#2F250B',
          frameInnerCushion: '#42330D',
          surfaceBg: '#1A1608',
          markingsColor: '#FBBF24',
          pocketRimColor: '#F59E0B',
          baselineCircleColor: '#DC2626',
          baselineDotColor: '#F59E0B',
          arrowColor: '#F59E0B'
        }
      };

      var currentThemeId = '${initialTheme}';
      var currentStrikerSkin = '${initialSkin}';
      var currentSeat = ${initialSeat};
      var currentOffsetRatio = 0;
      var activeScene = null;

      function getTheme(id) {
        var key = id ? id.toLowerCase() : 'classic';
        return BOARD_THEMES[key] || BOARD_THEMES['classic'];
      }

      // Convert speed in cm/s to step velocity (px/step)
      function speedCmSToStepVelocity(speedCmS, dtSec) {
        return speedCmS * PX_PER_CM * dtSec;
      }

      // Convert step velocity (px/step) to speed in cm/s
      function stepVelocityToSpeedCmS(stepVel, dtSec) {
        return dtSec > 0 ? (stepVel / dtSec) / PX_PER_CM : 0;
      }

      // IN-ENGINE ACOUSTIC SYNTHESIZER (WEB AUDIO API)
      var sfxAudioCtx = null;
      var sfxAudioEnabled = true;
      var sfxAudioVolume = 0.8;
      var lastClickSoundTime = 0;
      var lastThudSoundTime = 0;

      function getSfxAudio() {
        if (!sfxAudioCtx && typeof window !== 'undefined') {
          var Ctx = window.AudioContext || window.webkitAudioContext;
          if (Ctx) {
            try { sfxAudioCtx = new Ctx(); } catch(e){}
          }
        }
        if (sfxAudioCtx && sfxAudioCtx.state === 'suspended') {
          sfxAudioCtx.resume().catch(function(){});
        }
        return sfxAudioCtx;
      }

      function playWoodClick(speedCmS) {
        if (!sfxAudioEnabled || sfxAudioVolume <= 0) return;
        var nowMs = Date.now();
        if (nowMs - lastClickSoundTime < 22) return;
        lastClickSoundTime = nowMs;

        var ctx = getSfxAudio();
        if (!ctx) return;
        try {
          var now = ctx.currentTime;
          var normSpeed = Math.min(1.0, Math.max(0.15, speedCmS / 160));
          var vol = normSpeed * sfxAudioVolume * 0.9;

          // Layer 1: High crisp contact click ("clack" transient)
          var oscClick = ctx.createOscillator();
          var gainClick = ctx.createGain();
          var clickFreq = 2300 + Math.random() * 400; // 2300-2700 Hz
          oscClick.type = 'triangle';
          oscClick.frequency.setValueAtTime(clickFreq, now);
          oscClick.frequency.exponentialRampToValueAtTime(750, now + 0.012);

          gainClick.gain.setValueAtTime(vol * 0.75, now);
          gainClick.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

          oscClick.connect(gainClick);
          gainClick.connect(ctx.destination);
          oscClick.start(now);
          oscClick.stop(now + 0.015);

          // Layer 2: Deep organic wooden body resonance ("tok" wooden tone)
          var oscBody = ctx.createOscillator();
          var gainBody = ctx.createGain();
          var filterBody = ctx.createBiquadFilter();

          var bodyFreq = 560 + Math.random() * 120; // 560-680 Hz authentic wooden timbre
          oscBody.type = 'sine';
          oscBody.frequency.setValueAtTime(bodyFreq, now);
          oscBody.frequency.exponentialRampToValueAtTime(bodyFreq * 0.7, now + 0.038);

          filterBody.type = 'lowpass';
          filterBody.frequency.setValueAtTime(1500, now);

          gainBody.gain.setValueAtTime(vol * 0.85, now);
          gainBody.gain.exponentialRampToValueAtTime(0.001, now + 0.040);

          oscBody.connect(filterBody);
          filterBody.connect(gainBody);
          gainBody.connect(ctx.destination);

          oscBody.start(now);
          oscBody.stop(now + 0.042);
        } catch(e){}
      }

      function playCushionThud(speedCmS) {
        if (!sfxAudioEnabled || sfxAudioVolume <= 0) return;
        var nowMs = Date.now();
        if (nowMs - lastThudSoundTime < 45) return;
        lastThudSoundTime = nowMs;

        var ctx = getSfxAudio();
        if (!ctx) return;
        try {
          var now = ctx.currentTime;
          var normSpeed = Math.min(1.0, Math.max(0.15, speedCmS / 130));
          var vol = normSpeed * sfxAudioVolume * 0.6;

          var osc = ctx.createOscillator();
          var gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.06);
        } catch(e){}
      }

      function playPocketSound(isQueen, isStriker) {
        if (!sfxAudioEnabled || sfxAudioVolume <= 0) return;
        var ctx = getSfxAudio();
        if (!ctx) return;
        try {
          var now = ctx.currentTime;
          if (isQueen) {
            [523.25, 659.25, 783.99, 1046.5].forEach(function(f, i) {
              var osc = ctx.createOscillator();
              var gain = ctx.createGain();
              var t = now + i * 0.06;
              osc.type = 'sine';
              osc.frequency.setValueAtTime(f, t);
              gain.gain.setValueAtTime(sfxAudioVolume * 0.45, t);
              gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(t);
              osc.stop(t + 0.4);
            });
          } else if (isStriker) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(130, now);
            osc.frequency.setValueAtTime(95, now + 0.08);
            gain.gain.setValueAtTime(sfxAudioVolume * 0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.2);
          } else {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(320, now);
            osc.frequency.exponentialRampToValueAtTime(85, now + 0.08);
            gain.gain.setValueAtTime(sfxAudioVolume * 0.85, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.095);
          }
        } catch(e){}
      }

      function playShootSound(powerRatio) {
        if (!sfxAudioEnabled || sfxAudioVolume <= 0) return;
        var ctx = getSfxAudio();
        if (!ctx) return;
        try {
          var now = ctx.currentTime;
          var osc = ctx.createOscillator();
          var gain = ctx.createGain();
          var vol = (0.3 + powerRatio * 0.5) * sfxAudioVolume;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.exponentialRampToValueAtTime(480, now + 0.04);
          osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);

          gain.gain.setValueAtTime(vol, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.1);
        } catch(e){}
      }

      // VISUAL ANIMATION EFFECT HELPERS
      function createShotBlastRing(scene, x, y) {
        if (!scene || !scene.add) return;
        var ring = scene.add.circle(x, y, 18);
        ring.setStrokeStyle(3, 0x2BD67B, 0.9);
        ring.setDepth(20);
        scene.tweens.add({
          targets: ring,
          radius: 56,
          alpha: 0,
          duration: 250,
          ease: 'Quad.easeOut',
          onComplete: function() { ring.destroy(); }
        });
      }

      function createCollisionSpark(scene, x, y) {
        if (!scene || !scene.add) return;
        var spark = scene.add.circle(x, y, 5, 0xF5ECD2, 0.9);
        spark.setDepth(22);
        scene.tweens.add({
          targets: spark,
          scale: 2.2,
          alpha: 0,
          duration: 140,
          ease: 'Quad.easeOut',
          onComplete: function() { spark.destroy(); }
        });
      }

      function createQueenStarburst(scene, px, py) {
        if (!scene || !scene.add) return;
        for (var i = 0; i < 10; i++) {
          var angle = (Math.PI * 2 / 10) * i;
          var dist = 32 + Math.random() * 24;
          var star = scene.add.circle(px, py, 4, 0xE9B949, 1);
          star.setDepth(30);
          scene.tweens.add({
            targets: star,
            x: px + Math.cos(angle) * dist,
            y: py + Math.sin(angle) * dist,
            alpha: 0,
            scale: 0.2,
            duration: 480,
            ease: 'Quad.easeOut',
            onComplete: function() { star.destroy(); }
          });
        }
      }

      function createFoulRipple(scene, px, py) {
        if (!scene || !scene.add) return;
        var foulRing = scene.add.circle(px, py, 20);
        foulRing.setStrokeStyle(4, 0xEF4444, 0.95);
        foulRing.setDepth(30);
        scene.tweens.add({
          targets: foulRing,
          radius: 65,
          alpha: 0,
          duration: 340,
          ease: 'Quad.easeOut',
          onComplete: function() { foulRing.destroy(); }
        });
      }

      function createPocketSuctionEffect(scene, px, py, coinType) {
        if (!scene || !scene.add) return;
        var color = coinType === 'queen' ? 0xE9B949 : (coinType === 'white' ? 0xF5F0E6 : 0x2BD67B);
        var ring = scene.add.circle(px, py, POCKET_RADIUS_PX * 1.25);
        ring.setStrokeStyle(2.5, color, 0.85);
        ring.setDepth(28);
        scene.tweens.add({
          targets: ring,
          radius: 4,
          alpha: 0,
          duration: 320,
          ease: 'Cubic.easeIn',
          onComplete: function() { ring.destroy(); }
        });

        for (var i = 0; i < 4; i++) {
          var pAngle = (Math.PI / 2) * i;
          var pDist = POCKET_RADIUS_PX * 0.85;
          var p = scene.add.circle(px + Math.cos(pAngle) * pDist, py + Math.sin(pAngle) * pDist, 2.5, color, 0.9);
          p.setDepth(28);
          scene.tweens.add({
            targets: p,
            x: px,
            y: py,
            scale: 0.1,
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeIn',
            onComplete: function() { p.destroy(); }
          });
        }
      }

      // TEXTURE GENERATOR (DPR-RESPONSIVE, HIGH-FIDELITY VECTOR CANVASES)
      function generateTextures(scene, theme) {
        var dpr = typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(3, Math.max(1, Math.round(window.devicePixelRatio))) : 2;

        // 1. Coins Helper (Flat top-down discs per reference sheet)
        function drawCoinCanvas(ctx, size, dpr, type) {
          var cx = size / 2;
          var cy = size / 2;
          var r = (size / 2) - 2 * dpr;

          var isWhite = type === 'white';
          var isBlack = type === 'black';

          var faceCol = isWhite ? '#F5ECD2' : (isBlack ? '#1B2420' : '#E23B5A');
          var ringCol = isWhite ? '#D4C5A3' : (isBlack ? '#2E3A34' : '#FF7894');
          var emblemCol = isWhite ? '#B8A57E' : (isBlack ? '#3D4C44' : '#FFD84A');

          // 1. Face disc
          ctx.fillStyle = faceCol;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();

          // 2. Fine outer edge stroke
          ctx.strokeStyle = ringCol;
          ctx.lineWidth = 1.2 * dpr;
          ctx.stroke();

          // 3. Inner concentric ring
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
          ctx.lineWidth = 1.6 * dpr;
          ctx.stroke();

          // 4. Center emblem
          if (type === 'queen') {
            ctx.fillStyle = emblemCol;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.30, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1 * dpr;
            ctx.stroke();
          } else {
            ctx.fillStyle = emblemCol;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 0.20, 0, Math.PI * 2);
            ctx.fill();
          }

          // 5. Small specular highlight
          ctx.save();
          ctx.translate(cx - r * 0.35, cy - r * 0.35);
          ctx.rotate(-40 * Math.PI / 180);
          ctx.fillStyle = isWhite ? 'rgba(255, 255, 255, 0.45)' : (isBlack ? 'rgba(255, 255, 255, 0.20)' : 'rgba(255, 255, 255, 0.55)');
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(0, 0, r * 0.30, r * 0.12, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.restore();
        }

        var coinSize = Math.round(48 * dpr);

        createCanvasTexture(scene, 'tex_coin_white', coinSize, coinSize, function(ctx) {
          drawCoinCanvas(ctx, coinSize, dpr, 'white');
        });

        createCanvasTexture(scene, 'tex_coin_black', coinSize, coinSize, function(ctx) {
          drawCoinCanvas(ctx, coinSize, dpr, 'black');
        });

        createCanvasTexture(scene, 'tex_coin_queen', coinSize, coinSize, function(ctx) {
          drawCoinCanvas(ctx, coinSize, dpr, 'queen');
        });

        // Standalone Non-Rotating Coin Shadow (offset 0.7, 1.4)
        createCanvasTexture(scene, 'tex_coin_shadow', coinSize, coinSize, function(ctx) {
          var cx = coinSize / 2;
          var r = (coinSize / 2) - 2 * dpr;
          var grad = ctx.createRadialGradient(cx, cx, 1 * dpr, cx, cx, r);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0.40)');
          grad.addColorStop(0.70, 'rgba(0, 0, 0, 0.15)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cx, r, 0, Math.PI * 2);
          ctx.fill();
        });

        // 2. Striker Texture (Emerald rim, cream face, brass ring, emerald dashed ring, brass center)
        var strikerSize = Math.round(68 * dpr);

        function drawStrikerCanvas(ctx, size, dpr) {
          var cx = size / 2;
          var cy = size / 2;
          var r = (size / 2) - 2 * dpr;

          // 1. Emerald outer rim (#2BD67B)
          ctx.fillStyle = '#2BD67B';
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#1FA85E';
          ctx.lineWidth = 1.5 * dpr;
          ctx.stroke();

          // 2. Cream face (#FFF8E7)
          ctx.fillStyle = '#FFF8E7';
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
          ctx.fill();

          // 3. Brass ring (#FFD84A)
          ctx.strokeStyle = '#FFD84A';
          ctx.lineWidth = 2 * dpr;
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
          ctx.stroke();

          // 4. Emerald dashed ring (#2BD67B)
          ctx.fillStyle = '#2BD67B';
          for (var gi = 0; gi < 12; gi++) {
            var gAng = (gi * Math.PI * 2) / 12;
            var gnx = cx + Math.cos(gAng) * (r * 0.52);
            var gny = cy + Math.sin(gAng) * (r * 0.52);
            ctx.beginPath();
            ctx.arc(gnx, gny, 2.2 * dpr, 0, Math.PI * 2);
            ctx.fill();
          }

          // 5. Brass center (#FFD84A)
          ctx.fillStyle = '#FFD84A';
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.28, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#D4892A';
          ctx.lineWidth = 1.2 * dpr;
          ctx.stroke();

          // Center emerald jewel dot
          ctx.fillStyle = '#2BD67B';
          ctx.beginPath();
          ctx.arc(cx, cy, r * 0.10, 0, Math.PI * 2);
          ctx.fill();

          // 6. Specular curved dome glint
          ctx.save();
          ctx.translate(cx - r * 0.32, cy - r * 0.32);
          ctx.rotate(-35 * Math.PI / 180);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(0, 0, r * 0.30, r * 0.10, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.restore();
        }

        var strikerKeys = ['emerald', 'classic', 'royal', 'gold', 'default'];
        strikerKeys.forEach(function(sKey) {
          createCanvasTexture(scene, 'tex_striker_' + sKey, strikerSize, strikerSize, function(ctx) {
            drawStrikerCanvas(ctx, strikerSize, dpr);
          });
        });
        createCanvasTexture(scene, 'tex_striker', strikerSize, strikerSize, function(ctx) {
          drawStrikerCanvas(ctx, strikerSize, dpr);
        });

        // Standalone Non-Rotating Striker Shadow (offset 0.7, 1.4)
        createCanvasTexture(scene, 'tex_striker_shadow', strikerSize, strikerSize, function(ctx) {
          var cx = strikerSize / 2;
          var r = (strikerSize / 2) - 2 * dpr;
          var grad = ctx.createRadialGradient(cx, cx, 2 * dpr, cx, cx, r);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
          grad.addColorStop(0.70, 'rgba(0, 0, 0, 0.18)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cx, cx, r, 0, Math.PI * 2);
          ctx.fill();
        });

        // 3. Pocket Texture
        var pSize = Math.round(104 * dpr);
        createCanvasTexture(scene, 'tex_pocket', pSize, pSize, function(ctx) {
          var pcx = pSize / 2;
          var pr = (pSize / 2) - 4 * dpr;
          var grad = ctx.createRadialGradient(pcx, pcx, 4 * dpr, pcx, pcx, pr);
          grad.addColorStop(0, '#000000');
          grad.addColorStop(0.70, '#140D0A');
          grad.addColorStop(0.92, '#241711');
          grad.addColorStop(1, '#2A1B14');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pcx, pcx, pr, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#C9A24B';
          ctx.lineWidth = 4 * dpr;
          ctx.stroke();
        });
      }

      function createCanvasTexture(scene, key, width, height, drawFn) {
        if (scene.textures.exists(key)) {
          scene.textures.remove(key);
        }
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        if (ctx) {
          drawFn(ctx);
          var tex = scene.textures.addCanvas(key, canvas);
          if (tex) {
            tex.setFilter(Phaser.Textures.FilterMode.LINEAR);
          }
        }
      }

      // PHASER CARROM SCENE (WITH TUNNEL-FREE MATTER.JS SUBSTEPPING)
      var CarromScene = new Phaser.Class({
        Extends: Phaser.Scene,
        initialize: function CarromScene() {
          Phaser.Scene.call(this, { key: 'CarromScene' });
        },

        create: function() {
          activeScene = this;
          var size = this.cameras.main.width;
          this.canvasSize = size;
          var theme = getTheme(currentThemeId);

          // Matter World Setup: Zero Gravity, Manual Stepping Accumulator
          this.matter.world.setGravity(0, 0);
          this.matter.world.autoUpdate = false; // Manual step accumulator
          this.matter.world.setBounds(0, 0, 0, 0, 0, false, false, false, false);

          this.physicsAccumulator = 0;
          this.bouncedWalls = [];
          this.queuedPocketRemovals = [];
          this.pocketedInCurrentShot = [];
          this.isShotActive = false;
          this.isStrikerOverlapping = false;
          this.restStartTime = 0;
          this.hasReportedSettled = false;
          this.shotStartTime = 0;

          generateTextures(this, theme);

          this.boardGraphics = this.add.graphics();
          this.pocketsGroup = this.add.group();
          this.strikerAura = this.add.graphics().setDepth(14);
          this.aimGraphics = this.add.graphics().setDepth(25);
          this.debugGraphics = this.add.graphics().setDepth(100);

          this.coins = [];
          this.cushionBodies = [];
          this.pocketSensors = [];

          this.renderBoardGraphics(theme);
          this.createThickWalls();
          this.createPocketSensors();
          this.spawnCoinCluster();
          this.createStriker(theme);
          this.setupInputHandlers();
          this.setupCollisionHandlers();

          sendToReactNative({
            type: 'BOARD_RENDERED',
            payload: {
              theme: currentThemeId,
              coinCount: this.coins.length,
              boardSnapshot: this.getBoardSnapshot()
            },
            timestamp: Date.now()
          });

          sendToReactNative({
            type: 'ENGINE_READY',
            payload: { status: 'ready', boardSizePx: BOARD_PX, pxPerCm: PX_PER_CM },
            timestamp: Date.now()
          });
        },

        renderBoardGraphics: function(theme) {
          var s = this.canvasSize;
          var scale = s / 382;

          this.boardGraphics.clear();
          this.pocketsGroup.clear(true, true);

          // 1. Frame: 382 x 381, radius 12, wood gradient #8B5226 -> #5A3012
          this.boardGraphics.fillStyle(0x8B5226, 1);
          this.boardGraphics.fillRoundedRect(0, 0, s, s, 12 * scale);

          // Inner frame bevel for rich wooden depth
          this.boardGraphics.lineStyle(3 * scale, 0x5A3012, 0.95);
          this.boardGraphics.strokeRoundedRect(1 * scale, 1 * scale, s - 2 * scale, s - 2 * scale, 12 * scale);

          // 2. Playing Surface: 368 x 366 at (7 * scale, 7.5 * scale), #EBCB93
          var surfX = 7 * scale;
          var surfY = 7.5 * scale;
          var surfW = 368 * scale;
          var surfH = 366 * scale;

          this.boardGraphics.fillStyle(0xEBCB93, 1);
          this.boardGraphics.fillRect(surfX, surfY, surfW, surfH);

          // Surface fine border
          this.boardGraphics.lineStyle(1.5 * scale, 0x8B5226, 0.75);
          this.boardGraphics.strokeRect(surfX, surfY, surfW, surfH);

          // Vertical Wood Grain Lines at 30% opacity
          this.boardGraphics.lineStyle(1 * scale, 0xC8A97A, 0.30);
          var grainStep = 9 * scale;
          for (var gx = surfX + grainStep; gx < surfX + surfW; gx += grainStep) {
            this.boardGraphics.lineBetween(gx, surfY, gx, surfY + surfH);
          }

          // 3. Emerald Corner Caps (#2BD67B) at all 4 corners (L-shaped, 6-unit thick, 41-unit arms)
          var capCol = 0x2BD67B;
          var capThick = 6 * scale;
          var capArm = 41 * scale;

          this.boardGraphics.fillStyle(capCol, 1);
          // Top-Left L-cap
          this.boardGraphics.fillRect(0, 0, capArm, capThick);
          this.boardGraphics.fillRect(0, 0, capThick, capArm);

          // Top-Right L-cap
          this.boardGraphics.fillRect(s - capArm, 0, capArm, capThick);
          this.boardGraphics.fillRect(s - capThick, 0, capThick, capArm);

          // Bottom-Left L-cap
          this.boardGraphics.fillRect(0, s - capThick, capArm, capThick);
          this.boardGraphics.fillRect(0, s - capArm, capThick, capArm);

          // Bottom-Right L-cap
          this.boardGraphics.fillRect(s - capArm, s - capThick, capArm, capThick);
          this.boardGraphics.fillRect(s - capThick, s - capArm, capThick, capArm);

          // 4. Center Circle: (190.5 * scale, 189.7 * scale), r 63.5 * scale (0.166 B), 1.2 stroke
          var centerX = 190.5 * scale;
          var centerY = 189.7 * scale;
          var centerR = 63.5 * scale;

          this.boardGraphics.lineStyle(1.2 * scale, 0x6B3A1A, 0.85);
          this.boardGraphics.strokeCircle(centerX, centerY, centerR);

          // Inner center circle & pinpoint dot
          this.boardGraphics.lineStyle(1.0 * scale, 0x6B3A1A, 0.60);
          this.boardGraphics.strokeCircle(centerX, centerY, 19 * scale);
          this.boardGraphics.fillStyle(0xE23B5A, 0.95);
          this.boardGraphics.fillCircle(centerX, centerY, 4 * scale);

          // 5. Baselines: pill outlines, 1.6 stroke #6B3A1A, thickness 26.5 (0.069 B), length 228 (0.60 B)
          var markCol = 0x6B3A1A;
          this.boardGraphics.lineStyle(1.6 * scale, markCol, 0.90);

          // Top pill: x 77, y 50.2, w 228, h 26.5
          this.boardGraphics.strokeRoundedRect(77 * scale, 50.2 * scale, 228 * scale, 26.5 * scale, 13.25 * scale);
          // Bottom pill: x 77, y 303.9, w 228, h 26.5
          this.boardGraphics.strokeRoundedRect(77 * scale, 303.9 * scale, 228 * scale, 26.5 * scale, 13.25 * scale);
          // Left pill: x 51.5, y 76.5, w 25.5, h 227.4
          this.boardGraphics.strokeRoundedRect(51.5 * scale, 76.5 * scale, 25.5 * scale, 227.4 * scale, 12.75 * scale);
          // Right pill: x 304.5, y 76.5, w 25.5, h 227.4
          this.boardGraphics.strokeRoundedRect(304.5 * scale, 76.5 * scale, 25.5 * scale, 227.4 * scale, 12.75 * scale);

          // End Markers: emerald circles r 11.5 with brass ring at end positions
          var emR = 11.5 * scale;
          var endMarkerCoords = [
            { x: 90 * scale, y: 63.5 * scale },
            { x: 292 * scale, y: 63.5 * scale },
            { x: 90 * scale, y: 317.1 * scale },
            { x: 292 * scale, y: 317.1 * scale },
            { x: 64 * scale, y: 88.5 * scale },
            { x: 64 * scale, y: 291.5 * scale },
            { x: 317 * scale, y: 88.5 * scale },
            { x: 317 * scale, y: 291.5 * scale }
          ];

          endMarkerCoords.forEach(function(em) {
            activeScene.boardGraphics.fillStyle(0x2BD67B, 1);
            activeScene.boardGraphics.fillCircle(em.x, em.y, emR);
            activeScene.boardGraphics.lineStyle(1.5 * scale, 0xFFD84A, 0.95);
            activeScene.boardGraphics.strokeCircle(em.x, em.y, emR);
            // Center brass pinpoint
            activeScene.boardGraphics.fillStyle(0xFFD84A, 0.9);
            activeScene.boardGraphics.fillCircle(em.x, em.y, 2.5 * scale);
          });

          // 6. 4 Pockets: black circles, radius 16.4 (0.086 B diameter)
          var pr = 16.4 * scale;
          var pCoords = [
            { x: 24 * scale, y: 22.5 * scale },
            { x: 357.5 * scale, y: 22.5 * scale },
            { x: 24 * scale, y: 356.5 * scale },
            { x: 357.5 * scale, y: 356.5 * scale }
          ];

          pCoords.forEach(function(pPos) {
            var pSprite = activeScene.add.sprite(pPos.x, pPos.y, 'tex_pocket');
            pSprite.setDisplaySize(pr * 2, pr * 2);
            pSprite.setDepth(2);
            activeScene.pocketsGroup.add(pSprite);
          });
        },

        createThickWalls: function() {
          this.cushionBodies.forEach(function(b) { activeScene.matter.world.remove(b); });
          this.cushionBodies = [];

          var s = this.canvasSize;
          var scale = s / 382;
          var surfX = 7 * scale;
          var surfY = 7.5 * scale;
          var surfW = 368 * scale;
          var surfH = 366 * scale;
          var thick = 50 * scale;

          var wallDefs = [
            { x: s / 2, y: surfY - thick / 2, w: s + thick * 2, h: thick, label: 'cushion_top' },
            { x: s / 2, y: surfY + surfH + thick / 2, w: s + thick * 2, h: thick, label: 'cushion_bottom' },
            { x: surfX - thick / 2, y: s / 2, w: thick, h: s + thick * 2, label: 'cushion_left' },
            { x: surfX + surfW + thick / 2, y: s / 2, w: thick, h: s + thick * 2, label: 'cushion_right' }
          ];

          wallDefs.forEach(function(def) {
            var wall = activeScene.matter.add.rectangle(def.x, def.y, def.w, def.h, {
              isStatic: true,
              restitution: 0.0,
              friction: 0.0,
              frictionStatic: 0.0,
              label: def.label,
              collisionFilter: { category: CAT_WALL, mask: MASK_WALL }
            });
            activeScene.cushionBodies.push(wall);
          });
        },

        createPocketSensors: function() {
          this.pocketSensors.forEach(function(s) { activeScene.matter.world.remove(s); });
          this.pocketSensors = [];

          var s = this.canvasSize;
          var scale = s / 382;
          var pCoords = [
            { x: 24 * scale, y: 22.5 * scale, idx: 0 },
            { x: 357.5 * scale, y: 22.5 * scale, idx: 1 },
            { x: 24 * scale, y: 356.5 * scale, idx: 2 },
            { x: 357.5 * scale, y: 356.5 * scale, idx: 3 }
          ];

          pCoords.forEach(function(coord) {
            var sensor = activeScene.matter.add.circle(coord.x, coord.y, POCKET_SUCTION_RADIUS, {
              isStatic: true,
              isSensor: true,
              label: 'pocket_' + coord.idx,
              collisionFilter: { category: CAT_POCKET, mask: MASK_POCKET }
            });
            activeScene.pocketSensors.push(sensor);
          });
        },

        spawnCoinCluster: function() {
          this.coins.forEach(function(c) {
            if (c.body) activeScene.matter.world.remove(c.body);
            if (c.sprite) c.sprite.destroy();
            if (c.shadow) c.shadow.destroy();
          });
          this.coins = [];

          var s = this.canvasSize;
          var scale = s / 382;
          var cx = 190.5 * scale;
          var cy = 189.7 * scale;
          var rCoin = COIN_RADIUS_PX; // 10 * scale (0.02618 B)
          var shOffX = 0.7 * scale;
          var shOffY = 1.4 * scale;

          var addCoin = function(scene, id, type, x, y) {
            // Standalone non-rotating soft shadow
            var shadow = scene.add.sprite(x + shOffX, y + shOffY, 'tex_coin_shadow');
            shadow.setOrigin(0.5, 0.5);
            shadow.setDisplaySize(rCoin * 2.3, rCoin * 2.3);
            shadow.setDepth(8);

            var key = type === 'queen' ? 'tex_coin_queen' : (type === 'white' ? 'tex_coin_white' : 'tex_coin_black');
            var coinSprite = scene.add.sprite(x, y, key);
            coinSprite.setOrigin(0.5, 0.5);
            coinSprite.setDisplaySize(2 * rCoin, 2 * rCoin);
            coinSprite.setDepth(10);

            var body = scene.matter.add.circle(x, y, rCoin, {
              restitution: COIN_RESTITUTION,
              friction: 0.01,
              frictionAir: 0.0,
              frictionStatic: 0.0,
              inertia: Infinity,
              label: 'coin_' + id,
              collisionFilter: { category: CAT_COIN, mask: MASK_COIN }
            });

            scene.matter.body.setMass(body, COIN_MASS);

            body.coinRef = { id: id, type: type, sprite: coinSprite, shadow: shadow, body: body, isPocketed: false };
            scene.coins.push(body.coinRef);
          };

          // 1. Queen at center (0, 0)
          addCoin(this, 'queen', 'queen', cx, cy);

          // 2. 6 Whites on inner ring (~0.055 B, 60° apart) scaled by 1.045
          var sFit = 1.045 * scale;
          var whiteOffsets = [
            [-11.1, -16.5],
            [9.5, -18.1],
            [-20.1, 2.0],
            [20.5, -1.2],
            [-9.0, 18.4],
            [10.5, 17.3]
          ];
          for (var wIdx = 0; wIdx < whiteOffsets.length; wIdx++) {
            var wo = whiteOffsets[wIdx];
            addCoin(this, 'w_' + wIdx, 'white', cx + wo[0] * sFit, cy + wo[1] * sFit);
          }

          // 3. 6 Blacks on outer ring (~0.09 B) scaled by 1.045
          var blackOffsets = [
            [-1.5, -34.5],
            [-30.7, -14.9],
            [29.5, -19.1],
            [-29.1, 19.5],
            [31.7, 16.3],
            [2.6, 34.8]
          ];
          for (var bIdx = 0; bIdx < blackOffsets.length; bIdx++) {
            var bo = blackOffsets[bIdx];
            addCoin(this, 'b_' + bIdx, 'black', cx + bo[0] * sFit, cy + bo[1] * sFit);
          }
        },

        createStriker: function(theme) {
          if (this.strikerBody) {
            this.matter.world.remove(this.strikerBody);
          }
          if (this.strikerSprite) this.strikerSprite.destroy();
          if (this.strikerShadow) this.strikerShadow.destroy();

          var s = this.canvasSize;
          var scale = s / 382;
          var sr = STRIKER_RADIUS_PX; // 14.8 * scale (0.03874 B)
          this.strikerRadius = sr;

          var px = 191.0 * scale;
          var py = 317.1 * scale;
          var shOffX = 0.7 * scale;
          var shOffY = 1.4 * scale;

          this.strikerShadow = this.add.sprite(px + shOffX, py + shOffY, 'tex_striker_shadow');
          this.strikerShadow.setOrigin(0.5, 0.5);
          this.strikerShadow.setDisplaySize(sr * 2.3, sr * 2.3);
          this.strikerShadow.setDepth(12);

          this.strikerSprite = this.add.sprite(px, py, 'tex_striker');
          this.strikerSprite.setOrigin(0.5, 0.5);
          this.strikerSprite.setDisplaySize(2 * sr, 2 * sr);
          this.strikerSprite.setDepth(20);

          this.strikerBody = this.matter.add.circle(px, py, sr, {
            restitution: COIN_RESTITUTION,
            friction: 0.01,
            frictionAir: 0.0,
            frictionStatic: 0.0,
            inertia: Infinity,
            label: 'striker',
            collisionFilter: { category: CAT_STRIKER, mask: MASK_STRIKER }
          });

          this.matter.body.setMass(this.strikerBody, STRIKER_MASS);
          this.strikerBody.isStriker = true;
          this.strikerIsPocketed = false;

          this.updateStrikerPosition();
        },

        updateStrikerPosition: function() {
          if (!this.strikerBody || this.isShotActive) return;

          var s = this.canvasSize;
          var scale = s / 382;
          var sr = this.strikerRadius || STRIKER_RADIUS_PX;

          var centerX = 191.0 * scale;
          var travelHalf = 101.0 * scale; // Travel range: 90 to 292 (end-markers)

          var clampedOffset = Math.max(-1.0, Math.min(1.0, currentOffsetRatio));
          var px = centerX + clampedOffset * travelHalf;
          var py = 317.1 * scale;

          if (currentSeat === 0) {
            // Bottom baseline (My Turn)
            px = centerX + clampedOffset * travelHalf;
            py = 317.1 * scale;
          } else if (currentSeat === 2) {
            // Top baseline (Opponent Turn)
            px = centerX + clampedOffset * travelHalf;
            py = 63.5 * scale;
          } else if (currentSeat === 1) {
            // Right baseline
            px = 317.0 * scale;
            py = centerX + clampedOffset * travelHalf;
          } else if (currentSeat === 3) {
            // Left baseline
            px = 64.0 * scale;
            py = centerX + clampedOffset * travelHalf;
          }

          // Coin overlap check on baseline
          var overlapping = false;
          for (var i = 0; i < this.coins.length; i++) {
            var c = this.coins[i];
            if (c.isPocketed || !c.body) continue;
            var dist = Math.hypot(px - c.body.position.x, py - c.body.position.y);
            if (dist < sr + COIN_RADIUS_PX) {
              overlapping = true;
              break;
            }
          }

          this.isStrikerOverlapping = overlapping;
          if (overlapping) {
            this.strikerSprite.setTint(0xFF4444);
          } else {
            this.strikerSprite.clearTint();
          }

          this.matter.body.setPosition(this.strikerBody, { x: px, y: py });
          this.matter.body.setVelocity(this.strikerBody, { x: 0, y: 0 });
          this.matter.body.setAngularVelocity(this.strikerBody, 0);

          this.strikerSprite.setPosition(px, py);
          this.strikerShadow.setPosition(px + 0.7 * scale, py + 1.4 * scale);

          this.updateStrikerAura();
        },

        updateStrikerAura: function(forceState) {
          this.strikerAura.clear();
          if (this.isShotActive || this.strikerIsPocketed || !this.strikerBody) return;

          var state = forceState || this.currentTurnState || (currentSeat === 0 ? 'MY_TURN' : 'OPPONENT_TURN');
          var px = this.strikerBody.position.x;
          var py = this.strikerBody.position.y;
          var sr = this.strikerRadius || STRIKER_RADIUS_PX;
          var scale = this.canvasSize / 382;

          if (state === 'MY_TURN' || state === 'AIMING') {
            // Emerald glow
            this.strikerAura.lineStyle(2.4 * scale, 0x2BD67B, 0.90);
            this.strikerAura.strokeCircle(px, py, sr * 1.22);
            this.strikerAura.lineStyle(4.8 * scale, 0x2BD67B, 0.35);
            this.strikerAura.strokeCircle(px, py, sr * 1.45);
          } else if (state === 'OPPONENT_TURN') {
            // Gold glow (#FFD84A)
            this.strikerAura.lineStyle(2.4 * scale, 0xFFD84A, 0.90);
            this.strikerAura.strokeCircle(px, py, sr * 1.22);
            this.strikerAura.lineStyle(4.8 * scale, 0xFFD84A, 0.35);
            this.strikerAura.strokeCircle(px, py, sr * 1.45);
          }
        },

        setTurnState: function(state) {
          this.currentTurnState = state;
          if (state === 'SHOT_IN_PROGRESS') {
            this.isShotActive = true;
            this.strikerAura.clear();
          } else {
            this.isShotActive = false;
            this.updateStrikerAura(state);
          }
        },

        setupInputHandlers: function() {
          var scene = this;

          this.input.on('pointerdown', function(pointer) {
            if (scene.isShotActive) return;

            var px = scene.strikerBody.position.x;
            var py = scene.strikerBody.position.y;
            var dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, px, py);

            // Slingshot touch directly on striker
            if (dist <= scene.strikerRadius * 2.6) {
              if (scene.isStrikerOverlapping) return;
              scene.isAiming = true;
              scene.updateAim(pointer.x, pointer.y);
            }
          });

          this.input.on('pointermove', function(pointer) {
            if (!pointer.isDown || scene.isShotActive || !scene.isAiming) return;
            scene.updateAim(pointer.x, pointer.y);
          });

          this.input.on('pointerup', function() {
            if (scene.isAiming) {
              scene.isAiming = false;
              scene.aimGraphics.clear();

              sendToReactNative({
                type: 'AIM_CHANGED',
                payload: { angle: scene.aimAngle || 0, powerRatio: 0, isAiming: false },
                timestamp: Date.now()
              });

              if (!scene.isStrikerOverlapping && scene.aimPowerRatio >= 0.05) {
                scene.executeShot(scene.aimAngle, scene.aimPowerRatio);
              }
            }
          });
        },

        updateAim: function(curX, curY) {
          var px = this.strikerBody.position.x;
          var py = this.strikerBody.position.y;
          var scale = this.canvasSize / 382;

          // Slingshot pull vector: pulling backward from striker aims forward
          var pullDx = px - curX;
          var pullDy = py - curY;
          var pullDist = Math.hypot(pullDx, pullDy);

          // Aim zone radius = 0.20 B (76.6 units)
          var maxDragDist = 76.6 * scale;
          var deadzone = 8 * scale;

          var clampedDist = Math.min(pullDist, maxDragDist);
          var angle = Math.atan2(pullDy, pullDx);
          var powerRatio = clampedDist <= deadzone ? 0 : (clampedDist - deadzone) / (maxDragDist - deadzone);

          this.aimAngle = angle;
          this.aimPowerRatio = powerRatio;

          if (clampedDist <= deadzone) {
            this.aimGraphics.clear();
            sendToReactNative({
              type: 'AIM_CHANGED',
              payload: { angle: angle, powerRatio: 0, isAiming: true },
              timestamp: Date.now()
            });
            return;
          }

          this.renderAimGuide(angle, powerRatio, clampedDist);

          sendToReactNative({
            type: 'AIM_CHANGED',
            payload: {
              angle: angle,
              powerRatio: powerRatio,
              isAiming: true,
              speed_cm_s: STRIKER_MIN_SPEED_CM_S + powerRatio * (STRIKER_MAX_SPEED_CM_S - STRIKER_MIN_SPEED_CM_S)
            },
            timestamp: Date.now()
          });
        },

        renderAimGuide: function(angle, powerRatio, clampedDist) {
          this.aimGraphics.clear();

          var s = this.canvasSize;
          var scale = s / 382;
          var px = this.strikerBody.position.x;
          var py = this.strikerBody.position.y;
          var sr = this.strikerRadius || STRIKER_RADIUS_PX;

          var cosA = Math.cos(angle);
          var sinA = Math.sin(angle);

          var maxDragDist = 76.6 * scale; // 0.20 B

          // 1. Aim Zone: faint dotted circle centered on striker, r = 0.20 B (76.6), fill black 12%, stroke white 30%
          this.aimGraphics.fillStyle(0x000000, 0.12);
          this.aimGraphics.fillCircle(px, py, maxDragDist);

          var segCount = 28;
          var segAngle = (Math.PI * 2) / segCount;
          for (var si = 0; si < segCount; si += 2) {
            var aStart = si * segAngle;
            var aEnd = (si + 1) * segAngle;
            this.aimGraphics.lineStyle(1.2 * scale, 0xFFFFFF, 0.30);
            this.aimGraphics.beginPath();
            this.aimGraphics.arc(px, py, maxDragDist, aStart, aEnd);
            this.aimGraphics.strokePath();
          }

          // 2. Pull-back trail: grey-white dotted line behind striker, opposite shot direction, 60 units long, 45% opacity
          var trailLen = Math.min(60 * scale, clampedDist || maxDragDist);
          var trailSpacing = 6.5 * scale;
          for (var td = sr + 4 * scale; td <= trailLen + sr; td += trailSpacing) {
            var trX = px - cosA * td;
            var trY = py - sinA * td;
            this.aimGraphics.fillStyle(0xFFFFFF, 0.45);
            this.aimGraphics.fillCircle(trX, trY, 1.6 * scale);
          }

          // 3. Raycast: Find first obstacle (coin or cushion) along shot ray
          var nearestDist = 800 * scale;
          var hitType = 'none';
          var hitCoin = null;

          for (var i = 0; i < this.coins.length; i++) {
            var c = this.coins[i];
            if (c.isPocketed || !c.body) continue;
            var toX = c.body.position.x - px;
            var toY = c.body.position.y - py;
            var proj = toX * cosA + toY * sinA;
            if (proj <= 0) continue;
            var combR = sr + COIN_RADIUS_PX;
            var perpSq = (toX * toX + toY * toY) - proj * proj;
            if (perpSq <= combR * combR) {
              var halfChord = Math.sqrt(Math.max(0, combR * combR - perpSq));
              var hitD = proj - halfChord;
              if (hitD > 0 && hitD < nearestDist) {
                nearestDist = hitD;
                hitType = 'coin';
                hitCoin = c;
              }
            }
          }

          var surfX = 7 * scale;
          var surfY = 7.5 * scale;
          var surfW = 368 * scale;
          var surfH = 366 * scale;
          var bMinX = surfX + sr;
          var bMaxX = surfX + surfW - sr;
          var bMinY = surfY + sr;
          var bMaxY = surfY + surfH - sr;
          var wallHitSide = null;

          if (cosA > 0.001) {
            var dRight = (bMaxX - px) / cosA;
            if (dRight < nearestDist) { nearestDist = dRight; hitType = 'wall'; wallHitSide = 'right'; }
          } else if (cosA < -0.001) {
            var dLeft = (bMinX - px) / cosA;
            if (dLeft < nearestDist) { nearestDist = dLeft; hitType = 'wall'; wallHitSide = 'left'; }
          }
          if (sinA > 0.001) {
            var dBottom = (bMaxY - py) / sinA;
            if (dBottom < nearestDist) { nearestDist = dBottom; hitType = 'wall'; wallHitSide = 'bottom'; }
          } else if (sinA < -0.001) {
            var dTop = (bMinY - py) / sinA;
            if (dTop < nearestDist) { nearestDist = dTop; hitType = 'wall'; wallHitSide = 'top'; }
          }

          var contactX = px + cosA * nearestDist;
          var contactY = py + sinA * nearestDist;

          // 4. Aim Arrow: 5-unit stroke with orange-to-yellow gradient (#FF7A00 -> #FFD84A) and 13-unit arrowhead
          var arrowStartX = px + cosA * sr;
          var arrowStartY = py + sinA * sr;
          var arrowLen = Math.max(0, nearestDist - sr);
          var headLen = 13 * scale;
          var headHalfW = 6.5 * scale;

          var shaftLen = Math.max(0, arrowLen - headLen);
          var steps = 14;
          var stepDist = shaftLen / steps;

          for (var st = 0; st < steps; st++) {
            var t1 = st / steps;
            var p1x = arrowStartX + cosA * (st * stepDist);
            var p1y = arrowStartY + sinA * (st * stepDist);
            var p2x = arrowStartX + cosA * ((st + 1) * stepDist);
            var p2y = arrowStartY + sinA * ((st + 1) * stepDist);

            var colInterp = Phaser.Display.Color.Interpolate.ColorWithColor(
              { r: 255, g: 122, b: 0 },
              { r: 255, g: 216, b: 74 },
              100,
              Math.round(t1 * 100)
            );
            var colHex = Phaser.Display.Color.GetColor(colInterp.r, colInterp.g, colInterp.b);
            var brightnessAlpha = 0.70 + 0.30 * powerRatio;

            this.aimGraphics.lineStyle(5 * scale, colHex, brightnessAlpha);
            this.aimGraphics.lineBetween(p1x, p1y, p2x, p2y);
          }

          // Arrowhead at contact point
          var perpX = -sinA;
          var perpY = cosA;
          var hBaseX = contactX - cosA * headLen;
          var hBaseY = contactY - sinA * headLen;
          var h1x = hBaseX + perpX * headHalfW;
          var h1y = hBaseY + perpY * headHalfW;
          var h2x = hBaseX - perpX * headHalfW;
          var h2y = hBaseY - perpY * headHalfW;

          this.aimGraphics.fillStyle(0xFFD84A, 0.85 + 0.15 * powerRatio);
          this.aimGraphics.fillTriangle(h1x, h1y, h2x, h2y, contactX, contactY);
          this.aimGraphics.lineStyle(1.2 * scale, 0xFF7A00, 0.9);
          this.aimGraphics.strokeTriangle(h1x, h1y, h2x, h2y, contactX, contactY);

          // 5. Ghost striker at contact point
          this.aimGraphics.lineStyle(1.5 * scale, 0xFFFFFF, 0.40);
          this.aimGraphics.strokeCircle(contactX, contactY, sr);

          // 6. Post-contact path: white dotted line (round 3.2 dots, 7.5 spacing)
          if (hitType === 'coin' && hitCoin && hitCoin.body) {
            var targetX = hitCoin.body.position.x;
            var targetY = hitCoin.body.position.y;
            var deflDx = targetX - contactX;
            var deflDy = targetY - contactY;
            var deflDistTot = Math.hypot(deflDx, deflDy) || 1;
            var deflUx = deflDx / deflDistTot;
            var deflUy = deflDy / deflDistTot;
            var pathLen = 85 * scale;
            var dotSpacing = 7.5 * scale;
            var dotRadius = 1.6 * scale; // diameter 3.2

            for (var pd = 0; pd < pathLen; pd += dotSpacing) {
              var pDotX = targetX + deflUx * pd;
              var pDotY = targetY + deflUy * pd;
              this.aimGraphics.fillStyle(0xFFFFFF, 0.90);
              this.aimGraphics.fillCircle(pDotX, pDotY, dotRadius);
            }
          } else if (hitType === 'wall') {
            var reflA = angle;
            if (wallHitSide === 'left' || wallHitSide === 'right') {
              reflA = Math.PI - angle;
            } else {
              reflA = -angle;
            }
            var rUx = Math.cos(reflA);
            var rUy = Math.sin(reflA);
            var rPathLen = 75 * scale;
            var rDotSpacing = 7.5 * scale;
            var rDotRadius = 1.6 * scale;

            for (var rpd = 0; rpd < rPathLen; rpd += rDotSpacing) {
              var rdX = contactX + rUx * rpd;
              var rdY = contactY + rUy * rpd;
              this.aimGraphics.fillStyle(0xFFFFFF, 0.75);
              this.aimGraphics.fillCircle(rdX, rdY, rDotRadius);
            }
          }
        },

        executeShot: function(angle, powerRatio) {
          if (this.isShotActive || !this.strikerBody || this.isStrikerOverlapping) return;

          this.isShotActive = true;
          this.restStartTime = 0;
          this.hasReportedSettled = false;
          this.shotStartTime = Date.now();
          this.pocketedInCurrentShot = [];
          this.strikerAura.clear();

          var spRange = STRIKER_MAX_SPEED_CM_S - STRIKER_MIN_SPEED_CM_S;
          var speedCmS = STRIKER_MIN_SPEED_CM_S + powerRatio * spRange;
          var vStep = speedCmSToStepVelocity(speedCmS, BASE_DT_SEC);
          var vxStep = Math.cos(angle) * vStep;
          var vyStep = Math.sin(angle) * vStep;

          this.matter.body.setVelocity(this.strikerBody, { x: vxStep, y: vyStep });

          playShootSound(powerRatio);
          createShotBlastRing(this, this.strikerBody.position.x, this.strikerBody.position.y);

          sendToReactNative({
            type: 'SHOT_STARTED',
            payload: {
              speed_cm_s: speedCmS,
              angle: angle,
              impulse: { x: vxStep, y: vyStep }
            },
            timestamp: Date.now()
          });
        },

        setupCollisionHandlers: function() {
          var scene = this;

          this.matter.world.on('collisionstart', function(event) {
            event.pairs.forEach(function(pair) {
              var bodyA = pair.bodyA;
              var bodyB = pair.bodyB;

              // 1. Cushion / Wall Collision
              var isWallA = bodyA.label && bodyA.label.indexOf('wall') === 0;
              var isWallB = bodyB.label && bodyB.label.indexOf('wall') === 0;

              if (isWallA || isWallB) {
                pair.restitution = WALL_BOUNCE_DAMPING;

                var movingBody = isWallA ? bodyB : bodyA;
                var wallBody = isWallA ? bodyA : bodyB;

                var isHorizontal = wallBody.label.indexOf('top') >= 0 || wallBody.label.indexOf('bottom') >= 0;
                scene.bouncedWalls.push({ moving: movingBody, isHorizontal: isHorizontal });

                var wallStep = Math.hypot(movingBody.velocity.x, movingBody.velocity.y);
                var wallSpeedCmS = stepVelocityToSpeedCmS(wallStep, BASE_DT_SEC);
                playCushionThud(wallSpeedCmS);
                return;
              }

              // 2. Coin-to-Coin or Striker-to-Coin Impact
              var isPieceA = bodyA.isStriker || bodyA.coinRef;
              var isPieceB = bodyB.isStriker || bodyB.coinRef;

              if (isPieceA && isPieceB) {
                var relVx = bodyA.velocity.x - bodyB.velocity.x;
                var relVy = bodyA.velocity.y - bodyB.velocity.y;
                var relStep = Math.hypot(relVx, relVy);
                var speedCmS = stepVelocityToSpeedCmS(relStep, BASE_DT_SEC);

                if (speedCmS > 2.0) {
                  playWoodClick(speedCmS);

                  var contactX = (bodyA.position.x + bodyB.position.x) / 2;
                  var contactY = (bodyA.position.y + bodyB.position.y) / 2;

                  if (speedCmS > 30.0) {
                    createCollisionSpark(scene, contactX, contactY);
                  }

                  if (speedCmS > 40.0 && (!scene.lastBridgeCollisionTime || Date.now() - scene.lastBridgeCollisionTime > 75)) {
                    scene.lastBridgeCollisionTime = Date.now();
                    var dx = bodyB.position.x - bodyA.position.x;
                    var dy = bodyB.position.y - bodyA.position.y;
                    var d = Math.hypot(dx, dy) || 1;
                    var normal = { x: dx / d, y: dy / d };

                    sendToReactNative({
                      type: 'COIN_COLLISION',
                      payload: {
                        bodyA: bodyA.label,
                        bodyB: bodyB.label,
                        speed_cm_s: speedCmS,
                        normal: normal
                      },
                      timestamp: Date.now()
                    });
                  }
                }
              }
            });
          });

          this.matter.world.on('afterupdate', function() {
            while (scene.bouncedWalls.length > 0) {
              var item = scene.bouncedWalls.pop();
              if (item.isHorizontal) {
                item.moving.velocity.x *= WALL_BOUNCE_DAMPING;
              } else {
                item.moving.velocity.y *= WALL_BOUNCE_DAMPING;
              }
            }
          });
        },

        update: function(time, delta) {
          // Clamp delta to prevent sudden physics frame bursts on mobile
          var safeDelta = Math.min(delta, 50);
          this.physicsAccumulator += safeDelta;

          while (this.physicsAccumulator >= FIXED_DT_MS) {
            this.stepSimulation();
            this.physicsAccumulator -= FIXED_DT_MS;
          }

          // Visual Sync
          this.syncVisuals();

          // Motion & Settle Check
          this.checkSettled();

          // Debug Overlay
          if (DEBUG_OVERLAY) {
            this.renderDebugOverlay();
          }
        },

        stepSimulation: function() {
          var scene = this;
          var dtSec = BASE_DT_SEC;

          // 1. Gather all active moving bodies
          var activeBodies = [];
          if (this.strikerBody && !this.strikerIsPocketed) activeBodies.push(this.strikerBody);
          this.coins.forEach(function(c) {
            if (c.body && !c.isPocketed) activeBodies.push(c.body);
          });

          // 2. Surface Coulomb friction & viscous damping
          activeBodies.forEach(function(b) {
            var vx = b.velocity.x;
            var vy = b.velocity.y;
            var stepSp = Math.hypot(vx, vy);
            var spCmS = stepVelocityToSpeedCmS(stepSp, dtSec);
            var av = b.angularVelocity;

            if (spCmS < REST_SPEED_THRESHOLD_CM_S && Math.abs(av) < ANGULAR_REST_THRESHOLD) {
              if (stepSp > 0 || av !== 0) {
                scene.matter.body.setVelocity(b, { x: 0, y: 0 });
                scene.matter.body.setAngularVelocity(b, 0);
              }
            } else if (spCmS >= REST_SPEED_THRESHOLD_CM_S) {
              var newSp = Math.max(0, spCmS - FRICTION_DECEL_CM_S2 * dtSec);
              newSp = newSp * Math.max(0, 1 - VISCOUS_DAMPING * dtSec);

              if (newSp < REST_SPEED_THRESHOLD_CM_S) {
                scene.matter.body.setVelocity(b, { x: 0, y: 0 });
              } else {
                var factor = (speedCmSToStepVelocity(newSp, dtSec)) / stepSp;
                scene.matter.body.setVelocity(b, { x: vx * factor, y: vy * factor });
              }
            }

            if (Math.abs(av) >= ANGULAR_REST_THRESHOLD) {
              var newAv = av * Math.max(0, 1 - ANGULAR_DAMPING_PER_SEC * dtSec);
              scene.matter.body.setAngularVelocity(b, Math.abs(newAv) < ANGULAR_REST_THRESHOLD ? 0 : newAv);
            }
          });

          // 3. Pocket Suction & Capture Check
          var pSensors = this.pocketSensors;
          for (var pIdx = 0; pIdx < pSensors.length; pIdx++) {
            var pSens = pSensors[pIdx];
            var pX = pSens.position.x;
            var pY = pSens.position.y;

            for (var bIdx = 0; bIdx < activeBodies.length; bIdx++) {
              var b = activeBodies[bIdx];
              if (b.isPocketed) continue;

              var distToHole = Math.hypot(pX - b.position.x, pY - b.position.y);

              // Gentle suction pull towards pocket center
              if (distToHole <= POCKET_SUCTION_RADIUS && distToHole > 1.0) {
                var pull = (1 - distToHole / POCKET_SUCTION_RADIUS) * 0.0006;
                scene.matter.body.applyForce(b, b.position, {
                  x: (pX - b.position.x) * pull,
                  y: (pY - b.position.y) * pull
                });
              }

              // Hole capture
              if (distToHole <= POCKET_CAPTURE_RADIUS) {
                b.isPocketed = true;
                scene.queuedPocketRemovals.push({ body: b, pocketIndex: pIdx });
              }
            }
          }

          // Step Matter world exactly once per fixed dt
          this.matter.world.step(FIXED_DT_MS);

          // Process queued removals at end of step (deduplicated)
          this.processQueuedPocketRemovals();
        },

        processQueuedPocketRemovals: function() {
          if (this.queuedPocketRemovals.length === 0) return;

          var scene = this;
          var items = this.queuedPocketRemovals.slice();
          this.queuedPocketRemovals = [];

          items.forEach(function(item) {
            var body = item.body;
            var pIdx = item.pocketIndex;

            if (body.isStriker) {
              scene.strikerIsPocketed = true;
              scene.pocketedInCurrentShot.push({ id: 'striker', type: 'striker', pocketIndex: pIdx });

              playPocketSound(false, true);
              createFoulRipple(scene, body.position.x, body.position.y);

              scene.tweens.add({
                targets: [scene.strikerSprite, scene.strikerShadow],
                scaleX: 0.1,
                scaleY: 0.1,
                alpha: 0,
                duration: 250,
                ease: 'Back.easeIn',
                onComplete: function() {
                  scene.matter.body.setVelocity(body, { x: 0, y: 0 });
                  scene.strikerSprite.setVisible(false);
                  scene.strikerShadow.setVisible(false);
                }
              });

              sendToReactNative({
                type: 'STRIKER_POCKETED',
                payload: { pocketIndex: pIdx },
                timestamp: Date.now()
              });

              sendToReactNative({
                type: 'OBJECT_POCKETED',
                payload: { id: 'striker', type: 'striker', pocketIndex: pIdx },
                timestamp: Date.now()
              });
            } else if (body.coinRef) {
              var c = body.coinRef;
              scene.pocketedInCurrentShot.push({ id: c.id, type: c.type, pocketIndex: pIdx });

              if (c.type === 'queen') {
                playPocketSound(true, false);
                createQueenStarburst(scene, body.position.x, body.position.y);
              } else {
                playPocketSound(false, false);
              }

              scene.tweens.add({
                targets: [c.sprite, c.shadow],
                scaleX: 0.1,
                scaleY: 0.1,
                alpha: 0,
                duration: 250,
                ease: 'Back.easeIn',
                onComplete: function() {
                  c.sprite.setVisible(false);
                  c.shadow.setVisible(false);
                  scene.matter.world.remove(body);
                }
              });

              sendToReactNative({
                type: 'OBJECT_POCKETED',
                payload: { id: c.id, type: c.type, pocketIndex: pIdx },
                timestamp: Date.now()
              });
            }
          });
        },

        syncVisuals: function() {
          if (this.strikerBody && !this.strikerIsPocketed) {
            this.strikerSprite.setPosition(this.strikerBody.position.x, this.strikerBody.position.y);
            if (this.isShotActive) {
              this.strikerSprite.setRotation(this.strikerBody.angle);
            } else if (this.isAiming && this.aimAngle !== undefined) {
              this.strikerSprite.setRotation(this.aimAngle + Math.PI / 2);
            } else {
              this.strikerSprite.setRotation(0);
            }
            this.strikerShadow.setPosition(this.strikerBody.position.x + 3, this.strikerBody.position.y + 4);
            this.strikerShadow.setRotation(0); // Shadows stay fixed to light angle

            // Pulsing Cyan/Turquoise Radiant Aura Ring around Striker when resting/idle
            if (this.strikerAura) {
              if (!this.isShotActive && !this.isAiming && !this.isStrikerOverlapping) {
                var pulse = (Math.sin(Date.now() / 240) + 1) / 2; // 0..1
                var auraR = this.strikerRadius + 5 + pulse * 6;
                var auraAlpha = 0.45 + pulse * 0.45;
                this.strikerAura.clear();
                this.strikerAura.lineStyle(2.5, 0x00FFFF, auraAlpha);
                this.strikerAura.strokeCircle(this.strikerBody.position.x, this.strikerBody.position.y, auraR);
                this.strikerAura.lineStyle(5, 0x26E6D9, auraAlpha * 0.35);
                this.strikerAura.strokeCircle(this.strikerBody.position.x, this.strikerBody.position.y, auraR + 2);
              } else {
                this.strikerAura.clear();
              }
            }
          } else if (this.strikerAura) {
            this.strikerAura.clear();
          }

          this.coins.forEach(function(c) {
            if (c.isPocketed || !c.body) return;
            c.sprite.setPosition(c.body.position.x, c.body.position.y);
            c.sprite.setRotation(c.body.angle);
            c.shadow.setPosition(c.body.position.x + 2, c.body.position.y + 3);
            c.shadow.setRotation(0); // Shadows stay fixed to light angle
          });
        },

        checkSettled: function() {
          if (!this.isShotActive) return;

          var strikerMoving = false;
          if (this.strikerBody && !this.strikerIsPocketed) {
            var sSp = stepVelocityToSpeedCmS(Math.hypot(this.strikerBody.velocity.x, this.strikerBody.velocity.y), BASE_DT_SEC);
            strikerMoving = sSp >= REST_SPEED_THRESHOLD_CM_S || Math.abs(this.strikerBody.angularVelocity) >= ANGULAR_REST_THRESHOLD;
          }

          var anyCoinMoving = false;
          for (var i = 0; i < this.coins.length; i++) {
            var c = this.coins[i];
            if (c.isPocketed || !c.body) continue;
            var cSp = stepVelocityToSpeedCmS(Math.hypot(c.body.velocity.x, c.body.velocity.y), BASE_DT_SEC);
            if (cSp >= REST_SPEED_THRESHOLD_CM_S || Math.abs(c.body.angularVelocity) >= ANGULAR_REST_THRESHOLD) {
              anyCoinMoving = true;
              break;
            }
          }

          var allStopped = !strikerMoving && !anyCoinMoving;
          var now = Date.now();

          if (allStopped) {
            if (this.restStartTime === 0) {
              this.restStartTime = now;
              sendToReactNative({ type: 'ALL_OBJECTS_STOPPED', timestamp: now });
            } else if (now - this.restStartTime >= SETTLED_COOLDOWN_MS) {
              if (!this.hasReportedSettled) {
                this.hasReportedSettled = true;
                this.isShotActive = false;
                this.restStartTime = 0;

                var pocketed = this.pocketedInCurrentShot.slice();
                this.pocketedInCurrentShot = [];
                var duration = now - this.shotStartTime;

                sendToReactNative({
                  type: 'SHOT_SETTLED',
                  payload: {
                    pocketedCount: pocketed.length,
                    pocketed: pocketed,
                    duration_ms: duration,
                    strikerPocketed: this.strikerIsPocketed,
                    boardSnapshot: this.getBoardSnapshot()
                  },
                  timestamp: now
                });

                this.resetStriker();
              }
            }
          } else {
            this.restStartTime = 0;
          }
        },

        resetStriker: function() {
          this.strikerIsPocketed = false;
          var sr = this.strikerRadius || STRIKER_RADIUS_PX;
          if (this.strikerSprite) {
            this.strikerSprite.setVisible(true);
            this.strikerSprite.setAlpha(1);
            this.strikerSprite.setDisplaySize(2 * sr * (260 / 240), 2 * sr * (276 / 240));
          }
          if (this.strikerShadow) {
            this.strikerShadow.setVisible(true);
            this.strikerShadow.setAlpha(1);
            this.strikerShadow.setDisplaySize(sr * 2.4, sr * 2.4);
          }
          currentOffsetRatio = 0;
          this.updateStrikerPosition();
        },

        renderDebugOverlay: function() {
          this.debugGraphics.clear();

          // 1. Cushion / Wall Outlines (Red)
          this.debugGraphics.lineStyle(1.5, 0xEF4444, 0.8);
          this.cushionBodies.forEach(function(w) {
            activeScene.debugGraphics.strokeRect(
              w.position.x - w.width / 2,
              w.position.y - w.height / 2,
              w.width,
              w.height
            );
          });

          // 2. Pocket Sensors (Blue dashed/solid)
          this.pocketSensors.forEach(function(p) {
            activeScene.debugGraphics.lineStyle(1, 0x3B82F6, 0.7);
            activeScene.debugGraphics.strokeCircle(p.position.x, p.position.y, POCKET_SUCTION_RADIUS);
            activeScene.debugGraphics.lineStyle(1.5, 0x1D4ED8, 0.9);
            activeScene.debugGraphics.strokeCircle(p.position.x, p.position.y, POCKET_CAPTURE_RADIUS);
          });

          // 3. Body outlines & velocity vectors
          var drawBodyDebug = function(g, body, radius, colorHex) {
            g.lineStyle(1.5, colorHex, 0.85);
            g.strokeCircle(body.position.x, body.position.y, radius);

            // Velocity vector colored by speed cm/s
            var vx = body.velocity.x;
            var vy = body.velocity.y;
            var spStep = Math.hypot(vx, vy);
            var spCmS = stepVelocityToSpeedCmS(spStep, BASE_DT_SEC);

            if (spCmS >= 2.0) {
              var vCol = spCmS < 100 ? 0x22C55E : (spCmS < 250 ? 0xEAB308 : 0xEF4444);
              var vLen = spCmS * 0.4;
              var dirX = vx / spStep;
              var dirY = vy / spStep;
              g.lineStyle(2, vCol, 0.95);
              g.lineBetween(
                body.position.x,
                body.position.y,
                body.position.x + dirX * vLen,
                body.position.y + dirY * vLen
              );
            }
          };

          if (this.strikerBody && !this.strikerIsPocketed) {
            drawBodyDebug(this.debugGraphics, this.strikerBody, STRIKER_RADIUS_PX, 0x06B6D4);
          }

          this.coins.forEach(function(c) {
            if (c.body && !c.isPocketed) {
              drawBodyDebug(activeScene.debugGraphics, c.body, COIN_RADIUS_PX, 0x10B981);
            }
          });
        },

        changeTheme: function(themeId) {
          currentThemeId = themeId;
          var theme = getTheme(themeId);
          generateTextures(this, theme);
          this.renderBoardGraphics(theme);
        },

        changeStrikerSkin: function(skin) {
          currentStrikerSkin = skin;
          if (this.strikerSprite) {
            this.strikerSprite.setTexture('tex_striker_' + skin);
            var sr = this.strikerRadius || STRIKER_RADIUS_PX;
            this.strikerSprite.setDisplaySize(2 * sr * (260 / 240), 2 * sr * (276 / 240));
          }
        },

        setSeat: function(seat) {
          currentSeat = seat;
          this.resetStriker();
        },

        setOffset: function(offset) {
          if (!this.isShotActive) {
            currentOffsetRatio = offset;
            this.updateStrikerPosition();
          }
        },

        toggleDebugOverlay: function(enabled) {
          DEBUG_OVERLAY = typeof enabled === 'boolean' ? enabled : !DEBUG_OVERLAY;
          if (!DEBUG_OVERLAY) this.debugGraphics.clear();
        },

        resetBoard: function() {
          this.spawnCoinCluster();
          this.resetStriker();
          this.isShotActive = false;
          this.restStartTime = 0;
          this.hasReportedSettled = false;
          this.pocketedInCurrentShot = [];
        },

        returnCoinsToCenter: function(coinsToReturn) {
          if (!Array.isArray(coinsToReturn) || coinsToReturn.length === 0) return;
          var scene = this;
          var cx = this.canvasSize / 2;
          var cy = this.canvasSize / 2;
          var rCoin = COIN_RADIUS_PX;

          coinsToReturn.forEach(function(item, idx) {
            var targetCoin = null;
            if (item.id) {
              targetCoin = scene.coins.find(function(c) { return c.id === item.id && c.isPocketed; });
            }
            if (!targetCoin && item.type) {
              targetCoin = scene.coins.find(function(c) { return c.type === item.type && c.isPocketed; });
            }
            if (!targetCoin) return;

            var posX = cx + (idx > 0 ? (idx * rCoin * 2.1) : 0);
            var posY = cy;

            targetCoin.isPocketed = false;
            scene.matter.body.setPosition(targetCoin.body, { x: posX, y: posY });
            scene.matter.body.setVelocity(targetCoin.body, { x: 0, y: 0 });
            scene.matter.body.setAngularVelocity(targetCoin.body, 0);

            try {
              scene.matter.world.add(targetCoin.body);
            } catch(e) {}

            targetCoin.sprite.setPosition(posX, posY);
            targetCoin.sprite.setScale(1);
            targetCoin.sprite.setAlpha(1);
            targetCoin.sprite.setVisible(true);

            targetCoin.shadow.setPosition(posX + 2, posY + 3);
            targetCoin.shadow.setScale(1);
            targetCoin.shadow.setAlpha(1);
            targetCoin.shadow.setVisible(true);
          });
        },

        getBoardSnapshot: function() {
          var s = this.canvasSize;
          var coinsData = (this.coins || []).map(function(c) {
            return {
              id: c.id,
              type: c.type,
              position: {
                x: c.body ? (c.body.position.x / s) : 0,
                y: c.body ? (c.body.position.y / s) : 0
              },
              isPocketed: !!c.isPocketed
            };
          });
          var sr = this.strikerRadius || STRIKER_RADIUS_PX;
          var strikerData = {
            position: {
              x: this.strikerBody ? (this.strikerBody.position.x / s) : 0,
              y: this.strikerBody ? (this.strikerBody.position.y / s) : 0
            },
            radius: sr / s,
            seat: currentSeat,
            offsetRatio: currentOffsetRatio,
            isPocketed: !!this.strikerIsPocketed
          };
          return {
            boardSize: s,
            scale: s / 382,
            coins: coinsData,
            striker: strikerData,
            pockets: [
              { id: 0, position: { x: 24 / 382, y: 22.5 / 382 }, radius: 16.4 / 382, corner: 'top-left' },
              { id: 1, position: { x: 357.5 / 382, y: 22.5 / 382 }, radius: 16.4 / 382, corner: 'top-right' },
              { id: 2, position: { x: 24 / 382, y: 356.5 / 382 }, radius: 16.4 / 382, corner: 'bottom-left' },
              { id: 3, position: { x: 357.5 / 382, y: 356.5 / 382 }, radius: 16.4 / 382, corner: 'bottom-right' }
            ],
            activeSeat: currentSeat,
            timestamp: Date.now()
          };
        }
      });

      // MESSAGING BRIDGE
      function sendToReactNative(msg) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        } else if (window.parent && window.parent !== window) {
          window.parent.postMessage(JSON.stringify(msg), '*');
        }
      }

      function handleHostMessage(raw) {
        try {
          var msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!activeScene) return;

          switch (msg.type) {
            case 'CHANGE_THEME':
              if (msg.payload && msg.payload.themeId) {
                activeScene.changeTheme(msg.payload.themeId);
              }
              break;
            case 'CHANGE_STRIKER_SKIN':
              if (msg.payload && msg.payload.skin) {
                activeScene.changeStrikerSkin(msg.payload.skin);
              }
              break;
            case 'SET_PLAYER_SEAT':
              if (msg.payload && typeof msg.payload.seat === 'number') {
                activeScene.setSeat(msg.payload.seat);
              }
              break;
            case 'SET_TURN_STATE':
              if (msg.payload && msg.payload.state) {
                activeScene.setTurnState(msg.payload.state);
              }
              break;
            case 'SET_STRIKER_OFFSET':
              if (msg.payload && typeof msg.payload.offset === 'number') {
                activeScene.setOffset(msg.payload.offset);
              }
              break;
            case 'SET_AIM_POWER':
              if (msg.payload && typeof msg.payload.power === 'number') {
                var p = Math.max(0, Math.min(1.0, msg.payload.power));
                activeScene.aimPowerRatio = p;
                if (p > 0.02) {
                  activeScene.renderAimGuide(activeScene.aimAngle || -Math.PI / 2, p);
                } else {
                  activeScene.aimGraphics.clear();
                }
              }
              break;
            case 'CANCEL_AIM':
              activeScene.aimGraphics.clear();
              activeScene.aimPowerRatio = 0;
              break;
            case 'SHOOT':
              var pVal = (msg.payload && (typeof msg.payload.power === 'number' ? msg.payload.power : typeof msg.payload.powerRatio === 'number' ? msg.payload.powerRatio : 0.75)) || 0.75;
              var aVal = (msg.payload && typeof msg.payload.angle === 'number') ? msg.payload.angle : (activeScene.aimAngle || -Math.PI / 2);
              activeScene.executeShot(aVal, pVal);
              break;
            case 'TOGGLE_DEBUG':
              activeScene.toggleDebugOverlay(msg.payload ? msg.payload.enabled : undefined);
              break;
            case 'RESET_BOARD':
              activeScene.resetBoard();
              break;
            case 'RETURN_COINS':
              if (msg.payload && Array.isArray(msg.payload.coins)) {
                activeScene.returnCoinsToCenter(msg.payload.coins);
              }
              break;
            case 'SET_AUDIO_CONFIG':
              if (msg.payload) {
                if (typeof msg.payload.soundEnabled === 'boolean') sfxAudioEnabled = msg.payload.soundEnabled;
                if (typeof msg.payload.soundVolume === 'number') sfxAudioVolume = msg.payload.soundVolume;
              }
              break;
            case 'PAUSE_GAME':
              if (activeScene && activeScene.matter && activeScene.matter.world) {
                activeScene.isPaused = true;
              }
              break;
            case 'RESUME_GAME':
              if (activeScene && activeScene.matter && activeScene.matter.world) {
                activeScene.isPaused = false;
              }
              break;
            case 'GET_BOARD_SNAPSHOT':
              if (activeScene && typeof activeScene.getBoardSnapshot === 'function') {
                sendToReactNative({
                  type: 'BOARD_SNAPSHOT',
                  payload: activeScene.getBoardSnapshot(),
                  timestamp: Date.now()
                });
              }
              break;
          }
        } catch (e) {
          console.warn('[PhaserWebView] Parse error:', e);
        }
      }

      window.addEventListener('message', function(ev) {
        handleHostMessage(ev.data);
      });
      document.addEventListener('message', function(ev) {
        handleHostMessage(ev.data);
      });

      // INITIALIZE PHASER WITH MATTER PHYSICS (AUTO DETECT WEBGL / CANVAS FOR 100% RELIABILITY)
      function initPhaser() {
        if (window._phaserGameInstance) return;
        var container = document.getElementById('carrom-game-container');
        if (!container) return;

        var w = window.innerWidth || (document.documentElement ? document.documentElement.clientWidth : 0);
        var h = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : 0);
        if (!w || !h || w < 50 || h < 50) {
          setTimeout(initPhaser, 40);
          return;
        }

        var config = {
          type: Phaser.AUTO,
          parent: 'carrom-game-container',
          width: ${canvasSize},
          height: ${canvasSize},
          transparent: true,
          physics: {
            default: 'matter',
            matter: {
              gravity: { x: 0, y: 0 },
              autoUpdate: false,
              positionIterations: 8,
              velocityIterations: 6,
              debug: false
            }
          },
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: ${canvasSize},
            height: ${canvasSize}
          },
          scene: [CarromScene]
        };

        window._phaserGameInstance = new Phaser.Game(config);
      }

      if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initPhaser, 30);
      } else {
        window.addEventListener('DOMContentLoaded', function() {
          setTimeout(initPhaser, 30);
        });
      }

      window.addEventListener('load', function() {
        if (window._phaserGameInstance && window._phaserGameInstance.scale) {
          setTimeout(function() {
            window._phaserGameInstance.scale.refresh();
          }, 60);
        }
      });

      window.addEventListener('resize', function() {
        if (window._phaserGameInstance && window._phaserGameInstance.scale) {
          window._phaserGameInstance.scale.refresh();
        }
      });
    })();
  </script>
</body>
</html>`;
}
