import {
  Coin,
  CoinType,
  FoulDetail,
  FoulType,
  GameConfiguration,
  GameResult,
  GameScore,
  Player,
  PlayerId,
  PlayerSeat,
  PlayerTurn,
  PocketedCoinRecord,
  QueenStatus,
  ShotResult,
  ShotSettlementInput,
  TeamId,
  TeamScore,
  Vector2D,
} from '@carromverse/shared-types';
import { distance, generateMatchId, TypedEventEmitter } from '@carromverse/shared-utils';
import { BASELINE_DEFINITIONS, BaselineSegment, BOARD_CENTER } from '../config/board.config.js';
import { IRuleset } from '../rulesets/Ruleset.js';
import { createRulesetForMode } from '../rulesets/index.js';
import { FoulManager } from './FoulManager.js';
import { QueenManager } from './QueenManager.js';
import { ScoringEngine } from './ScoringEngine.js';
import { TurnManager } from './TurnManager.js';
import { WinConditionManager } from './WinConditionManager.js';

export interface SettledShotEvaluation {
  shotNumber: number;
  activePlayerId: PlayerId;
  activeSeat: PlayerSeat;
  pocketedCoins: PocketedCoinRecord[];
  foulOccurred: boolean;
  fouls: FoulDetail[];
  primaryFoulType?: FoulType;
  queenStatusBefore: QueenStatus;
  queenStatusAfter: QueenStatus;
  queenCoveredThisShot: boolean;
  queenReturnedToCenter: boolean;
  extraTurnEarned: boolean;
  coinsToReturnToBoard: { id?: string; type: CoinType }[];
  playerScoreDelta: number;
  teamScoreDelta: number;
  playerScores: Record<PlayerId, GameScore>;
  teamScores?: Record<TeamId, TeamScore>;
  isMatchOver: boolean;
  matchResult?: GameResult;
  nextTurn?: PlayerTurn;
  remainingCoins?: { white: number; black: number; queen: number; total: number };
}

export interface RulesEngineEvents {
  TURN_CHANGED: { activePlayerId: PlayerId; turnNumber: number; activeSeat: PlayerSeat };
  SHOT_SETTLED: { evaluation: SettledShotEvaluation };
  QUEEN_STATUS_CHANGED: { status: QueenStatus; coveredBy?: PlayerId };
  FOUL_COMMITTED: { player: Player; fouls: FoulDetail[] };
  MATCH_COMPLETED: { result: GameResult };
}

export class CarromRulesEngine extends TypedEventEmitter<RulesEngineEvents> {
  private config: GameConfiguration;
  private ruleset: IRuleset;
  private players: Player[];
  private coins: Coin[] = [];
  private turnManager: TurnManager;
  private queenManager: QueenManager;
  private foulManager: FoulManager;
  private scoringEngine: ScoringEngine;
  private winConditionManager: WinConditionManager;
  private matchId: string;
  private matchStartedAt: string;
  private isMatchOver: boolean = false;
  private currentRound: number = 1;
  private shotCounter: number = 0;

  constructor(config: GameConfiguration, players: Player[]) {
    super();
    this.config = config;
    this.ruleset = createRulesetForMode(config.mode, config);
    this.players = players;
    this.matchId = generateMatchId();
    this.matchStartedAt = new Date().toISOString();

    this.turnManager = new TurnManager(config.mode, players, config.turnTimeLimitSeconds);
    this.queenManager = new QueenManager(this.ruleset);
    this.foulManager = new FoulManager(this.ruleset, players);
    this.scoringEngine = new ScoringEngine(this.ruleset, players);
    this.winConditionManager = new WinConditionManager(this.ruleset);

    this.initializeBoardCoins();
  }

  private initializeBoardCoins(): void {
    const coins: Coin[] = [];
    const { coinRadius } = this.config.boardDimensions;

    // Queen at center
    coins.push({
      id: 'coin_queen',
      type: 'queen',
      position: { x: BOARD_CENTER.x, y: BOARD_CENTER.y },
      velocity: { x: 0, y: 0 },
      angle: 0,
      angularVelocity: 0,
      state: 'on_board',
    });

    // Inner circle (6 coins: 3 White, 3 Black)
    const innerRadius = coinRadius * 2 + 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      coins.push({
        id: `coin_inner_${i}`,
        type: i % 2 === 0 ? 'white' : 'black',
        position: {
          x: BOARD_CENTER.x + innerRadius * Math.cos(angle),
          y: BOARD_CENTER.y + innerRadius * Math.sin(angle),
        },
        velocity: { x: 0, y: 0 },
        angle: 0,
        angularVelocity: 0,
        state: 'on_board',
      });
    }

