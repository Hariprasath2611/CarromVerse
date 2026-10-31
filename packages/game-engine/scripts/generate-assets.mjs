import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEXTURES_DIR = path.resolve(__dirname, '../assets/textures');

if (!fs.existsSync(TEXTURES_DIR)) {
  fs.mkdirSync(TEXTURES_DIR, { recursive: true });
}

// Color helpers
function hexToRgba(hex, alpha = 1.0) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b, a: alpha };
}

function lerpColor(c1, c2, t) {
  t = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
    a: c1.a + (c2.a - c1.a) * t,
  };
}

function blendPixel(img, x, y, col) {
  if (x < 0 || x >= img.width || y < 0 || y >= img.height || col.a <= 0) return;
  const idx = (img.width * Math.floor(y) + Math.floor(x)) << 2;
  const sa = Math.max(0, Math.min(1, col.a));
  const da = img.data[idx + 3] / 255;
  const outA = sa + da * (1 - sa);

  if (outA > 0) {
    img.data[idx] = Math.round((col.r * sa + img.data[idx] * da * (1 - sa)) / outA);
    img.data[idx + 1] = Math.round((col.g * sa + img.data[idx + 1] * da * (1 - sa)) / outA);
    img.data[idx + 2] = Math.round((col.b * sa + img.data[idx + 2] * da * (1 - sa)) / outA);
    img.data[idx + 3] = Math.round(outA * 255);
  }
}

// 1. Render Coin (White, Black, Queen)
function renderCoinImage(sizePx, type = 'white') {
  // SVG face is r100, height is 236 with 12px thickness
  const w = sizePx;
  const h = Math.round((sizePx * 236) / 220);
  const png = new PNG({ width: w, height: h });
  const scale = sizePx / 220;

  const cx = w / 2;
  const faceCy = (110 * scale);
  const thickCy = (122 * scale);
  const rFace = (100 * scale);

  const isWhite = type === 'white';
  const isBlack = type === 'black';

  const colThickness = isWhite ? hexToRgba('#A89868') : isBlack ? hexToRgba('#030504') : hexToRgba('#7A1020');
  const colFaceInner = isWhite ? hexToRgba('#FFFFFF') : isBlack ? hexToRgba('#4A524E') : hexToRgba('#FF5C78');
  const colFaceOuter = isWhite ? hexToRgba('#E2D6B4') : isBlack ? hexToRgba('#0B0F0D') : hexToRgba('#B82545');
  const colGroove = isWhite ? hexToRgba('#CDBF9A') : isBlack ? hexToRgba('#2E3833') : hexToRgba('#FFD0D8');
  const colEmblemDot = isWhite ? hexToRgba('#CDBF9A') : isBlack ? hexToRgba('#2BD67B') : hexToRgba('#FFD0D8');
  const colEmblemDisc = isWhite ? hexToRgba('#CDBF9A', 0) : isBlack ? hexToRgba('#141A17') : hexToRgba('#FFD0D8', 0);
  const highlightAlpha = isWhite ? 0.55 : isBlack ? 0.22 : 0.50;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // 1. Edge thickness
      const dThick = Math.hypot(x - cx, y - thickCy);
      if (dThick <= rFace + 0.5) {
        const edgeA = Math.max(0, Math.min(1, rFace + 0.5 - dThick));
        blendPixel(png, x, y, { ...colThickness, a: colThickness.a * edgeA });
      }

      // 2. Face disc with radial gradient
      const dFace = Math.hypot(x - cx, y - faceCy);
      if (dFace <= rFace + 0.5) {
        const edgeA = Math.max(0, Math.min(1, rFace + 0.5 - dFace));
        const t = dFace / rFace;
        const faceCol = lerpColor(colFaceInner, colFaceOuter, t);
        blendPixel(png, x, y, { ...faceCol, a: edgeA });

        // Grooves: r84, r66
        const dGroove84 = Math.abs(dFace - 84 * scale);
        if (dGroove84 <= 1.5 * scale) {
          const ga = (1 - dGroove84 / (1.5 * scale)) * 0.8;
          blendPixel(png, x, y, { ...colGroove, a: ga });
        }

        const dGroove66 = Math.abs(dFace - 66 * scale);
        if (dGroove66 <= 1.0 * scale) {
          const ga = (1 - dGroove66 / (1.0 * scale)) * 0.75;
          blendPixel(png, x, y, { ...colGroove, a: ga });
        }

        // Tick ring r48
        const dTick = Math.abs(dFace - 48 * scale);
        if (dTick <= 5 * scale) {
          const angle = Math.atan2(y - faceCy, x - cx);
          const segAngle = (Math.PI * 2) / 16;
          const mod = Math.abs((angle + Math.PI * 2) % segAngle);
          if (mod < segAngle * 0.22) {
            blendPixel(png, x, y, { ...colGroove, a: 0.85 });
          }
        }

        // Center emblem disc r30
        if (dFace <= 30 * scale) {
          if (colEmblemDisc.a > 0) {
            blendPixel(png, x, y, colEmblemDisc);
          }
          const dBorder = Math.abs(dFace - 30 * scale);
          if (dBorder <= 1.0 * scale) {
            blendPixel(png, x, y, { ...colGroove, a: 0.9 });
          }
        }

        // Center dot r8
        if (dFace <= 8 * scale) {
          blendPixel(png, x, y, colEmblemDot);
        }

        // Highlight ellipse rotated -35 deg at (74, 62)
        const cosR = Math.cos(35 * Math.PI / 180);
        const sinR = Math.sin(35 * Math.PI / 180);
        const dx = (x - 74 * scale);
        const dy = (y - 62 * scale);
        const rx = dx * cosR - dy * sinR;
        const ry = dx * sinR + dy * cosR;
        const elDist = Math.hypot(rx / (20 * scale), ry / (8 * scale));
        if (elDist <= 1.0) {
          const ha = (1.0 - elDist) * highlightAlpha;
          blendPixel(png, x, y, { r: 255, g: 255, b: 255, a: ha });
        }
      }
    }
  }

  return png;
}

