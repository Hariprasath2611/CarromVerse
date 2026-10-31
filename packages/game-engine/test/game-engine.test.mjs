import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBoardDimensions,
  NORMALIZED_BOARD_CONFIG,
  generateOpeningCoinCluster,
  getBaselineForSeat,
} from '../dist/board/BoardConfig.js';
import { getBoardTheme } from '../dist/board/BoardThemes.js';
import { generateCarromPhaserHtml } from '../dist/bridge/phaserHtmlGenerator.js';

describe('CarromVerse Game Engine Foundation & Rendering Tests', () => {
  it('calculateBoardDimensions calculates accurate pixel dimensions for standard canvas', () => {
    const dim800 = calculateBoardDimensions(800);
    assert.equal(dim800.size, 800);
    assert.equal(dim800.frameWidth, 800 * NORMALIZED_BOARD_CONFIG.FRAME_WIDTH);
    assert.equal(dim800.playingSurfaceSize, 800 * NORMALIZED_BOARD_CONFIG.PLAYING_SURFACE_SIZE);
    assert.ok(dim800.strikerRadius > dim800.coinRadius, 'Striker must be larger than coins');
    assert.equal(dim800.coinRadius, 800 * 0.02);
    assert.equal(dim800.strikerRadius, 800 * 0.028);
  });

  it('generateOpeningCoinCluster generates 19 coins with exact symmetrical formation', () => {
    const cluster = generateOpeningCoinCluster();
    assert.equal(cluster.length, 19, 'Must have exactly 19 coins in opening formation');

    const queens = cluster.filter((c) => c.type === 'queen');
    const whites = cluster.filter((c) => c.type === 'white');
    const blacks = cluster.filter((c) => c.type === 'black');

    assert.equal(queens.length, 1, 'Must contain exactly 1 Queen');
    assert.equal(whites.length, 9, 'Must contain exactly 9 White coins');
    assert.equal(blacks.length, 9, 'Must contain exactly 9 Black coins');

    // Verify Queen is at exact center
    const queen = queens[0];
    assert.equal(queen.nx, 0.5);
    assert.equal(queen.ny, 0.5);

    // Verify no two coins overlap
    const rCoin = NORMALIZED_BOARD_CONFIG.COIN_RADIUS;
    const minAllowedDist = 2 * rCoin * 0.99; // allows floating-point precision tolerance

    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        const dx = cluster[i].nx - cluster[j].nx;
        const dy = cluster[i].ny - cluster[j].ny;
        const dist = Math.hypot(dx, dy);
        assert.ok(
          dist >= minAllowedDist,
          `Coins ${cluster[i].id} and ${cluster[j].id} overlap! Distance=${dist}, min=${minAllowedDist}`
        );
      }
    }
  });

  it('getBoardTheme retrieves themes and falls back to forest emerald', () => {
    const classic = getBoardTheme('classic');
    assert.equal(classic.id, 'classic');
    assert.equal(classic.colors.surfaceBg, '#E8D3B0');

    const forest = getBoardTheme('forest');
    assert.equal(forest.id, 'forest');
    assert.equal(forest.colors.markingsColor, '#4ADE80');

    const royal = getBoardTheme('royal');
    assert.equal(royal.id, 'royal');

    const fallback = getBoardTheme('unknown_theme');
    assert.equal(fallback.id, 'forest');
  });

  it('getBaselineForSeat calculates accurate coordinates for all 4 player seats', () => {
    const south = getBaselineForSeat(0);
    assert.ok(south.y1 === south.y2, 'South baseline is horizontal');
    assert.ok(south.y1 > 0.5, 'South baseline is below center');

    const north = getBaselineForSeat(2);
    assert.ok(north.y1 === north.y2, 'North baseline is horizontal');
    assert.ok(north.y1 < 0.5, 'North baseline is above center');

    const west = getBaselineForSeat(3);
    assert.ok(west.x1 === west.x2, 'West baseline is vertical');
    assert.ok(west.x1 < 0.5, 'West baseline is left of center');

    const east = getBaselineForSeat(1);
    assert.ok(east.x1 === east.x2, 'East baseline is vertical');
    assert.ok(east.x1 > 0.5, 'East baseline is right of center');
  });

  it('generateCarromPhaserHtml produces a complete self-contained HTML page', () => {
    const html = generateCarromPhaserHtml({
      themeId: 'forest',
      strikerSkin: 'emerald',
      activeSeat: 0,
      canvasSize: 800,
    });

    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('carrom-game-container'));
    assert.ok(html.includes('phaser.min.js'));
    assert.ok(html.includes('tex_coin_queen'));
    assert.ok(html.includes('tex_striker_'));
    assert.ok(html.includes('BOARD_RENDERED'));
    assert.ok(html.includes('ENGINE_READY'));
  });
});
