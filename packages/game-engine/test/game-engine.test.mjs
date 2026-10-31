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
import { VectorUtils } from '../dist/utils/VectorUtils.js';
import { PhysicsUtils } from '../dist/utils/PhysicsUtils.js';
import {
  COLLISION_CATEGORIES,
  COLLISION_MASKS,
  ALL_COINS_CATEGORY,
} from '../dist/physics/CollisionCategories.js';
import { PHYSICS_CONFIG } from '../dist/physics/PhysicsConfig.js';
import { MotionDetector } from '../dist/mechanics/MotionDetector.js';
import { PocketDetection } from '../dist/mechanics/PocketDetection.js';

describe('CarromVerse Game Engine Phase 1.3 & 1.4 Tests', () => {
  describe('Phase 1.3 Board & Visual Tests', () => {
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

      const queen = queens[0];
      assert.equal(queen.nx, 0.5);
      assert.equal(queen.ny, 0.5);

      const rCoin = NORMALIZED_BOARD_CONFIG.COIN_RADIUS;
      const minAllowedDist = 2 * rCoin * 0.99;

      for (let i = 0; i < cluster.length; i++) {
        for (let j = i + 1; j < cluster.length; j++) {
          const dx = cluster[i].nx - cluster[j].nx;
          const dy = cluster[i].ny - cluster[j].ny;
          const dist = Math.hypot(dx, dy);
          assert.ok(
            dist >= minAllowedDist,
            `Coins ${cluster[i].id} and ${cluster[j].id} overlap! Distance=${dist}`
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
  });

  describe('Phase 1.4 Physics Math & Utilities Tests', () => {
    it('VectorUtils accurately computes distance, magnitude, normalize, dot, and clamp', () => {
      assert.equal(VectorUtils.distance(0, 0, 3, 4), 5);
      assert.equal(VectorUtils.magnitude(3, 4), 5);

      const norm = VectorUtils.normalize(0, 10);
      assert.equal(norm.x, 0);
      assert.equal(norm.y, 1);

      const zeroNorm = VectorUtils.normalize(0, 0);
      assert.equal(zeroNorm.x, 0);
      assert.equal(zeroNorm.y, 0);

      assert.equal(VectorUtils.dot(1, 0, 0, 1), 0); // Orthogonal vectors
      assert.equal(VectorUtils.dot(2, 3, 4, 5), 23);

      assert.equal(VectorUtils.clamp(15, 0, 10), 10);
      assert.equal(VectorUtils.clamp(-5, 0, 10), 0);
      assert.equal(VectorUtils.clamp(5, 0, 10), 5);

      // Vector reflection against horizontal wall (normal = [0, -1])
      const reflected = VectorUtils.reflect({ x: 2, y: 3 }, { x: 0, y: 1 });
      assert.equal(reflected.x, 2);
      assert.equal(reflected.y, -3);
    });

    it('PhysicsUtils accurately converts coordinates, energies, overlaps, and damping', () => {
      assert.equal(PhysicsUtils.toPixels(0.5, 800), 400);
      assert.equal(PhysicsUtils.toNormalized(400, 800), 0.5);

      const pv = PhysicsUtils.toPixelVector({ x: 0.25, y: 0.75 }, 800);
      assert.equal(pv.x, 200);
      assert.equal(pv.y, 600);

      const speed = PhysicsUtils.calculateImpactSpeed({ x: 10, y: 0 }, { x: -5, y: 0 });
      assert.equal(speed, 15);

      // Kinetic Energy: 0.5 * 2kg * (10m/s)^2 = 100 J
      const ke = PhysicsUtils.calculateKineticEnergy(2, 10);
      assert.equal(ke, 100);

      // Overlap: radius 10 and 15 at distance 20 -> 10 + 15 = 25 > 20 -> overlap!
      const overlap = PhysicsUtils.checkCircleOverlap(
        { x: 0, y: 0, radius: 10 },
        { x: 20, y: 0, radius: 15 }
      );
      assert.equal(overlap, true);

      // Non-overlap: distance 30 > 25
      const noOverlap = PhysicsUtils.checkCircleOverlap(
        { x: 0, y: 0, radius: 10 },
        { x: 30, y: 0, radius: 15 }
      );
      assert.equal(noOverlap, false);

      // Velocity damping snaps to zero below rest threshold
      const snapped = PhysicsUtils.applyDamping({ x: 0.03, y: 0.04 }, 0.05, 0.08);
      assert.equal(snapped.x, 0);
      assert.equal(snapped.y, 0);

      const damped = PhysicsUtils.applyDamping({ x: 10, y: 0 }, 0.1, 0.08);
      assert.equal(damped.x, 9);
      assert.equal(damped.y, 0);
    });

    it('Collision Categories and Bitmasks satisfy all interaction requirements', () => {
      // Categories must have distinct single-bit representations (except composite aliases)
      assert.equal(COLLISION_CATEGORIES.DEFAULT & COLLISION_CATEGORIES.BOARD_BOUNDARY, 0);
      assert.equal(COLLISION_CATEGORIES.WHITE_COIN & COLLISION_CATEGORIES.BLACK_COIN, 0);
      assert.equal(COLLISION_CATEGORIES.WHITE_COIN & COLLISION_CATEGORIES.QUEEN, 0);
      assert.equal(COLLISION_CATEGORIES.STRIKER & COLLISION_CATEGORIES.POCKET_SENSOR, 0);

      // Striker must collide with cushions, all coins, and pocket sensors
      assert.ok((COLLISION_MASKS.STRIKER & COLLISION_CATEGORIES.BOARD_BOUNDARY) !== 0);
      assert.ok((COLLISION_MASKS.STRIKER & COLLISION_CATEGORIES.WHITE_COIN) !== 0);
      assert.ok((COLLISION_MASKS.STRIKER & COLLISION_CATEGORIES.BLACK_COIN) !== 0);
      assert.ok((COLLISION_MASKS.STRIKER & COLLISION_CATEGORIES.QUEEN) !== 0);
      assert.ok((COLLISION_MASKS.STRIKER & COLLISION_CATEGORIES.POCKET_SENSOR) !== 0);

      // Coins must collide with board boundaries, other coins, striker, and pocket sensors
      assert.ok((COLLISION_MASKS.WHITE_COIN & COLLISION_CATEGORIES.BOARD_BOUNDARY) !== 0);
      assert.ok((COLLISION_MASKS.WHITE_COIN & COLLISION_CATEGORIES.BLACK_COIN) !== 0);
      assert.ok((COLLISION_MASKS.WHITE_COIN & COLLISION_CATEGORIES.STRIKER) !== 0);
      assert.ok((COLLISION_MASKS.WHITE_COIN & COLLISION_CATEGORIES.POCKET_SENSOR) !== 0);

      // Pocket sensors must detect striker and all coins
      assert.ok((COLLISION_MASKS.POCKET_SENSOR & COLLISION_CATEGORIES.STRIKER) !== 0);
      assert.ok((COLLISION_MASKS.POCKET_SENSOR & ALL_COINS_CATEGORY) !== 0);
    });

    it('PHYSICS_CONFIG sets zero gravity and correct carrom mass ratios', () => {
      assert.equal(PHYSICS_CONFIG.world.gravity.x, 0, 'Top-down carrom must have zero X gravity');
      assert.equal(PHYSICS_CONFIG.world.gravity.y, 0, 'Top-down carrom must have zero Y gravity');

      // Striker mass must be ~2.7x to 3.0x coin mass (ICF standard: ~15g vs ~5.5g)
      assert.ok(
        PHYSICS_CONFIG.striker.massRatio > 2.5 && PHYSICS_CONFIG.striker.massRatio < 3.2,
        `Striker mass ratio ${PHYSICS_CONFIG.striker.massRatio} must be ~2.73`
      );

      // High elastic restitution
      assert.ok(PHYSICS_CONFIG.coins.restitution >= 0.85, 'Coins must have high elastic rebound');
      assert.ok(PHYSICS_CONFIG.striker.restitution >= 0.85, 'Striker must have hard acrylic rebound');
      assert.ok(PHYSICS_CONFIG.cushions.normalRetention >= 0.60, 'Cushions must have solid rebound');

      // Stopping velocity thresholds
      assert.ok(PHYSICS_CONFIG.motion.linearRestThreshold <= 5.0);
      assert.ok(PHYSICS_CONFIG.motion.settledCooldownMs >= 200);
    });

    it('MotionDetector accurately tracks shot lifecycle and settled duration', (t, done) => {
      let stoppedCalled = false;
      let settledCalled = false;

      const detector = new MotionDetector({
        onAllObjectsStopped: () => {
          stoppedCalled = true;
        },
        onShotSettled: () => {
          settledCalled = true;
        },
      });

      assert.equal(detector.isBoardAtRest(), true, 'Board must start at rest');
      assert.equal(detector.isShotInProgress(), false);

      // Start shot
      detector.notifyShotStarted();
      assert.equal(detector.isShotInProgress(), true);
      assert.equal(detector.isBoardAtRest(), false);

      // Mock striker and coins at rest
      const mockStriker = {
        physicsBody: { velocity: { x: 0, y: 0 }, angularVelocity: 0 },
        isPocketed: false,
      };
      const mockCoins = [
        {
          id: 'c1',
          physicsBody: { velocity: { x: 0, y: 0 }, angularVelocity: 0 },
          isPocketed: false,
        },
      ];

      // Step 1: Detect all stopped
      detector.update(mockStriker, mockCoins);
      assert.equal(stoppedCalled, true, 'onAllObjectsStopped must be emitted');

      // Fast forward past cooldown (300ms)
      setTimeout(() => {
        detector.update(mockStriker, mockCoins);
        assert.equal(settledCalled, true, 'onShotSettled must be emitted after rest cooldown');
        assert.equal(detector.isBoardAtRest(), true);
        done();
      }, 330);
    });

    it('PocketDetection detects sensor overlap, prevents duplicate entries, and queues removal', () => {
      const mockScene = {
        matter: {
          world: {
            remove: () => {},
          },
        },
      };

      let pocketEventReceived = null;
      const pd = new PocketDetection(mockScene, (event) => {
        pocketEventReceived = event;
      });

      let animationPlayed = false;
      const mockEntity = {
        id: 'coin_white_1',
        playPocketAnimation: (cb) => {
          animationPlayed = true;
          cb?.();
        },
      };

      const mockBody = {
        entity: mockEntity,
        entityType: 'white',
      };

      // 1. First trigger registers pocket entry
      pd.handleSensorOverlap(mockBody, 2);
      pd.processQueuedRemovals();

      assert.ok(pocketEventReceived !== null);
      assert.equal(pocketEventReceived.id, 'coin_white_1');
      assert.equal(pocketEventReceived.type, 'white');
      assert.equal(pocketEventReceived.pocketIndex, 2);
      assert.equal(animationPlayed, true);

      // 2. Duplicate trigger on same coin is suppressed
      pocketEventReceived = null;
      pd.handleSensorOverlap(mockBody, 2);
      pd.processQueuedRemovals();
      assert.equal(pocketEventReceived, null, 'Duplicate pocketing must be suppressed');
    });

    it('generateCarromPhaserHtml embeds Phaser Matter physics with zero gravity and bridge events', () => {
      const html = generateCarromPhaserHtml({
        themeId: 'forest',
        strikerSkin: 'emerald',
        activeSeat: 0,
        canvasSize: 800,
      });

      assert.ok(html.includes("default: 'matter'"), 'Must configure Matter physics default');
      assert.ok(html.includes('setGravity(0, 0)'), 'Must configure zero gravity');
      assert.ok(html.includes('SHOT_STARTED'), 'Must support SHOT_STARTED bridge event');
      assert.ok(html.includes('OBJECT_POCKETED'), 'Must support OBJECT_POCKETED bridge event');
      assert.ok(html.includes('STRIKER_POCKETED'), 'Must support STRIKER_POCKETED bridge event');
      assert.ok(html.includes('SHOT_SETTLED'), 'Must support SHOT_SETTLED bridge event');
      assert.ok(html.includes('AIM_CHANGED'), 'Must support AIM_CHANGED bridge event');
      assert.ok(html.includes('cushion_top'), 'Must create cushion bodies');
      assert.ok(html.includes('pocket_'), 'Must create pocket sensor bodies');
    });
  });
});
