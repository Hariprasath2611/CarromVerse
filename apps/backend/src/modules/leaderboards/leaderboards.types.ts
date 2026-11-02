export interface LeaderboardEntryDto {
  rank: number;
  userId: string;
  username: string;
  avatar: string;
  score: number;
  tier: string;
}

export type LeaderboardScope = 'daily' | 'weekly' | 'all_time';

