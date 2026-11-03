import { CoinType } from './coin.js';
import { PlayerId, PlayerSeat } from './player.js';

export type FoulType =
  | 'striker_pocketed'
  | 'striker_out_of_bounds'
  | 'opponent_coin_pocketed'
  | 'wrong_coin_pocketed'
  | 'striker_not_on_baseline'
  | 'turn_timeout'
  | 'queen_failed_cover'
  | 'illegal_queen_pocket'
  | 'coin_overboard'
  | 'no_contact'
  | 'illegal_break'
  | 'touch_foul';

export interface FoulDetail {
  type: FoulType;
  description: string;
  penaltyCoins: number;
  penaltyPoints: number;
}

export type TurnPhase =
  | 'positioning'
  | 'aiming'
  | 'simulating'
  | 'evaluating'
  | 'completed';

export interface PocketedCoinRecord {
  id: string;
  type: CoinType | 'striker';
  pocketIndex?: number;
}

export interface ShotSettlementInput {
  pocketedCoins: PocketedCoinRecord[];
  strikerPocketed: boolean;
  durationMs?: number;
  contactOccurred?: boolean;
  coinsOverboard?: { id?: string; type: CoinType }[];
}

export interface ShotResult {
  pocketedCoins: CoinType[];
  pocketedCoinIds: string[];
  foulCommitted: boolean;
  foulType?: FoulType;
  fouls?: FoulDetail[];
  queenPocketedThisShot: boolean;
  queenCoveredThisShot: boolean;
  queenReturnedToCenter: boolean;
  extraTurnEarned: boolean;
  penaltyCoinsDue: number;
  coinsToReturnToBoard?: { id?: string; type: CoinType }[];
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
