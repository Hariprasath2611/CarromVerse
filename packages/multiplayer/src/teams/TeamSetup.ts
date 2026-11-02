import { Player, TeamId } from '@carromverse/shared-types';

export interface TeamInfo {
  id: TeamId;
  name: string;
  players: Player[];
  score: number;
}

export class TeamSetup {
  public static createTeams(
    players: Player[],
    teamAName = 'Team A',
    teamBName = 'Team B'
  ): Record<TeamId, TeamInfo> {
    const teamA: TeamInfo = {
      id: 'team_a',
      name: teamAName,
      players: players.filter((p) => p.teamId === 'team_a'),
      score: 0,
    };

    const teamB: TeamInfo = {
      id: 'team_b',
      name: teamBName,
      players: players.filter((p) => p.teamId === 'team_b'),
      score: 0,
    };

    return {
      team_a: teamA,
      team_b: teamB,
    };
  }

  public static getPartner(player: Player, allPlayers: Player[]): Player | undefined {
    if (!player.teamId) return undefined;
    return allPlayers.find((p) => p.teamId === player.teamId && p.id !== player.id);
  }
}