    // Outer circle (12 coins: 6 White, 6 Black)
    const outerRadius = innerRadius * 1.95;
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + Math.PI / 12;
      coins.push({
        id: `coin_outer_${i}`,
        type: i % 2 === 0 ? 'white' : 'black',
        position: {
          x: BOARD_CENTER.x + outerRadius * Math.cos(angle),
          y: BOARD_CENTER.y + outerRadius * Math.sin(angle),
        },
        velocity: { x: 0, y: 0 },
        angle: 0,
        angularVelocity: 0,
        state: 'on_board',
      });
    }

    this.coins = coins;
  }

  public getRuleset(): IRuleset {
    return this.ruleset;
  }

  public getTurnManager(): TurnManager {
    return this.turnManager;
  }

  public getQueenManager(): QueenManager {
    return this.queenManager;
  }

  public getFoulManager(): FoulManager {
    return this.foulManager;
  }

  public getRemainingCoinsCount(): { white: number; black: number; queen: number; total: number } {
    let white = 0;
    let black = 0;
    let queen = 0;
    for (const c of this.coins) {
      if (c.state === 'on_board') {
        if (c.type === 'white') white++;
        else if (c.type === 'black') black++;
        else if (c.type === 'queen') queen++;
      }
    }
    return {
      white,
      black,
      queen,
      total: white + black + queen,
    };
  }

  public getScoringEngine(): ScoringEngine {
    return this.scoringEngine;
  }

  public getCoins(): Coin[] {
    return this.coins.map((c) => ({ ...c }));
  }

  public isMatchFinished(): boolean {
    return this.isMatchOver;
  }

  /**
   * Validate that the striker is placed strictly inside the legal baseline zone for the player's seat.
   */
  public isStrikerPlacementValid(
    seat: PlayerSeat,
    position: Vector2D,
    coinsOnBoard: Coin[] = this.coins
  ): { isValid: boolean; reason?: string } {
    const baseline: BaselineSegment | undefined = BASELINE_DEFINITIONS[seat];
    if (!baseline) {
      return { isValid: false, reason: 'Invalid player baseline seat' };
    }

    const { strikerRadius, coinRadius } = this.config.boardDimensions;

    // Check collision with any existing coin on the board
    for (const coin of coinsOnBoard) {
      if (coin.state === 'on_board') {
        const dist = distance(position, coin.position);
        if (dist < strikerRadius + coinRadius) {
          return { isValid: false, reason: 'Striker cannot overlap with a coin on the board' };
        }
      }
    }

    // Verify coordinates stay within the bounds of the baseline segment
    const minX = Math.min(baseline.start.x, baseline.end.x) - strikerRadius;
    const maxX = Math.max(baseline.start.x, baseline.end.x) + strikerRadius;
    const minY = Math.min(baseline.start.y, baseline.end.y) - strikerRadius;
    const maxY = Math.max(baseline.start.y, baseline.end.y) + strikerRadius;

    if (position.x < minX || position.x > maxX || position.y < minY || position.y > maxY) {
      return { isValid: false, reason: 'Striker must be placed within your baseline' };
    }

    return { isValid: true };
  }

  /**
   * Evaluates the single settled shot transaction atomically.
   */
  public processShotSettlement(input: ShotSettlementInput): SettledShotEvaluation {
    this.shotCounter++;
    const shooter = this.turnManager.getActivePlayer();
    const queenStatusBefore = this.queenManager.getStatus();

    // 1. Filter and deduplicate pocketed coins
    const rawPocketed = input.pocketedCoins || [];
    const validPocketedCoins: PocketedCoinRecord[] = [];

    let strikerPocketed = input.strikerPocketed;

    for (const p of rawPocketed) {
      if (p.type === 'striker' || p.id === 'striker') {
        strikerPocketed = true;
        continue;
      }

      // Find matching coin on board and check if not already pocketed
      const boardCoin = this.coins.find((c) => c.id === p.id);
      if (boardCoin && boardCoin.state !== 'pocketed') {
        validPocketedCoins.push(p);
      } else if (!boardCoin) {
        // Fallback if coins are dynamically identified by type
        validPocketedCoins.push(p);
      }
    }

    const pocketedCoinTypes = validPocketedCoins.map((c) => c.type as CoinType);
    const assignedCoins = validPocketedCoins.filter((c) =>
      this.ruleset.isAssignedCoin(shooter, c.type as CoinType)
    );
    const queenWasPocketed = pocketedCoinTypes.includes('queen');

    // 2. Pre-evaluate Queen to know if failed cover happened
    const isPendingCoverBefore = queenStatusBefore === 'pending_cover';
    const failedQueenCoverAttempt = isPendingCoverBefore && (assignedCoins.length === 0 || strikerPocketed);

    // 3. Detect Fouls
    const playerScore = this.scoringEngine.getPlayerScore(shooter.id);
    const playerPocketedCount =
      (playerScore?.whiteCoinsPocketed ?? 0) + (playerScore?.blackCoinsPocketed ?? 0);

    // SGFI Law 56/57: Check if sinking queen alone without banking any piece
    const strictQueenCheck = this.ruleset.strictQueenEligibility ?? false;
    const isPrematureQueen =
      strictQueenCheck &&
      queenWasPocketed &&
      assignedCoins.length === 0 &&
      playerPocketedCount === 0 &&
      !strikerPocketed;

    const foulResult = this.foulManager.detectFouls({
      player: shooter,
      strikerPocketed,
      pocketedCoinTypes,
      isFailedQueenCover: failedQueenCoverAttempt,
      contactOccurred: input.contactOccurred,
      playerPocketedCoinsCount: playerPocketedCount,
      coinsOverboard: input.coinsOverboard,
      isPrematureQueenPocket: isPrematureQueen,
    });

    const foulOccurred = foulResult.hasFoul;

    // 4. Queen Manager state transition
    const queenResult = this.queenManager.evaluateShot({
      shooter,
      queenPocketedThisShot: queenWasPocketed,
      assignedCoinsPocketedCount: assignedCoins.length,
      foulOccurred,
      playerBankedCoinsCount: playerPocketedCount,
      strictQueenEligibility: strictQueenCheck,
    });

    const queenStatusAfter = queenResult.status;
    if (queenStatusBefore !== queenStatusAfter) {
      this.emit('QUEEN_STATUS_CHANGED', {
        status: queenStatusAfter,
        coveredBy: queenResult.queenRetainedByPlayerId,
      });
    }

    // 5. Coin states & Returns to board
    const coinsToReturnToBoard: { id?: string; type: CoinType }[] = [];

    // Return Queen to board if returned
    if (queenResult.queenReturnedToBoard) {
      const qCoin = this.coins.find((c) => c.type === 'queen');
      if (qCoin) {
        qCoin.state = 'on_board';
        qCoin.position = { x: BOARD_CENTER.x, y: BOARD_CENTER.y };
        qCoin.velocity = { x: 0, y: 0 };
        coinsToReturnToBoard.push({ id: qCoin.id, type: 'queen' });
      }
    }

    // Handle coins that flew overboard (SGFI Chapter XII)
    if (input.coinsOverboard && input.coinsOverboard.length > 0) {
      for (const ob of input.coinsOverboard) {
        const match = this.coins.find(
          (c) => c.id === ob.id || (ob.type && c.type === ob.type && c.state !== 'pocketed')
        );
        if (match) {
          match.state = 'on_board';
          match.position = { x: BOARD_CENTER.x, y: BOARD_CENTER.y };
          match.velocity = { x: 0, y: 0 };
          coinsToReturnToBoard.push({ id: match.id, type: match.type });
        }
      }
    }

    // Mark newly pocketed coins as pocketed
    for (const p of validPocketedCoins) {
      if (p.type === 'queen' && queenResult.queenReturnedToBoard) {
        continue;
      }
      // SGFI Law 89a: If striker is pocketed along with own coin, own coin must return to center circle!
      if (strikerPocketed && this.ruleset.isAssignedCoin(shooter, p.type as CoinType)) {
        const match = this.coins.find((c) => c.id === p.id);
        if (match) {
          match.state = 'on_board';
          match.position = { x: BOARD_CENTER.x, y: BOARD_CENTER.y };
          match.velocity = { x: 0, y: 0 };
          coinsToReturnToBoard.push({ id: match.id, type: match.type });
        }
        continue;
      }

      const match = this.coins.find((c) => c.id === p.id);
      if (match) {
        match.state = 'pocketed';
        match.pocketedBy = shooter.id;
      }
    }

    // Handle Foul penalty coins to return
    if (foulResult.penaltyCoinsToReturnNow > 0) {
      let remainingToReturn = foulResult.penaltyCoinsToReturnNow;
      // Find previously pocketed assigned coins to return to center
      for (const c of this.coins) {
        if (remainingToReturn <= 0) break;
        if (c.state === 'pocketed' && c.type !== 'queen' && this.ruleset.isAssignedCoin(shooter, c.type)) {
          c.state = 'on_board';
          c.position = { x: BOARD_CENTER.x, y: BOARD_CENTER.y };
          c.velocity = { x: 0, y: 0 };
          coinsToReturnToBoard.push({ id: c.id, type: c.type });
          remainingToReturn--;
        }
      }
    }

    // Settle due penalties if no foul occurred and player pocketed assigned coins (SGFI Law 93)
    let settledDueCount = 0;
    if (!foulOccurred && assignedCoins.length > 0) {
      settledDueCount = this.foulManager.settleDuePenalty(shooter.id, assignedCoins.length);
      if (settledDueCount > 0) {
        let returnCount = settledDueCount;
        for (const c of this.coins) {
          if (returnCount <= 0) break;
          if (c.state === 'pocketed' && c.type !== 'queen' && this.ruleset.isAssignedCoin(shooter, c.type)) {
            c.state = 'on_board';
            c.position = { x: BOARD_CENTER.x, y: BOARD_CENTER.y };
            c.velocity = { x: 0, y: 0 };
            coinsToReturnToBoard.push({ id: c.id, type: c.type });
            returnCount--;
          }
        }
      }
    }

    // 6. Scoring
    let playerScoreDelta = 0;
    let teamScoreDelta = 0;

    if (!foulOccurred) {
      // Score pocketed coins
      const scoredCoins = validPocketedCoins
        .filter((c) => c.type !== 'queen' || queenResult.queenCoveredThisShot)
        .map((c) => c.type as CoinType);

      // If Queen was covered in this shot but pocketed earlier, credit the Queen now
      if (queenResult.queenCoveredThisShot && !scoredCoins.includes('queen')) {
        scoredCoins.push('queen');
      }

      const scoreResult = this.scoringEngine.recordShotCoins(
        shooter,
        scoredCoins,
        queenResult.queenCoveredThisShot
      );
      playerScoreDelta = scoreResult.playerDelta;
      teamScoreDelta = scoreResult.teamDelta;
    } else {
      // Record foul and penalty deductions
      this.scoringEngine.recordFoul(shooter, foulResult.penaltyCoinsAddedToDue);
      if (foulResult.penaltyPointsDeducted > 0) {
        this.scoringEngine.deductPenaltyPoints(shooter, foulResult.penaltyPointsDeducted);
      }
      this.emit('FOUL_COMMITTED', { player: shooter, fouls: foulResult.fouls });
    }

    // 7. Extra turn evaluation
    let extraTurnEarned = false;
    if (!foulOccurred) {
      // In SGFI Law 93: if all pocketed assigned coins went to settle due, no extra turn earned
      const retainedAssignedCoins = assignedCoins.length > settledDueCount;
      const pocketedQueenPending = queenWasPocketed && queenStatusAfter === 'pending_cover';
      const coveredQueen = queenResult.queenCoveredThisShot;

      if (retainedAssignedCoins || pocketedQueenPending || coveredQueen) {
        extraTurnEarned = true;
        this.scoringEngine.recordExtraTurn(shooter);
      }
    }

    this.scoringEngine.recordHistory(
      this.turnManager.getTurnNumber(),
      shooter,
      playerScoreDelta,
      pocketedCoinTypes,
      foulResult.penaltyPointsDeducted
    );

    // 8. Win condition check
    const allPlayerScores = this.scoringEngine.getAllPlayerScores();
    const teamScores = this.scoringEngine.getTeamScores();
    const winResult = this.winConditionManager.checkWinCondition({
      players: this.players,
      scores: allPlayerScores,
      teamScores,
      coinsOnBoard: this.coins,
      queenStatus: queenStatusAfter,
      currentRound: this.currentRound,
    });

    let matchResult: GameResult | undefined;
    let nextTurn: PlayerTurn | undefined;

    if (winResult.hasWinner) {
      this.isMatchOver = true;
      matchResult = this.winConditionManager.createGameResult({
        sessionId: this.matchId,
        config: this.config,
        winResult,
        players: this.players,
        finalScores: allPlayerScores,
        totalTurns: this.turnManager.getTurnNumber(),
        startedAt: this.matchStartedAt,
      });

      this.emit('MATCH_COMPLETED', { result: matchResult });
    } else {
      nextTurn = this.turnManager.advanceTurn(extraTurnEarned);
      this.emit('TURN_CHANGED', {
        activePlayerId: nextTurn.activePlayerId,
        turnNumber: nextTurn.turnNumber,
        activeSeat: nextTurn.activeSeat,
      });
    }

    const evaluation: SettledShotEvaluation = {
      shotNumber: this.shotCounter,
      activePlayerId: shooter.id,
      activeSeat: shooter.seat,
      pocketedCoins: validPocketedCoins,
      foulOccurred,
      fouls: foulResult.fouls,
      primaryFoulType: foulResult.primaryFoulType,
      queenStatusBefore,
      queenStatusAfter,
      queenCoveredThisShot: queenResult.queenCoveredThisShot,
      queenReturnedToCenter: queenResult.queenReturnedToBoard,
      extraTurnEarned,
      coinsToReturnToBoard,
      playerScoreDelta,
      teamScoreDelta,
      playerScores: allPlayerScores,
      teamScores,
      isMatchOver: this.isMatchOver,
      matchResult,
      nextTurn,
      remainingCoins: this.getRemainingCoinsCount(),
    };

    this.emit('SHOT_SETTLED', { evaluation });

    // If Queen returned to board, reset manager status to unpocketed for subsequent play
    if (queenResult.queenReturnedToBoard) {
      this.queenManager.resetToUnpocketed();
    }

    return evaluation;
  }

  /**
   * Adapts legacy evaluateShot interface for 100% backward compatibility.
   */
  public evaluateShot(input: {
    player: Player;
    pocketedCoins: Coin[];
    strikerPocketed: boolean;
    queenStatus: QueenStatus;
    queenPocketedByPlayerId?: string;
  }): ShotResult {
    const rawCoins: PocketedCoinRecord[] = input.pocketedCoins.map((c) => ({
      id: c.id,
      type: c.type,
    }));

    const evaluation = this.processShotSettlement({
      pocketedCoins: rawCoins,
      strikerPocketed: input.strikerPocketed,
    });

    return {
      pocketedCoins: evaluation.pocketedCoins.map((c) => c.type as CoinType),
      pocketedCoinIds: evaluation.pocketedCoins.map((c) => c.id),
      foulCommitted: evaluation.foulOccurred,
      foulType: evaluation.primaryFoulType,
      fouls: evaluation.fouls,
      queenPocketedThisShot: input.pocketedCoins.some((c) => c.type === 'queen'),
      queenCoveredThisShot: evaluation.queenCoveredThisShot,
      queenReturnedToCenter: evaluation.queenReturnedToCenter,
      extraTurnEarned: evaluation.extraTurnEarned,
      penaltyCoinsDue: evaluation.fouls.reduce((acc, f) => acc + f.penaltyCoins, 0),
      coinsToReturnToBoard: evaluation.coinsToReturnToBoard,
    };
  }

  /**
   * Settles official SGFI/ICF board completion.
   * Awards 1 pt per opponent piece remaining on board + 3 pts Queen bonus (subject to 21 pt cap).
   */
  public settleBoardCompletion(winner: Player): {
    winnerPoints: number;
    remainingOpponentCoins: number;
    queenBonus: number;
  } {
    const queenCoveredByWinner =
      this.queenManager.getPocketedByPlayerId() === winner.id ||
      (winner.teamId && this.queenManager.getPocketedByTeamId() === winner.teamId);

    return this.scoringEngine.settleBoardOutcome({
      winner,
      coinsOnBoard: this.coins,
      queenCoveredByWinner: Boolean(queenCoveredByWinner && this.queenManager.isCovered()),
    });
  }
}
