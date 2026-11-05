import { BoardSnapshot, CoinSnapshot } from '../types/ShotTypes.js';
import { BoardAnalyzer } from '../analysis/BoardAnalyzer.js';
import { CoinAnalyzer } from '../analysis/CoinAnalyzer.js';

export interface BoardStateScore {
  botCoinCount: number;
  opponentCoinCount: number;
  botPocketProximityScore: number;
  opponentPocketProximityScore: number;
  queenAdvantage: number;
  overallPositionalScore: number; // positive = bot advantage
}

export class BoardStateEvaluator {
  /**
   * Evaluates overall board state and positional advantage for the bot.
   */
  public static evaluateBoardState(
    snapshot: BoardSnapshot,
    botColor: 'white' | 'black',
    queenStatus: 'unpocketed' | 'pending_cover' | 'covered' | 'returned_to_center'
  ): BoardStateScore {
    const activeCoins = BoardAnalyzer.getActiveCoins(snapshot);
    const botCoins: CoinSnapshot[] = [];
    const opponentCoins: CoinSnapshot[] = [];
    let queenCoin: CoinSnapshot | null = null;

    for (const c of activeCoins) {
      if (c.type === 'queen') {
        queenCoin = c;
      } else if (c.type === botColor) {
        botCoins.push(c);
      } else {
        opponentCoins.push(c);
      }
    }

    // Proximity score: average inverse distance to nearest pocket
    const calcProximity = (coins: CoinSnapshot[]) => {
      if (coins.length === 0) return 0;
      let total = 0;
      for (const coin of coins) {
        let minDist = 1.0;
        for (const p of snapshot.pockets) {
          const d = CoinAnalyzer.distance(coin.position, p.position);
          if (d < minDist) minDist = d;
        }
        total += Math.max(0, 1.0 - minDist);
      }
      return total / coins.length;
    };

    const botProximity = calcProximity(botCoins);
    const oppProximity = calcProximity(opponentCoins);

    // Coins remaining advantage (fewer coins remaining is better!)
    const coinAdvantage = (opponentCoins.length - botCoins.length) * 15;

    // Queen advantage
    let queenAdvantage = 0;
    if (queenStatus === 'covered') {
      queenAdvantage = 0;
    } else if (queenStatus === 'pending_cover') {
      queenAdvantage = 30;
    }

    const overall = coinAdvantage + (botProximity - oppProximity) * 20 + queenAdvantage;

    return {
      botCoinCount: botCoins.length,
      opponentCoinCount: opponentCoins.length,
      botPocketProximityScore: Number(botProximity.toFixed(2)),
      opponentPocketProximityScore: Number(oppProximity.toFixed(2)),
      queenAdvantage,
      overallPositionalScore: Number(overall.toFixed(2)),
    };
  }
}
