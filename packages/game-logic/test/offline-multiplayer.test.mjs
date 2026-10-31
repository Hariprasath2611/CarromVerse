import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getSeatLayoutForMode,
  createInitialPlayersForMode,
  validatePlayerConfiguration,
  SEAT_DIRECTION_LABELS,
  PREDEFINED_AVATARS,
  TurnManager,
} from '../dist/index.js';

describe('Phase 1.6 – Offline Multiplayer & Seat Configuration', () => {
  describe('Avatar and Seat Definitions', () => {
    it('provides 8 predefined avatars with emojis and labels', () => {
      assert.strictEqual(PREDEFINED_AVATARS.length, 8);
      for (const avatar of PREDEFINED_AVATARS) {
        assert.ok(avatar.id);
        assert.ok(avatar.emoji);
        assert.ok(avatar.label);
      }
    });

    it('maps all 4 seats to correct cardinal direction labels', () => {
      assert.strictEqual(SEAT_DIRECTION_LABELS[0], 'South (Bottom)');
      assert.strictEqual(SEAT_DIRECTION_LABELS[1], 'East (Right)');
      assert.strictEqual(SEAT_DIRECTION_LABELS[2], 'North (Top)');
      assert.strictEqual(SEAT_DIRECTION_LABELS[3], 'West (Left)');
    });
  });

  describe('2-Player Individual Mode Configuration', () => {
    it('sets up 2 opposing seats: South (0) and North (2)', () => {
      const layout = getSeatLayoutForMode('two_player_individual');
      assert.strictEqual(layout.length, 2);
      assert.strictEqual(layout[0].seat, 0);
      assert.strictEqual(layout[0].defaultCoinType, 'white');
      assert.strictEqual(layout[1].seat, 2);
      assert.strictEqual(layout[1].defaultCoinType, 'black');
    });

    it('creates valid 2-player configuration with default names and avatars', () => {
      const players = createInitialPlayersForMode('two_player_individual');
      assert.strictEqual(players.length, 2);
      assert.strictEqual(players[0].name, 'Player 1');
      assert.strictEqual(players[0].assignedCoinType, 'white');
      assert.strictEqual(players[1].name, 'Player 2');
      assert.strictEqual(players[1].assignedCoinType, 'black');

      const validation = validatePlayerConfiguration('two_player_individual', players);
      assert.strictEqual(validation.isValid, true);
    });

    it('rotates turns between seat 0 and seat 2', () => {
      const players = createInitialPlayersForMode('two_player_individual');
      const turnManager = new TurnManager('two_player_individual', players);
      assert.strictEqual(turnManager.getActivePlayer().seat, 0);
      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 2);
      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 0);
    });
  });

  describe('3-Player Individual Mode Configuration', () => {
    it('sets up 3 seats: South (0), East (1), and North (2)', () => {
      const layout = getSeatLayoutForMode('three_player_individual');
      assert.strictEqual(layout.length, 3);
      assert.strictEqual(layout[0].seat, 0);
      assert.strictEqual(layout[1].seat, 1);
      assert.strictEqual(layout[2].seat, 2);
      // In 3-player points carrom, any coin can be pocketed
      assert.strictEqual(layout[0].defaultCoinType, 'any');
      assert.strictEqual(layout[1].defaultCoinType, 'any');
      assert.strictEqual(layout[2].defaultCoinType, 'any');
    });

    it('creates valid 3-player configuration', () => {
      const players = createInitialPlayersForMode('three_player_individual', {
        customNames: { 0: 'Alice', 1: 'Bob', 2: 'Charlie' },
      });
      assert.strictEqual(players.length, 3);
      assert.strictEqual(players[0].name, 'Alice');
      assert.strictEqual(players[1].name, 'Bob');
      assert.strictEqual(players[2].name, 'Charlie');

      const validation = validatePlayerConfiguration('three_player_individual', players);
      assert.strictEqual(validation.isValid, true);
    });

    it('rotates turns across seats 0 -> 1 -> 2 -> 0', () => {
      const players = createInitialPlayersForMode('three_player_individual');
      const turnManager = new TurnManager('three_player_individual', players);
      assert.strictEqual(turnManager.getActivePlayer().seat, 0);
      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 1);
      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 2);
      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 0);
    });
  });

  describe('4-Player Individual Mode Configuration', () => {
    it('sets up 4 seats (0, 1, 2, 3) with distinct coin/point assignments', () => {
      const layout = getSeatLayoutForMode('four_player_individual');
      assert.strictEqual(layout.length, 4);
      assert.deepStrictEqual(layout.map(l => l.seat), [0, 1, 2, 3]);
    });

    it('rotates turns clockwise through all four seats 0 -> 1 -> 2 -> 3 -> 0', () => {
      const players = createInitialPlayersForMode('four_player_individual');
      const turnManager = new TurnManager('four_player_individual', players);
      assert.strictEqual(turnManager.getActivePlayer().seat, 0);
      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 1);
      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 2);
      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 3);
      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 0);
    });
  });

  describe('4-Player Team Mode (2v2) Configuration', () => {
    it('assigns partners to opposite seats (Team A: 0 & 2, Team B: 1 & 3)', () => {
      const layout = getSeatLayoutForMode('four_player_team', {
        teamAName: 'Emerald Warriors',
        teamBName: 'Golden Strikers',
      });
      assert.strictEqual(layout.length, 4);

      // Team A: seats 0 & 2, White
      assert.strictEqual(layout[0].seat, 0);
      assert.strictEqual(layout[0].teamId, 'team_a');
      assert.strictEqual(layout[0].defaultCoinType, 'white');
      assert.strictEqual(layout[2].seat, 2);
      assert.strictEqual(layout[2].teamId, 'team_a');
      assert.strictEqual(layout[2].defaultCoinType, 'white');

      // Team B: seats 1 & 3, Black
      assert.strictEqual(layout[1].seat, 1);
      assert.strictEqual(layout[1].teamId, 'team_b');
      assert.strictEqual(layout[1].defaultCoinType, 'black');
      assert.strictEqual(layout[3].seat, 3);
      assert.strictEqual(layout[3].teamId, 'team_b');
      assert.strictEqual(layout[3].defaultCoinType, 'black');
    });

    it('enforces turn alternation between teams: A1 -> B1 -> A2 -> B2', () => {
      const players = createInitialPlayersForMode('four_player_team');
      const turnManager = new TurnManager('four_player_team', players);

      const p1 = turnManager.getActivePlayer();
      assert.strictEqual(p1.seat, 0);
      assert.strictEqual(p1.teamId, 'team_a');

      turnManager.advanceTurn();
      const p2 = turnManager.getActivePlayer();
      assert.strictEqual(p2.seat, 1);
      assert.strictEqual(p2.teamId, 'team_b');

      turnManager.advanceTurn();
      const p3 = turnManager.getActivePlayer();
      assert.strictEqual(p3.seat, 2);
      assert.strictEqual(p3.teamId, 'team_a');

      turnManager.advanceTurn();
      const p4 = turnManager.getActivePlayer();
      assert.strictEqual(p4.seat, 3);
      assert.strictEqual(p4.teamId, 'team_b');

      turnManager.advanceTurn();
      assert.strictEqual(turnManager.getActivePlayer().seat, 0);
    });

    it('rejects adjacent team seating violating carrom doubles rules', () => {
      const players = createInitialPlayersForMode('four_player_team');
      // Malform seating: make seats 0 and 1 Team A, seats 2 and 3 Team B
      players[1].teamId = 'team_a';
      players[2].teamId = 'team_b';

      const validation = validatePlayerConfiguration('four_player_team', players);
      assert.strictEqual(validation.isValid, false);
      assert.ok(validation.error.includes('opposite seats'));
    });
  });

  describe('Configuration Validation Errors', () => {
    it('rejects empty player list', () => {
      const validation = validatePlayerConfiguration('two_player_individual', []);
      assert.strictEqual(validation.isValid, false);
      assert.ok(validation.error.includes('No players'));
    });

    it('rejects wrong player count', () => {
      const players = createInitialPlayersForMode('two_player_individual');
      const validation = validatePlayerConfiguration('four_player_team', players);
      assert.strictEqual(validation.isValid, false);
      assert.ok(validation.error.includes('requires exactly 4 players'));
    });

    it('rejects duplicate seats', () => {
      const players = createInitialPlayersForMode('two_player_individual');
      players[1].seat = 0; // Duplicate seat 0
      const validation = validatePlayerConfiguration('two_player_individual', players);
      assert.strictEqual(validation.isValid, false);
      assert.ok(validation.error.includes('Multiple players assigned to seat 0'));
    });
  });
});
