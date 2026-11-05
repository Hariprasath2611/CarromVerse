import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  BoardAnalyzer,
  CoinAnalyzer,
  PocketAnalyzer,
  AngleCalculator,
  TrajectoryEstimator,
  ShotGenerator,
  ShotEvaluator,
  StrategySelector,
  BotDecisionEngine,
  BotSessionManager,
  BOT_PERSONALITIES,
  DEFAULT_OVERALL_PRACTICE_STATS,
} from '../dist/index.js';

describe('Carrom Bot AI Engine', () => {
  describe('BoardAnalyzer & Geometry', () => {
    it('should correctly calculate normalized striker baseline position for each seat', () => {
      // Seat 0 (South): bottom baseline at y ~ 0.8301
      const pos0 = BoardAnalyzer.getStrikerPositionForOffset(0, 0);
      assert.strictEqual(pos0.x, 0.5);
      assert(Math.abs(pos0.y - 317.1 / 382) < 0.001);

      // Seat 2 (North): top baseline at y ~ 0.1662
      const pos2 = BoardAnalyzer.getStrikerPositionForOffset(2, 0);
      assert.strictEqual(pos2.x, 0.5);
      assert(Math.abs(pos2.y - 63.5 / 382) < 0.001);

      // Clamped offset tests
      const posLeft = BoardAnalyzer.getStrikerPositionForOffset(2, -1.5); // should clamp to -0.92
      const expectedLeftX = 0.5 - 0.92 * (101 / 382);
      assert(Math.abs(posLeft.x - expectedLeftX) < 0.001);
    });

    it('should accurately detect striker baseline overlap with existing coins', () => {
      const strikerPos = { x: 0.5, y: 0.1662 };
      const coins = [
        // Coin overlapping striker
        { id: 'c1', type: 'black', position: { x: 0.505, y: 0.167 }, isPocketed: false },
        // Coin far away
        { id: 'c2', type: 'white', position: { x: 0.2, y: 0.5 }, isPocketed: false },
      ];

      const isOverlapping = BoardAnalyzer.isStrikerOverlappingAnyCoin(strikerPos, coins);
      assert.strictEqual(isOverlapping, true);

      // If coin is pocketed, no overlap
      coins[0].isPocketed = true;
      assert.strictEqual(BoardAnalyzer.isStrikerOverlappingAnyCoin(strikerPos, coins), false);
    });
  });

  describe('AngleCalculator & Ghost Ball Physics', () => {
    it('should calculate direct ghost ball impact point and zero cut angle', () => {
      const strikerPos = { x: 0.5, y: 0.166 };
      const coinPos = { x: 0.5, y: 0.5 };
      const pocketPos = { x: 0.5, y: 0.933 }; // Directly below coin

      const ghost = AngleCalculator.calculateGhostBall(strikerPos, coinPos, pocketPos);
      assert.strictEqual(ghost.isValidGeometry, true);
      assert(ghost.cutAngleDeg < 1.0, `Expected head-on cut angle ~0, got ${ghost.cutAngleDeg}`);
      assert(ghost.impactPoint.y < coinPos.y, 'Impact point should be above coin for top shot');
    });

    it('should reject shots where cut angle exceeds physical carrom limits', () => {
      const strikerPos = { x: 0.5, y: 0.166 };
      const coinPos = { x: 0.5, y: 0.5 };
      const pocketPos = { x: 0.5, y: 0.06 }; // Pocket is behind striker!

      const ghost = AngleCalculator.calculateGhostBall(strikerPos, coinPos, pocketPos);
      assert.strictEqual(ghost.isValidGeometry, false);
      assert(ghost.cutAngleDeg > 90);
    });
  });

  describe('Trajectory & Obstacle Analysis', () => {
    it('should detect when another coin blocks striker line of sight', () => {
      const strikerPos = { x: 0.5, y: 0.166 };
      const impactPoint = { x: 0.5, y: 0.45 };
      const targetCoin = { id: 'target', type: 'black', position: { x: 0.5, y: 0.5 }, isPocketed: false };
      const pocket = BoardAnalyzer.POCKETS[3];

      // Blocking coin directly in front of striker
      const blockingCoin = { id: 'blocker', type: 'white', position: { x: 0.5, y: 0.3 }, isPocketed: false };

      const result = TrajectoryEstimator.estimateTrajectory(
        strikerPos,
        impactPoint,
        targetCoin,
        pocket,
        [targetCoin, blockingCoin],
        10,
        0.3,
        0.4
      );

      assert.strictEqual(result.isStrikerLineClear, false);
      assert.strictEqual(result.blockingCoinId, 'blocker');
      assert(result.estimatedSuccessProbability < 0.2, 'Success probability should be heavily penalized when blocked');
    });
  });

  describe('Bot Difficulties & Decision Engine', () => {
    const mockBoardSnapshot = {
      boardSize: 840,
      scale: 840 / 382,
      coins: [
        { id: 'w1', type: 'white', position: { x: 0.25, y: 0.35 }, isPocketed: false },
        { id: 'b1', type: 'black', position: { x: 0.70, y: 0.40 }, isPocketed: false },
        { id: 'b2', type: 'black', position: { x: 0.50, y: 0.45 }, isPocketed: false },
        { id: 'q', type: 'queen', position: { x: 0.50, y: 0.50 }, isPocketed: false },
      ],
      striker: {
        position: { x: 0.5, y: 0.1662 },
        radius: BoardAnalyzer.STRIKER_RADIUS_NORM,
        seat: 2,
        offsetRatio: 0,
        isPocketed: false,
      },
      pockets: BoardAnalyzer.POCKETS,
      activeSeat: 2,
      timestamp: Date.now(),
    };

    it('EASY Bot (Rookie): computes simple direct shot within candidate budget', () => {
      const engine = new BotDecisionEngine('EASY');
      const result = engine.computeShot(mockBoardSnapshot, 'black', 'unpocketed', 42);

      assert.strictEqual(result.decision.shot.targetCoinType === 'black' || result.decision.shot.targetCoinType === 'queen', true);
      assert(result.allEvaluatedCandidates.length <= BOT_PERSONALITIES.EASY.candidateEvaluationBudget);
      assert(result.decision.thinkingTimeMs >= BOT_PERSONALITIES.EASY.thinkingDelayMinMs);
      assert(result.executionDurationMs < 100, `Expected fast execution <100ms, took ${result.executionDurationMs}ms`);
    });

    it('MEDIUM Bot (Pro): evaluates candidates and considers queen opportunities', () => {
      const engine = new BotDecisionEngine('MEDIUM');
      const result = engine.computeShot(mockBoardSnapshot, 'black', 'unpocketed', 123);

      assert(result.allEvaluatedCandidates.length <= BOT_PERSONALITIES.MEDIUM.candidateEvaluationBudget);
      assert(result.decision.confidence > 0);
      assert(result.executionDurationMs < 100);
    });

    it('HARD Bot (Master): maximizes queen cover priority and optimal score selection', () => {
      const engine = new BotDecisionEngine('HARD');
      // When queen is pending cover, Hard bot MUST prioritize assigned coins
      const result = engine.computeShot(mockBoardSnapshot, 'black', 'pending_cover', 999);

      assert.strictEqual(result.strategyMode, 'COVER_QUEEN');
      assert.strictEqual(result.decision.shot.targetCoinType, 'black', 'Must target black coin to cover queen!');
      assert(result.decision.confidence > 0);
      assert(result.executionDurationMs < 100);
    });
  });

  describe('BotSessionManager & Statistics', () => {
    it('should initialize human vs bot players correctly', () => {
      const players = BotSessionManager.createPracticePlayers('Alice', '👑', 'HARD', 'white');
      assert.strictEqual(players.length, 2);

      const human = players[0];
      assert.strictEqual(human.name, 'Alice');
      assert.strictEqual(human.type, 'human');
      assert.strictEqual(human.seat, 0);
      assert.strictEqual(human.assignedCoinType, 'white');

      const bot = players[1];
      assert.strictEqual(bot.name, 'Master Bot');
      assert.strictEqual(bot.type, 'bot');
      assert.strictEqual(bot.seat, 2);
      assert.strictEqual(bot.assignedCoinType, 'black');
    });

    it('should create valid practice game configuration with handover disabled', () => {
      const config = BotSessionManager.createPracticeGameConfig({
        targetPoints: 115,
        turnTimeLimitSec: 25,
      });

      assert.strictEqual(config.mode, 'practice');
      assert.strictEqual(config.handoverConfirmationEnabled, false, 'Handover modal must be disabled in Practice mode');
      assert.strictEqual(config.targetScore, 115);
      assert.strictEqual(config.turnTimeLimitSeconds, 25);
    });

    it('should track and update practice statistics across difficulties', () => {
      let stats = { ...DEFAULT_OVERALL_PRACTICE_STATS };

      // Record a win against Easy bot
      stats = BotSessionManager.recordMatchResult(
        stats,
        'EASY',
        true, // won
        115,  // humanScore
        40,   // botScore
        12,   // shots
        9,    // pockets
        0,    // fouls
        true, // queenCovered
        180   // durationSec
      );

      assert.strictEqual(stats.easy.matchesPlayed, 1);
      assert.strictEqual(stats.easy.matchesWon, 1);
      assert.strictEqual(stats.easy.matchesLost, 0);
      assert.strictEqual(stats.easy.successfulPockets, 9);
      assert.strictEqual(stats.easy.queenSuccesses, 1);
      assert.strictEqual(stats.easy.highestScore, 115);

      // Record a loss against Hard bot
      stats = BotSessionManager.recordMatchResult(
        stats,
        'HARD',
        false, // lost
        75,    // humanScore
        115,   // botScore
        15,    // shots
        6,     // pockets
        1,     // fouls
        false, // queenCovered
        240    // durationSec
      );

      assert.strictEqual(stats.hard.matchesPlayed, 1);
      assert.strictEqual(stats.hard.matchesWon, 0);
      assert.strictEqual(stats.hard.matchesLost, 1);
      assert.strictEqual(stats.hard.fouls, 1);
      assert.strictEqual(stats.easy.matchesPlayed, 1, 'Easy stats should remain untouched');
    });
  });
});
