import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CarromRulesEngine,
  CarromStateMachine,
  FreeStyleRuleset,
  createRulesetForMode,
  createDefaultGameConfig,
} from '../dist/index.js';

describe('CARROMVERSE – FREE STYLE MODE & GAMEPLAY IMPROVEMENTS TEST SUITE', () => {
  const setupFreeStyleEngine = (targetScore = 180) => {
    const players = [
      {
        id: 'player_1',
        name: 'Player 1',
        avatarUrl: '👑',
        type: 'human',
        seat: 0,
        position: 'bottom',
        assignedCoinType: 'any',
        isReady: true,
        score: 0,
        fouls: 0,
      },
      {
        id: 'player_2',
        name: 'Player 2',
        avatarUrl: '🐯',
        type: 'human',
        seat: 2,
        position: 'top',
        assignedCoinType: 'any',
        isReady: true,
        score: 0,
        fouls: 0,
      },
    ];

    const baseConfig = createDefaultGameConfig('two_player_individual');
    const config = {
      ...baseConfig,
      variant: 'freestyle_carrom',
      targetScore,
      whiteCoinPoints: 20,
      blackCoinPoints: 10,
      queenPoints: 50,
      requiresQueenCover: false,
      isOfficialSGFI: false,
    };

    const ruleset = new FreeStyleRuleset(config);
    const engine = new CarromRulesEngine(config, players, ruleset);
    return { engine, players, config, ruleset };
  };

  describe('1. FreeStyleRuleset Instantiation & Coin Values', () => {
    it('creates FreeStyleRuleset via factory when variant is freestyle_carrom', () => {
      const ruleset = createRulesetForMode('two_player_individual', {
        variant: 'freestyle_carrom',
        targetScore: 180,
      });
      assert.strictEqual(ruleset.variant, 'freestyle_carrom');
      assert.strictEqual(ruleset instanceof FreeStyleRuleset, true);
      assert.strictEqual(ruleset.targetScore, 180);
      assert.strictEqual(ruleset.requiresQueenCover, false);
    });

    it('has exact point values: White=20, Black=10, Red=50, Total board points=320', () => {
      const ruleset = new FreeStyleRuleset();
      assert.strictEqual(ruleset.getPointsForCoin('white'), 20);
      assert.strictEqual(ruleset.getPointsForCoin('black'), 10);
      assert.strictEqual(ruleset.getPointsForCoin('queen'), 50);

      // Total available board points: 9 * 20 + 9 * 10 + 1 * 50 = 180 + 90 + 50 = 320
      const totalBoardPoints = 9 * 20 + 9 * 10 + 1 * 50;
      assert.strictEqual(totalBoardPoints, 320);
    });

    it('treats all colored coins as open assigned coins and none as opponent coins', () => {
      const ruleset = new FreeStyleRuleset();
      const mockPlayer = { id: 'p1', seat: 0, assignedCoinType: 'any' };

      assert.strictEqual(ruleset.isAssignedCoin(mockPlayer, 'white'), true);
      assert.strictEqual(ruleset.isAssignedCoin(mockPlayer, 'black'), true);
      assert.strictEqual(ruleset.isAssignedCoin(mockPlayer, 'queen'), true);

      assert.strictEqual(ruleset.isOpponentCoin(mockPlayer, 'white'), false);
      assert.strictEqual(ruleset.isOpponentCoin(mockPlayer, 'black'), false);
      assert.strictEqual(ruleset.isOpponentCoin(mockPlayer, 'queen'), false);
    });
  });

  describe('2. Authoritative Scoring Calculations', () => {
    it('Example 1: One white coin = 20 points', () => {
      const { engine } = setupFreeStyleEngine();
      const evalResult = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.playerScoreDelta, 20);
      assert.strictEqual(evalResult.playerScores['player_1'].points, 20);
      assert.strictEqual(evalResult.playerScores['player_2'].points, 0);
      assert.strictEqual(evalResult.extraTurnEarned, true);
    });

    it('Example 2: One black coin = 10 points', () => {
      const { engine } = setupFreeStyleEngine();
      const evalResult = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_1', type: 'black' }],
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.playerScoreDelta, 10);
      assert.strictEqual(evalResult.playerScores['player_1'].points, 10);
      assert.strictEqual(evalResult.playerScores['player_2'].points, 0);
    });

    it('Example 3: One red coin = 50 points (no cover required in Free Style)', () => {
      const { engine } = setupFreeStyleEngine();
      const evalResult = engine.processShotSettlement({
        pocketedCoins: [{ id: 'queen', type: 'queen' }],
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.playerScoreDelta, 50);
      assert.strictEqual(evalResult.playerScores['player_1'].points, 50);
      assert.strictEqual(evalResult.playerScores['player_2'].points, 0);
      assert.strictEqual(evalResult.queenCoveredThisShot, true);
    });

    it('Example 4: Three white coins = 60 points', () => {
      const { engine } = setupFreeStyleEngine();
      const evalResult = engine.processShotSettlement({
        pocketedCoins: [
          { id: 'coin_inner_0', type: 'white' },
          { id: 'coin_inner_2', type: 'white' },
          { id: 'coin_inner_4', type: 'white' },
        ],
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.playerScoreDelta, 60);
      assert.strictEqual(evalResult.playerScores['player_1'].points, 60);
    });

    it('Example 5: Two white + two black = 60 points (2*20 + 2*10 = 60)', () => {
      const { engine } = setupFreeStyleEngine();
      const evalResult = engine.processShotSettlement({
        pocketedCoins: [
          { id: 'coin_inner_0', type: 'white' },
          { id: 'coin_inner_2', type: 'white' },
          { id: 'coin_inner_1', type: 'black' },
          { id: 'coin_inner_3', type: 'black' },
        ],
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.playerScoreDelta, 60);
      assert.strictEqual(evalResult.playerScores['player_1'].points, 60);
    });

    it('Example 6: One white + one black + one red = 80 points (20 + 10 + 50 = 80)', () => {
      const { engine } = setupFreeStyleEngine();
      const evalResult = engine.processShotSettlement({
        pocketedCoins: [
          { id: 'coin_inner_0', type: 'white' },
          { id: 'coin_inner_1', type: 'black' },
          { id: 'queen', type: 'queen' },
        ],
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.playerScoreDelta, 80);
      assert.strictEqual(evalResult.playerScores['player_1'].points, 80);
    });

    it('Example 7: Nine white coins = 180 points (9 * 20 = 180)', () => {
      const { engine } = setupFreeStyleEngine(200);
      const whiteCoins = [
        { id: 'coin_inner_0', type: 'white' },
        { id: 'coin_inner_2', type: 'white' },
        { id: 'coin_inner_4', type: 'white' },
        { id: 'coin_outer_0', type: 'white' },
        { id: 'coin_outer_2', type: 'white' },
        { id: 'coin_outer_4', type: 'white' },
        { id: 'coin_outer_6', type: 'white' },
        { id: 'coin_outer_8', type: 'white' },
        { id: 'coin_outer_10', type: 'white' },
      ];

      const evalResult = engine.processShotSettlement({
        pocketedCoins: whiteCoins,
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.playerScoreDelta, 180);
      assert.strictEqual(evalResult.playerScores['player_1'].points, 180);
    });
  });

  describe('3. Remaining Coin Counter Tracking', () => {
    it('starts with exactly 19 coins: 9 white, 9 black, 1 queen', () => {
      const { engine } = setupFreeStyleEngine();
      const counts = engine.getRemainingCoinsCount();

      assert.strictEqual(counts.white, 9, 'Initial white coins must be 9');
      assert.strictEqual(counts.black, 9, 'Initial black coins must be 9');
      assert.strictEqual(counts.queen, 1, 'Initial queen must be 1');
      assert.strictEqual(counts.total, 19, 'Initial total must be 19');
    });

    it('decrements counts correctly after legal pocketing', () => {
      const { engine } = setupFreeStyleEngine();

      // Pocket 1 white
      let evalResult = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(evalResult.remainingCoins.white, 8);
      assert.strictEqual(evalResult.remainingCoins.black, 9);
      assert.strictEqual(evalResult.remainingCoins.queen, 1);
      assert.strictEqual(evalResult.remainingCoins.total, 18);

      // Pocket Queen
      evalResult = engine.processShotSettlement({
        pocketedCoins: [{ id: 'queen', type: 'queen' }],
        strikerPocketed: false,
      });
      assert.strictEqual(evalResult.remainingCoins.white, 8);
      assert.strictEqual(evalResult.remainingCoins.black, 9);
      assert.strictEqual(evalResult.remainingCoins.queen, 0);
      assert.strictEqual(evalResult.remainingCoins.total, 17);

      // Pocket 2 black
      evalResult = engine.processShotSettlement({
        pocketedCoins: [
          { id: 'coin_inner_1', type: 'black' },
          { id: 'coin_inner_3', type: 'black' },
        ],
        strikerPocketed: false,
      });
      assert.strictEqual(evalResult.remainingCoins.white, 8);
      assert.strictEqual(evalResult.remainingCoins.black, 7);
      assert.strictEqual(evalResult.remainingCoins.queen, 0);
      assert.strictEqual(evalResult.remainingCoins.total, 15);
    });

    it('strictly excludes striker from remaining coin count', () => {
      const { engine } = setupFreeStyleEngine();

      const evalResult = engine.processShotSettlement({
        pocketedCoins: [
          { id: 'striker', type: 'striker' },
          { id: 'coin_inner_0', type: 'white' },
        ],
        strikerPocketed: true,
      });

      // Striker scratched with own white coin: coin returned to board, foul assessed
      assert.strictEqual(evalResult.foulOccurred, true);
      const counts = engine.getRemainingCoinsCount();
      assert.strictEqual(counts.total, 19, 'Coin returned so total remains 19');
      assert.strictEqual(counts.white, 9);
    });

    it('restores remaining coin count when foul penalty returns coin to board', () => {
      const { engine } = setupFreeStyleEngine();

      // First legally pocket 2 black coins
      engine.processShotSettlement({
        pocketedCoins: [
          { id: 'coin_inner_1', type: 'black' },
          { id: 'coin_inner_3', type: 'black' },
        ],
        strikerPocketed: false,
      });
      assert.strictEqual(engine.getRemainingCoinsCount().total, 17);

      // Next shot: striker pocketed (foul penalty returns 1 coin)
      const foulResult = engine.processShotSettlement({
        pocketedCoins: [],
        strikerPocketed: true,
      });

      assert.strictEqual(foulResult.foulOccurred, true);
      assert.strictEqual(foulResult.coinsToReturnToBoard.length, 1);
      assert.strictEqual(engine.getRemainingCoinsCount().total, 18, 'Returned coin restored total to 18');
    });

    it('ignores duplicate pocket events without altering counts', () => {
      const { engine } = setupFreeStyleEngine();

      // Pocket coin_inner_0 once
      engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(engine.getRemainingCoinsCount().total, 18);

      // Attempt to pocket coin_inner_0 a second time
      const duplicateResult = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });

      assert.strictEqual(duplicateResult.playerScoreDelta, 0, 'No points awarded for duplicate');
      assert.strictEqual(engine.getRemainingCoinsCount().total, 18, 'Count must remain 18');
    });
  });

  describe('4. Free Style Win Conditions', () => {
    it('detects win immediately when player reaches target score (180 points)', () => {
      const { engine } = setupFreeStyleEngine(180);

      // 9 whites = 180 points
      const whiteCoins = [
        { id: 'coin_inner_0', type: 'white' },
        { id: 'coin_inner_2', type: 'white' },
        { id: 'coin_inner_4', type: 'white' },
        { id: 'coin_outer_0', type: 'white' },
        { id: 'coin_outer_2', type: 'white' },
        { id: 'coin_outer_4', type: 'white' },
        { id: 'coin_outer_6', type: 'white' },
        { id: 'coin_outer_8', type: 'white' },
        { id: 'coin_outer_10', type: 'white' },
      ];

      const evalResult = engine.processShotSettlement({
        pocketedCoins: whiteCoins,
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.isMatchOver, true);
      assert.ok(evalResult.matchResult);
      assert.strictEqual(evalResult.matchResult.winnerId, 'player_1');
      assert.strictEqual(evalResult.matchResult.finalScores['player_1'].points, 180);
      assert.strictEqual(engine.isMatchFinished(), true);
    });

    it('does not declare win when player is below target score', () => {
      const { engine } = setupFreeStyleEngine(180);

      const evalResult = engine.processShotSettlement({
        pocketedCoins: [
          { id: 'coin_inner_0', type: 'white' }, // 20
          { id: 'queen', type: 'queen' },         // 50 => total 70
        ],
        strikerPocketed: false,
      });

      assert.strictEqual(evalResult.playerScores['player_1'].points, 70);
      assert.strictEqual(evalResult.isMatchOver, false);
      assert.strictEqual(evalResult.matchResult, undefined);
    });

    it('resolves deterministic tie-break if both reach target in the same shot', () => {
      const ruleset = new FreeStyleRuleset({ targetScore: 180 });
      const players = [
        { id: 'p1', name: 'Player 1', seat: 0, assignedCoinType: 'any' },
        { id: 'p2', name: 'Player 2', seat: 2, assignedCoinType: 'any' },
      ];

      // Context where p1 has 190 and p2 has 180
      const winResult1 = ruleset.evaluateWin({
        players,
        scores: {
          p1: { points: 190, whiteCoinsPocketed: 8, blackCoinsPocketed: 3, queenPocketed: false },
          p2: { points: 180, whiteCoinsPocketed: 1, blackCoinsPocketed: 6, queenPocketed: true },
        },
        coinsOnBoard: [],
        queenStatus: 'covered',
        currentRound: 1,
      });

      assert.strictEqual(winResult1.hasWinner, true);
      assert.strictEqual(winResult1.winnerPlayerId, 'p1', 'Higher points must win deterministic tie-break');

      // Context where both have exactly 180
      const winResult2 = ruleset.evaluateWin({
        players,
        scores: {
          p1: { points: 180, whiteCoinsPocketed: 9, blackCoinsPocketed: 0, queenPocketed: false },
          p2: { points: 180, whiteCoinsPocketed: 0, blackCoinsPocketed: 0, queenPocketed: false },
        },
        coinsOnBoard: [],
        queenStatus: 'covered',
        currentRound: 1,
      });

      assert.strictEqual(winResult2.hasWinner, true);
      assert.strictEqual(winResult2.winnerPlayerId, 'p1', 'Active shooter / seat 0 wins deterministic precedence');
    });

    it('declares player with highest score winner when all 19 coins are cleared below 180', () => {
      const ruleset = new FreeStyleRuleset({ targetScore: 180 });
      const players = [
        { id: 'p1', name: 'Player 1', seat: 0, assignedCoinType: 'any' },
        { id: 'p2', name: 'Player 2', seat: 2, assignedCoinType: 'any' },
      ];

      const winResult = ruleset.evaluateWin({
        players,
        scores: {
          p1: { points: 170, whiteCoinsPocketed: 6, blackCoinsPocketed: 5, queenPocketed: false },
          p2: { points: 150, whiteCoinsPocketed: 3, blackCoinsPocketed: 4, queenPocketed: true },
        },
        coinsOnBoard: [], // all cleared
        queenStatus: 'covered',
        currentRound: 1,
      });

      assert.strictEqual(winResult.hasWinner, true);
      assert.strictEqual(winResult.winnerPlayerId, 'p1');
      assert.match(winResult.reason, /All coins cleared/);
    });
  });

  describe('5. Turn Alternation & Multi-Player Scoring Isolation', () => {
    it('maintains separate scores for Player 1 and Player 2', () => {
      const { engine } = setupFreeStyleEngine();

      // Turn 1 (Player 1): Pockets 1 white coin (20 pts) -> extra turn
      let res = engine.processShotSettlement({
        pocketedCoins: [{ id: 'coin_inner_0', type: 'white' }],
        strikerPocketed: false,
      });
      assert.strictEqual(res.playerScores['player_1'].points, 20);
      assert.strictEqual(res.playerScores['player_2'].points, 0);
      assert.strictEqual(res.nextTurn.activePlayerId, 'player_1');

      // Turn 2 (Player 1): Dry shot -> passes turn to Player 2
      res = engine.processShotSettlement({
        pocketedCoins: [],
        strikerPocketed: false,
      });
      assert.strictEqual(res.playerScores['player_1'].points, 20);
      assert.strictEqual(res.playerScores['player_2'].points, 0);
      assert.strictEqual(res.nextTurn.activePlayerId, 'player_2');

      // Turn 3 (Player 2): Pockets Queen (50 pts)
      res = engine.processShotSettlement({
        pocketedCoins: [{ id: 'queen', type: 'queen' }],
        strikerPocketed: false,
      });
      assert.strictEqual(res.playerScores['player_1'].points, 20);
      assert.strictEqual(res.playerScores['player_2'].points, 50);
      assert.strictEqual(res.nextTurn.activePlayerId, 'player_2');
    });
  });
});
