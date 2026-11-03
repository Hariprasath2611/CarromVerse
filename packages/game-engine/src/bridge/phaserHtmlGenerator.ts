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

      // TEXTURE GENERATOR (DPR-RESPONSIVE, HIGH-FIDELITY VECTOR CANVASES)
      function generateTextures(scene, theme) {
        var dpr = typeof window !== 'undefined' && window.devicePixelRatio ? Math.min(3, Math.max(1, Math.round(window.devicePixelRatio))) : 2;

        // 1. Coins Helper (Carrom Pool Tournament Ivory & Ebony & Ruby Queen)
        function drawCoinCanvas(ctx, w, h, s, type) {
          var cx = w / 2;
          var faceCy = 110 * s;
          var thickCy = 122 * s;
          var rFace = 100 * s;

          var isWhite = type === 'white';
          var isBlack = type === 'black';

          var colThickness = isWhite ? '#B29E72' : (isBlack ? '#070908' : '#7A0E1C');
          var colFaceInner = isWhite ? '#FFFFFF' : (isBlack ? '#3B4340' : '#FF4D6D');
          var colFaceOuter = isWhite ? '#E5D6B6' : (isBlack ? '#131815' : '#B81D39');
          var colGrooves = isWhite ? '#CBB890' : (isBlack ? '#28302C' : '#FFC2CC');
          var colEmblemDot = isWhite ? '#C2AF84' : (isBlack ? '#D97706' : '#FFD0D8');
          var highlightAlpha = isWhite ? 0.60 : (isBlack ? 0.22 : 0.55);

          // 1. Edge-thickness disc
          ctx.fillStyle = colThickness;
          ctx.beginPath();
          ctx.arc(cx, thickCy, rFace, 0, Math.PI * 2);
          ctx.fill();

          // 2. Face disc with radial gradient
          var faceGrad = ctx.createRadialGradient(cx - 12 * s, faceCy - 15 * s, 8 * s, cx, faceCy, rFace);
          faceGrad.addColorStop(0, colFaceInner);
          if (isBlack) faceGrad.addColorStop(0.4, '#262D29');
          faceGrad.addColorStop(1, colFaceOuter);
          ctx.fillStyle = faceGrad;
          ctx.beginPath();
          ctx.arc(cx, faceCy, rFace, 0, Math.PI * 2);
          ctx.fill();

          // Outer face border
          ctx.strokeStyle = colGrooves;
          ctx.lineWidth = 1.5 * s;
          ctx.stroke();

          // 3. Concentric rings r84 & r66
          ctx.lineWidth = 2.5 * s;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 84 * s, 0, Math.PI * 2);
          ctx.stroke();

          ctx.lineWidth = 1.8 * s;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 66 * s, 0, Math.PI * 2);
          ctx.stroke();

          // 4. Center emblem
          ctx.strokeStyle = colGrooves;
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 30 * s, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = colEmblemDot;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 8 * s, 0, Math.PI * 2);
          ctx.fill();

          // 5. Specular highlight
          ctx.save();
          ctx.translate(72 * s, 60 * s);
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

        // 2. Striker Textures (Carrom Pool Signature Royal Purple Medallion with Gold Mandala & Ruby Gem)
        var strikerW = Math.round(98 * dpr);
        var strikerH = Math.round(98 * (276 / 260) * dpr);
        var strikerS = strikerW / 260;

        function drawStrikerCanvas(ctx, w, h, s, skinKey) {
          var cx = w / 2;
          var faceCy = 130 * s;
          var thickCy = 144 * s;
          var rFace = 120 * s;

          // 1. Thickness disc (dark rich violet base)
          ctx.fillStyle = '#2A0740';
          ctx.beginPath();
          ctx.arc(cx, thickCy, rFace, 0, Math.PI * 2);
          ctx.fill();

          // 2. Royal Purple outer rim with radial gradient
          var rimGrad = ctx.createRadialGradient(cx - 15 * s, faceCy - 20 * s, 15 * s, cx, faceCy, rFace);
          rimGrad.addColorStop(0, '#6B1B9A');
          rimGrad.addColorStop(0.5, '#4A126D');
          rimGrad.addColorStop(0.85, '#3B0957');
          rimGrad.addColorStop(1, '#2E0644');
          ctx.fillStyle = rimGrad;
          ctx.beginPath();
          ctx.arc(cx, faceCy, rFace, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#2A0740';
          ctx.lineWidth = 2 * s;
          ctx.stroke();

          // 3. Golden Gear/Mandala Ring r100
          ctx.fillStyle = '#F59E0B';
          ctx.beginPath();
          ctx.arc(cx, faceCy, 100 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#B45309';
          ctx.lineWidth = 2 * s;
          ctx.stroke();

          // Mandala gear notches (12 teeth around r100)
          ctx.fillStyle = '#D97706';
          for (var gi = 0; gi < 12; gi++) {
            var gAng = (gi * Math.PI * 2) / 12;
            var gnx = cx + Math.cos(gAng) * 94 * s;
            var gny = faceCy + Math.sin(gAng) * 94 * s;
            ctx.beginPath();
            ctx.arc(gnx, gny, 5 * s, 0, Math.PI * 2);
            ctx.fill();
          }

          // 4. Inner Royal Purple Medallion r84
          var medGrad = ctx.createRadialGradient(cx - 10 * s, faceCy - 10 * s, 10 * s, cx, faceCy, 84 * s);
          medGrad.addColorStop(0, '#5C1687');
          medGrad.addColorStop(0.8, '#430D63');
          medGrad.addColorStop(1, '#33084C');
          ctx.fillStyle = medGrad;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 84 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#E9B949';
          ctx.lineWidth = 2.5 * s;
          ctx.stroke();

          // 5. Gold Inlay Star / Ring r55
          ctx.strokeStyle = '#FDE68A';
          ctx.lineWidth = 2 * s;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 55 * s, 0, Math.PI * 2);
          ctx.stroke();

          // 6. Central Ruby Jewel r24 with 3D glass dome
          var rubyGrad = ctx.createRadialGradient(cx - 5 * s, faceCy - 6 * s, 2 * s, cx, faceCy, 24 * s);
          rubyGrad.addColorStop(0, '#FF4D6D');
          rubyGrad.addColorStop(0.4, '#DC2626');
          rubyGrad.addColorStop(0.85, '#991B1B');
          rubyGrad.addColorStop(1, '#5C0808');
          ctx.fillStyle = rubyGrad;
          ctx.beginPath();
          ctx.arc(cx, faceCy, 24 * s, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#E9B949';
          ctx.lineWidth = 2 * s;
          ctx.stroke();

          // Center jewel glint
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(cx - 6 * s, faceCy - 6 * s, 4 * s, 0, Math.PI * 2);
          ctx.fill();

          // 7. Top curved specular highlight (Carrom Pool 3D look)
          ctx.save();
          ctx.translate(cx - 28 * s, faceCy - 48 * s);
          ctx.rotate(-35 * Math.PI / 180);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
          ctx.beginPath();
          if (ctx.ellipse) {
            ctx.ellipse(0, 0, 28 * s, 10 * s, 0, 0, Math.PI * 2);
          } else {
            ctx.arc(0, 0, 20 * s, 0, Math.PI * 2);
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
          var scale = BOARD_PX / 528;

          var bo = 74 * scale; // Baseline center line offset from cushion
          var halfBl = 156 * scale; // Distance from center to baseline discs
          var pillLen = 336 * scale; // Full length of baseline pill
          var pillH = 24 * scale; // Thickness of baseline pill
          var pillRx = 12 * scale; // Corner radius of baseline pill
          var discR = 9.5 * scale; // Radius of amber baseline discs
          var cornerDiscR = 11.5 * scale; // Radius of 4 corner discs

          this.boardGraphics.clear();
          this.pocketsGroup.clear(true, true);

          // 1. Frame: Rounded rect r32 with rich mahogany wood
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.frameColor || '#38160E').color, 1);
          this.boardGraphics.fillRoundedRect(0, 0, s, s, 32 * (s / 640));

          // Brass Inlay Line inset 8 (2 units, 70% opacity)
          var brassCol = Phaser.Display.Color.HexStringToColor(theme.frameAccent || '#C9943B').color;
          this.boardGraphics.lineStyle(2, brassCol, 0.70);
          this.boardGraphics.strokeRoundedRect(8 * (s / 640), 8 * (s / 640), s - 16 * (s / 640), s - 16 * (s / 640), 24 * (s / 640));

          // 45 deg miter joints
          this.boardGraphics.lineStyle(1.5, 0x1E0C06, 0.6);
          this.boardGraphics.lineBetween(0, 0, fw, fw);
          this.boardGraphics.lineBetween(s, 0, s - fw, fw);
          this.boardGraphics.lineBetween(0, s, fw, s - fw);
          this.boardGraphics.lineBetween(s, s, s - fw, s - fw);

          // Inner Cushion Lip (Rect in #220D07)
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.frameInnerCushion || '#220D07').color, 1);
          this.boardGraphics.fillRect(fw - 8, fw - 8, surfSize + 16, surfSize + 16);

          // 2. Playing Surface (Birchwood #E5CBA7)
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.surfaceBg || '#E5CBA7').color, 1);
          this.boardGraphics.fillRoundedRect(fw, fw, surfSize, surfSize, 4);

          // Surface fine border
          var grainCol = Phaser.Display.Color.HexStringToColor(theme.surfaceGrain || '#CEAF85').color;
          this.boardGraphics.lineStyle(2, grainCol, 0.9);
          this.boardGraphics.strokeRoundedRect(fw, fw, surfSize, surfSize, 4);

          // Horizontal Wood Grain Lines (Carrom Pool Style!)
          this.boardGraphics.lineStyle(1, grainCol, 0.18);
          var grainStep = 14 * scale;
          for (var gy = fw + grainStep; gy < s - fw; gy += grainStep) {
            this.boardGraphics.lineBetween(fw, gy, s - fw, gy);
          }

          // 3. 4 Bright Amber/Orange Curved Corner Pocket Brackets (Carrom Pool Signature!)
          var bracketCol = Phaser.Display.Color.HexStringToColor(theme.cornerBracketColor || '#E87A1E').color;
          var bracketHi = Phaser.Display.Color.HexStringToColor(theme.cornerBracketHighlight || '#FFB04D').color;
          var pocketOffset = 24 * scale;
          var pr = POCKET_RADIUS_PX;

          var corners = [
            { cx: fw + pocketOffset, cy: fw + pocketOffset, start: Math.PI, end: Math.PI * 1.5 },
            { cx: s - fw - pocketOffset, cy: fw + pocketOffset, start: Math.PI * 1.5, end: Math.PI * 2.0 },
            { cx: s - fw - pocketOffset, cy: s - fw - pocketOffset, start: 0, end: Math.PI * 0.5 },
            { cx: fw + pocketOffset, cy: s - fw - pocketOffset, start: Math.PI * 0.5, end: Math.PI }
          ];

          corners.forEach(function(cDef) {
            // Main amber/orange curved bracket
            activeScene.boardGraphics.lineStyle(8 * scale, bracketCol, 1.0);
            activeScene.boardGraphics.beginPath();
            activeScene.boardGraphics.arc(cDef.cx, cDef.cy, pr + 11 * scale, cDef.start - 0.15, cDef.end + 0.15);
            activeScene.boardGraphics.strokePath();

            // 3D Highlight curve
            activeScene.boardGraphics.lineStyle(2.5 * scale, bracketHi, 0.85);
            activeScene.boardGraphics.beginPath();
            activeScene.boardGraphics.arc(cDef.cx, cDef.cy, pr + 13 * scale, cDef.start - 0.08, cDef.end + 0.08);
            activeScene.boardGraphics.strokePath();
          });

          // 4. Diagonal Foul Lines (dashed fine lines)
          var markCol = Phaser.Display.Color.HexStringToColor(theme.markingsColor || '#5C2807').color;
          this.boardGraphics.lineStyle(1.5, markCol, 0.80);
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

          drawDashedLine(this.boardGraphics, center - 96 * scale, center - 96 * scale, center - 200 * scale, center - 200 * scale, 6, 6);
          drawDashedLine(this.boardGraphics, center + 96 * scale, center - 96 * scale, center + 200 * scale, center - 200 * scale, 6, 6);
          drawDashedLine(this.boardGraphics, center - 96 * scale, center + 96 * scale, center - 200 * scale, center + 200 * scale, 6, 6);
          drawDashedLine(this.boardGraphics, center + 96 * scale, center + 96 * scale, center + 200 * scale, center + 200 * scale, 6, 6);

          // 5. Baselines: 4 Pill Outlines (stroke 2, no fill)
          this.boardGraphics.lineStyle(2, markCol, 0.95);
          // Top Baseline
          this.boardGraphics.strokeRoundedRect(center - pillLen / 2, fw + bo - pillH / 2, pillLen, pillH, pillRx);
          // Bottom Baseline
          this.boardGraphics.strokeRoundedRect(center - pillLen / 2, s - fw - bo - pillH / 2, pillLen, pillH, pillRx);
          // Left Baseline
          this.boardGraphics.strokeRoundedRect(fw + bo - pillH / 2, center - pillLen / 2, pillH, pillLen, pillRx);
          // Right Baseline
          this.boardGraphics.strokeRoundedRect(s - fw - bo - pillH / 2, center - pillLen / 2, pillH, pillLen, pillRx);

          // Solid Amber/Orange Circular Wooden Discs at Baseline Ends (Carrom Pool Style!)
          var amberDiscCol = Phaser.Display.Color.HexStringToColor(theme.baselineDiscColor || '#D97706').color;
          var discOutline = Phaser.Display.Color.HexStringToColor(theme.baselineDiscOutline || '#4A1E06').color;

          var drawAmberDisc = function(g, dx, dy, rad) {
            g.fillStyle(amberDiscCol, 1);
            g.fillCircle(dx, dy, rad);
            g.lineStyle(1.6, discOutline, 0.95);
            g.strokeCircle(dx, dy, rad);
            // Subtle 3D highlight dot
            g.fillStyle(0xFFE8B2, 0.65);
            g.fillCircle(dx - rad * 0.3, dy - rad * 0.3, rad * 0.3);
          };

          // 8 Baseline End Discs:
          drawAmberDisc(this.boardGraphics, center - halfBl, fw + bo, discR);
          drawAmberDisc(this.boardGraphics, center + halfBl, fw + bo, discR);
          drawAmberDisc(this.boardGraphics, center - halfBl, s - fw - bo, discR);
          drawAmberDisc(this.boardGraphics, center + halfBl, s - fw - bo, discR);
          drawAmberDisc(this.boardGraphics, fw + bo, center - halfBl, discR);
          drawAmberDisc(this.boardGraphics, fw + bo, center + halfBl, discR);
          drawAmberDisc(this.boardGraphics, s - fw - bo, center - halfBl, discR);
          drawAmberDisc(this.boardGraphics, s - fw - bo, center + halfBl, discR);

          // 4 Corner Amber Discs (Carrom Pool Style!):
          var cornerOffset = 136 * scale;
          drawAmberDisc(this.boardGraphics, center - cornerOffset, center - cornerOffset, cornerDiscR);
          drawAmberDisc(this.boardGraphics, center + cornerOffset, center - cornerOffset, cornerDiscR);
          drawAmberDisc(this.boardGraphics, center - cornerOffset, center + cornerOffset, cornerDiscR);
          drawAmberDisc(this.boardGraphics, center + cornerOffset, center + cornerOffset, cornerDiscR);

          // 6. Center Concentric Wood-Etched Rings (Clean, authentic Carrom Pool style!)
          // Outer coin cluster ring (fits 19 coins)
          this.boardGraphics.lineStyle(2, markCol, 0.9);
          this.boardGraphics.strokeCircle(center, center, 88 * scale);
          this.boardGraphics.lineStyle(1, markCol, 0.45);
          this.boardGraphics.strokeCircle(center, center, 84 * scale);

          // Inner Queen circle (fits Queen coin)
          this.boardGraphics.lineStyle(2, markCol, 0.9);
          this.boardGraphics.strokeCircle(center, center, 24 * scale);
          this.boardGraphics.lineStyle(1, markCol, 0.45);
          this.boardGraphics.strokeCircle(center, center, 14 * scale);

          // Center wood dot
          this.boardGraphics.fillStyle(markCol, 0.85);
          this.boardGraphics.fillCircle(center, center, 4 * scale);

          // 7. Corner Pocket Sprites
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

          // If finger is within 15px of striker center, cancel zone
          if (pullDist < 16) {
            this.aimGraphics.clear();
            this.aimPowerRatio = 0;
            // Soft red cancel zone ring
            this.aimGraphics.fillStyle(0xEF4444, 0.25);
            this.aimGraphics.fillCircle(px, py, this.strikerRadius + 6);
            this.aimGraphics.lineStyle(2, 0xEF4444, 0.85);
            this.aimGraphics.strokeCircle(px, py, this.strikerRadius + 6);
            return;
          }

          var angle = Math.atan2(pullDy, pullDx);
          var maxPullPx = 130;
          var clampedPull = Math.min(pullDist, maxPullPx);
          this.aimPowerRatio = Math.max(0.05, Math.min(1.0, (clampedPull - 16) / (maxPullPx - 16)));
          this.aimAngle = angle;

          this.renderAimGuide(angle, this.aimPowerRatio, curX, curY);
        },

        renderAimGuide: function(angle, powerRatio, pullX, pullY) {
          var px = this.strikerBody.position.x;
          var py = this.strikerBody.position.y;
          var sr = this.strikerRadius;
          var cosA = Math.cos(angle);
          var sinA = Math.sin(angle);
          var s = this.canvasSize;
          var scale = BOARD_PX / 528;

          this.aimGraphics.clear();

          // 1. Translucent Dashed Touch Boundary Circle centered on striker (Carrom Pool Screenshot 5!)
          var boundaryR = 95 * scale;
          this.aimGraphics.fillStyle(0xFFFFFF, 0.035);
          this.aimGraphics.fillCircle(px, py, boundaryR);

          // Dashed border (28 segments)
          var nDashes = 28;
          var dStep = (Math.PI * 2) / nDashes;
          this.aimGraphics.lineStyle(1.6, 0xFFFFFF, 0.26);
          for (var b = 0; b < nDashes; b += 2) {
            this.aimGraphics.beginPath();
            this.aimGraphics.arc(px, py, boundaryR, b * dStep, (b + 1) * dStep);
            this.aimGraphics.strokePath();
          }

          // 2. Back-Trace Dotted Line to Touch Pointer (Screenshot 5!)
          if (typeof pullX === 'number' && typeof pullY === 'number') {
            var backDx = pullX - px;
            var backDy = pullY - py;
            var backDist = Math.hypot(backDx, backDy);
            if (backDist > sr) {
              var bDirX = backDx / backDist;
              var bDirY = backDy / backDist;
              for (var bd = sr + 8; bd < backDist; bd += 11) {
                this.aimGraphics.fillStyle(0xFFFFFF, 0.55);
                this.aimGraphics.fillCircle(px + bDirX * bd, py + bDirY * bd, 2.4);
              }
            }
          }

          // 3. Tapered Gradient Power Arrow (Originates at striker edge and points FORWARD along angle!)
          var bodyLen = 22 + powerRatio * 62;
          var headLen = 18;
          var arrowTotalLen = bodyLen + headLen;

          var arrowStartX = px + cosA * sr;
          var arrowStartY = py + sinA * sr;

          // Normal perpendicular unit vector for width
          var normX = -sinA;
          var normY = cosA;

          var baseW = 15; // Width at striker base
          var neckW = 11; // Width before arrowhead
          var headW = 23; // Arrowhead wings width

          var neckX = arrowStartX + cosA * bodyLen;
          var neckY = arrowStartY + sinA * bodyLen;
          var tipX = arrowStartX + cosA * arrowTotalLen;
          var tipY = arrowStartY + sinA * arrowTotalLen;

          // Arrow Body polygon (Tapered trapezoid)
          var p1x = arrowStartX + normX * (baseW / 2);
          var p1y = arrowStartY + normY * (baseW / 2);
          var p2x = arrowStartX - normX * (baseW / 2);
          var p2y = arrowStartY - normY * (baseW / 2);
          var p3x = neckX - normX * (neckW / 2);
          var p3y = neckY - normY * (neckW / 2);
          var p4x = neckX + normX * (neckW / 2);
          var p4y = neckY + normY * (neckW / 2);

          // Arrow Head polygon (Triangular point)
          var h1x = neckX + normX * (headW / 2);
          var h1y = neckY + normY * (headW / 2);
          var h2x = neckX - normX * (headW / 2);
          var h2y = neckY - normY * (headW / 2);

          // Render Arrow Body: Warm Yellow (#F59E0B) with bright gold core
          this.aimGraphics.fillStyle(0xF59E0B, 0.95);
          this.aimGraphics.fillPoints([
            { x: p1x, y: p1y },
            { x: p2x, y: p2y },
            { x: p3x, y: p3y },
            { x: p4x, y: p4y }
          ], true);

          // Yellow inner core
          this.aimGraphics.fillStyle(0xFDE047, 0.85);
          this.aimGraphics.fillPoints([
            { x: arrowStartX + normX * (baseW * 0.3), y: arrowStartY + normY * (baseW * 0.3) },
            { x: arrowStartX - normX * (baseW * 0.3), y: arrowStartY - normY * (baseW * 0.3) },
            { x: neckX - normX * (neckW * 0.3), y: neckY - normY * (neckW * 0.3) },
            { x: neckX + normX * (neckW * 0.3), y: neckY + normY * (neckW * 0.3) }
          ], true);

          // Render Arrow Head: Fiery Red (#EF4444 / #DC2626) with sharp point
          this.aimGraphics.fillStyle(0xEF4444, 0.98);
          this.aimGraphics.fillTriangle(h1x, h1y, h2x, h2y, tipX, tipY);

          // Crisp dark outline around entire arrow
          this.aimGraphics.lineStyle(1.6, 0x7F1D1D, 0.95);
          this.aimGraphics.strokePoints([
            { x: p1x, y: p1y },
            { x: p2x, y: p2y },
            { x: p3x, y: p3y },
            { x: h2x, y: h2y },
            { x: tipX, y: tipY },
            { x: h1x, y: h1y },
            { x: p4x, y: p4y },
            { x: p1x, y: p1y }
          ], true);

          // 4. Forward Raycasting to find nearest collision (Coins & Cushions)
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

          // 5. Crisp Pure White Dotted Trajectory Line from arrow tip to contact point
          var arrowTipDist = sr + arrowTotalLen;
          var dotSpacing = 11.5;
          for (var td = arrowTipDist; td < nearestDist; td += dotSpacing) {
            var dotX = px + cosA * td;
            var dotY = py + sinA * td;
            this.aimGraphics.fillStyle(0xFFFFFF, 0.95);
            this.aimGraphics.fillCircle(dotX, dotY, 2.7);
          }

          // 6. Ghost Striker at Contact Point (Screenshot 5!)
          this.aimGraphics.lineStyle(1.8, 0xFFFFFF, 0.85);
          this.aimGraphics.strokeCircle(contactX, contactY, sr);
          this.aimGraphics.fillStyle(0xFFFFFF, 0.12);
          this.aimGraphics.fillCircle(contactX, contactY, sr);

          // 7. If Target is a Coin -> Render Deflection Trajectory & Ghost Coin!
          if (hitType === 'coin' && hitCoin && hitCoin.body) {
            var targetX = hitCoin.body.position.x;
            var targetY = hitCoin.body.position.y;
            var normX2 = targetX - contactX;
            var normY2 = targetY - contactY;
            var normDist = Math.hypot(normX2, normY2) || 1;
            var deflDirX = normX2 / normDist;
            var deflDirY = normY2 / normDist;
            var deflDist = Math.min(140, 45 + powerRatio * 85);

            for (var dd = 0; dd < deflDist; dd += dotSpacing) {
              var cDotX = targetX + deflDirX * dd;
              var cDotY = targetY + deflDirY * dd;
              this.aimGraphics.fillStyle(0xFFFFFF, 0.95);
              this.aimGraphics.fillCircle(cDotX, cDotY, 2.7);
            }

            // Target rollout ghost coin
            this.aimGraphics.lineStyle(1.8, 0xFFFFFF, 0.90);
            this.aimGraphics.strokeCircle(targetX + deflDirX * deflDist, targetY + deflDirY * deflDist, COIN_RADIUS_PX);
            this.aimGraphics.fillStyle(0xFFFFFF, 0.18);
            this.aimGraphics.fillCircle(targetX + deflDirX * deflDist, targetY + deflDirY * deflDist, COIN_RADIUS_PX);
          } else if (hitType === 'wall') {
            // Cushion rebound reflection angle
            var reflAngle = angle;
            if (wallHitSide === 'left' || wallHitSide === 'right') {
              reflAngle = Math.PI - angle;
            } else {
              reflAngle = -angle;
            }
            var rCos = Math.cos(reflAngle);
            var rSin = Math.sin(reflAngle);
            var reboundDist = Math.min(110, 35 + powerRatio * 75);

            for (var rd = 0; rd < reboundDist; rd += dotSpacing) {
              var rDotX = contactX + rCos * rd;
              var rDotY = contactY + rSin * rd;
              this.aimGraphics.fillStyle(0xFFFFFF, 0.75);
              this.aimGraphics.fillCircle(rDotX, rDotY, 2.5);
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
