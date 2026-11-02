import { GameMode, Player } from '@carromverse/shared-types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class PartnerValidator {
  public static validate(mode: GameMode, players: Player[]): ValidationResult {
    if (!players || players.length === 0) {
      return { isValid: false, error: 'No players configured' };
    }

    const expectedCount =
      mode === 'two_player_individual' ? 2 : mode === 'three_player_individual' ? 3 : 4;

    if (players.length !== expectedCount) {
      return {
        isValid: false,
        error: `Mode ${mode} requires exactly ${expectedCount} players, but ${players.length} provided`,
      };
    }

    const idSet = new Set<string>();
    for (const p of players) {
      if (!p.id || idSet.has(p.id)) {
        return { isValid: false, error: `Duplicate or missing player ID: ${p.id}` };
      }
      idSet.add(p.id);
    }

    const seatSet = new Set<number>();
    for (const p of players) {
      if (seatSet.has(p.seat)) {
        return { isValid: false, error: `Multiple players assigned to seat ${p.seat}` };
      }
      seatSet.add(p.seat);
    }

    const validSeats =
      mode === 'two_player_individual'
        ? [0, 2]
        : mode === 'three_player_individual'
        ? [0, 1, 2]
        : [0, 1, 2, 3];

    for (const p of players) {
      if (!validSeats.includes(p.seat)) {
        return {
          isValid: false,
          error: `Invalid seat ${p.seat} for mode ${mode}. Allowed seats: ${validSeats.join(', ')}`,
        };
      }
    }

    if (mode === 'four_player_team') {
      const teamA = players.filter((p) => p.teamId === 'team_a');
      const teamB = players.filter((p) => p.teamId === 'team_b');

      if (teamA.length !== 2 || teamB.length !== 2) {
        return {
          isValid: false,
          error: `Team mode requires exactly 2 players in Team A and 2 players in Team B (found ${teamA.length} and ${teamB.length})`,
        };
      }

      const teamASeats = teamA.map((p) => p.seat).sort((a, b) => a - b);
      const teamBSeats = teamB.map((p) => p.seat).sort((a, b) => a - b);

      if (teamASeats[0] !== 0 || teamASeats[1] !== 2) {
        return {
          isValid: false,
          error: 'Team A partners must occupy opposite seats 0 (South) and 2 (North)',
        };
      }
      if (teamBSeats[0] !== 1 || teamBSeats[1] !== 3) {
        return {
          isValid: false,
          error: 'Team B partners must occupy opposite seats 1 (East) and 3 (West)',
        };
      }
    }

    return { isValid: true };
  }
}