// 2. Render Striker
function renderStrikerImage(sizePx) {
  // SVG face is r120, height is 276 with 14px thickness
  const w = sizePx;
  const h = Math.round((sizePx * 276) / 260);
  const png = new PNG({ width: w, height: h });
  const scale = sizePx / 260;

  const cx = w / 2;
  const faceCy = (130 * scale);
  const thickCy = (144 * scale);
  const rFace = (120 * scale);

  const colThickness = hexToRgba('#0B6F3C');
  const colRimInner = hexToRgba('#5BF0A0');
  const colRimOuter = hexToRgba('#138A4C');
  const colCream = hexToRgba('#F5ECD2');
  const colEmerald = hexToRgba('#2BD67B');
  const colBrass = hexToRgba('#E9B949');
  const colBrassStroke = hexToRgba('#A47A16');

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // 1. Thickness
      const dThick = Math.hypot(x - cx, y - thickCy);
      if (dThick <= rFace + 0.5) {
        const edgeA = Math.max(0, Math.min(1, rFace + 0.5 - dThick));
        blendPixel(png, x, y, { ...colThickness, a: edgeA });
      }

      // 2. Face disc with gradient
      const dFace = Math.hypot(x - cx, y - faceCy);
      if (dFace <= rFace + 0.5) {
        const edgeA = Math.max(0, Math.min(1, rFace + 0.5 - dFace));
        const t = dFace / rFace;
        const rimCol = lerpColor(colRimInner, colRimOuter, t);
        blendPixel(png, x, y, { ...rimCol, a: edgeA });

        // Cream disc r100
        if (dFace <= 100 * scale) {
          blendPixel(png, x, y, colCream);
        }

        // Ring r84 emerald (6 units)
        const d84 = Math.abs(dFace - 84 * scale);
        if (d84 <= 3 * scale) {
          blendPixel(png, x, y, { ...colEmerald, a: 0.95 });
        }

        // Ring r62 brass (3 units)
        const d62 = Math.abs(dFace - 62 * scale);
        if (d62 <= 1.5 * scale) {
          blendPixel(png, x, y, colBrass);
        }

        // Dashed ring r40 emerald
        const d40 = Math.abs(dFace - 40 * scale);
        if (d40 <= 1.5 * scale) {
          const angle = Math.atan2(y - faceCy, x - cx);
          const seg = (Math.PI * 2) / 20;
          if (Math.abs((angle + Math.PI * 2) % seg) < seg * 0.5) {
            blendPixel(png, x, y, colEmerald);
          }
        }

        // Center brass dot r12
        if (dFace <= 12 * scale) {
          blendPixel(png, x, y, dFace > 10 * scale ? colBrassStroke : colBrass);
        }

        // Aim notch: top triangle (130, 30)
        if (y < faceCy - 75 * scale && Math.abs(x - cx) <= (y - (faceCy - 114 * scale)) * 0.45) {
          blendPixel(png, x, y, { r: 6, g: 33, b: 15, a: 0.65 });
        }

        // Highlight ellipse rotated -35 deg at (86, 74)
        const cosR = Math.cos(35 * Math.PI / 180);
        const sinR = Math.sin(35 * Math.PI / 180);
        const dx = (x - 86 * scale);
        const dy = (y - 74 * scale);
        const rx = dx * cosR - dy * sinR;
        const ry = dx * sinR + dy * cosR;
        const elDist = Math.hypot(rx / (23 * scale), ry / (9 * scale));
        if (elDist <= 1.0) {
          blendPixel(png, x, y, { r: 255, g: 255, b: 255, a: (1 - elDist) * 0.50 });
        }
      }
    }
  }

  return png;
}

