import { BoardThemeId, StrikerSkin } from '../types/GameTypes.js';

export interface PhaserHtmlOptions {
  themeId?: BoardThemeId | string;
  strikerSkin?: StrikerSkin | string;
  activeSeat?: number;
  canvasSize?: number;
}

export function generateCarromPhaserHtml(options: PhaserHtmlOptions = {}): string {
  const initialTheme = options.themeId || 'forest';
  const initialSkin = options.strikerSkin || 'emerald';
  const initialSeat = options.activeSeat ?? 0;
  const canvasSize = options.canvasSize || 800;

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
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.85);
      border-radius: 8px;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js"></script>
</head>
<body>
  <div id="carrom-game-container"></div>

  <script>
    (function() {
      // THEMES
      var BOARD_THEMES = {
        classic: {
          id: 'classic',
          frameColor: '#5C2C16',
          frameAccent: '#8B4513',
          frameInnerCushion: '#3D1D0E',
          surfaceBg: '#E8D3B0',
          markingsColor: '#3D1D0E',
          pocketRimColor: '#A0522D',
          baselineCircleColor: '#B91C1C',
          baselineDotColor: '#DC2626',
          arrowColor: '#5C2C16'
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

      // Collision Category Bitmasks
      var CAT_DEFAULT = 0x0001;
      var CAT_CUSHION = 0x0002;
      var CAT_COIN    = 0x0004;
      var CAT_STRIKER = 0x0008;
      var CAT_POCKET  = 0x0010;

      function getTheme(id) {
        var key = id ? id.toLowerCase() : 'forest';
        return BOARD_THEMES[key] || BOARD_THEMES['forest'];
      }

      // TEXTURE GENERATOR
      function generateTextures(scene, theme) {
        // 1. Coin Shadow
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

        // 2. Striker Shadow
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

        // 3. White Coin
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

          ctx.fillStyle = '#C9BFA8';
          ctx.beginPath();
          ctx.arc(48, 48, r * 0.16, 0, Math.PI * 2);
          ctx.fill();

          var gloss = ctx.createLinearGradient(48 - r, 48 - r, 48, 48);
          gloss.addColorStop(0, 'rgba(255,255,255,0.75)');
          gloss.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gloss;
          ctx.beginPath();
          ctx.arc(40, 40, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
        });

        // 4. Black Coin
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

          ctx.beginPath();
          ctx.arc(48, 48, r * 0.44, 0, Math.PI * 2);
          ctx.stroke();

          var gloss = ctx.createLinearGradient(48 - r, 48 - r, 48, 48);
          gloss.addColorStop(0, 'rgba(255,255,255,0.35)');
          gloss.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gloss;
          ctx.beginPath();
          ctx.arc(40, 40, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
        });

        // 5. Queen Coin
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

          ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(48, 48, r * 0.72, 0, Math.PI * 2);
          ctx.stroke();

          // 8-point gold rosette
          ctx.fillStyle = '#F59E0B';
          var pts = 8;
          var outR = r * 0.55;
          var inR = r * 0.28;
          ctx.beginPath();
          for (var i = 0; i < pts * 2; i++) {
            var rad = (i * Math.PI) / pts;
            var curR = i % 2 === 0 ? outR : inR;
            var x = 48 + Math.cos(rad) * curR;
            var y = 48 + Math.sin(rad) * curR;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(48, 48, r * 0.18, 0, Math.PI * 2);
          ctx.fill();

          var gloss = ctx.createLinearGradient(48 - r, 48 - r, 48, 48);
          gloss.addColorStop(0, 'rgba(255,255,255,0.7)');
          gloss.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = gloss;
          ctx.beginPath();
          ctx.arc(40, 40, r * 0.45, 0, Math.PI * 2);
          ctx.fill();
        });

        // 6. Striker Textures
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

            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(64, 64, r * 0.78, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = cfg.inner;
            ctx.beginPath();
            ctx.arc(64, 64, r * 0.38, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = cfg.rim;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(64, 64, r * 0.12, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = cfg.rim;
            ctx.beginPath();
            ctx.moveTo(64, 64 - r * 0.65);
            ctx.lineTo(64 - 7, 64 - r * 0.42);
            ctx.lineTo(64 + 7, 64 - r * 0.42);
            ctx.closePath();
            ctx.fill();

            var gloss = ctx.createLinearGradient(64 - r, 64 - r, 64, 64);
            gloss.addColorStop(0, 'rgba(255,255,255,0.75)');
            gloss.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gloss;
            ctx.beginPath();
            ctx.arc(52, 52, r * 0.48, 0, Math.PI * 2);
            ctx.fill();
          });
        });

        // 7. Pocket Texture
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

      // PHASER CARROM SCENE (WITH MATTER.JS PHYSICS)
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

          this.matter.world.setGravity(0, 0);
          this.matter.world.setBounds(0, 0, 0, 0, 0, false, false, false, false);

          generateTextures(this, theme);

          this.boardGraphics = this.add.graphics();
          this.pocketsGroup = this.add.group();
          this.coins = [];
          this.cushionBodies = [];
          this.pocketSensors = [];
          this.isAiming = false;
          this.aimStartPoint = { x: 0, y: 0 };
          this.aimPowerRatio = 0;
          this.aimAngle = -Math.PI / 2;
          this.isShotActive = false;
          this.restStartTime = 0;
          this.pocketedInCurrentShot = [];

          this.renderBoardGraphics(theme);
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
            payload: { status: 'ready' },
            timestamp: Date.now()
          });
        },

        renderBoardGraphics: function(theme) {
          var s = this.canvasSize;
          var fw = s * 0.08;
          var surfSize = s * 0.84;
          var bo = s * 0.135;
          var bl = s * 0.54;
          var bcr = s * 0.019;
          var center = s / 2;

          this.boardGraphics.clear();
          this.pocketsGroup.clear(true, true);

          // 1. Frame
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.frameColor).color, 1);
          this.boardGraphics.fillRect(0, 0, s, s);

          this.boardGraphics.lineStyle(3, Phaser.Display.Color.HexStringToColor(theme.frameAccent).color, 0.8);
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

          // Cushions
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.frameInnerCushion).color, 1);
          this.boardGraphics.fillRect(fw, fw, surfSize, s * 0.022);
          this.boardGraphics.fillRect(fw, s - fw - s * 0.022, surfSize, s * 0.022);
          this.boardGraphics.fillRect(fw, fw, s * 0.022, surfSize);
          this.boardGraphics.fillRect(s - fw - s * 0.022, fw, s * 0.022, surfSize);

          // Create Matter Cushion Physics Bodies
          this.cushionBodies.forEach(function(b) { activeScene.matter.world.remove(b); });
          this.cushionBodies = [];

          var cThick = s * 0.03;
          var pClearance = s * 0.085;
          var cLen = surfSize - pClearance * 2;

          var cConfigs = [
            { x: center, y: fw + cThick / 2, w: cLen, h: cThick, label: 'cushion_top' },
            { x: center, y: s - fw - cThick / 2, w: cLen, h: cThick, label: 'cushion_bottom' },
            { x: fw + cThick / 2, y: center, w: cThick, h: cLen, label: 'cushion_left' },
            { x: s - fw - cThick / 2, y: center, w: cThick, h: cLen, label: 'cushion_right' }
          ];

          cConfigs.forEach(function(cfg) {
            var body = activeScene.matter.add.rectangle(cfg.x, cfg.y, cfg.w, cfg.h, {
              isStatic: true,
              restitution: 0.90,
              friction: 0.04,
              label: cfg.label,
              collisionFilter: { category: CAT_CUSHION, mask: CAT_STRIKER | CAT_COIN }
            });
            activeScene.cushionBodies.push(body);
          });

          // 3. Markings
          var markCol = Phaser.Display.Color.HexStringToColor(theme.markingsColor).color;
          var circleCol = Phaser.Display.Color.HexStringToColor(theme.baselineCircleColor).color;
          var dotCol = Phaser.Display.Color.HexStringToColor(theme.baselineDotColor).color;

          this.boardGraphics.lineStyle(1.8, markCol, 0.85);

          var drawSide = function(g, x1, y1, x2, y2, isH) {
            var gap = s * 0.014;
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
          this.boardGraphics.strokeCircle(center, center, s * 0.065);
          this.boardGraphics.lineStyle(1.5, markCol, 0.7);
          this.boardGraphics.strokeCircle(center, center, s * 0.022);
          this.boardGraphics.fillStyle(dotCol, 1);
          this.boardGraphics.fillCircle(center, center, s * 0.007);

          // Corner Foul Arrows
          var arrLen = s * 0.085;
          var corners = [
            { x: fw + bo * 0.6, y: fw + bo * 0.6, a: Math.PI / 4 },
            { x: s - fw - bo * 0.6, y: fw + bo * 0.6, a: (3 * Math.PI) / 4 },
            { x: s - fw - bo * 0.6, y: s - fw - bo * 0.6, a: -(3 * Math.PI) / 4 },
            { x: fw + bo * 0.6, y: s - fw - bo * 0.6, a: -Math.PI / 4 }
          ];

          corners.forEach(function(c) {
            var ex = c.x + Math.cos(c.a) * arrLen;
            var ey = c.y + Math.sin(c.a) * arrLen;
            activeScene.boardGraphics.lineStyle(1.8, markCol, 0.85);
            activeScene.boardGraphics.lineBetween(c.x, c.y, ex, ey);
            activeScene.boardGraphics.fillStyle(circleCol, 1);
            activeScene.boardGraphics.fillCircle(ex, ey, 4.5);
          });

          // Pockets (Visual Sprites)
          var pr = s * 0.038;
          var inset = fw + pr * 0.55;
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

        createPocketSensors: function() {
          this.pocketSensors.forEach(function(s) { activeScene.matter.world.remove(s); });
          this.pocketSensors = [];

          var s = this.canvasSize;
          var fw = s * 0.08;
          var pr = s * 0.038;
          var inset = fw + pr * 0.55;

          var pCoords = [
            { x: inset, y: inset, idx: 0 },
            { x: s - inset, y: inset, idx: 1 },
            { x: s - inset, y: s - inset, idx: 2 },
            { x: inset, y: s - inset, idx: 3 }
          ];

          pCoords.forEach(function(coord) {
            var sensor = activeScene.matter.add.circle(coord.x, coord.y, pr * 0.85, {
              isStatic: true,
              isSensor: true,
              label: 'pocket_' + coord.idx,
              collisionFilter: { category: CAT_POCKET, mask: CAT_STRIKER | CAT_COIN }
            });
            activeScene.pocketSensors.push(sensor);
          });
        },

        spawnCoinCluster: function() {
          // Clean existing coins
          this.coins.forEach(function(c) {
            if (c.body) activeScene.matter.world.remove(c.body);
            if (c.sprite) c.sprite.destroy();
            if (c.shadow) c.shadow.destroy();
          });
          this.coins = [];

          var s = this.canvasSize;
          var cx = s / 2;
          var cy = s / 2;
          var rCoin = s * 0.020;

          var addPhysicsCoin = function(scene, id, type, x, y) {
            var shadow = scene.add.sprite(x + 3, y + 4, 'tex_coin_shadow');
            shadow.setDisplaySize(rCoin * 2.3, rCoin * 2.3);
            shadow.setDepth(9);

            var key = type === 'queen' ? 'tex_coin_queen' : (type === 'white' ? 'tex_coin_white' : 'tex_coin_black');
            var coinSprite = scene.add.sprite(x, y, key);
            coinSprite.setDisplaySize(rCoin * 2, rCoin * 2);
            coinSprite.setDepth(10);

            var body = scene.matter.add.circle(x, y, rCoin, {
              restitution: 0.93,
              friction: 0.035,
              frictionAir: 0.018,
              density: 0.0025,
              label: 'coin_' + id,
              collisionFilter: {
                category: CAT_COIN,
                mask: CAT_CUSHION | CAT_COIN | CAT_STRIKER | CAT_POCKET
              }
            });

            body.coinRef = { id: id, type: type, sprite: coinSprite, shadow: shadow, body: body, isPocketed: false };
            scene.coins.push(body.coinRef);
          };

          // Queen
          addPhysicsCoin(this, 'queen', 'queen', cx, cy);

          // Ring 1 (6 coins)
          var d1 = 2 * rCoin * 1.02;
          var r1Types = ['white', 'black', 'white', 'black', 'white', 'black'];
          for (var i = 0; i < 6; i++) {
            var ang = (i * Math.PI) / 3;
            addPhysicsCoin(this, 'r1_' + i, r1Types[i], cx + Math.cos(ang) * d1, cy + Math.sin(ang) * d1);
          }

          // Ring 2 (12 coins)
          var d2Axis = 4 * rCoin * 1.02;
          var d2Inter = 2 * Math.sqrt(3) * rCoin * 1.02;
          var r2Types = ['black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white'];
          for (var j = 0; j < 12; j++) {
            var a2 = (j * Math.PI) / 6;
            var dist = j % 2 === 0 ? d2Axis : d2Inter;
            addPhysicsCoin(this, 'r2_' + j, r2Types[j], cx + Math.cos(a2) * dist, cy + Math.sin(a2) * dist);
          }
        },

        createStriker: function(theme) {
          if (this.strikerBody) {
            this.matter.world.remove(this.strikerBody);
          }
          if (this.strikerSprite) this.strikerSprite.destroy();
          if (this.strikerShadow) this.strikerShadow.destroy();
          if (this.aimRay) this.aimRay.destroy();

          var s = this.canvasSize;
          var fw = s * 0.08;
          var bo = s * 0.135;
          var sr = s * 0.028;

          this.strikerRadius = sr;
          var px = s / 2;
          var py = s - fw - bo;

          // Shadow
          this.strikerShadow = this.add.sprite(px + 4, py + 5, 'tex_striker_shadow');
          this.strikerShadow.setDisplaySize(sr * 2.4, sr * 2.4);
          this.strikerShadow.setDepth(19);

          // Sprite
          this.strikerSprite = this.add.sprite(px, py, 'tex_striker_' + currentStrikerSkin);
          this.strikerSprite.setDisplaySize(sr * 2, sr * 2);
          this.strikerSprite.setDepth(20);

          // Aim Ray
          this.aimRay = this.add.graphics();
          this.aimRay.setDepth(21);

          // Matter Body
          this.strikerBody = this.matter.add.circle(px, py, sr, {
            restitution: 0.95,
            friction: 0.028,
            frictionAir: 0.014,
            density: 0.0075,
            label: 'striker',
            collisionFilter: {
              category: CAT_STRIKER,
              mask: CAT_CUSHION | CAT_COIN | CAT_POCKET
            }
          });
          this.strikerBody.isStriker = true;
          this.strikerIsPocketed = false;

          this.updateStrikerPosition();
        },

        updateStrikerPosition: function() {
          if (!this.strikerBody || this.isShotActive) return;

          var s = this.canvasSize;
          var fw = s * 0.08;
          var bo = s * 0.135;
          var bl = s * 0.54;
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

            if (dist <= scene.strikerRadius * 2.4) {
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
              var fw = s * 0.08;
              var bo = s * 0.135;
              var bl = s * 0.54;
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
                payload: { offset: currentOffsetRatio },
                timestamp: Date.now()
              });
            }
          });

          this.input.on('pointerup', function() {
            if (scene.isAiming) {
              scene.isAiming = false;
              scene.aimRay.clear();

              if (scene.aimPowerRatio > 0.05) {
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
            this.aimRay.clear();
            this.aimPowerRatio = 0;
            return;
          }

          var angle = Math.atan2(dy, dx);
          var maxDrag = 140;
          var clampedDist = Math.min(dist, maxDrag);
          this.aimPowerRatio = Math.max(0, Math.min(1, (clampedDist - 8) / (maxDrag - 8)));
          this.aimAngle = angle;

          var px = this.strikerBody.position.x;
          var py = this.strikerBody.position.y;
          var rayLen = this.strikerRadius * 2.5 + this.aimPowerRatio * this.strikerRadius * 5.0;
          var ex = px + Math.cos(angle) * rayLen;
          var ey = py + Math.sin(angle) * rayLen;

          this.aimRay.clear();
          var col = this.aimPowerRatio > 0.75 ? 0xF59E0B : 0x4ADE80;
          this.aimRay.lineStyle(2.5, col, 0.5 + this.aimPowerRatio * 0.5);
          this.aimRay.lineBetween(px, py, ex, ey);
          this.aimRay.fillStyle(col, 0.9);
          this.aimRay.fillCircle(ex, ey, 4 + this.aimPowerRatio * 3.5);

          sendToReactNative({
            type: 'AIM_CHANGED',
            payload: { angle: angle, powerRatio: this.aimPowerRatio },
            timestamp: Date.now()
          });
        },

        executeShot: function(angle, powerRatio) {
          if (this.isShotActive || !this.strikerBody) return;

          this.isShotActive = true;
          this.restStartTime = 0;
          this.pocketedInCurrentShot = [];

          var power = 1.5 + powerRatio * 26.5;
          var fx = Math.cos(angle) * power * 0.18;
          var fy = Math.sin(angle) * power * 0.18;

          this.matter.body.applyForce(this.strikerBody, this.strikerBody.position, { x: fx, y: fy });

          sendToReactNative({
            type: 'SHOT_STARTED',
            payload: { power: power, powerRatio: powerRatio, angle: angle },
            timestamp: Date.now()
          });
        },

        setupCollisionHandlers: function() {
          var scene = this;

          this.matter.world.on('collisionstart', function(event) {
            event.pairs.forEach(function(pair) {
              var bodyA = pair.bodyA;
              var bodyB = pair.bodyB;

              var isSensA = bodyA.isSensor && bodyA.label && bodyA.label.indexOf('pocket_') === 0;
              var isSensB = bodyB.isSensor && bodyB.label && bodyB.label.indexOf('pocket_') === 0;

              if (isSensA) {
                scene.handlePocketEntry(bodyB, parseInt(bodyA.label.split('_')[1], 10));
              } else if (isSensB) {
                scene.handlePocketEntry(bodyA, parseInt(bodyB.label.split('_')[1], 10));
              }
            });
          });
        },

        handlePocketEntry: function(body, pocketIdx) {
          if (!body || body.isPocketed) return;
          body.isPocketed = true;

          var scene = this;

          if (body.isStriker) {
            this.strikerIsPocketed = true;
            this.pocketedInCurrentShot.push({ id: 'striker', type: 'striker', pocketIndex: pocketIdx });

            this.tweens.add({
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
              payload: { pocketIndex: pocketIdx },
              timestamp: Date.now()
            });
          } else if (body.coinRef) {
            var c = body.coinRef;
            if (c.isPocketed) return;
            c.isPocketed = true;

            this.pocketedInCurrentShot.push({ id: c.id, type: c.type, pocketIndex: pocketIdx });

            this.tweens.add({
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
              payload: { id: c.id, type: c.type, pocketIndex: pocketIdx },
              timestamp: Date.now()
            });
          }
        },

        update: function() {
          var scene = this;
          var linearThreshold = 0.07;
          var angularThreshold = 0.04;

          // 1. Update Striker Visual & Physics Damping
          var strikerMoving = false;
          if (this.strikerBody && !this.strikerIsPocketed) {
            var sx = this.strikerBody.position.x;
            var sy = this.strikerBody.position.y;
            var svx = this.strikerBody.velocity.x;
            var svy = this.strikerBody.velocity.y;
            var sSpeed = Math.hypot(svx, svy);
            var sav = this.strikerBody.angularVelocity;

            if (sSpeed < linearThreshold && Math.abs(sav) < angularThreshold) {
              if (sSpeed > 0 || sav !== 0) {
                this.matter.body.setVelocity(this.strikerBody, { x: 0, y: 0 });
                this.matter.body.setAngularVelocity(this.strikerBody, 0);
              }
            } else {
              strikerMoving = true;
              this.matter.body.setVelocity(this.strikerBody, { x: svx * 0.992, y: svy * 0.992 });
              this.matter.body.setAngularVelocity(this.strikerBody, sav * 0.95);
            }

            this.strikerSprite.setPosition(sx, sy);
            this.strikerSprite.setRotation(this.strikerBody.angle);
            this.strikerShadow.setPosition(sx + 4, sy + 5);
          }

          // 2. Update Coins Visual & Physics Damping
          var anyCoinMoving = false;
          this.coins.forEach(function(c) {
            if (c.isPocketed || !c.body) return;

            var cx = c.body.position.x;
            var cy = c.body.position.y;
            var cvx = c.body.velocity.x;
            var cvy = c.body.velocity.y;
            var cSpeed = Math.hypot(cvx, cvy);
            var cav = c.body.angularVelocity;

            if (cSpeed < linearThreshold && Math.abs(cav) < angularThreshold) {
              if (cSpeed > 0 || cav !== 0) {
                scene.matter.body.setVelocity(c.body, { x: 0, y: 0 });
                scene.matter.body.setAngularVelocity(c.body, 0);
              }
            } else {
              anyCoinMoving = true;
              scene.matter.body.setVelocity(c.body, { x: cvx * 0.992, y: cvy * 0.992 });
              scene.matter.body.setAngularVelocity(c.body, cav * 0.95);
            }

            c.sprite.setPosition(cx, cy);
            c.sprite.setRotation(c.body.angle);
            c.shadow.setPosition(cx + 3, cy + 4);
          });

          // 3. Motion & Settled Detection
          if (this.isShotActive) {
            var allStopped = !strikerMoving && !anyCoinMoving;
            var now = Date.now();

            if (allStopped) {
              if (this.restStartTime === 0) {
                this.restStartTime = now;
              } else if (now - this.restStartTime >= 250) {
                // Board has settled!
                this.isShotActive = false;
                this.restStartTime = 0;

                var pocketed = this.pocketedInCurrentShot.slice();
                this.pocketedInCurrentShot = [];

                sendToReactNative({
                  type: 'SHOT_SETTLED',
                  payload: {
                    pocketedCount: pocketed.length,
                    pocketedItems: pocketed,
                    strikerPocketed: this.strikerIsPocketed
                  },
                  timestamp: now
                });

                // Reset striker back to player's baseline
                this.resetStriker();
              }
            } else {
              this.restStartTime = 0;
            }
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

        resetBoard: function() {
          this.spawnCoinCluster();
          this.resetStriker();
          this.isShotActive = false;
          this.restStartTime = 0;
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
              if (msg.payload && typeof msg.payload.power === 'number') {
                var angle = typeof msg.payload.angle === 'number' ? msg.payload.angle : -Math.PI / 2;
                activeScene.executeShot(angle, msg.payload.power);
              }
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
