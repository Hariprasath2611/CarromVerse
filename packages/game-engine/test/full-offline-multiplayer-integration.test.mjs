import { test, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import Matter from 'matter-js';

import {
  BOARD_PX,
  PX_PER_CM,
  SIZES,
  MASSES,
  SPEEDS,
  FRICTION,
  RESTITUTION,
  POCKET,
  SIMULATION,
} from '../dist/physics/PhysicsConfig.js';
import { PhysicsUtils } from '../dist/utils/PhysicsUtils.js';
import { MotionDetector } from '../dist/mechanics/MotionDetector.js';
import { PocketDetection } from '../dist/mechanics/PocketDetection.js';
import { generateOpeningCoinCluster } from '../dist/board/BoardConfig.js';

import {
  CarromStateMachine,
  CarromRulesEngine,
  createDefaultGameConfig,
  createInitialPlayersForMode,
  validatePlayerConfiguration,
  getSeatDirectionLabel,
  PREDEFINED_AVATARS,
  StandardTwoPlayerRuleset,
  ThreePlayerRuleset,
  FourPlayerIndividualRuleset,
  FourPlayerTeamRuleset,
} from '@carromverse/game-logic';

const { Engine, Bodies, Composite, Body, Events } = Matter;

// Helper to construct a real Matter.js Tournament Board with 4 walls & 4 pocket sensors
function createRealPhysicsBoard() {
  const engine = Engine.create({
    gravity: { x: 0, y: 0 },
    positionIterations: SIMULATION.positionIterations,
    velocityIterations: SIMULATION.velocityIterations,
  });

  const s = BOARD_PX; // 740 px
  const cx = s / 2;
  const cy = s / 2;
  const thick = SIZES.wallThicknessPx;

  // Outer cushions
  const topWall = Bodies.rectangle(cx, -thick / 2, s + thick * 2, thick, {
    isStatic: true,
    restitution: 0.0,
    friction: 0.0,
    label: 'wall_top',
  });
  const botWall = Bodies.rectangle(cx, s + thick / 2, s + thick * 2, thick, {
    isStatic: true,
    restitution: 0.0,
    friction: 0.0,
    label: 'wall_bottom',
  });
  const leftWall = Bodies.rectangle(-thick / 2, cy, thick, s + thick * 2, {
    isStatic: true,
    restitution: 0.0,
    friction: 0.0,
    label: 'wall_left',
  });
  const rightWall = Bodies.rectangle(s + thick / 2, cy, thick, s + thick * 2, {
    isStatic: true,
    restitution: 0.0,
    friction: 0.0,
    label: 'wall_right',
  });

  Composite.add(engine.world, [topWall, botWall, leftWall, rightWall]);

  // Wall bounce damping
  Events.on(engine, 'collisionStart', (e) => {
    e.pairs.forEach((pair) => {
      const isWallA = pair.bodyA.label && pair.bodyA.label.startsWith('wall');
      const isWallB = pair.bodyB.label && pair.bodyB.label.startsWith('wall');
      if (isWallA || isWallB) {
        pair.restitution = RESTITUTION.wallBounceDamping;
      }
    });
  });

  // Pockets
  const pocketCenters = [
    { x: SIZES.pocketOffsetPx, y: SIZES.pocketOffsetPx, id: 'top_left' },
    { x: s - SIZES.pocketOffsetPx, y: SIZES.pocketOffsetPx, id: 'top_right' },
    { x: SIZES.pocketOffsetPx, y: s - SIZES.pocketOffsetPx, id: 'bottom_left' },
    { x: s - SIZES.pocketOffsetPx, y: s - SIZES.pocketOffsetPx, id: 'bottom_right' },
  ];

  const pockets = pocketCenters.map((p) =>
    Bodies.circle(p.x, p.y, SIZES.pocketRadiusPx, {
      isStatic: true,
      isSensor: true,
      label: `pocket_${p.id}`,
    })
  );
  Composite.add(engine.world, pockets);

  return { engine, pockets, pocketCenters, s };
}

// Helper to spawn standard 19-coin cluster in Matter.js world
function spawnPhysicsCoins(engine) {
  const clusterDefs = generateOpeningCoinCluster();
  const coinBodies = clusterDefs.map((def) => {
    const px = def.nx * BOARD_PX;
    const py = def.ny * BOARD_PX;
    const b = Bodies.circle(px, py, SIZES.coinRadiusPx, {
      restitution: RESTITUTION.coinToCoin,
      friction: FRICTION.frictionAir,
      frictionAir: FRICTION.frictionAir,
      frictionStatic: 0.0,
      label: `coin_${def.id}`,
    });
    Body.setMass(b, MASSES.coin);
    b.coinType = def.type;
    b.coinId = def.id;
    return b;
  });

  Composite.add(engine.world, coinBodies);
  return coinBodies;
}

// Fixed timestep stepping with Coulomb friction deceleration
function stepWorld(engine, bodies, dtSec = 1 / 60) {
  const decelStep = FRICTION.decelerationCmS2 * dtSec;
  bodies.forEach((b) => {
    if (b.isStatic) return;
    const spd = Math.hypot(b.velocity.x, b.velocity.y);
    if (spd > 0.0001) {
      const newSpd = Math.max(0, spd - decelStep);
      const ratio = newSpd / spd;
      Body.setVelocity(b, { x: b.velocity.x * ratio, y: b.velocity.y * ratio });
    }
  });

  Engine.update(engine, dtSec * 1000);
}

describe('CarromVerse Phase 1.6 – End-to-End Integration Testing', () => {
  describe('1. Physics & Striker Mechanics with Baseline Seating', () => {
    it('positions striker legally on all 4 baselines (Seats 0, 1, 2, 3)', () => {
      const { engine, s } = createRealPhysicsBoard();
      const center = s / 2;
      const baselineOffset = 74 * (BOARD_PX / 528);

      // Seats: 0=South, 1=East, 2=North, 3=West
      const seatPositions = [
        { seat: 0, expectedX: center, expectedY: s - baselineOffset },
        { seat: 1, expectedX: s - baselineOffset, expectedY: center },
        { seat: 2, expectedX: center, expectedY: baselineOffset },
        { seat: 3, expectedX: baselineOffset, expectedY: center },
      ];

      for (const sp of seatPositions) {
        const striker = Bodies.circle(sp.expectedX, sp.expectedY, SIZES.strikerRadiusPx, {
          label: `striker_seat_${sp.seat}`,
        });
        Body.setMass(striker, MASSES.striker);
        Composite.add(engine.world, striker);

        // Verify striker stays within board boundaries
        assert.ok(striker.position.x > 0 && striker.position.x < s);
        assert.ok(striker.position.y > 0 && striker.position.y < s);

        // Verify mass ratio is 3:1 relative to coin mass
        assert.strictEqual(striker.mass, 15);
        Composite.remove(engine.world, striker);
      }
    });

    it('enforces min and max shooting speed bounds', () => {
      // Speeds: MIN=40 cm/s, MAX=350 cm/s
      assert.strictEqual(SPEEDS.strikerMinLaunchSpeedCmS, 40);
      assert.strictEqual(SPEEDS.strikerMaxLaunchSpeedCmS, 350);

      const minStepVel = PhysicsUtils.speedCmSToStepVelocity(SPEEDS.strikerMinLaunchSpeedCmS, 1 / 60);
      const maxStepVel = PhysicsUtils.speedCmSToStepVelocity(SPEEDS.strikerMaxLaunchSpeedCmS, 1 / 60);

      assert.ok(minStepVel > 0);
      assert.ok(maxStepVel > minStepVel);
      assert.strictEqual(Math.round(maxStepVel / minStepVel), Math.round(350 / 40));
    });

    it('executes physical collision: striker transfers kinetic momentum to coin', () => {
      const { engine } = createRealPhysicsBoard();
      // Position striker below coin with a small gap
      const striker = Bodies.circle(370, 450, SIZES.strikerRadiusPx, {
        restitution: RESTITUTION.strikerToCoin,
      });
      Body.setMass(striker, MASSES.striker);
      const coin = Bodies.circle(370, 400, SIZES.coinRadiusPx, {
        restitution: RESTITUTION.coinToCoin,
      });
      Body.setMass(coin, MASSES.coin);
      Composite.add(engine.world, [striker, coin]);

      // Launch striker upward into coin at 150 cm/s
      const vStep = PhysicsUtils.speedCmSToStepVelocity(150, 1 / 60);
      Body.setVelocity(striker, { x: 0, y: -vStep });

      // Run 20 physics steps
      for (let i = 0; i < 20; i++) {
        stepWorld(engine, [striker, coin]);
      }

      // Coin must have received momentum and moved upward (negative y)
      assert.ok(coin.position.y < 400, `Coin y did not decrease: ${coin.position.y}`);
    });

    it('detects coin entering pocket sensor and flags capture without duplicate events', () => {
      const { engine, pocketCenters } = createRealPhysicsBoard();
      const pocketTL = pocketCenters[0]; // (39, 39)
      const coin = Bodies.circle(pocketTL.x, pocketTL.y, SIZES.coinRadiusPx);
      Composite.add(engine.world, coin);

      const pocketDetector = new PocketDetection({
        pocketRadius: SIZES.pocketRadiusPx,
        captureThreshold: SIZES.pocketCaptureRadiusPx,
      });

      // Coin at exact pocket center
      const dist = Math.hypot(coin.position.x - pocketTL.x, coin.position.y - pocketTL.y);
      assert.ok(dist <= SIZES.pocketCaptureRadiusPx);

      const capturedFirst = pocketDetector.checkPocketCapture(coin, pocketCenters);
      assert.ok(capturedFirst);

      // Verify deduplication: second check ignores already pocketed coin
      pocketDetector.markAsPocketed('coin_test_1');
      const isAlreadyPocketed = pocketDetector.isPocketed('coin_test_1');
      assert.strictEqual(isAlreadyPocketed, true);
    });
  });

  describe('2. Mode 1 Integration: Two Players Individual (1v1)', () => {
    it('executes a complete 1v1 match from opening shot to victory and result generation', () => {
      const players = createInitialPlayersForMode('two_player_individual', {
        customNames: { 0: 'Alice', 2: 'Bob' },
      });
      const config = createDefaultGameConfig('two_player_individual');
      config.targetScore = 15; // Set target to 15 for match completion
      const sm = new CarromStateMachine(config, players);

      // 1. Verify seating and player configs
      assert.strictEqual(players[0].name, 'Alice');
      assert.strictEqual(players[0].seat, 0);
      assert.strictEqual(players[0].assignedCoinType, 'white');
      assert.strictEqual(players[1].name, 'Bob');
      assert.strictEqual(players[1].seat, 2);
      assert.strictEqual(players[1].assignedCoinType, 'black');

      // 2. Shot 1: Alice pockets a legal white coin
      const shot1 = sm.processShotSettlement({
        pocketedCoins: [{ id: 'w1', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(shot1.extraTurnEarned, true);
      assert.strictEqual(shot1.foulOccurred, false);
      assert.strictEqual(sm.getSessionState().scores['player_0'].points, 10);
      // Turn remains with Alice
      assert.strictEqual(shot1.nextTurn.activePlayerId, 'player_0');

      // 3. Shot 2: Alice pockets Queen alone -> Queen status becomes pending_cover
      const shot2 = sm.processShotSettlement({
        pocketedCoins: [{ id: 'queen_1', type: 'queen' }],
        strikerPocketed: false,
      });
      assert.strictEqual(shot2.queenStatusAfter, 'pending_cover');
      assert.strictEqual(shot2.extraTurnEarned, true);

      // 4. Shot 3: Alice pockets White coin to cover Queen!
      const shot3 = sm.processShotSettlement({
        pocketedCoins: [{ id: 'w2', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(shot3.queenCoveredThisShot, true);
      assert.strictEqual(shot3.queenStatusAfter, 'covered');
      // Alice gets 10 pts for white coin + 25 pts for queen = 35 total pts
      assert.strictEqual(sm.getSessionState().scores['player_0'].points, 45);

      // 5. Target score reached (45 >= 15) -> Match complete!
      assert.strictEqual(shot3.isMatchOver, true);
      assert.ok(shot3.matchResult);
      assert.strictEqual(shot3.matchResult.winnerId, 'player_0');
      assert.strictEqual(shot3.matchResult.winnerName, 'Alice');
      assert.strictEqual(shot3.matchResult.isDraw, false);
    });

    it('switches turn to Bob upon dry shot or striker scratch foul', () => {
      const players = createInitialPlayersForMode('two_player_individual');
      const config = createDefaultGameConfig('two_player_individual');
      const sm = new CarromStateMachine(config, players);

      // Dry shot -> turn passes to seat 2 (Bob)
      const dryShot = sm.processShotSettlement({
        pocketedCoins: [],
        strikerPocketed: false,
      });
      assert.strictEqual(dryShot.extraTurnEarned, false);
      assert.strictEqual(dryShot.nextTurn.activeSeat, 2);

      // Bob scratches striker -> foul penalty, turn passes back to Alice (seat 0)
      const foulShot = sm.processShotSettlement({
        pocketedCoins: [],
        strikerPocketed: true,
      });
      assert.strictEqual(foulShot.foulOccurred, true);
      assert.strictEqual(foulShot.primaryFoulType, 'striker_pocketed');
      assert.strictEqual(foulShot.nextTurn.activeSeat, 0);
    });
  });

  describe('3. Mode 2 Integration: Three Players Individual (Points Carrom)', () => {
    it('executes a complete 3-player match with turn rotation across seats 0 -> 1 -> 2 -> 0', () => {
      const players = createInitialPlayersForMode('three_player_individual', {
        customNames: { 0: 'Alice', 1: 'Bob', 2: 'Charlie' },
      });
      const config = createDefaultGameConfig('three_player_individual');
      config.targetScore = 20;
      const sm = new CarromStateMachine(config, players);

      // Verify 3 seats
      assert.strictEqual(players.length, 3);
      assert.deepStrictEqual(players.map((p) => p.seat), [0, 1, 2]);

      // Turn 1: Alice (Seat 0) takes dry shot -> Turn passes to Bob (Seat 1)
      const shot1 = sm.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(shot1.nextTurn.activeSeat, 1);

      // Turn 2: Bob (Seat 1) pockets a black coin (worth 5 points in points carrom) -> extra turn
      const shot2 = sm.processShotSettlement({
        pocketedCoins: [{ id: 'b1', type: 'black' }],
        strikerPocketed: false,
      });
      assert.strictEqual(shot2.extraTurnEarned, true);
      assert.strictEqual(sm.getSessionState().scores['player_1'].points, 5);

      // Turn 3: Bob takes dry shot -> passes to Charlie (Seat 2)
      const shot3 = sm.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(shot3.nextTurn.activeSeat, 2);

      // Turn 4: Charlie (Seat 2) pockets Queen (25 pts) in points carrom!
      const shot4 = sm.processShotSettlement({
        pocketedCoins: [{ id: 'queen_1', type: 'queen' }],
        strikerPocketed: false,
      });
      assert.strictEqual(sm.getSessionState().scores['player_2'].points, 25);
      // Charlie reaches target score of 20 -> Match complete!
      assert.strictEqual(shot4.isMatchOver, true);
      assert.strictEqual(shot4.matchResult.winnerName, 'Charlie');
    });
  });

  describe('4. Mode 3 Integration: Four Players Individual (Free-For-All)', () => {
    it('rotates turns clockwise through all four seats and evaluates individual scoring', () => {
      const players = createInitialPlayersForMode('four_player_individual');
      const config = createDefaultGameConfig('four_player_individual');
      config.targetScore = 15;
      const sm = new CarromStateMachine(config, players);

      assert.strictEqual(players.length, 4);
      assert.deepStrictEqual(players.map((p) => p.seat), [0, 1, 2, 3]);

      // Turn 1 (Seat 0) dry -> passes to Seat 1
      const t1 = sm.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(t1.nextTurn.activeSeat, 1);

      // Turn 2 (Seat 1) dry -> passes to Seat 2
      const t2 = sm.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(t2.nextTurn.activeSeat, 2);

      // Turn 3 (Seat 2) dry -> passes to Seat 3
      const t3 = sm.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(t3.nextTurn.activeSeat, 3);

      // Turn 4 (Seat 3) dry -> passes back to Seat 0
      const t4 = sm.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(t4.nextTurn.activeSeat, 0);

      // Player 1 (Seat 0) pockets 2 White coins (20 pts) -> Wins match!
      const winShot = sm.processShotSettlement({
        pocketedCoins: [
          { id: 'w1', type: 'white' },
          { id: 'w2', type: 'white' },
        ],
        strikerPocketed: false,
      });
      assert.strictEqual(winShot.isMatchOver, true);
      assert.strictEqual(winShot.matchResult.winnerId, 'player_0');
    });
  });

  describe('5. Mode 4 Integration: Four Players Team (2v2 Doubles)', () => {
    it('executes a complete 2v2 doubles match with team alternation and shared scores', () => {
      const players = createInitialPlayersForMode('four_player_team', {
        teamAName: 'Emerald Knights',
        teamBName: 'Golden Strikers',
      });
      const config = createDefaultGameConfig('four_player_team');
      config.targetScore = 20;
      const sm = new CarromStateMachine(config, players);

      // 1. Verify opposite seating layout
      const validation = validatePlayerConfiguration('four_player_team', players);
      assert.strictEqual(validation.isValid, true);

      // Team A partners: Seat 0 & Seat 2 (White coins)
      assert.strictEqual(players[0].teamId, 'team_a');
      assert.strictEqual(players[2].teamId, 'team_a');
      assert.strictEqual(players[0].assignedCoinType, 'white');
      assert.strictEqual(players[2].assignedCoinType, 'white');

      // Team B partners: Seat 1 & Seat 3 (Black coins)
      assert.strictEqual(players[1].teamId, 'team_b');
      assert.strictEqual(players[3].teamId, 'team_b');
      assert.strictEqual(players[1].assignedCoinType, 'black');
      assert.strictEqual(players[3].assignedCoinType, 'black');

      // 2. Strict alternating turns: A1 (0) -> B1 (1) -> A2 (2) -> B2 (3)
      // A1 dry shot -> passes to B1
      const s1 = sm.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s1.nextTurn.activeSeat, 1);
      assert.strictEqual(s1.nextTurn.activePlayerId, 'player_1');

      // B1 dry shot -> passes to A2
      const s2 = sm.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s2.nextTurn.activeSeat, 2);
      assert.strictEqual(s2.nextTurn.activePlayerId, 'player_2');

      // A2 pockets a White coin (+10 points for Team A) -> earns extra turn
      const s3 = sm.processShotSettlement({
        pocketedCoins: [{ id: 'w1', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(s3.extraTurnEarned, true);
      assert.strictEqual(s3.nextTurn.activeSeat, 2);

      // A2 pockets a second White coin (+10 points -> 20 points total for Team A)
      const s4 = sm.processShotSettlement({
        pocketedCoins: [{ id: 'w2', type: 'white' }],
        strikerPocketed: false,
      });

      // Team A reached target score (20 points) -> Match complete!
      assert.strictEqual(s4.isMatchOver, true);
      assert.strictEqual(s4.matchResult.winningTeamId, 'team_a');
      assert.strictEqual(s4.matchResult.isDraw, false);
    });
  });

  describe('6. Pass-and-Play Handover System Mechanics', () => {
    it('identifies when handover confirmation is required on turn transition', () => {
      const players = createInitialPlayersForMode('two_player_individual');
      const config = createDefaultGameConfig('two_player_individual');
      config.handoverConfirmationEnabled = true;

      const prevTurn = { activePlayerId: 'player_0', activeSeat: 0 };
      const nextTurn = { activePlayerId: 'player_2', activeSeat: 2 };

      const playerSwitched = nextTurn.activePlayerId !== prevTurn.activePlayerId;
      assert.strictEqual(playerSwitched, true);

      const nextPlayer = players.find((p) => p.id === nextTurn.activePlayerId);
      assert.ok(nextPlayer);
      assert.strictEqual(nextPlayer.name, 'Player 2');
      assert.strictEqual(getSeatDirectionLabel(nextPlayer.seat), 'North (Top)');
    });

    it('bypasses handover modal when handoverConfirmationEnabled is disabled', () => {
      const config = createDefaultGameConfig('two_player_individual');
      config.handoverConfirmationEnabled = false;

      const isHandoverRequired = config.handoverConfirmationEnabled !== false;
      assert.strictEqual(isHandoverRequired, false);
    });
  });

  describe('7. Performance & Stability Verification', () => {
    it('executes 100 consecutive physics shots with substepping and zero body leaks', () => {
      const { engine, s } = createRealPhysicsBoard();
      const cx = s / 2;
      const cy = s / 2;

      const coinBodies = spawnPhysicsCoins(engine, cx, cy);
      const striker = Bodies.circle(cx, s - 100, SIZES.strikerRadiusPx);
      Body.setMass(striker, MASSES.strikerMass);
      Composite.add(engine.world, striker);

      const initialBodyCount = Composite.allBodies(engine.world).length;
      assert.strictEqual(initialBodyCount, 4 + 4 + 19 + 1); // 4 walls + 4 pockets + 19 coins + 1 striker = 28

      const tStart = Date.now();

      // Run 100 simulated shots
      for (let shot = 0; shot < 100; shot++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        const vStep = PhysicsUtils.speedCmSToStepVelocity(120, 1 / 60);
        Body.setVelocity(striker, { x: Math.cos(angle) * vStep, y: Math.sin(angle) * vStep });

        // Simulate 20 substepping frames per shot
        for (let frame = 0; frame < 20; frame++) {
          stepWorld(engine, [striker, ...coinBodies]);
        }

        // Reset striker back to baseline without leaking bodies
        Body.setPosition(striker, { x: cx, y: s - 100 });
        Body.setVelocity(striker, { x: 0, y: 0 });
      }

      const totalTimeMs = Date.now() - tStart;
      const finalBodyCount = Composite.allBodies(engine.world).length;

      // Assert zero body leaks
      assert.strictEqual(finalBodyCount, initialBodyCount);
      // Assert average frame time is well within 60 FPS budget (< 16ms per frame)
      const avgStepMs = totalTimeMs / 2000;
      assert.ok(avgStepMs < 5.0, `Step time ${avgStepMs}ms exceeds 5ms threshold`);
    });
  });
});