// 3. Render Standalone Shadow
function renderShadowImage(w, h, rx, ry, maxAlpha = 0.40) {
  const png = new PNG({ width: w, height: h });
  const cx = w / 2;
  const cy = h / 2;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
      if (d <= 1.0) {
        const a = (1.0 - d * d) * maxAlpha;
        blendPixel(png, x, y, { r: 0, g: 0, b: 0, a });
      }
    }
  }

  return png;
}

// 4. Render Board Classic Texture (2048x2048)
function renderBoardImage(dim = 2048) {
  const png = new PNG({ width: dim, height: dim });
  const scale = dim / 640;

  const colWoodInner = hexToRgba('#A0612C');
  const colWoodMid = hexToRgba('#6B3A1A');
  const colWoodOuter = hexToRgba('#8B5226');
  const colLip = hexToRgba('#3E2210');
  const colSurface = hexToRgba('#F0DDB0');
  const colGrain = hexToRgba('#B8955A', 0.22);
  const colBrass = hexToRgba('#E9B949', 0.70);
  const colLine = hexToRgba('#6B3A1A');
  const colGreen = hexToRgba('#1E8F5A');
  const colRed = hexToRgba('#D8344A');
  const colPocketBrass = hexToRgba('#C9A24B');

  const sOrigin = 56 * scale;
  const sSize = 528 * scale;
  const sEnd = sOrigin + sSize;
  const center = dim / 2;

  // Frame Background
  for (let y = 0; y < dim; y++) {
    for (let x = 0; x < dim; x++) {
      const t = (x + y) / (dim * 2);
      const wood = t < 0.5 ? lerpColor(colWoodInner, colWoodMid, t * 2) : lerpColor(colWoodMid, colWoodOuter, (t - 0.5) * 2);
      blendPixel(png, x, y, wood);

      // Frame grain
      if ((Math.floor(x / scale) % 8 === 2) || (Math.floor(x / scale) % 8 === 6)) {
        blendPixel(png, x, y, { r: 74, g: 38, b: 16, a: 0.15 });
      }

      // Inner lip rect (44-596)
      if (x >= 44 * scale && x <= 596 * scale && y >= 44 * scale && y <= 596 * scale) {
        blendPixel(png, x, y, colLip);
      }

      // Playing surface 56-584
      if (x >= sOrigin && x <= sEnd && y >= sOrigin && y <= sEnd) {
        blendPixel(png, x, y, colSurface);
        if (Math.floor((x - sOrigin) / scale) % 13 === 6) {
          blendPixel(png, x, y, colGrain);
        }

        // Diagonal gloss overlay (22% -> 0%)
        const glossT = 1.0 - (x + y) / (sEnd * 2);
        if (glossT > 0) {
          blendPixel(png, x, y, { r: 255, g: 255, b: 255, a: glossT * 0.22 });
        }
      }
    }
  }

  // Draw vector lines & markings
  function drawLine(x1, y1, x2, y2, col, thick = 2) {
    const dist = Math.hypot(x2 - x1, y2 - y1);
    const steps = Math.ceil(dist * 2);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = x1 + (x2 - x1) * t;
      const py = y1 + (y2 - y1) * t;
      for (let ox = -thick / 2; ox <= thick / 2; ox++) {
        for (let oy = -thick / 2; oy <= thick / 2; oy++) {
          blendPixel(png, Math.round(px + ox), Math.round(py + oy), col);
        }
      }
    }
  }

  function drawCircle(cx, cy, r, col, strokeW = 2, fillCol = null) {
    for (let y = Math.floor(cy - r - strokeW); y <= Math.ceil(cy + r + strokeW); y++) {
      for (let x = Math.floor(cx - r - strokeW); x <= Math.ceil(cx + r + strokeW); x++) {
        const d = Math.hypot(x - cx, y - cy);
        if (fillCol && d <= r) {
          blendPixel(png, x, y, fillCol);
        }
        const diff = Math.abs(d - r);
        if (diff <= strokeW / 2) {
          const a = 1.0 - diff / (strokeW / 2);
          blendPixel(png, x, y, { ...col, a: col.a * a });
        }
      }
    }
  }

  // Brass Inlay
  const inset = 8 * scale;
  drawLine(inset, inset, dim - inset, inset, colBrass, 2 * scale);
  drawLine(dim - inset, inset, dim - inset, dim - inset, colBrass, 2 * scale);
  drawLine(dim - inset, dim - inset, inset, dim - inset, colBrass, 2 * scale);
  drawLine(inset, dim - inset, inset, inset, colBrass, 2 * scale);

  // Baselines pills
  const drawBaselinePill = (x1, y1, x2, y2, isH) => {
    const r = 12 * scale;
    drawLine(x1, y1, x2, y2, colLine, 2 * scale);
    if (isH) {
      drawLine(x1, y1 - r, x2, y1 - r, colLine, 2 * scale);
      drawLine(x1, y1 + r, x2, y1 + r, colLine, 2 * scale);
      drawCircle(x1, y1, 8 * scale, colRed, 1, colRed);
      drawCircle(x2, y1, 8 * scale, colRed, 1, colRed);
    } else {
      drawLine(x1 - r, y1, x1 - r, y2, colLine, 2 * scale);
      drawLine(x1 + r, y1, x1 + r, y2, colLine, 2 * scale);
      drawCircle(x1, y1, 8 * scale, colRed, 1, colRed);
      drawCircle(x1, y2, 8 * scale, colRed, 1, colRed);
    }
  };

  drawBaselinePill(164 * scale, 130 * scale, 476 * scale, 130 * scale, true);
  drawBaselinePill(164 * scale, 510 * scale, 476 * scale, 510 * scale, true);
  drawBaselinePill(130 * scale, 164 * scale, 130 * scale, 476 * scale, false);
  drawBaselinePill(510 * scale, 164 * scale, 510 * scale, 476 * scale, false);

  // Center Circles
  drawCircle(center, center, 86 * scale, colGreen, 3 * scale);
  drawCircle(center, center, 62 * scale, colRed, 2 * scale);
  drawCircle(center, center, 40 * scale, colGreen, 1.5 * scale);
  drawCircle(center, center, 18 * scale, colGreen, 2 * scale);
  drawCircle(center, center, 10 * scale, colRed, 1, colRed);

  // Pockets
  const pR = 28 * scale;
  const pCenters = [
    [80 * scale, 80 * scale],
    [560 * scale, 80 * scale],
    [80 * scale, 560 * scale],
    [560 * scale, 560 * scale],
  ];

  pCenters.forEach(([px, py]) => {
    drawCircle(px, py, pR, colPocketBrass, 4 * scale, hexToRgba('#050302'));
  });

  return png;
}

