import { CoinType } from './coin.js';
import { PlayerId, PlayerSeat } from './player.js';

export type FoulType =
  | 'striker_pocketed'
  | 'striker_out_of_bounds'
  | 'wrong_coin_pocketed'
  | 'striker_not_on_baseline'
  | 'turn_timeout'
  | 'queen_failed_cover'
  | 'touch_foul';

export type TurnPhase =
  | 'positioning'
  | 'aiming'
  | 'simulating'
  | 'evaluating'
  | 'completed';

export interface ShotResult {
  pocketedCoins: CoinType[];
  pocketedCoinIds: string[];
  foulCommitted: boolean;
  foulType?: FoulType;
  queenPocketedThisShot: boolean;
  queenCoveredThisShot: boolean;
  queenReturnedToCenter: boolean;
  extraTurnEarned: boolean;
  penaltyCoinsDue: number;
}

export interface PlayerTurn {
  turnNumber: number;
  activePlayerId: PlayerId;
  activeSeat: PlayerSeat;
  phase: TurnPhase;
  turnStartTime: number;
  timeRemainingSeconds: number;
  strikerPlaced: boolean;
  shotTaken: boolean;
  shotResult?: ShotResult;
}
