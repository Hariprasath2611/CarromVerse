import { Player, PlayerSeat, QueenStatus } from '@carromverse/shared-types';
import { BotStrategyMode } from '../types/StrategyTypes.js';

export interface PlayerStateAnalysis {
  isBotTurn: boolean;
  botPlayer: Player | null;
  opponentPlayer: Player | null;
  botSeat: PlayerSeat;
  botAssignedColor: 'white' | 'black';
  botScore: number;
  opponentScore: number;
  isCoveringQueen: boolean;
  strategyMode: BotStrategyMode;
}

export class PlayerStateAnalyzer {
  public static analyze(
    activePlayers: Player[],
    activeSeat: PlayerSeat,
    queenStatus: QueenStatus,
    scores: Record<string, { points: number }>
  ): PlayerStateAnalysis {
    const botPlayer = activePlayers.find((p) => p.type === 'bot') || activePlayers.find((p) => p.seat === 2) || null;
    const opponentPlayer = activePlayers.find((p) => p.id !== botPlayer?.id) || null;

    const botSeat: PlayerSeat = (botPlayer?.seat as PlayerSeat) ?? 2;
    const isBotTurn = activeSeat === botSeat;

    const botAssignedColor: 'white' | 'black' =
      botPlayer?.assignedCoinType === 'white' ? 'white' : 'black';

    const botScore = botPlayer ? scores[botPlayer.id]?.points ?? 0 : 0;
    const opponentScore = opponentPlayer ? scores[opponentPlayer.id]?.points ?? 0 : 0;

    const isCoveringQueen = isBotTurn && queenStatus === 'pending_cover';

    let strategyMode: BotStrategyMode = 'OFFENSIVE';
    if (isCoveringQueen) {
      strategyMode = 'COVER_QUEEN';
    } else if (queenStatus === 'unpocketed') {
      strategyMode = 'QUEEN_HUNTER';
    } else if (botScore > opponentScore + 30) {
      strategyMode = 'OFFENSIVE';
    }

    return {
      isBotTurn,
      botPlayer,
      opponentPlayer,
      botSeat,
      botAssignedColor,
      botScore,
      opponentScore,
      isCoveringQueen,
      strategyMode,
    };
  }
}
