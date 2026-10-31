import {
  CoinType,
  GameMode,
  Player,
  PlayerPosition,
  PlayerSeat,
  TeamId,
} from '@carromverse/shared-types';

export interface SeatLayout {
  seat: PlayerSeat;
  position: PlayerPosition;
  positionLabel: string;
  defaultName: string;
  defaultAvatar: string;
  defaultCoinType: CoinType | 'any';
  teamId?: TeamId;
  teamLabel?: string;
}

export const PREDEFINED_AVATARS: Array<{ id: string; emoji: string; label: string }> = [
  { id: 'crown', emoji: '👑', label: 'Champion' },
  { id: 'tiger', emoji: '🐯', label: 'Tiger' },
  { id: 'eagle', emoji: '🦅', label: 'Falcon' },
  { id: 'lion', emoji: '🦁', label: 'Lion' },
  { id: 'lightning', emoji: '⚡', label: 'Blitz' },
  { id: 'target', emoji: '🎯', label: 'Sniper' },
  { id: 'diamond', emoji: '💎', label: 'Diamond' },
  { id: 'dragon', emoji: '🐉', label: 'Dragon' },
];

export const SEAT_DIRECTION_LABELS: Record<PlayerSeat, string> = {
  0: 'South (Bottom)',
  1: 'East (Right)',
  2: 'North (Top)',
  3: 'West (Left)',
};

export function getSeatDirectionLabel(seat: PlayerSeat): string {
  return SEAT_DIRECTION_LABELS[seat] || 'Unknown';
}

export function getSeatLayoutForMode(
  mode: GameMode,
  options?: { teamAName?: string; teamBName?: string }
): SeatLayout[] {
  const teamAName = options?.teamAName || 'Team A';
  const teamBName = options?.teamBName || 'Team B';

  switch (mode) {
    case 'two_player_individual':
      return [
        {
          seat: 0,
          position: 'bottom',
          positionLabel: 'South (Bottom)',
          defaultName: 'Player 1',
          defaultAvatar: '👑',
          defaultCoinType: 'white',
        },
        {
          seat: 2,
          position: 'top',
          positionLabel: 'North (Top)',
          defaultName: 'Player 2',
          defaultAvatar: '🐯',
          defaultCoinType: 'black',
        },
      ];

    case 'three_player_individual':
      return [
        {
          seat: 0,
          position: 'bottom',
          positionLabel: 'South (Bottom)',
          defaultName: 'Player 1',
          defaultAvatar: '👑',
          defaultCoinType: 'any',
        },
        {
          seat: 1,
          position: 'right',
          positionLabel: 'East (Right)',
          defaultName: 'Player 2',
          defaultAvatar: '🐯',
          defaultCoinType: 'any',
        },
        {
          seat: 2,
          position: 'top',
          positionLabel: 'North (Top)',
          defaultName: 'Player 3',
          defaultAvatar: '🦅',
          defaultCoinType: 'any',
        },
      ];

    case 'four_player_team':
      return [
        {
          seat: 0,
          position: 'bottom',
          positionLabel: 'South (Bottom)',
          defaultName: `${teamAName} (P1)`,
          defaultAvatar: '👑',
          defaultCoinType: 'white',
          teamId: 'team_a',
          teamLabel: teamAName,
        },
        {
          seat: 1,
          position: 'right',
          positionLabel: 'East (Right)',
          defaultName: `${teamBName} (P1)`,
          defaultAvatar: '🐯',
          defaultCoinType: 'black',
          teamId: 'team_b',
          teamLabel: teamBName,
        },
        {
          seat: 2,
          position: 'top',
          positionLabel: 'North (Top)',
          defaultName: `${teamAName} (P2)`,
          defaultAvatar: '🦅',
          defaultCoinType: 'white',
          teamId: 'team_a',
          teamLabel: teamAName,
        },
        {
          seat: 3,
          position: 'left',
          positionLabel: 'West (Left)',
          defaultName: `${teamBName} (P2)`,
          defaultAvatar: '🦁',
          defaultCoinType: 'black',
          teamId: 'team_b',
          teamLabel: teamBName,
        },
      ];

    case 'four_player_individual':
    default:
      return [
        {
          seat: 0,
          position: 'bottom',
          positionLabel: 'South (Bottom)',
          defaultName: 'Player 1',
          defaultAvatar: '👑',
          defaultCoinType: 'any',
        },
        {
          seat: 1,
          position: 'right',
          positionLabel: 'East (Right)',
          defaultName: 'Player 2',
          defaultAvatar: '🐯',
          defaultCoinType: 'any',
        },
        {
          seat: 2,
          position: 'top',
          positionLabel: 'North (Top)',
          defaultName: 'Player 3',
          defaultAvatar: '🦅',
          defaultCoinType: 'any',
        },
        {
          seat: 3,
          position: 'left',
          positionLabel: 'West (Left)',
          defaultName: 'Player 4',
          defaultAvatar: '🦁',
          defaultCoinType: 'any',
        },
      ];
  }
}

export function createInitialPlayersForMode(
  mode: GameMode,
  options?: {
    customNames?: Record<number, string>;
    customAvatars?: Record<number, string>;
    teamAName?: string;
    teamBName?: string;
  }
): Player[] {
  const layouts = getSeatLayoutForMode(mode, options);

  return layouts.map((layout, idx) => ({
    id: `player_${layout.seat}`,
    name: options?.customNames?.[layout.seat] || layout.defaultName,
    avatarUrl: options?.customAvatars?.[layout.seat] || layout.defaultAvatar,
    type: 'human' as const,
    seat: layout.seat,
    position: layout.position,
    teamId: layout.teamId,
    assignedCoinType: layout.defaultCoinType,
    isReady: true,
    score: 0,
    fouls: 0,
  }));
}

export function validatePlayerConfiguration(
  mode: GameMode,
  players: Player[]
): { isValid: boolean; error?: string } {
  if (!players || players.length === 0) {
    return { isValid: false, error: 'No players configured' };
  }

  // 1. Check expected player count
  const expectedCount =
    mode === 'two_player_individual' ? 2 : mode === 'three_player_individual' ? 3 : 4;

  if (players.length !== expectedCount) {
    return {
      isValid: false,
      error: `Mode ${mode} requires exactly ${expectedCount} players, but ${players.length} provided`,
    };
  }

  // 2. Check unique player IDs
  const idSet = new Set<string>();
  for (const p of players) {
    if (!p.id || idSet.has(p.id)) {
      return { isValid: false, error: `Duplicate or missing player ID: ${p.id}` };
    }
    idSet.add(p.id);
  }

  // 3. Check unique seats
  const seatSet = new Set<number>();
  for (const p of players) {
    if (seatSet.has(p.seat)) {
      return { isValid: false, error: `Multiple players assigned to seat ${p.seat}` };
    }
    seatSet.add(p.seat);
  }

  // 4. Check valid seat positions for the mode
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

  // 5. Team mode specific validation
  if (mode === 'four_player_team') {
    const teamA = players.filter((p) => p.teamId === 'team_a');
    const teamB = players.filter((p) => p.teamId === 'team_b');

    if (teamA.length !== 2 || teamB.length !== 2) {
      return {
        isValid: false,
        error: `Team mode requires exactly 2 players in Team A and 2 players in Team B (found ${teamA.length} and ${teamB.length})`,
      };
    }

    // Opposite seating validation (Team A: seats 0 & 2; Team B: seats 1 & 3)
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
