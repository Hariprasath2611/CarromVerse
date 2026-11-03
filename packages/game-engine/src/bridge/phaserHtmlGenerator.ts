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
      // 1. PHYSICAL CONSTANTS (Single Source of Truth)
      var BOARD_PX = 740;
      var BOARD_CM = 74;
      var PX_PER_CM = BOARD_PX / BOARD_CM; // 10.0 px per cm

      var COIN_RADIUS_CM = 2.10; // Increased coin size for rich mobile visibility
      var COIN_RADIUS_PX = COIN_RADIUS_CM * PX_PER_CM; // 21.0 px
      var COIN_MASS = 5.0;

      var STRIKER_RADIUS_CM = 2.75; // Increased striker size
      var STRIKER_RADIUS_PX = STRIKER_RADIUS_CM * PX_PER_CM; // 27.5 px
      var STRIKER_MASS = 15.0; // 3:1 mass ratio

      var POCKET_RADIUS_CM = 4.5;
      var POCKET_RADIUS_PX = POCKET_RADIUS_CM * PX_PER_CM; // 45.0 px (visible hole radius)
      var POCKET_CAPTURE_RADIUS = POCKET_RADIUS_PX * 0.85; // 38.25 px capture radius
      var POCKET_SUCTION_RADIUS = POCKET_RADIUS_PX * 1.22; // 54.9 px suction zone

      var WALL_THICKNESS_CM = 5.0;
      var WALL_THICKNESS_PX = WALL_THICKNESS_CM * PX_PER_CM; // 50.0 px

      var STRIKER_MIN_SPEED_CM_S = 25.0;
      var STRIKER_MAX_SPEED_CM_S = 180.0;
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
          frameColor: '#A0612C',
          frameAccent: '#E9B949',
          frameInnerCushion: '#3E2210',
          surfaceBg: '#F0DDB0',
          surfaceGrain: '#B8955A',
          markingsColor: '#6B3A1A',
          pocketRimColor: '#C9A24B',
          baselineCircleColor: '#D8344A',
          baselineDotColor: '#D8344A',
          greenRingColor: '#1E8F5A',
          redAccentColor: '#D8344A',
          arrowColor: '#6B3A1A'
        },
        mahogany: {
          id: 'mahogany',
          frameColor: '#5C1D0C',
          frameAccent: '#E9B949',
          frameInnerCushion: '#361007',
          surfaceBg: '#F5E4C3',
          surfaceGrain: '#C29B63',
          markingsColor: '#5C1D0C',
          pocketRimColor: '#C9A24B',
          baselineCircleColor: '#D8344A',
          baselineDotColor: '#D8344A',
          greenRingColor: '#1E8F5A',
          redAccentColor: '#D8344A',
          arrowColor: '#5C1D0C'
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

      // TEXTURE GENERATOR (DPR-RESPONSIVE, HIGH-FIDELITY VECTOR CANVASES)
      function generateTextures(scene, theme) {
        var dpr = typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(3, Math.max(1, Math.round(window.devicePixelRatio))) : 2;

        // 1. Coins Helper
        function drawCoinCanvas(ctx, w, h, s, type) {
          var cx = w / 2;
          var faceCy = 110 * s;
          var thickCy = 122 * s;
          var rFace = 100 * s;

          var isWhite = type === 'white';
          var isBlack = type === 'black';

          var colThickness = isWhite ? '#A89868' : (isBlack ? '#030504' : '#7A1020');
          var colFaceInner = isWhite ? '#FFFFFF' : (isBlack ? '#4A524E' : '#FF5C78');
          var colFaceOuter = isWhite ? '#E2D6B4' : (isBlack ? '#0B0F0D' : '#B82545');
          var colGrooves = isWhite ? '#CDBF9A' : (isBlack ? '#2E3833' : '#FFD0D8');
          var colEmblemDot = isWhite ? '#CDBF9A' : (isBlack ? '#2BD67B' : '#FFD0D8');
          var colEmblemDisc = isBlack ? '#141A17' : null;
          var highlightAlpha = isWhite ? 0.55 : (isBlack ? 0.22 : 0.50);

          // 1. Edge-thickness disc (r100, 12 units lower)
          ctx.fillStyle = colThickness;
          ctx.beginPath();
          ctx.arc(cx, thickCy, rFace, 0, Math.PI * 2);
          ctx.fill();

          // 2. Face disc with radial gradient
          var faceGrad = ctx.createRadialGradient(cx - 10 * s, faceCy - 15 * s, 10 * s, cx, faceCy, rFace);
          faceGrad.addColorStop(0, colFaceInner);
          if (isBlack) faceGrad.addColorStop(0.4, '#2D3330');
          faceGrad.addColorStop(1, colFaceOuter);
          ctx.fillStyle = faceGrad;
          ctx.beginPath();
          ctx.arc(cx, faceCy, rFace, 0, Math.PI * 2);
          ctx.fill();

          // Outer face border
          ctx.strokeStyle = colGrooves;
          ctx.lineWidth = 1.5 * s;
          ctx.stroke();

          // 3. Groove ring r84 (3 units)
          ctx.lineWidth = 3 * s;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 84 * s, 0, Math.PI * 2);
          ctx.stroke();

          // 4. Inner ring r66 (2 units)
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 66 * s, 0, Math.PI * 2);
          ctx.stroke();

          // 5. Tick ring (r48, 10-unit stroke dashed [3*s, 15.85*s])
          ctx.lineWidth = 10 * s;
          if (ctx.setLineDash) ctx.setLineDash([3 * s, 15.85 * s]);
          ctx.beginPath();
          ctx.arc(cx, faceCy, 48 * s, 0, Math.PI * 2);
          ctx.stroke();
          if (ctx.setLineDash) ctx.setLineDash([]);

          // 6. Center emblem (r30 disc, r8 dot)
          if (colEmblemDisc) {
            ctx.fillStyle = colEmblemDisc;
            ctx.beginPath();
            ctx.arc(cx, faceCy, 30 * s, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = colGrooves;
            ctx.lineWidth = 1.5 * s;
            ctx.stroke();
          } else {
            ctx.strokeStyle = colGrooves;
            ctx.lineWidth = 2 * s;
            ctx.beginPath();
            ctx.arc(cx, faceCy, 30 * s, 0, Math.PI * 2);
            ctx.stroke();
          }

          ctx.fillStyle = colEmblemDot;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 8 * s, 0, Math.PI * 2);
          ctx.fill();

          // 7. Top highlight ellipse (center 74, 62; 40x16; rotated -35°; white)
          ctx.save();
          ctx.translate(74 * s, 62 * s);
          ctx.rotate(-35 * Math.PI / 180);
          ctx.fillStyle = 'rgba(255, 255, 255, ' + highlightAlpha + ')';
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(0, 0, 20 * s, 8 * s, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(0, 0, 15 * s, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.restore();
        }

        var coinW = Math.round(74 * dpr);
        var coinH = Math.round(74 * (236 / 220) * dpr);
        var coinS = coinW / 220;

        createCanvasTexture(scene, 'tex_coin_white', coinW, coinH, function(ctx) {
          drawCoinCanvas(ctx, coinW, coinH, coinS, 'white');
        });

        createCanvasTexture(scene, 'tex_coin_black', coinW, coinH, function(ctx) {
          drawCoinCanvas(ctx, coinW, coinH, coinS, 'black');
        });

        createCanvasTexture(scene, 'tex_coin_queen', coinW, coinH, function(ctx) {
          drawCoinCanvas(ctx, coinW, coinH, coinS, 'queen');
        });

        // Standalone Non-Rotating Coin Shadow
        createCanvasTexture(scene, 'tex_coin_shadow', coinW, Math.round(coinW * 0.45), function(ctx) {
          var sw = coinW;
          var sh = Math.round(coinW * 0.45);
          var grad = ctx.createRadialGradient(sw / 2, sh / 2, 2 * dpr, sw / 2, sh / 2, 0.45 * sw);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0.42)');
          grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.20)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(sw / 2, sh / 2, 0.42 * sw, 0.22 * sh, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(sw / 2, sh / 2, 0.35 * sw, 0, Math.PI * 2);
          }
          ctx.fill();
        });

        // 2. Striker Textures
        var strikerW = Math.round(98 * dpr);
        var strikerH = Math.round(98 * (276 / 260) * dpr);
        var strikerS = strikerW / 260;

        function drawStrikerCanvas(ctx, w, h, s, skinKey) {
          var cx = w / 2;
          var faceCy = 130 * s;
          var thickCy = 144 * s;
          var rFace = 120 * s;

          // 1. Thickness disc (#0B6F3C lower by 14)
          ctx.fillStyle = '#0B6F3C';
          ctx.beginPath();
          ctx.arc(cx, thickCy, rFace, 0, Math.PI * 2);
          ctx.fill();

          // 2. Rim r120 gradient (#5BF0A0 -> #138A4C)
          var rimGrad = ctx.createRadialGradient(cx - 15 * s, faceCy - 20 * s, 15 * s, cx, faceCy, rFace);
          rimGrad.addColorStop(0, '#5BF0A0');
          rimGrad.addColorStop(0.5, '#2BD67B');
          rimGrad.addColorStop(0.85, '#19A35C');
          rimGrad.addColorStop(1, '#138A4C');
          ctx.fillStyle = rimGrad;
          ctx.beginPath();
          ctx.arc(cx, faceCy, rFace, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0B6F3C';
          ctx.lineWidth = 2 * s;
          ctx.stroke();

          // 3. Cream disc r100 (#F5ECD2)
          ctx.fillStyle = '#F5ECD2';
          ctx.beginPath();
          ctx.arc(cx, faceCy, 100 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#E0D2AF';
          ctx.lineWidth = 2 * s;
          ctx.stroke();

          // 4. Ring r84 emerald 6 units (#2BD67B)
          ctx.strokeStyle = '#2BD67B';
          ctx.lineWidth = 6 * s;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 84 * s, 0, Math.PI * 2);
          ctx.stroke();

          // 5. Ring r62 brass 3 units (#E9B949)
          ctx.strokeStyle = '#E9B949';
          ctx.lineWidth = 3 * s;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 62 * s, 0, Math.PI * 2);
          ctx.stroke();

          // 6. Dashed ring r40 emerald (stroke 2, dashed [4*s, 4*s])
          ctx.strokeStyle = '#2BD67B';
          ctx.lineWidth = 2 * s;
          if (ctx.setLineDash) ctx.setLineDash([4 * s, 4 * s]);
          ctx.beginPath();
          ctx.arc(cx, faceCy, 40 * s, 0, Math.PI * 2);
          ctx.stroke();
          if (ctx.setLineDash) ctx.setLineDash([]);

          // 7. Center brass dot r12 (#E9B949, stroke #A47A16)
          ctx.fillStyle = '#E9B949';
          ctx.beginPath();
          ctx.arc(cx, faceCy, 12 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#A47A16';
          ctx.lineWidth = 1.5 * s;
          ctx.stroke();

          // 8. Aim notch: triangle at top (130, 30) in #06210F at 60% opacity
          ctx.fillStyle = 'rgba(6, 33, 15, 0.60)';
          ctx.beginPath();
          ctx.moveTo(130 * s, 16 * s);
          ctx.lineTo(122 * s, 34 * s);
          ctx.lineTo(138 * s, 34 * s);
          ctx.closePath();
          ctx.fill();

          // 9. Highlight: ellipse (86, 74; 46x18; -35°; white 50%)
          ctx.save();
          ctx.translate(86 * s, 74 * s);
          ctx.rotate(-35 * Math.PI / 180);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.50)';
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(0, 0, 23 * s, 9 * s, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(0, 0, 18 * s, 0, Math.PI * 2);
          }
          ctx.fill();
          ctx.restore();
        }

        var strikerKeys = ['emerald', 'classic', 'royal', 'gold', 'default'];
        strikerKeys.forEach(function(sKey) {
          createCanvasTexture(scene, 'tex_striker_' + sKey, strikerW, strikerH, function(ctx) {
            drawStrikerCanvas(ctx, strikerW, strikerH, strikerS, sKey);
          });
        });

        // Standalone Non-Rotating Striker Shadow
        createCanvasTexture(scene, 'tex_striker_shadow', strikerW, Math.round(strikerW * 0.45), function(ctx) {
          var sw = strikerW;
          var sh = Math.round(strikerW * 0.45);
          var grad = ctx.createRadialGradient(sw / 2, sh / 2, 4 * dpr, sw / 2, sh / 2, 0.45 * sw);
          grad.addColorStop(0, 'rgba(0, 0, 0, 0.48)');
          grad.addColorStop(0.65, 'rgba(0, 0, 0, 0.22)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(sw / 2, sh / 2, 0.45 * sw, 0.24 * sh, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(sw / 2, sh / 2, 0.40 * sw, 0, Math.PI * 2);
          }
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
            payload: { theme: currentThemeId, coinCount: this.coins.length },
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
          var fw = (s - BOARD_PX) / 2; // Frame width (50px on 840 canvas)
          var surfSize = BOARD_PX;
          var center = s / 2;
          var scale = BOARD_PX / 528; // 528 units in reference SVG = BOARD_PX (74 cm)

          var bo = 74 * scale; // Baseline center line offset from cushion
          var halfBl = 156 * scale; // Distance from center to baseline red marker centers
          var pillLen = 336 * scale; // Full length of baseline pill
          var pillH = 24 * scale; // Thickness of baseline pill
          var pillRx = 12 * scale; // Corner radius of baseline pill
          var markerR = 8 * scale; // Radius of red end markers

          this.boardGraphics.clear();
          this.pocketsGroup.clear(true, true);

          // 1. Frame: Rounded rect r30 with rich wood colors
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.frameColor || '#A0612C').color, 1);
          this.boardGraphics.fillRoundedRect(0, 0, s, s, 30 * (s / 640));

          // Brass Inlay Line inset 8 (2 units, 70% opacity)
          var brassCol = Phaser.Display.Color.HexStringToColor(theme.frameAccent || '#E9B949').color;
          this.boardGraphics.lineStyle(2, brassCol, 0.70);
          this.boardGraphics.strokeRoundedRect(8 * (s / 640), 8 * (s / 640), s - 16 * (s / 640), s - 16 * (s / 640), 22 * (s / 640));

          // 45 deg miter joints
          this.boardGraphics.lineStyle(1.5, 0x4A2610, 0.5);
          this.boardGraphics.lineBetween(0, 0, fw, fw);
          this.boardGraphics.lineBetween(s, 0, s - fw, fw);
          this.boardGraphics.lineBetween(0, s, fw, s - fw);
          this.boardGraphics.lineBetween(s, s, s - fw, s - fw);

          // Inner Cushion Lip (Rect in #3E2210)
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.frameInnerCushion || '#3E2210').color, 1);
          this.boardGraphics.fillRect(fw - 8, fw - 8, surfSize + 16, surfSize + 16);

          // 2. Playing Surface 56-584 (528 units square in #F0DDB0)
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.surfaceBg || '#F0DDB0').color, 1);
          this.boardGraphics.fillRoundedRect(fw, fw, surfSize, surfSize, 4);

          // Surface 2-unit border #B8955A
          var grainCol = Phaser.Display.Color.HexStringToColor(theme.surfaceGrain || '#B8955A').color;
          this.boardGraphics.lineStyle(2, grainCol, 1.0);
          this.boardGraphics.strokeRoundedRect(fw, fw, surfSize, surfSize, 4);

          // Faint Vertical Wood Grain Lines every 13 units at 22% opacity
          this.boardGraphics.lineStyle(1, grainCol, 0.22);
          var grainStep = 13 * scale;
          for (var gx = fw + grainStep; gx < s - fw; gx += grainStep) {
            this.boardGraphics.lineBetween(gx, fw, gx, s - fw);
          }

          // 3. Diagonal Foul Lines (dashed 6 6 radiating from center to corners)
          var markCol = Phaser.Display.Color.HexStringToColor(theme.markingsColor || '#6B3A1A').color;
          var redCol = Phaser.Display.Color.HexStringToColor(theme.redAccentColor || '#D8344A').color;
          var greenCol = Phaser.Display.Color.HexStringToColor(theme.greenRingColor || '#1E8F5A').color;

          this.boardGraphics.lineStyle(1.5, markCol, 0.85);
          var drawDashedLine = function(g, x1, y1, x2, y2, dLen, gLen) {
            var dx = x2 - x1;
            var dy = y2 - y1;
            var tot = Math.hypot(dx, dy);
            if (tot <= 0) return;
            var ux = dx / tot;
            var uy = dy / tot;
            var cur = 0;
            while (cur < tot) {
              var endD = Math.min(cur + dLen, tot);
              g.lineBetween(x1 + ux * cur, y1 + uy * cur, x1 + ux * endD, y1 + uy * endD);
              cur += dLen + gLen;
            }
          };

          // 4 Diagonal Guides: from (center +- 96*scale) to (center +- 202*scale)
          drawDashedLine(this.boardGraphics, center - 96 * scale, center - 96 * scale, center - 202 * scale, center - 202 * scale, 6, 6);
          drawDashedLine(this.boardGraphics, center + 96 * scale, center - 96 * scale, center + 202 * scale, center - 202 * scale, 6, 6);
          drawDashedLine(this.boardGraphics, center - 96 * scale, center + 96 * scale, center - 202 * scale, center + 202 * scale, 6, 6);
          drawDashedLine(this.boardGraphics, center + 96 * scale, center + 96 * scale, center + 202 * scale, center + 202 * scale, 6, 6);

          // 4. Baselines: 4 Pill Outlines (stroke 2, no fill) with Red End Markers
          this.boardGraphics.lineStyle(2, markCol, 1.0);

          // Top Baseline
          this.boardGraphics.strokeRoundedRect(center - pillLen / 2, fw + bo - pillH / 2, pillLen, pillH, pillRx);
          // Bottom Baseline
          this.boardGraphics.strokeRoundedRect(center - pillLen / 2, s - fw - bo - pillH / 2, pillLen, pillH, pillRx);
          // Left Baseline
          this.boardGraphics.strokeRoundedRect(fw + bo - pillH / 2, center - pillLen / 2, pillH, pillLen, pillRx);
          // Right Baseline
          this.boardGraphics.strokeRoundedRect(s - fw - bo - pillH / 2, center - pillLen / 2, pillH, pillLen, pillRx);

          // Red End Markers r8 at pill circle centers (center +- halfBl)
          this.boardGraphics.fillStyle(redCol, 1);
          // Top markers
          this.boardGraphics.fillCircle(center - halfBl, fw + bo, markerR);
          this.boardGraphics.fillCircle(center + halfBl, fw + bo, markerR);
          // Bottom markers
          this.boardGraphics.fillCircle(center - halfBl, s - fw - bo, markerR);
          this.boardGraphics.fillCircle(center + halfBl, s - fw - bo, markerR);
          // Left markers
          this.boardGraphics.fillCircle(fw + bo, center - halfBl, markerR);
          this.boardGraphics.fillCircle(fw + bo, center + halfBl, markerR);
          // Right markers
          this.boardGraphics.fillCircle(s - fw - bo, center - halfBl, markerR);
          this.boardGraphics.fillCircle(s - fw - bo, center + halfBl, markerR);

          // 5. Center Circles and Emblems
          // Outer Green Circle r86
          this.boardGraphics.lineStyle(3, greenCol, 0.95);
          this.boardGraphics.strokeCircle(center, center, 86 * scale);

          // Red Circle r62
          this.boardGraphics.lineStyle(2, redCol, 0.95);
          this.boardGraphics.strokeCircle(center, center, 62 * scale);

          // Dashed Green Circle r40
          var nDashes = 18;
          var dAngle = (2 * Math.PI) / nDashes;
          this.boardGraphics.lineStyle(1.5, greenCol, 0.9);
          for (var a = 0; a < nDashes; a += 2) {
            this.boardGraphics.beginPath();
            this.boardGraphics.arc(center, center, 40 * scale, a * dAngle, (a + 1) * dAngle);
            this.boardGraphics.strokePath();
          }

          // Four Red Petals (ellipses 7x16) at +-50 units on axes
          this.boardGraphics.fillStyle(redCol, 1);
          this.boardGraphics.fillEllipse(center, center - 50 * scale, 14 * scale, 32 * scale);
          this.boardGraphics.fillEllipse(center, center + 50 * scale, 14 * scale, 32 * scale);
          this.boardGraphics.fillEllipse(center - 50 * scale, center, 32 * scale, 14 * scale);
          this.boardGraphics.fillEllipse(center + 50 * scale, center, 32 * scale, 14 * scale);

          // Inner Green Ring r18
          this.boardGraphics.lineStyle(2, greenCol, 1.0);
          this.boardGraphics.strokeCircle(center, center, 18 * scale);

          // Center Red Dot r10
          this.boardGraphics.fillStyle(redCol, 1);
          this.boardGraphics.fillCircle(center, center, 10 * scale);

          // 6. Corner Pockets (visual sprites at exact sensor centers: fw + 24*scale)
          var pr = POCKET_RADIUS_PX;
          var pocketOffset = 24 * scale;
          var pCoords = [
            { x: fw + pocketOffset, y: fw + pocketOffset },
            { x: s - fw - pocketOffset, y: fw + pocketOffset },
            { x: s - fw - pocketOffset, y: s - fw - pocketOffset },
            { x: fw + pocketOffset, y: s - fw - pocketOffset }
          ];

          pCoords.forEach(function(coord) {
            var p = activeScene.add.sprite(coord.x, coord.y, 'tex_pocket');
            p.setDisplaySize(pr * 2, pr * 2);
            p.setDepth(2);
            activeScene.pocketsGroup.add(p);
          });
        },

        createThickWalls: function() {
          this.cushionBodies.forEach(function(b) { activeScene.matter.world.remove(b); });
          this.cushionBodies = [];

          var s = this.canvasSize;
          var fw = (s - BOARD_PX) / 2; // 50px
          var center = s / 2;
          var thick = WALL_THICKNESS_PX; // 50px thick

          // 4 Static Wall Rectangles placed OUTSIDE the 740px playable surface:
          // Inner edges: Left x=fw, Right x=s-fw, Top y=fw, Bottom y=s-fw
          var wallDefs = [
            { x: center, y: fw - thick / 2, w: BOARD_PX + thick * 2, h: thick, label: 'cushion_top' },
            { x: center, y: s - fw + thick / 2, w: BOARD_PX + thick * 2, h: thick, label: 'cushion_bottom' },
            { x: fw - thick / 2, y: center, w: thick, h: BOARD_PX + thick * 2, label: 'cushion_left' },
            { x: s - fw + thick / 2, y: center, w: thick, h: BOARD_PX + thick * 2, label: 'cushion_right' }
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
          var fw = (s - BOARD_PX) / 2;
          var scale = BOARD_PX / 528;
          var pocketOffset = 24 * scale;

          var pCoords = [
            { x: fw + pocketOffset, y: fw + pocketOffset, idx: 0 },
            { x: s - fw - pocketOffset, y: fw + pocketOffset, idx: 1 },
            { x: s - fw - pocketOffset, y: s - fw - pocketOffset, idx: 2 },
            { x: fw + pocketOffset, y: s - fw - pocketOffset, idx: 3 }
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
          var cx = s / 2;
          var cy = s / 2;
          var rCoin = COIN_RADIUS_PX; // 15.5 px

          var addCoin = function(scene, id, type, x, y) {
            var shadow = scene.add.sprite(x + 2, y + 3, 'tex_coin_shadow');
            shadow.setOrigin(0.5, 0.5);
            shadow.setDisplaySize(rCoin * 2.3, rCoin * 2.3);
            shadow.setDepth(8);

            var key = type === 'queen' ? 'tex_coin_queen' : (type === 'white' ? 'tex_coin_white' : 'tex_coin_black');
            var coinSprite = scene.add.sprite(x, y, key);
            coinSprite.setOrigin(0.5, 110 / 236);
            coinSprite.setDisplaySize(2 * rCoin * (220 / 200), 2 * rCoin * (236 / 200));
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

          // Queen (swappable texture slot ready)
          addCoin(this, 'queen', 'queen', cx, cy);

          // Ring 1 (6 coins)
          var d1 = 2 * rCoin * 1.01;
          var r1Types = ['white', 'black', 'white', 'black', 'white', 'black'];
          for (var i = 0; i < 6; i++) {
            var ang = (i * Math.PI) / 3;
            addCoin(this, 'r1_' + i, r1Types[i], cx + Math.cos(ang) * d1, cy + Math.sin(ang) * d1);
          }

          // Ring 2 (12 coins)
          var d2Axis = 4 * rCoin * 1.01;
          var d2Inter = 2 * Math.sqrt(3) * rCoin * 1.01;
          var r2Types = ['black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white'];
          for (var j = 0; j < 12; j++) {
            var a2 = (j * Math.PI) / 6;
            var dist = j % 2 === 0 ? d2Axis : d2Inter;
            addCoin(this, 'r2_' + j, r2Types[j], cx + Math.cos(a2) * dist, cy + Math.sin(a2) * dist);
          }
        },

        createStriker: function(theme) {
          if (this.strikerBody) {
            this.matter.world.remove(this.strikerBody);
          }
          if (this.strikerSprite) this.strikerSprite.destroy();
          if (this.strikerShadow) this.strikerShadow.destroy();

          var s = this.canvasSize;
          var fw = (s - BOARD_PX) / 2;
          var scale = BOARD_PX / 528;
          var bo = 74 * scale;
          var sr = STRIKER_RADIUS_PX; // 20.5 px

          this.strikerRadius = sr;
          var px = s / 2;
          var py = s - fw - bo;

          this.strikerShadow = this.add.sprite(px + 3, py + 4, 'tex_striker_shadow');
          this.strikerShadow.setOrigin(0.5, 0.5);
          this.strikerShadow.setDisplaySize(sr * 2.4, sr * 2.4);
          this.strikerShadow.setDepth(12);

          this.strikerSprite = this.add.sprite(px, py, 'tex_striker_' + currentStrikerSkin);
          this.strikerSprite.setOrigin(0.5, 130 / 276);
          this.strikerSprite.setDisplaySize(2 * sr * (260 / 240), 2 * sr * (276 / 240));
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
          var fw = (s - BOARD_PX) / 2;
          var scale = BOARD_PX / 528;
          var bo = 74 * scale;
          var halfBl = 156 * scale;
          var center = s / 2;

          var clampedOffset = Math.max(-1.0, Math.min(1.0, currentOffsetRatio));
          var px = center;
          var py = center;

          if (currentSeat === 0) {
            px = center + clampedOffset * halfBl;
            py = s - fw - bo;
          } else if (currentSeat === 1) {
            px = s - fw - bo;
            py = center + clampedOffset * halfBl;
          } else if (currentSeat === 2) {
            px = center + clampedOffset * halfBl;
            py = fw + bo;
          } else if (currentSeat === 3) {
            px = fw + bo;
            py = center + clampedOffset * halfBl;
          }

          // Coin overlap check on baseline
          var overlapping = false;
          var sr = this.strikerRadius;
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
            this.strikerSprite.setTint(0xFF4444); // Red flag on illegal overlap
          } else {
            this.strikerSprite.clearTint();
          }

          this.matter.body.setPosition(this.strikerBody, { x: px, y: py });
          this.matter.body.setVelocity(this.strikerBody, { x: 0, y: 0 });
          this.matter.body.setAngularVelocity(this.strikerBody, 0);

          this.strikerSprite.setPosition(px, py);
          this.strikerShadow.setPosition(px + 4, py + 5);
        },

        setupInputHandlers: function() {
          var scene = this;

          this.input.on('pointerdown', function(pointer) {
            if (scene.isShotActive) return;

            var px = scene.strikerBody.position.x;
            var py = scene.strikerBody.position.y;
            var dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, px, py);
            var s = scene.canvasSize;
            var fw = (s - BOARD_PX) / 2;
            var scale = BOARD_PX / 528;
            var bo = 74 * scale;

            // 1. Direct Slingshot Touch on Striker (Carrom Pool Style!)
            if (dist <= scene.strikerRadius * 2.8) {
              if (scene.isStrikerOverlapping) return;
              scene.inputMode = 'slingshot';
              scene.isAiming = true;
              scene.aimStartPoint = { x: px, y: py };
              scene.updateAim(pointer.x, pointer.y);
              return;
            }

            // 2. Baseline Horizontal Slider Touch Zone (near bottom baseline)
            var baselineY = s - fw - bo;
            if (currentSeat === 0 && Math.abs(pointer.y - baselineY) < 55) {
              scene.inputMode = 'baseline_drag';
              scene.handleBaselinePointer(pointer);
              return;
            }

            // 3. Direct Board Touch-To-Aim (touching anywhere else on playing surface)
            if (!scene.isStrikerOverlapping) {
              scene.inputMode = 'touch_aim';
              scene.isAiming = true;
              scene.aimStartPoint = { x: px, y: py };
              var aimAngle = Math.atan2(pointer.y - py, pointer.x - px);
              scene.aimAngle = aimAngle;
              scene.aimPowerRatio = 0.70; // Sweet-spot default power
              scene.renderAimGuide(aimAngle, scene.aimPowerRatio);
            }
          });

          this.input.on('pointermove', function(pointer) {
            if (!pointer.isDown || scene.isShotActive) return;

            if (scene.inputMode === 'slingshot') {
              scene.updateAim(pointer.x, pointer.y);
            } else if (scene.inputMode === 'touch_aim') {
              var px = scene.strikerBody.position.x;
              var py = scene.strikerBody.position.y;
              var aimAngle = Math.atan2(pointer.y - py, pointer.x - px);
              scene.aimAngle = aimAngle;
              scene.renderAimGuide(aimAngle, scene.aimPowerRatio || 0.70);
            } else if (scene.inputMode === 'baseline_drag') {
              scene.handleBaselinePointer(pointer);
            }
          });

          this.input.on('pointerup', function() {
            if (scene.inputMode === 'slingshot') {
              scene.isAiming = false;
              scene.aimGraphics.clear();

              if (!scene.isStrikerOverlapping && scene.aimPowerRatio >= 0.05) {
                scene.executeShot(scene.aimAngle, scene.aimPowerRatio);
              }
            }
            scene.inputMode = null;
          });
        },

        handleBaselinePointer: function(pointer) {
          var s = this.canvasSize;
          var bl = BOARD_PX * 0.54;
          var halfBl = bl / 2;
          var center = s / 2;

          var off = 0;
          if (currentSeat === 0 || currentSeat === 2) {
            off = (pointer.x - center) / halfBl;
          } else {
            off = (pointer.y - center) / halfBl;
          }

          currentOffsetRatio = Math.max(-0.95, Math.min(0.95, off));
          this.updateStrikerPosition();

          sendToReactNative({
            type: 'STRIKER_DRAGGED',
            payload: { offset: currentOffsetRatio, isOverlapping: this.isStrikerOverlapping },
            timestamp: Date.now()
          });
        },

        updateAim: function(curX, curY) {
          var px = this.strikerBody.position.x;
          var py = this.strikerBody.position.y;

          // Slingshot pull vector: pulling backward from striker aims forward
          var pullDx = px - curX;
          var pullDy = py - curY;
          var pullDist = Math.hypot(pullDx, pullDy);

          // If finger is right on the striker (< 14px), treat as cancel zone
          if (pullDist < 14) {
            this.aimGraphics.clear();
            this.aimPowerRatio = 0;
            // Draw soft red cancel indicator
            this.aimGraphics.fillStyle(0xEF4444, 0.35);
            this.aimGraphics.fillCircle(px, py, this.strikerRadius + 8);
            this.aimGraphics.lineStyle(2, 0xEF4444, 0.9);
            this.aimGraphics.strokeCircle(px, py, this.strikerRadius + 8);
            return;
          }

          var angle = Math.atan2(pullDy, pullDx);
          var maxPullPx = 135;
          var clampedPull = Math.min(pullDist, maxPullPx);
          this.aimPowerRatio = Math.max(0.05, Math.min(1.0, (clampedPull - 14) / (maxPullPx - 14)));
          this.aimAngle = angle;

          this.renderAimGuide(angle, this.aimPowerRatio, curX, curY);
        },

        renderAimGuide: function(angle, powerRatio, pullX, pullY) {
          var px = this.strikerBody.position.x;
          var py = this.strikerBody.position.y;
          var sr = this.strikerRadius;
          var cosA = Math.cos(angle);
          var sinA = Math.sin(angle);

          this.aimGraphics.clear();

          // 1. Slingshot Tension Arc & Arrow behind Striker (Carrom Pool Style!)
          var powerCol = powerRatio > 0.75 ? 0xEF4444 : (powerRatio > 0.40 ? 0xF59E0B : 0x2BD67B);
          var arcR = sr + 14 + powerRatio * 16;
          var oppAngle = angle + Math.PI;
          var spread = 0.55 + powerRatio * 0.45;

          // Glowing force arc behind striker
          this.aimGraphics.lineStyle(4, powerCol, 0.85);
          this.aimGraphics.beginPath();
          this.aimGraphics.arc(px, py, arcR, oppAngle - spread, oppAngle + spread);
          this.aimGraphics.strokePath();

          // Elastic slingshot tension lines from striker edges to pull position if pulling
          if (typeof pullX === 'number' && typeof pullY === 'number') {
            var perpX = -sinA * (sr * 0.8);
            var perpY = cosA * (sr * 0.8);
            this.aimGraphics.lineStyle(2.5, powerCol, 0.65);
            this.aimGraphics.lineBetween(px + perpX, py + perpY, pullX, pullY);
            this.aimGraphics.lineBetween(px - perpX, py - perpY, pullX, pullY);

            // Pull handle knob
            this.aimGraphics.fillStyle(powerCol, 0.9);
            this.aimGraphics.fillCircle(pullX, pullY, 12);
            this.aimGraphics.lineStyle(2, 0xFFFFFF, 0.95);
            this.aimGraphics.strokeCircle(pullX, pullY, 12);
          }

          // 2. Forward Raycasting to find nearest collision (Coins & Cushions)
          var nearestDist = 800;
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

          var s = this.canvasSize;
          var fw = (s - BOARD_PX) / 2;
          var boardMin = fw + sr;
          var boardMax = s - fw - sr;
          var wallHitSide = null;

          if (cosA > 0.001) {
            var dRight = (boardMax - px) / cosA;
            if (dRight < nearestDist) { nearestDist = dRight; hitType = 'wall'; wallHitSide = 'right'; }
          } else if (cosA < -0.001) {
            var dLeft = (boardMin - px) / cosA;
            if (dLeft < nearestDist) { nearestDist = dLeft; hitType = 'wall'; wallHitSide = 'left'; }
          }
          if (sinA > 0.001) {
            var dBottom = (boardMax - py) / sinA;
            if (dBottom < nearestDist) { nearestDist = dBottom; hitType = 'wall'; wallHitSide = 'bottom'; }
          } else if (sinA < -0.001) {
            var dTop = (boardMin - py) / sinA;
            if (dTop < nearestDist) { nearestDist = dTop; hitType = 'wall'; wallHitSide = 'top'; }
          }

          var contactX = px + cosA * nearestDist;
          var contactY = py + sinA * nearestDist;

          // 3. Dotted Aim Line with Glowing Trajectory
          var segLen = 9;
          var gapLen = 6;
          var step = segLen + gapLen;
          for (var d = 0; d < nearestDist; d += step) {
            var curD1 = d;
            var curD2 = Math.min(d + segLen, nearestDist);
            var alpha = 0.85 * (1 - (d / (nearestDist + 200)) * 0.4);
            this.aimGraphics.lineStyle(2.5, powerCol, alpha);
            this.aimGraphics.lineBetween(
              px + cosA * curD1, py + sinA * curD1,
              px + cosA * curD2, py + sinA * curD2
            );
          }

          // 4. Ghost Striker at Contact Point
          this.aimGraphics.lineStyle(2, powerCol, 0.75);
          this.aimGraphics.strokeCircle(contactX, contactY, sr);
          this.aimGraphics.fillStyle(powerCol, 0.18);
          this.aimGraphics.fillCircle(contactX, contactY, sr);

          // 5. If Target is a Coin -> Render Deflection Trajectory Line & Target Impact Arrow!
          if (hitType === 'coin' && hitCoin && hitCoin.body) {
            var targetX = hitCoin.body.position.x;
            var targetY = hitCoin.body.position.y;
            var normX = targetX - contactX;
            var normY = targetY - contactY;
            var normDist = Math.hypot(normX, normY) || 1;
            var deflDirX = normX / normDist;
            var deflDirY = normY / normDist;
            var deflDist = Math.min(130, 45 + powerRatio * 85);

            for (var dd = 0; dd < deflDist; dd += step) {
              var d1 = dd;
              var d2 = Math.min(dd + segLen, deflDist);
              this.aimGraphics.lineStyle(2.5, 0xF5ECD2, 0.90); // Crisp cream trajectory for target coin
              this.aimGraphics.lineBetween(
                targetX + deflDirX * d1, targetY + deflDirY * d1,
                targetX + deflDirX * d2, targetY + deflDirY * d2
              );
            }

            // Target rollout ghost coin
            this.aimGraphics.lineStyle(1.8, 0xF5ECD2, 0.95);
            this.aimGraphics.strokeCircle(targetX + deflDirX * deflDist, targetY + deflDirY * deflDist, COIN_RADIUS_PX);
            this.aimGraphics.fillStyle(0xF5ECD2, 0.25);
            this.aimGraphics.fillCircle(targetX + deflDirX * deflDist, targetY + deflDirY * deflDist, COIN_RADIUS_PX);
          } else if (hitType === 'wall') {
            // Cushion rebound reflection angle!
            var reflAngle = angle;
            if (wallHitSide === 'left' || wallHitSide === 'right') {
              reflAngle = Math.PI - angle;
            } else {
              reflAngle = -angle;
            }
            var rCos = Math.cos(reflAngle);
            var rSin = Math.sin(reflAngle);
            var reboundDist = Math.min(100, 30 + powerRatio * 70);

            for (var rd = 0; rd < reboundDist; rd += step) {
              var rd1 = rd;
              var rd2 = Math.min(rd + segLen, reboundDist);
              this.aimGraphics.lineStyle(2, powerCol, 0.55);
              this.aimGraphics.lineBetween(
                contactX + rCos * rd1, contactY + rSin * rd1,
                contactX + rCos * rd2, contactY + rSin * rd2
              );
            }
          }

          sendToReactNative({
            type: 'AIM_CHANGED',
            payload: {
              angle: angle,
              powerRatio: powerRatio,
              speed_cm_s: STRIKER_MIN_SPEED_CM_S + powerRatio * (STRIKER_MAX_SPEED_CM_S - STRIKER_MIN_SPEED_CM_S)
            },
            timestamp: Date.now()
          });
        },

        executeShot: function(angle, powerRatio) {
          if (this.isShotActive || !this.strikerBody || this.isStrikerOverlapping) return;

          this.isShotActive = true;
          this.restStartTime = 0;
          this.hasReportedSettled = false;
          this.shotStartTime = Date.now();
          this.pocketedInCurrentShot = [];

          var speedCmS = STRIKER_MIN_SPEED_CM_S + powerRatio * (STRIKER_MAX_SPEED_CM_S - STRIKER_MIN_SPEED_CM_S);
          var vStep = speedCmSToStepVelocity(speedCmS, BASE_DT_SEC);
          var vxStep = Math.cos(angle) * vStep;
          var vyStep = Math.sin(angle) * vStep;

          // Direct physical velocity setting (no raw impulses)
          this.matter.body.setVelocity(this.strikerBody, { x: vxStep, y: vyStep });

          // Audio & Animation Feedback
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
                    strikerPocketed: this.strikerIsPocketed
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
          backgroundColor: '#07130E',
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
