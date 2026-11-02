import { GameMode, GameResult } from '@carromverse/shared-types';

export interface RecordMatchRequestDto {
  result: GameResult;
}

export interface MatchFilterQueryDto {
  mode?: GameMode;
  limit?: number;
}