// 5. Pack Textures into Atlas
function packAtlas(textures, atlasDim = 512) {
  const atlas = new PNG({ width: atlasDim, height: atlasDim });
  const frames = {};

  let curX = 0;
  let curY = 0;
  let rowH = 0;

  for (const item of textures) {
    if (curX + item.png.width > atlasDim) {
      curX = 0;
      curY += rowH + 2;
      rowH = 0;
    }

    // Copy to atlas
    for (let y = 0; y < item.png.height; y++) {
      for (let x = 0; x < item.png.width; x++) {
        const srcIdx = (y * item.png.width + x) << 2;
        const dstIdx = ((curY + y) * atlasDim + (curX + x)) << 2;
        atlas.data[dstIdx] = item.png.data[srcIdx];
        atlas.data[dstIdx + 1] = item.png.data[srcIdx + 1];
        atlas.data[dstIdx + 2] = item.png.data[srcIdx + 2];
        atlas.data[dstIdx + 3] = item.png.data[srcIdx + 3];
      }
    }

    frames[item.key] = {
      frame: { x: curX, y: curY, w: item.png.width, h: item.png.height },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: item.png.width, h: item.png.height },
      sourceSize: { w: item.png.width, h: item.png.height },
    };

    curX += item.png.width + 2;
    rowH = Math.max(rowH, item.png.height);
  }

  const atlasJson = {
    frames,
    meta: {
      app: 'CarromVerse Texture Packer',
      version: '1.0',
      image: 'carrom_atlas.png',
      format: 'RGBA8888',
      size: { w: atlasDim, h: atlasDim },
      scale: '1',
    },
  };

  return { atlas, atlasJson };
}

