import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SeatManager,
  PassAndPlayManager,
  OfflineSessionManager,
  AvatarRegistry,
  PlayerSetup,
  PartnerValidator,
  SessionLifecycle,
} from '../dist/index.js';

test('Multiplayer Package - SeatManager', () => {
  assert.equal(SeatManager.getSeatDirectionLabel(0), 'South (Bottom)');
  assert.equal(SeatManager.getSeatDirectionLabel(2), 'North (Top)');
  assert.equal(SeatManager.getOppositeSeat(0), 2);
  assert.equal(SeatManager.getOppositeSeat(1), 3);
  assert.deepEqual(SeatManager.getActiveSeatsForMode('two_player_individual'), [0, 2]);
  assert.deepEqual(SeatManager.getActiveSeatsForMode('four_player_team'), [0, 1, 2, 3]);
});

test('Multiplayer Package - AvatarRegistry', () => {
  const avatars = AvatarRegistry.getAll();
  assert.equal(avatars.length, 8);
  assert.equal(AvatarRegistry.getDefaultAvatar(0), '👑');
  assert.equal(AvatarRegistry.getDefaultAvatar(1), '🐯');
});

test('Multiplayer Package - PlayerSetup and PartnerValidator', () => {
  const players2p = PlayerSetup.createInitialPlayersForMode('two_player_individual');
  assert.equal(players2p.length, 2);
  const val2p = PartnerValidator.validate('two_player_individual', players2p);
  assert.equal(val2p.isValid, true);

  const playersTeam = PlayerSetup.createInitialPlayersForMode('four_player_team');
  assert.equal(playersTeam.length, 4);
  const valTeam = PartnerValidator.validate('four_player_team', playersTeam);
  assert.equal(valTeam.isValid, true);
});

test('Multiplayer Package - OfflineSessionManager & PassAndPlay', () => {
  const session = new OfflineSessionManager('two_player_individual', {
    handoverConfirmationEnabled: true,
  });
  assert.equal(session.getCurrentPlayer().seat, 0);

  const { nextPlayer, handover } = session.advanceTurn();
  assert.equal(nextPlayer.seat, 2);
  assert.ok(handover);
  assert.equal(handover.toSeat, 2);
});

test('Multiplayer Package - SessionLifecycle', () => {
  const lifecycle = new SessionLifecycle();
  assert.equal(lifecycle.getState(), 'idle');
  lifecycle.transitionTo('configuring');
  lifecycle.transitionTo('in_progress');
  assert.equal(lifecycle.isGameActive(), true);
  lifecycle.transitionTo('completed');
  assert.equal(lifecycle.isFinished(), true);
});
