import { BoardThemeId, StrikerSkin } from '../types/GameTypes.js';

export interface PhaserHtmlOptions {
  themeId?: BoardThemeId | string;
  strikerSkin?: StrikerSkin | string;
  activeSeat?: number;
  canvasSize?: number;
  debugOverlay?: boolean;
}

export function generateCarromPhaserHtml(options: PhaserHtmlOptions = {}): string {
  const initialTheme = options.themeId || 'forest';
  const initialSkin = options.strikerSkin || 'emerald';
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
      background-color: #07130E;
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
      box-shadow: 0 10px 35px rgba(0, 0, 0, 0.9);
      border-radius: 8px;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
</head>
<body>
  <div id="carrom-game-container"></div>

  <script>
    (function() {
      // 1. PHYSICAL CONSTANTS (Single Source of Truth)
      var BOARD_PX = 740;
      var BOARD_CM = 74;
      var PX_PER_CM = BOARD_PX / BOARD_CM; // 10.0 px per cm

      var COIN_RADIUS_CM = 1.55;
      var COIN_RADIUS_PX = COIN_RADIUS_CM * PX_PER_CM; // 15.5 px
      var COIN_MASS = 5.0;

      var STRIKER_RADIUS_CM = 2.05;
      var STRIKER_RADIUS_PX = STRIKER_RADIUS_CM * PX_PER_CM; // 20.5 px
      var STRIKER_MASS = 15.0; // 3:1 mass ratio

      var POCKET_RADIUS_CM = 3.9;
      var POCKET_RADIUS_PX = POCKET_RADIUS_CM * PX_PER_CM; // 39.0 px (visible hole radius)
      var POCKET_CAPTURE_RADIUS = POCKET_RADIUS_PX * 0.85; // 33.15 px (~3.3 cm capture radius)
      var POCKET_SUCTION_RADIUS = POCKET_RADIUS_PX * 1.20; // 46.8 px suction zone

      var WALL_THICKNESS_CM = 5.0;
      var WALL_THICKNESS_PX = WALL_THICKNESS_CM * PX_PER_CM; // 50.0 px

      var STRIKER_MIN_SPEED_CM_S = 40.0;
      var STRIKER_MAX_SPEED_CM_S = 350.0;
      var REST_SPEED_THRESHOLD_CM_S = 2.0;
      var ANGULAR_REST_THRESHOLD = 0.05;

      var FRICTION_DECEL_CM_S2 = 90.0;
      var VISCOUS_DAMPING = 0.15;
      var ANGULAR_DAMPING_PER_SEC = 6.0;

      var COIN_RESTITUTION = 0.88;
      var WALL_BOUNCE_DAMPING = 0.65;

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
        var key = id ? id.toLowerCase() : 'forest';
        return BOARD_THEMES[key] || BOARD_THEMES['forest'];
      }

      // Convert speed in cm/s to step velocity (px/step)
      function speedCmSToStepVelocity(speedCmS, dtSec) {
        return speedCmS * PX_PER_CM * dtSec;
      }

      // Convert step velocity (px/step) to speed in cm/s
      function stepVelocityToSpeedCmS(stepVel, dtSec) {
        return dtSec > 0 ? (stepVel / dtSec) / PX_PER_CM : 0;
      }

      // TEXTURE GENERATOR
      function generateTextures(scene, theme) {
        createCanvasTexture(scene, 'tex_coin_shadow', 96, 96, function(ctx) {
          var grad = ctx.createRadialGradient(48, 48, 14, 48, 48, 46);
          grad.addColorStop(0, 'rgba(0,0,0,0.6)');
          grad.addColorStop(0.6, 'rgba(0,0,0,0.25)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(48, 48, 46, 0, Math.PI * 2);
          ctx.fill();
        });

        createCanvasTexture(scene, 'tex_striker_shadow', 128, 128, function(ctx) {
          var grad = ctx.createRadialGradient(64, 64, 18, 64, 64, 62);
          grad.addColorStop(0, 'rgba(0,0,0,0.65)');
          grad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(64, 64, 62, 0, Math.PI * 2);
          ctx.fill();
        });

        createCanvasTexture(scene, 'tex_coin_white', 96, 96, function(ctx) {
          var r = 44;
          var g = ctx.createRadialGradient(38, 38, 4, 48, 48, r);
          g.addColorStop(0, '#FFFFFF');
          g.addColorStop(0.4, '#F7F3E9');
          g.addColorStop(0.85, '#D5CBB5');
          g.addColorStop(1, '#B8AB91');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(48, 48, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#B3A892';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.strokeStyle = 'rgba(179, 168, 146, 0.55)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(48, 48, r * 0.72, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(48, 48, r * 0.44, 0, Math.PI * 2);
          ctx.stroke();
        });

        createCanvasTexture(scene, 'tex_coin_black', 96, 96, function(ctx) {
          var r = 44;
          var g = ctx.createRadialGradient(38, 38, 4, 48, 48, r);
          g.addColorStop(0, '#3A3E45');
          g.addColorStop(0.3, '#22252A');
          g.addColorStop(0.85, '#121417');
          g.addColorStop(1, '#08090A');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(48, 48, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#4B5563';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.strokeStyle = 'rgba(156, 163, 175, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(48, 48, r * 0.72, 0, Math.PI * 2);
          ctx.stroke();
        });

        createCanvasTexture(scene, 'tex_coin_queen', 96, 96, function(ctx) {
          var r = 44;
          var g = ctx.createRadialGradient(38, 38, 4, 48, 48, r);
          g.addColorStop(0, '#FF4D4D');
          g.addColorStop(0.35, '#DC2626');
          g.addColorStop(0.85, '#991B1B');
          g.addColorStop(1, '#660F0F');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(48, 48, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#FBBF24';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(48, 48, r * 0.22, 0, Math.PI * 2);
          ctx.fill();
        });

        var strikerSkins = {
          emerald: { colors: ['#34D399', '#059669', '#044E3B'], rim: '#6EE7B7', inner: '#065F46' },
          classic: { colors: ['#FFFFFF', '#E2E8F0', '#94A3B8'], rim: '#CBD5E1', inner: '#64748B' },
          royal: { colors: ['#60A5FA', '#2563EB', '#1E3A8A'], rim: '#93C5FD', inner: '#1D4ED8' },
          gold: { colors: ['#FDE047', '#EAB308', '#854D0E'], rim: '#FEF08A', inner: '#A16207' }
        };

        Object.keys(strikerSkins).forEach(function(sKey) {
          var cfg = strikerSkins[sKey];
          createCanvasTexture(scene, 'tex_striker_' + sKey, 128, 128, function(ctx) {
            var r = 59;
            var g = ctx.createRadialGradient(50, 50, 6, 64, 64, r);
            g.addColorStop(0, cfg.colors[0]);
            g.addColorStop(0.5, cfg.colors[1]);
            g.addColorStop(1, cfg.colors[2]);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(64, 64, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = cfg.rim;
            ctx.lineWidth = 4;
            ctx.stroke();
            ctx.fillStyle = cfg.inner;
            ctx.beginPath();
            ctx.arc(64, 64, r * 0.38, 0, Math.PI * 2);
            ctx.fill();
          });
        });

        createCanvasTexture(scene, 'tex_pocket', 96, 96, function(ctx) {
          var r = 44;
          var g = ctx.createRadialGradient(48, 48, 4, 48, 48, r);
          g.addColorStop(0, '#000000');
          g.addColorStop(0.7, '#07090C');
          g.addColorStop(0.92, '#1E232B');
          g.addColorStop(1, '#2D3440');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(48, 48, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = theme.pocketRimColor;
          ctx.lineWidth = 3;
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
          scene.textures.addCanvas(key, canvas);
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
          var bo = BOARD_PX * 0.135;
          var bl = BOARD_PX * 0.54;
          var bcr = BOARD_PX * 0.019;

          this.boardGraphics.clear();
          this.pocketsGroup.clear(true, true);

          // 1. Frame
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.frameColor).color, 1);
          this.boardGraphics.fillRect(0, 0, s, s);

          this.boardGraphics.lineStyle(3, Phaser.Display.Color.HexStringToColor(theme.frameAccent).color, 0.9);
          this.boardGraphics.strokeRect(2, 2, s - 4, s - 4);

          // 45 deg miter joints
          this.boardGraphics.lineStyle(1.5, 0x000000, 0.5);
          this.boardGraphics.lineBetween(0, 0, fw, fw);
          this.boardGraphics.lineBetween(s, 0, s - fw, fw);
          this.boardGraphics.lineBetween(0, s, fw, s - fw);
          this.boardGraphics.lineBetween(s, s, s - fw, s - fw);

          // 2. Playing Surface
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.surfaceBg).color, 1);
          this.boardGraphics.fillRect(fw, fw, surfSize, surfSize);

          // Inner Cushion bevel
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.frameInnerCushion).color, 1);
          var cBevel = 12;
          this.boardGraphics.fillRect(fw, fw, surfSize, cBevel);
          this.boardGraphics.fillRect(fw, s - fw - cBevel, surfSize, cBevel);
          this.boardGraphics.fillRect(fw, fw, cBevel, surfSize);
          this.boardGraphics.fillRect(s - fw - cBevel, fw, cBevel, surfSize);

          // 3. Markings
          var markCol = Phaser.Display.Color.HexStringToColor(theme.markingsColor).color;
          var circleCol = Phaser.Display.Color.HexStringToColor(theme.baselineCircleColor).color;
          var dotCol = Phaser.Display.Color.HexStringToColor(theme.baselineDotColor).color;

          this.boardGraphics.lineStyle(1.8, markCol, 0.85);

          var drawSide = function(g, x1, y1, x2, y2, isH) {
            var gap = BOARD_PX * 0.014;
            if (isH) {
              g.lineBetween(x1, y1 - gap / 2, x2, y2 - gap / 2);
              g.lineBetween(x1, y1 + gap / 2, x2, y2 + gap / 2);
              g.fillStyle(circleCol, 1);
              g.fillCircle(x1, y1, bcr);
              g.fillCircle(x2, y2, bcr);
              g.fillStyle(dotCol, 1);
              g.fillCircle(x1, y1, bcr * 0.42);
              g.fillCircle(x2, y2, bcr * 0.42);
            } else {
              g.lineBetween(x1 - gap / 2, y1, x2 - gap / 2, y2);
              g.lineBetween(x1 + gap / 2, y1, x2 + gap / 2, y2);
              g.fillStyle(circleCol, 1);
              g.fillCircle(x1, y1, bcr);
              g.fillCircle(x2, y2, bcr);
              g.fillStyle(dotCol, 1);
              g.fillCircle(x1, y1, bcr * 0.42);
              g.fillCircle(x2, y2, bcr * 0.42);
            }
          };

          var halfBl = bl / 2;
          drawSide(this.boardGraphics, center - halfBl, s - fw - bo, center + halfBl, s - fw - bo, true);
          drawSide(this.boardGraphics, center - halfBl, fw + bo, center + halfBl, fw + bo, true);
          drawSide(this.boardGraphics, fw + bo, center - halfBl, fw + bo, center + halfBl, false);
          drawSide(this.boardGraphics, s - fw - bo, center - halfBl, s - fw - bo, center + halfBl, false);

          // Center Circle
          this.boardGraphics.lineStyle(2, markCol, 0.9);
          this.boardGraphics.strokeCircle(center, center, BOARD_PX * 0.065);
          this.boardGraphics.lineStyle(1.5, markCol, 0.7);
          this.boardGraphics.strokeCircle(center, center, BOARD_PX * 0.022);
          this.boardGraphics.fillStyle(dotCol, 1);
          this.boardGraphics.fillCircle(center, center, BOARD_PX * 0.007);

          // Corner Pockets (Visual Sprites)
          var pr = POCKET_RADIUS_PX;
          var inset = fw + pr * 0.85;
          var pCoords = [
            { x: inset, y: inset },
            { x: s - inset, y: inset },
            { x: s - inset, y: s - inset },
            { x: inset, y: s - inset }
          ];

          pCoords.forEach(function(coord) {
            var p = activeScene.add.sprite(coord.x, coord.y, 'tex_pocket');
            p.setDisplaySize(pr * 2.2, pr * 2.2);
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
          var pr = POCKET_RADIUS_PX;
          var inset = fw + pr * 0.85;

          var pCoords = [
            { x: inset, y: inset, idx: 0 },
            { x: s - inset, y: inset, idx: 1 },
            { x: s - inset, y: s - inset, idx: 2 },
            { x: inset, y: s - inset, idx: 3 }
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
            var shadow = scene.add.sprite(x + 3, y + 4, 'tex_coin_shadow');
            shadow.setDisplaySize(rCoin * 2.3, rCoin * 2.3);
            shadow.setDepth(9);

            var key = type === 'queen' ? 'tex_coin_queen' : (type === 'white' ? 'tex_coin_white' : 'tex_coin_black');
            var coinSprite = scene.add.sprite(x, y, key);
            coinSprite.setDisplaySize(rCoin * 2, rCoin * 2);
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

          // Queen
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
          var bo = BOARD_PX * 0.135;
          var sr = STRIKER_RADIUS_PX; // 20.5 px

          this.strikerRadius = sr;
          var px = s / 2;
          var py = s - fw - bo;

          this.strikerShadow = this.add.sprite(px + 4, py + 5, 'tex_striker_shadow');
          this.strikerShadow.setDisplaySize(sr * 2.4, sr * 2.4);
          this.strikerShadow.setDepth(19);

          this.strikerSprite = this.add.sprite(px, py, 'tex_striker_' + currentStrikerSkin);
          this.strikerSprite.setDisplaySize(sr * 2, sr * 2);
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
          var bo = BOARD_PX * 0.135;
          var bl = BOARD_PX * 0.54;
          var halfBl = bl / 2;
          var center = s / 2;

          var clampedOffset = Math.max(-0.95, Math.min(0.95, currentOffsetRatio));
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

            if (dist <= scene.strikerRadius * 2.5) {
              if (scene.isStrikerOverlapping) {
                // Striker is overlapping a coin, block aiming
                return;
              }
              scene.isAiming = true;
              scene.aimStartPoint = { x: pointer.x, y: pointer.y };
              scene.updateAim(pointer.x, pointer.y);
            }
          });

          this.input.on('pointermove', function(pointer) {
            if (!pointer.isDown) return;

            if (scene.isAiming) {
              scene.updateAim(pointer.x, pointer.y);
            } else if (!scene.isShotActive) {
              // Direct drag on baseline
              var s = scene.canvasSize;
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
              scene.updateStrikerPosition();

              sendToReactNative({
                type: 'STRIKER_DRAGGED',
                payload: { offset: currentOffsetRatio, isOverlapping: scene.isStrikerOverlapping },
                timestamp: Date.now()
              });
            }
          });

          this.input.on('pointerup', function() {
            if (scene.isAiming) {
              scene.isAiming = false;
              scene.aimGraphics.clear();

              if (!scene.isStrikerOverlapping && scene.aimPowerRatio > 0.05) {
                scene.executeShot(scene.aimAngle, scene.aimPowerRatio);
              }
            }
          });
        },

        updateAim: function(curX, curY) {
          var dx = this.aimStartPoint.x - curX;
          var dy = this.aimStartPoint.y - curY;
          var dist = Math.hypot(dx, dy);

          if (dist < 8) {
            this.aimGraphics.clear();
            this.aimPowerRatio = 0;
            return;
          }

          var angle = Math.atan2(dy, dx);
          var maxDragPx = 120; // 12 cm * 10 px/cm
          var clampedDist = Math.min(dist, maxDragPx);
          this.aimPowerRatio = Math.max(0, Math.min(1, (clampedDist - 8) / (maxDragPx - 8)));
          this.aimAngle = angle;

          var px = this.strikerBody.position.x;
          var py = this.strikerBody.position.y;
          var sr = this.strikerRadius;

          // Raycast to find contact point against coins and cushions
          var cosA = Math.cos(angle);
          var sinA = Math.sin(angle);
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

          if (cosA > 0.001) nearestDist = Math.min(nearestDist, (boardMax - px) / cosA);
          else if (cosA < -0.001) nearestDist = Math.min(nearestDist, (boardMin - px) / cosA);
          if (sinA > 0.001) nearestDist = Math.min(nearestDist, (boardMax - py) / sinA);
          else if (sinA < -0.001) nearestDist = Math.min(nearestDist, (boardMin - py) / sinA);

          var contactX = px + cosA * nearestDist;
          var contactY = py + sinA * nearestDist;

          // Render Aim Line & Contact Point Ghost Striker
          this.aimGraphics.clear();
          var col = this.aimPowerRatio > 0.75 ? 0xF59E0B : 0x4ADE80;

          // Dotted guide line
          var segLen = 8;
          var gapLen = 6;
          var step = segLen + gapLen;
          for (var d = 0; d < nearestDist; d += step) {
            var curD1 = d;
            var curD2 = Math.min(d + segLen, nearestDist);
            this.aimGraphics.lineStyle(2, col, 0.75);
            this.aimGraphics.lineBetween(
              px + cosA * curD1, py + sinA * curD1,
              px + cosA * curD2, py + sinA * curD2
            );
          }

          // Ghost striker circle at contact point
          this.aimGraphics.lineStyle(2, col, 0.7);
          this.aimGraphics.strokeCircle(contactX, contactY, sr);
          this.aimGraphics.fillStyle(col, 0.22);
          this.aimGraphics.fillCircle(contactX, contactY, sr);

          // If aimed at a target coin, render its projected deflection trajectory line
          if (hitType === 'coin' && hitCoin && hitCoin.body) {
            var targetX = hitCoin.body.position.x;
            var targetY = hitCoin.body.position.y;
            var normX = targetX - contactX;
            var normY = targetY - contactY;
            var normDist = Math.hypot(normX, normY) || 1;
            var deflDirX = normX / normDist;
            var deflDirY = normY / normDist;
            var deflDist = Math.min(100, 35 + this.aimPowerRatio * 65);

            for (var dd = 0; dd < deflDist; dd += step) {
              var d1 = dd;
              var d2 = Math.min(dd + segLen, deflDist);
              this.aimGraphics.lineStyle(2, 0xF5ECD2, 0.85); // Cream trajectory for target coin
              this.aimGraphics.lineBetween(
                targetX + deflDirX * d1, targetY + deflDirY * d1,
                targetX + deflDirX * d2, targetY + deflDirY * d2
              );
            }
            this.aimGraphics.lineStyle(1.5, 0xF5ECD2, 0.9);
            this.aimGraphics.strokeCircle(targetX + deflDirX * deflDist, targetY + deflDirY * deflDist, COIN_RADIUS_PX * 0.75);
          }

          sendToReactNative({
            type: 'AIM_CHANGED',
            payload: {
              angle: angle,
              powerRatio: this.aimPowerRatio,
              speed_cm_s: STRIKER_MIN_SPEED_CM_S + this.aimPowerRatio * (STRIKER_MAX_SPEED_CM_S - STRIKER_MIN_SPEED_CM_S)
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
          // Fixed Timestep Accumulator
          this.physicsAccumulator += delta;

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

          // 1. Gather all active moving bodies
          var activeBodies = [];
          if (this.strikerBody && !this.strikerIsPocketed) activeBodies.push(this.strikerBody);
          this.coins.forEach(function(c) {
            if (c.body && !c.isPocketed) activeBodies.push(c.body);
          });

          // 2. Find fastest velocity in step
          var maxV = 0;
          activeBodies.forEach(function(b) {
            var v = Math.hypot(b.velocity.x, b.velocity.y);
            if (v > maxV) maxV = v;
          });

          // 3. Adaptive Substeps: fastest body moves <= 0.5 * coinRadius per substep
          var maxDisp = 0.5 * COIN_RADIUS_PX; // 7.75 px
          var nSubsteps = Math.min(MAX_SUBSTEPS, Math.max(1, Math.ceil(maxV / maxDisp)));
          var subDtSec = BASE_DT_SEC / nSubsteps;

          for (var s = 0; s < nSubsteps; s++) {
            // A. Surface Coulomb friction & viscous damping
            activeBodies.forEach(function(b) {
              var vx = b.velocity.x;
              var vy = b.velocity.y;
              var stepSp = Math.hypot(vx, vy);
              var spCmS = stepVelocityToSpeedCmS(stepSp, BASE_DT_SEC);
              var av = b.angularVelocity;

              if (spCmS < REST_SPEED_THRESHOLD_CM_S && Math.abs(av) < ANGULAR_REST_THRESHOLD) {
                if (stepSp > 0 || av !== 0) {
                  scene.matter.body.setVelocity(b, { x: 0, y: 0 });
                  scene.matter.body.setAngularVelocity(b, 0);
                }
              } else if (spCmS >= REST_SPEED_THRESHOLD_CM_S) {
                var newSp = Math.max(0, spCmS - FRICTION_DECEL_CM_S2 * subDtSec);
                newSp = newSp * Math.max(0, 1 - VISCOUS_DAMPING * subDtSec);

                if (newSp < REST_SPEED_THRESHOLD_CM_S) {
                  scene.matter.body.setVelocity(b, { x: 0, y: 0 });
                } else {
                  var factor = (speedCmSToStepVelocity(newSp, BASE_DT_SEC)) / stepSp;
                  scene.matter.body.setVelocity(b, { x: vx * factor, y: vy * factor });
                }
              }

              if (Math.abs(av) >= ANGULAR_REST_THRESHOLD) {
                var newAv = av * Math.max(0, 1 - ANGULAR_DAMPING_PER_SEC * subDtSec);
                scene.matter.body.setAngularVelocity(b, Math.abs(newAv) < ANGULAR_REST_THRESHOLD ? 0 : newAv);
              }
            });

            // B. Pocket Suction & Capture Check
            var pSensors = this.pocketSensors;
            for (var pIdx = 0; pIdx < pSensors.length; pIdx++) {
              var pSens = pSensors[pIdx];
              var pX = pSens.position.x;
              var pY = pSens.position.y;

              for (var bIdx = 0; bIdx < activeBodies.length; bIdx++) {
                var b = activeBodies[bIdx];
                if ((b).isPocketed) continue;

                var distToHole = Math.hypot(pX - b.position.x, pY - b.position.y);

                // Gentle suction pull
                if (distToHole <= POCKET_SUCTION_RADIUS && distToHole > 1.0) {
                  var pull = (1 - distToHole / POCKET_SUCTION_RADIUS) * 0.0006;
                  scene.matter.body.applyForce(b, b.position, {
                    x: (pX - b.position.x) * pull,
                    y: (pY - b.position.y) * pull
                  });
                }

                // Hole capture
                if (distToHole <= POCKET_CAPTURE_RADIUS) {
                  (b).isPocketed = true;
                  scene.queuedPocketRemovals.push({ body: b, pocketIndex: pIdx });
                }
              }
            }

            // Step Matter world
            this.matter.world.step(subDtSec * 1000);
          }

          // Process queued removals at end of substeps (deduplicated)
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
            this.strikerSprite.setRotation(this.strikerBody.angle);
            this.strikerShadow.setPosition(this.strikerBody.position.x + 4, this.strikerBody.position.y + 5);
          }

          this.coins.forEach(function(c) {
            if (c.isPocketed || !c.body) return;
            c.sprite.setPosition(c.body.position.x, c.body.position.y);
            c.sprite.setRotation(c.body.angle);
            c.shadow.setPosition(c.body.position.x + 3, c.body.position.y + 4);
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
          if (this.strikerSprite) {
            this.strikerSprite.setVisible(true);
            this.strikerSprite.setScale(1);
            this.strikerSprite.setAlpha(1);
          }
          if (this.strikerShadow) {
            this.strikerShadow.setVisible(true);
            this.strikerShadow.setScale(1);
            this.strikerShadow.setAlpha(1);
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

      // INITIALIZE PHASER WITH MATTER PHYSICS
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

      new Phaser.Game(config);
    })();
  </script>
</body>
</html>`;
}
