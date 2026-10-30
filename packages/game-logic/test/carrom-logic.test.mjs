import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CarromRulesManager,
  TurnManager,
  ScoreManager,
  CarromStateMachine,
  createDefaultGameConfig,
  BASELINE_DEFINITIONS,
  DEFAULT_BOARD_DIMENSIONS,
} from '../dist/index.js';

describe('CarromVerse Game Logic Foundation Tests', () => {
  const config2P = createDefaultGameConfig('two_player_individual');
  const players2P = [
    {
      id: 'p1',
      name: 'Alice',
      type: 'human',
      seat: 0,
      position: 'bottom',
      assignedCoinType: 'white',
      isReady: true,
      score: 0,
      fouls: 0,
    },
    {
      id: 'p2',
      name: 'Bob',
      type: 'human',
      seat: 2,
      position: 'top',
      assignedCoinType: 'black',
      isReady: true,
      score: 0,
      fouls: 0,
    },
  ];

  it('TurnManager alternates properly in 2-Player mode', () => {
    const tm = new TurnManager('two_player_individual', players2P, 25);
    const t1 = tm.createInitialTurn();
    assert.strictEqual(t1.activePlayerId, 'p1');
    assert.strictEqual(t1.activeSeat, 0);

    const t2 = tm.advanceTurn(false);
    assert.strictEqual(t2.activePlayerId, 'p2');
    assert.strictEqual(t2.activeSeat, 2);

    const t3 = tm.advanceTurn(false);
    assert.strictEqual(t3.activePlayerId, 'p1');
  });

  it('TurnManager grants extra turn without advancing player when earnedExtraTurn is true', () => {
    const tm = new TurnManager('two_player_individual', players2P, 25);
    tm.createInitialTurn();
    const t2 = tm.advanceTurn(true);
    assert.strictEqual(t2.activePlayerId, 'p1');
    assert.strictEqual(t2.turnNumber, 2);
  });

  it('TurnManager rotates 4-Player Team (2 vs 2) correctly', () => {
    const players4PTeam = [
      { id: 'tA1', name: 'A1', seat: 0, teamId: 'team_a', type: 'human', position: 'bottom', assignedCoinType: 'white', isReady: true, score: 0, fouls: 0 },
      { id: 'tB1', name: 'B1', seat: 1, teamId: 'team_b', type: 'human', position: 'right', assignedCoinType: 'black', isReady: true, score: 0, fouls: 0 },
      { id: 'tA2', name: 'A2', seat: 2, teamId: 'team_a', type: 'human', position: 'top', assignedCoinType: 'white', isReady: true, score: 0, fouls: 0 },
      { id: 'tB2', name: 'B2', seat: 3, teamId: 'team_b', type: 'human', position: 'left', assignedCoinType: 'black', isReady: true, score: 0, fouls: 0 },
    ];

    const tm = new TurnManager('four_player_team', players4PTeam, 25);
    assert.strictEqual(tm.getActivePlayer().id, 'tA1'); // Seat 0 (Team A)
    tm.advanceTurn(false);
    assert.strictEqual(tm.getActivePlayer().id, 'tB1'); // Seat 1 (Team B)
    tm.advanceTurn(false);
    assert.strictEqual(tm.getActivePlayer().id, 'tA2'); // Seat 2 (Team A)
    tm.advanceTurn(false);
    assert.strictEqual(tm.getActivePlayer().id, 'tB2'); // Seat 3 (Team B)
    tm.advanceTurn(false);
    assert.strictEqual(tm.getActivePlayer().id, 'tA1'); // Seat 0 (Team A)
  });

  it('CarromRulesManager detects striker pocketing foul and assesses penalty', () => {
    const rules = new CarromRulesManager(config2P);
    const result = rules.evaluateShot({
      player: players2P[0],
      pocketedCoins: [],
      strikerPocketed: true,
      queenStatus: 'unpocketed',
    });

    assert.strictEqual(result.foulCommitted, true);
    assert.strictEqual(result.foulType, 'striker_pocketed');
    assert.strictEqual(result.penaltyCoinsDue, 1);
    assert.strictEqual(result.extraTurnEarned, false);
  });

  it('CarromRulesManager grants extra turn on pocketing own assigned coin', () => {
    const rules = new CarromRulesManager(config2P);
    const whiteCoin = { id: 'c1', type: 'white', position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, angle: 0, angularVelocity: 0, state: 'pocketed' };

    const result = rules.evaluateShot({
      player: players2P[0], // assigned: white
      pocketedCoins: [whiteCoin],
      strikerPocketed: false,
      queenStatus: 'unpocketed',
    });

    assert.strictEqual(result.foulCommitted, false);
    assert.strictEqual(result.extraTurnEarned, true);
  });

  it('Queen Cover Logic: pocketing queen sets pending_cover; subsequent cover succeeds', () => {
    const rules = new CarromRulesManager(config2P);
    const queenCoin = { id: 'cq', type: 'queen', position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, angle: 0, angularVelocity: 0, state: 'pocketed' };

    // Shot 1: Queen pocketed alone
    const shot1 = rules.evaluateShot({
      player: players2P[0],
      pocketedCoins: [queenCoin],
      strikerPocketed: false,
      queenStatus: 'unpocketed',
    });

    assert.strictEqual(shot1.queenPocketedThisShot, true);
    assert.strictEqual(shot1.queenCoveredThisShot, false);
    assert.strictEqual(shot1.extraTurnEarned, true);

    // Shot 2: Covering with assigned white coin
    const whiteCoin = { id: 'c1', type: 'white', position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 }, angle: 0, angularVelocity: 0, state: 'pocketed' };
    const shot2 = rules.evaluateShot({
      player: players2P[0],
      pocketedCoins: [whiteCoin],
      strikerPocketed: false,
      queenStatus: 'pending_cover',
      queenPocketedByPlayerId: 'p1',
    });

    assert.strictEqual(shot2.queenCoveredThisShot, true);
    assert.strictEqual(shot2.queenReturnedToCenter, false);
    assert.strictEqual(shot2.extraTurnEarned, true);
  });

  it('Queen Cover Logic: failed cover returns queen to center', () => {
    const rules = new CarromRulesManager(config2P);
    // Shot fails to pocket any assigned coin while Queen is pending cover
    const shot = rules.evaluateShot({
      player: players2P[0],
      pocketedCoins: [],
      strikerPocketed: false,
      queenStatus: 'pending_cover',
      queenPocketedByPlayerId: 'p1',
    });

    assert.strictEqual(shot.queenCoveredThisShot, false);
    assert.strictEqual(shot.queenReturnedToCenter, true);
    assert.strictEqual(shot.extraTurnEarned, false);
  });

  it('Baseline placement validates legal positions', () => {
    const rules = new CarromRulesManager(config2P);
    // Legal position on Seat 0 baseline (y = 845, x between 240 and 760)
    const valid = rules.isStrikerPlacementValid(0, { x: 500, y: 845 }, []);
    assert.strictEqual(valid.isValid, true);

    // Illegal position (outside baseline in center of board)
    const invalid = rules.isStrikerPlacementValid(0, { x: 500, y: 500 }, []);
    assert.strictEqual(invalid.isValid, false);
  });
});