// Execution
async function generateAll() {
  console.log('Generating CarromVerse Assets...');

  // Scales @1x, @2x, @3x
  const scales = [
    { label: '@1x', coin: 62, striker: 82 },
    { label: '@2x', coin: 124, striker: 164 },
    { label: '@3x', coin: 186, striker: 246 },
  ];

  const atlasItems = [];

  for (const s of scales) {
    const cWhite = renderCoinImage(s.coin, 'white');
    const cBlack = renderCoinImage(s.coin, 'black');
    const cQueen = renderCoinImage(s.coin, 'queen');
    const striker = renderStrikerImage(s.striker);
    const shadowCoin = renderShadowImage(s.coin, Math.round(s.coin * 0.4), s.coin * 0.4, s.coin * 0.15, 0.40);
    const shadowStriker = renderShadowImage(s.striker, Math.round(s.striker * 0.4), s.striker * 0.42, s.striker * 0.16, 0.45);

    fs.writeFileSync(path.join(TEXTURES_DIR, `coin_white${s.label}.png`), PNG.sync.write(cWhite));
    fs.writeFileSync(path.join(TEXTURES_DIR, `coin_black${s.label}.png`), PNG.sync.write(cBlack));
    fs.writeFileSync(path.join(TEXTURES_DIR, `coin_queen${s.label}.png`), PNG.sync.write(cQueen));
    fs.writeFileSync(path.join(TEXTURES_DIR, `striker_default${s.label}.png`), PNG.sync.write(striker));
    fs.writeFileSync(path.join(TEXTURES_DIR, `shadow_coin${s.label}.png`), PNG.sync.write(shadowCoin));
    fs.writeFileSync(path.join(TEXTURES_DIR, `shadow_striker${s.label}.png`), PNG.sync.write(shadowStriker));

    if (s.label === '@1x') {
      atlasItems.push(
        { key: 'coin_white', png: cWhite },
        { key: 'coin_black', png: cBlack },
        { key: 'coin_queen', png: cQueen },
        { key: 'striker_default', png: striker },
        { key: 'shadow_coin', png: shadowCoin },
        { key: 'shadow_striker', png: shadowStriker }
      );
    }
  }

  // Board (2048px)
  console.log('Rendering 2048x2048 Classic Wood Board...');
  const board = renderBoardImage(2048);
  fs.writeFileSync(path.join(TEXTURES_DIR, 'board_classic.png'), PNG.sync.write(board));

  // Atlas
  console.log('Packing 512x512 Sprite Atlas...');
  const { atlas, atlasJson } = packAtlas(atlasItems, 512);
  fs.writeFileSync(path.join(TEXTURES_DIR, 'carrom_atlas.png'), PNG.sync.write(atlas));
  fs.writeFileSync(path.join(TEXTURES_DIR, 'carrom_atlas.json'), JSON.stringify(atlasJson, null, 2));

  console.log('Successfully generated all CarromVerse assets in packages/game-engine/assets/textures!');
}

generateAll().catch(console.error);
