import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  CarromRulesEngine,
  createDefaultGameConfig,
  StandardTwoPlayerRuleset,
  ThreePlayerRuleset,
  FourPlayerIndividualRuleset,
  FourPlayerTeamRuleset,
  FoulManager,
  QueenManager,
  ScoringEngine,
  TurnManager,
  WinConditionManager,
} from '../dist/index.js';

describe('CarromVerse Phase 1.5 – Comprehensive Rules Engine Tests', () => {
  const create2PPlayers = () => [
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

  const create3PPlayers = () => [
    { id: 'p1', name: 'Alice', type: 'human', seat: 0, position: 'bottom', assignedCoinType: 'any', isReady: true, score: 0, fouls: 0 },
    { id: 'p2', name: 'Bob', type: 'human', seat: 1, position: 'right', assignedCoinType: 'any', isReady: true, score: 0, fouls: 0 },
    { id: 'p3', name: 'Charlie', type: 'human', seat: 2, position: 'top', assignedCoinType: 'any', isReady: true, score: 0, fouls: 0 },
  ];

  const create4PTeamPlayers = () => [
    { id: 'tA1', name: 'Alice', seat: 0, teamId: 'team_a', type: 'human', position: 'bottom', assignedCoinType: 'white', isReady: true, score: 0, fouls: 0 },
    { id: 'tB1', name: 'Bob', seat: 1, teamId: 'team_b', type: 'human', position: 'right', assignedCoinType: 'black', isReady: true, score: 0, fouls: 0 },
    { id: 'tA2', name: 'Andrew', seat: 2, teamId: 'team_a', type: 'human', position: 'top', assignedCoinType: 'white', isReady: true, score: 0, fouls: 0 },
    { id: 'tB2', name: 'Bella', seat: 3, teamId: 'team_b', type: 'human', position: 'left', assignedCoinType: 'black', isReady: true, score: 0, fouls: 0 },
  ];

  describe('1. Mode A: Two Players (1v1)', () => {
    it('initializes 19 coins and sets seat 0 active', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());
      const coins = engine.getCoins();

      assert.strictEqual(coins.length, 19);
      assert.strictEqual(coins.filter((c) => c.type === 'white').length, 9);
      assert.strictEqual(coins.filter((c) => c.type === 'black').length, 9);
      assert.strictEqual(coins.filter((c) => c.type === 'queen').length, 1);
      assert.strictEqual(engine.getTurnManager().getActivePlayer().id, 'p1');
    });

    it('legal pocketing of own coin awards points and extra turn', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());

      const evalResult = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.foulOccurred, false);
      assert.strictEqual(evalResult.playerScoreDelta, 10);
      assert.strictEqual(evalResult.extraTurnEarned, true);
      assert.strictEqual(evalResult.nextTurn?.activePlayerId, 'p1');
      assert.strictEqual(evalResult.nextTurn?.turnNumber, 2);
    });

    it('dry shot (0 coins pocketed) passes turn to opponent', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());

      const evalResult = engine.processShotSettlement({
        pocketedCoins: [],
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.foulOccurred, false);
      assert.strictEqual(evalResult.playerScoreDelta, 0);
      assert.strictEqual(evalResult.extraTurnEarned, false);
      assert.strictEqual(evalResult.nextTurn?.activePlayerId, 'p2');
      assert.strictEqual(evalResult.nextTurn?.activeSeat, 2);
    });

    it('striker scratch foul incurs penalty coin and forfeits turn', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());

      // Alice first legally banks 1 coin
      engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });

      // Alice now commits a striker scratch foul
      const foulShot = engine.processShotSettlement({
        pocketedCoins: [],
        strikerPocketed: true,
      });

      assert.strictEqual(foulShot.foulOccurred, true);
      assert.strictEqual(foulShot.primaryFoulType, 'striker_pocketed');
      assert.strictEqual(foulShot.extraTurnEarned, false);
      // Alice's banked coin is returned to board
      assert.strictEqual(foulShot.coinsToReturnToBoard.length, 1);
      assert.strictEqual(foulShot.coinsToReturnToBoard[0].type, 'white');
      // Turn passes to Bob
      assert.strictEqual(foulShot.nextTurn?.activePlayerId, 'p2');
    });

    it('target score achievement completes the match with winner', () => {
      const config = createDefaultGameConfig('two_player_individual');
      config.targetScore = 20; // 2 white coins needed
      const engine = new CarromRulesEngine(config, create2PPlayers());

      // Alice pockets 2 white coins in one shot
      const shot = engine.processShotSettlement({
        pocketedCoins: [
          { id: 'coin_inner_0', type: 'white' },
          { id: 'coin_outer_0', type: 'white' },
        ],
        strikerPocketed: false,
      });

      assert.strictEqual(shot.playerScoreDelta, 20);
      assert.strictEqual(shot.isMatchOver, true);
      assert.ok(shot.matchResult);
      assert.strictEqual(shot.matchResult?.winnerId, 'p1');
      assert.strictEqual(shot.matchResult?.isDraw, false);
    });
  });

  describe('2. Mode B: Three Players (Points Carrom)', () => {
    it('turn rotates sequentially 0 -> 1 -> 2 -> 0 on dry shots', () => {
      const config = createDefaultGameConfig('three_player_individual');
      const engine = new CarromRulesEngine(config, create3PPlayers());

      assert.strictEqual(engine.getTurnManager().getActivePlayer().id, 'p1');

      const s1 = engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s1.nextTurn?.activePlayerId, 'p2');

      const s2 = engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s2.nextTurn?.activePlayerId, 'p3');

      const s3 = engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s3.nextTurn?.activePlayerId, 'p1');
    });

    it('any player earns points for pocketing any coin in points carrom', () => {
      const config = createDefaultGameConfig('three_player_individual');
      const engine = new CarromRulesEngine(config, create3PPlayers());

      // Player 1 pockets a black coin (+5)
      const s1 = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_1', type: 'black' }],
        strikerPocketed: false,
      });
      assert.strictEqual(s1.playerScoreDelta, 5);
      assert.strictEqual(s1.extraTurnEarned, true);

      // Player 1 pockets a white coin (+10)
      const s2 = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(s2.playerScoreDelta, 10);
      assert.strictEqual(s2.playerScores['p1'].points, 15);
    });

    it('smooth rotation when a player is eliminated', () => {
      const config = createDefaultGameConfig('three_player_individual');
      const engine = new CarromRulesEngine(config, create3PPlayers());

      // Eliminate player 2 (Bob)
      engine.getTurnManager().eliminatePlayer('p2');

      // Alice takes dry shot
      const s1 = engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      // Skips Bob and goes directly to Charlie (p3)
      assert.strictEqual(s1.nextTurn?.activePlayerId, 'p3');

      // Charlie takes dry shot -> goes back to Alice (p1)
      const s2 = engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s2.nextTurn?.activePlayerId, 'p1');
    });
  });

  describe('3. Mode D: Four Players Team (2 vs 2)', () => {
    it('alternates between teams in strict sequence: A1(0) -> B1(1) -> A2(2) -> B2(3) -> A1(0)', () => {
      const config = createDefaultGameConfig('four_player_team');
      const engine = new CarromRulesEngine(config, create4PTeamPlayers());

      assert.strictEqual(engine.getTurnManager().getActivePlayer().id, 'tA1');

      const s1 = engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s1.nextTurn?.activePlayerId, 'tB1');
      assert.strictEqual(s1.nextTurn?.activeSeat, 1);

      const s2 = engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s2.nextTurn?.activePlayerId, 'tA2');
      assert.strictEqual(s2.nextTurn?.activeSeat, 2);

      const s3 = engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s3.nextTurn?.activePlayerId, 'tB2');
      assert.strictEqual(s3.nextTurn?.activeSeat, 3);

      const s4 = engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(s4.nextTurn?.activePlayerId, 'tA1');
      assert.strictEqual(s4.nextTurn?.activeSeat, 0);
    });

    it('aggregates shared team points across partners', () => {
      const config = createDefaultGameConfig('four_player_team');
      const engine = new CarromRulesEngine(config, create4PTeamPlayers());

      // Alice (Team A, seat 0) pockets 1 White coin (+10)
      const s1 = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(s1.playerScoreDelta, 10);
      assert.strictEqual(s1.teamScoreDelta, 10);
      assert.strictEqual(s1.teamScores?.team_a.points, 10);

      // Alice takes a dry shot -> passes to Bob (Team B)
      engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });

      // Bob takes a dry shot -> passes to Andrew (Team A, seat 2)
      engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(engine.getTurnManager().getActivePlayer().id, 'tA2');

      // Andrew (Team A partner) pockets another White coin (+10)
      const s3 = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_outer_0', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(s3.teamScores?.team_a.points, 20);
      assert.strictEqual(s3.teamScores?.team_a.whiteCoinsPocketed, 2);
    });

    it('team win condition triggers when team reaches target score', () => {
      const config = createDefaultGameConfig('four_player_team');
      config.targetScore = 20;
      const engine = new CarromRulesEngine(config, create4PTeamPlayers());

      const s1 = engine.processShotSettlement({
        pocketedCoins: [
          { id: 'coin_inner_0', type: 'white' },
          { id: 'coin_outer_0', type: 'white' },
        ],
        strikerPocketed: false,
      });

      assert.strictEqual(s1.isMatchOver, true);
      assert.strictEqual(s1.matchResult?.winningTeamId, 'team_a');
      assert.strictEqual(s1.matchResult?.winnerName, 'Team A');
    });
  });

  describe('4. Queen State Machine & Cover Rules', () => {
    it('Queen alone sets pending_cover; subsequent assigned coin covers and awards 25 points', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());

      // Shot 1: Queen pocketed alone
      const s1 = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_queen', type: 'queen' }],
        strikerPocketed: false,
      });

      assert.strictEqual(s1.queenStatusAfter, 'pending_cover');
      assert.strictEqual(s1.queenCoveredThisShot, false);
      assert.strictEqual(s1.extraTurnEarned, true);
      assert.strictEqual(s1.playerScoreDelta, 0); // Queen points deferred until cover!

      // Shot 2: Covering with White coin
      const s2 = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });

      assert.strictEqual(s2.queenStatusAfter, 'covered');
      assert.strictEqual(s2.queenCoveredThisShot, true);
      // Scores White coin (10) + Queen (25) = 35 points!
      assert.strictEqual(s2.playerScoreDelta, 35);
      assert.strictEqual(s2.extraTurnEarned, true);
    });

    it('Immediate cover: Queen AND White coin pocketed in the very same shot', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());

      const shot = engine.processShotSettlement({
        pocketedCoins: [
          { id: 'coin_queen', type: 'queen' },
          { id: 'coin_inner_0', type: 'white' },
        ],
        strikerPocketed: false,
      });

      assert.strictEqual(shot.queenStatusAfter, 'covered');
      assert.strictEqual(shot.queenCoveredThisShot, true);
      assert.strictEqual(shot.queenReturnedToCenter, false);
      assert.strictEqual(shot.playerScoreDelta, 35);
      assert.strictEqual(shot.extraTurnEarned, true);
    });

    it('Failed cover: Player fails to pocket assigned coin on cover shot -> Queen returns to center', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());

      // Shot 1: Pocket Queen alone
      engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_queen', type: 'queen' }],
        strikerPocketed: false,
      });

      // Shot 2: Dry shot (fails to cover)
      const s2 = engine.processShotSettlement({
        pocketedCoins: [],
        strikerPocketed: false,
      });

      assert.strictEqual(s2.queenCoveredThisShot, false);
      assert.strictEqual(s2.queenReturnedToCenter, true);
      assert.strictEqual(s2.coinsToReturnToBoard.some((c) => c.type === 'queen'), true);
      assert.strictEqual(s2.extraTurnEarned, false);
      assert.strictEqual(s2.nextTurn?.activePlayerId, 'p2');
    });

    it('Foul during Queen shot returns Queen to board immediately', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());

      // Pocket Queen AND scratch striker simultaneously
      const shot = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_queen', type: 'queen' }],
        strikerPocketed: true,
      });

      assert.strictEqual(shot.foulOccurred, true);
      assert.strictEqual(shot.queenCoveredThisShot, false);
      assert.strictEqual(shot.queenReturnedToCenter, true);
      assert.strictEqual(shot.coinsToReturnToBoard.some((c) => c.type === 'queen'), true);
      assert.strictEqual(shot.extraTurnEarned, false);
      assert.strictEqual(shot.nextTurn?.activePlayerId, 'p2');
    });
  });

  describe('5. Due Penalties & Settlement', () => {
    it('logs due penalty when player has 0 banked coins; settles upon next legal pocket', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());

      // Alice scratches on turn 1 with 0 banked coins
      const s1 = engine.processShotSettlement({
        pocketedCoins: [],
        strikerPocketed: true,
      });

      assert.strictEqual(s1.foulOccurred, true);
      assert.strictEqual(s1.coinsToReturnToBoard.length, 0); // No coins available to return yet
      assert.strictEqual(engine.getFoulManager().getPenaltiesDue('p1'), 1);

      // Bob takes dry shot -> Alice's turn again
      engine.processShotSettlement({ pocketedCoins: [], strikerPocketed: false });
      assert.strictEqual(engine.getTurnManager().getActivePlayer().id, 'p1');

      // Alice now pockets a White coin: it settles the due penalty by returning to board
      const s3 = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });

      assert.strictEqual(engine.getFoulManager().getPenaltiesDue('p1'), 0);
      assert.strictEqual(s3.coinsToReturnToBoard.length, 1);
      assert.strictEqual(s3.coinsToReturnToBoard[0].type, 'white');
    });
  });

  describe('6. Deduplication & State Machine Bridge', () => {
    it('safely ignores duplicate pocket events for already pocketed coins', () => {
      const config = createDefaultGameConfig('two_player_individual');
      const engine = new CarromRulesEngine(config, create2PPlayers());

      // Turn 1: Alice pockets coin_inner_0
      engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(engine.getScoringEngine().getPlayerScore('p1')?.points, 10);

      // Turn 2: Attempting to submit the same coin_inner_0 again is deduplicated
      const s2 = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });
      // Should be treated as dry shot since coin was already pocketed
      assert.strictEqual(s2.playerScoreDelta, 0);
      assert.strictEqual(s2.extraTurnEarned, false);
      assert.strictEqual(engine.getScoringEngine().getPlayerScore('p1')?.points, 10);
    });
  });
});

