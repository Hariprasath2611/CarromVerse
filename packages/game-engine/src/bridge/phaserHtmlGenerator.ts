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
          var grad = ctx.createRadialGradient(64, 64, 20, 64, 64, 62);
          grad.addColorStop(0, 'rgba(0,0,0,0.7)');
          grad.addColorStop(0.7, 'rgba(0,0,0,0.3)');
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
          g.addColorStop(0.4, '#FDFBF7');
          g.addColorStop(0.85, '#EBE3D5');
          g.addColorStop(1, '#C9BFA8');
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

      // PHASER CARROM SCENE
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

          generateTextures(this, theme);

          this.boardGraphics = this.add.graphics();
          this.pocketsGroup = this.add.group();
          this.coinsGroup = this.add.group();

          this.renderBoardGraphics(theme);
          this.spawnCoinCluster();
          this.createStriker(theme);
          this.setupInputHandlers();

          sendToReactNative({
            type: 'BOARD_RENDERED',
            payload: { theme: currentThemeId, coinCount: this.coinsGroup.getChildren().length },
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

          // 3. Cushions
          var cWidth = fw * 0.35;
          this.boardGraphics.fillStyle(Phaser.Display.Color.HexStringToColor(theme.frameInnerCushion).color, 1);
          this.boardGraphics.fillRect(fw, fw - cWidth, s - fw * 2, cWidth);
          this.boardGraphics.fillRect(fw, s - fw, s - fw * 2, cWidth);
          this.boardGraphics.fillRect(fw - cWidth, fw, cWidth, s - fw * 2);
          this.boardGraphics.fillRect(s - fw, fw, cWidth, s - fw * 2);

          // 4. Baselines
          var markCol = Phaser.Display.Color.HexStringToColor(theme.markingsColor).color;
          var circleCol = Phaser.Display.Color.HexStringToColor(theme.baselineCircleColor).color;
          var dotCol = Phaser.Display.Color.HexStringToColor(theme.baselineDotColor).color;
          var gap = s * 0.018;
          var halfBl = bl / 2;

          var drawSide = function(g, x1, y1, x2, y2, isHoriz) {
            g.lineStyle(1.5, markCol, 0.85);
            if (isHoriz) {
              g.lineBetween(x1, y1 - gap/2, x2, y2 - gap/2);
              g.lineBetween(x1, y1 + gap/2, x2, y2 + gap/2);
              [x1, x2].forEach(function(cx) {
                g.fillStyle(circleCol, 1);
                g.fillCircle(cx, y1, bcr);
                g.lineStyle(1.5, markCol, 0.9);
                g.strokeCircle(cx, y1, bcr);
                g.fillStyle(dotCol, 1);
                g.fillCircle(cx, y1, bcr * 0.4);
              });
            } else {
              g.lineBetween(x1 - gap/2, y1, x2 - gap/2, y2);
              g.lineBetween(x1 + gap/2, y1, x2 + gap/2, y2);
              [y1, y2].forEach(function(cy) {
                g.fillStyle(circleCol, 1);
                g.fillCircle(x1, cy, bcr);
                g.lineStyle(1.5, markCol, 0.9);
                g.strokeCircle(x1, cy, bcr);
                g.fillStyle(dotCol, 1);
                g.fillCircle(x1, cy, bcr * 0.4);
              });
            }
          };

          drawSide(this.boardGraphics, center - halfBl, s - fw - bo, center + halfBl, s - fw - bo, true);
          drawSide(this.boardGraphics, center - halfBl, fw + bo, center + halfBl, fw + bo, true);
          drawSide(this.boardGraphics, fw + bo, center - halfBl, fw + bo, center + halfBl, false);
          drawSide(this.boardGraphics, s - fw - bo, center - halfBl, s - fw - bo, center + halfBl, false);

          // 5. Center Circle
          this.boardGraphics.lineStyle(2, markCol, 0.9);
          this.boardGraphics.strokeCircle(center, center, s * 0.065);
          this.boardGraphics.lineStyle(1.5, markCol, 0.7);
          this.boardGraphics.strokeCircle(center, center, s * 0.022);
          this.boardGraphics.fillStyle(dotCol, 1);
          this.boardGraphics.fillCircle(center, center, s * 0.007);

          // 6. Corner Foul Arrows
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

          // 7. Pockets
          var pr = s * 0.038;
          var inset = fw + pr * 0.55;
          var pCoords = [
            { x: inset, y: inset },
            { x: s - inset, y: inset },
            { x: inset, y: s - inset },
            { x: s - inset, y: s - inset }
          ];

          pCoords.forEach(function(coord) {
            var p = activeScene.add.sprite(coord.x, coord.y, 'tex_pocket');
            p.setDisplaySize(pr * 2.2, pr * 2.2);
            p.setDepth(2);
            activeScene.pocketsGroup.add(p);
          });
        },

        spawnCoinCluster: function() {
          this.coinsGroup.clear(true, true);

          var s = this.canvasSize;
          var cx = s / 2;
          var cy = s / 2;
          var rCoin = s * 0.020;

          var addCoin = function(scene, type, x, y) {
            var shadow = scene.add.sprite(x + 3, y + 4, 'tex_coin_shadow');
            shadow.setDisplaySize(rCoin * 2.3, rCoin * 2.3);
            shadow.setDepth(9);
            scene.coinsGroup.add(shadow);

            var key = type === 'queen' ? 'tex_coin_queen' : (type === 'white' ? 'tex_coin_white' : 'tex_coin_black');
            var coin = scene.add.sprite(x, y, key);
            coin.setDisplaySize(rCoin * 2, rCoin * 2);
            coin.setDepth(10);
            scene.coinsGroup.add(coin);
          };

          // Queen
          addCoin(this, 'queen', cx, cy);

          // Ring 1 (6 coins)
          var d1 = 2 * rCoin * 1.02;
          var r1Types = ['white', 'black', 'white', 'black', 'white', 'black'];
          for (var i = 0; i < 6; i++) {
            var ang = (i * Math.PI) / 3;
            addCoin(this, r1Types[i], cx + Math.cos(ang) * d1, cy + Math.sin(ang) * d1);
          }

          // Ring 2 (12 coins)
          var d2Axis = 4 * rCoin * 1.02;
          var d2Inter = 2 * Math.sqrt(3) * rCoin * 1.02;
          var r2Types = ['black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white', 'black', 'white'];
          for (var j = 0; j < 12; j++) {
            var a2 = (j * Math.PI) / 6;
            var dist = j % 2 === 0 ? d2Axis : d2Inter;
            addCoin(this, r2Types[j], cx + Math.cos(a2) * dist, cy + Math.sin(a2) * dist);
          }
        },

        createStriker: function(theme) {
          if (this.strikerContainer) {
            this.strikerContainer.destroy();
          }

          var s = this.canvasSize;
          var fw = s * 0.08;
          var bo = s * 0.135;
          var sr = s * 0.028;

          this.strikerRadius = sr;
          this.strikerContainer = this.add.container(s / 2, s - fw - bo);
          this.strikerContainer.setDepth(20);

          // Shadow
          this.strikerShadow = this.add.sprite(4, 5, 'tex_striker_shadow');
          this.strikerShadow.setDisplaySize(sr * 2.4, sr * 2.4);
          this.strikerContainer.add(this.strikerShadow);

          // Striker
          this.strikerSprite = this.add.sprite(0, 0, 'tex_striker_' + currentStrikerSkin);
          this.strikerSprite.setDisplaySize(sr * 2, sr * 2);
          this.strikerContainer.add(this.strikerSprite);

          // Aim Line
          this.aimRay = this.add.graphics();
          this.aimRay.lineStyle(2, 0x4ADE80, 0.75);
          this.aimRay.lineBetween(0, 0, 0, -sr * 3.5);
          this.aimRay.fillStyle(0x4ADE80, 0.9);
          this.aimRay.fillCircle(0, -sr * 3.5, 3.5);
          this.strikerContainer.add(this.aimRay);

          this.updateStrikerPosition();
        },

        updateStrikerPosition: function() {
          if (!this.strikerContainer) return;
          var s = this.canvasSize;
          var fw = s * 0.08;
          var bo = s * 0.135;
          var bl = s * 0.54;
          var halfBl = bl / 2;
          var center = s / 2;

          var clampedOffset = Math.max(-0.95, Math.min(0.95, currentOffsetRatio));

          if (currentSeat === 0) {
            // South
            this.strikerContainer.setPosition(center + clampedOffset * halfBl, s - fw - bo);
            this.strikerSprite.setRotation(0);
            this.drawAimRay(0, -this.strikerRadius * 3.5);
          } else if (currentSeat === 1) {
            // East
            this.strikerContainer.setPosition(s - fw - bo, center + clampedOffset * halfBl);
            this.strikerSprite.setRotation(-Math.PI / 2);
            this.drawAimRay(-this.strikerRadius * 3.5, 0);
          } else if (currentSeat === 2) {
            // North
            this.strikerContainer.setPosition(center + clampedOffset * halfBl, fw + bo);
            this.strikerSprite.setRotation(Math.PI);
            this.drawAimRay(0, this.strikerRadius * 3.5);
          } else if (currentSeat === 3) {
            // West
            this.strikerContainer.setPosition(fw + bo, center + clampedOffset * halfBl);
            this.strikerSprite.setRotation(Math.PI / 2);
            this.drawAimRay(this.strikerRadius * 3.5, 0);
          }
        },

        drawAimRay: function(endX, endY) {
          this.aimRay.clear();
          this.aimRay.lineStyle(2, 0x4ADE80, 0.75);
          this.aimRay.lineBetween(0, 0, endX, endY);
          this.aimRay.fillStyle(0x4ADE80, 0.9);
          this.aimRay.fillCircle(endX, endY, 3.5);
        },

        setupInputHandlers: function() {
          var self = this;
          var isDragging = false;

          this.input.on('pointerdown', function(pointer) {
            isDragging = true;
            self.handlePointerPosition(pointer.x, pointer.y);
          });

          this.input.on('pointermove', function(pointer) {
            if (isDragging) {
              self.handlePointerPosition(pointer.x, pointer.y);
            }
          });

          this.input.on('pointerup', function() {
            isDragging = false;
          });
        },

        handlePointerPosition: function(px, py) {
          var s = this.canvasSize;
          var bl = s * 0.54;
          var halfBl = bl / 2;
          var center = s / 2;

          var ratio = 0;
          if (currentSeat === 0 || currentSeat === 2) {
            ratio = (px - center) / halfBl;
          } else {
            ratio = (py - center) / halfBl;
          }

          currentOffsetRatio = Math.max(-0.95, Math.min(0.95, ratio));
          this.updateStrikerPosition();

          sendToReactNative({
            type: 'STRIKER_DRAGGED',
            payload: { offset: currentOffsetRatio, seat: currentSeat },
            timestamp: Date.now()
          });
        },

        changeTheme: function(themeId) {
          currentThemeId = themeId;
          var theme = getTheme(themeId);
          generateTextures(this, theme);
          this.renderBoardGraphics(theme);
          this.spawnCoinCluster();
          this.createStriker(theme);
        },

        changeStrikerSkin: function(skin) {
          currentStrikerSkin = skin;
          if (this.strikerSprite) {
            this.strikerSprite.setTexture('tex_striker_' + skin);
          }
        },

        setSeat: function(seat) {
          currentSeat = seat;
          currentOffsetRatio = 0;
          this.updateStrikerPosition();
        },

        setOffset: function(offset) {
          currentOffsetRatio = offset;
          this.updateStrikerPosition();
        },

        resetBoard: function() {
          this.spawnCoinCluster();
          currentOffsetRatio = 0;
          this.updateStrikerPosition();
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

      // INITIALIZE PHASER
      var config = {
        type: Phaser.AUTO,
        parent: 'carrom-game-container',
        width: ${canvasSize},
        height: ${canvasSize},
        backgroundColor: '#07130E',
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
