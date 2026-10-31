import {
  Coin,
  GameConfiguration,
  GameResult,
  GameSession,
  Player,
  PlayerId,
  QueenStatus,
  ShotResult,
  ShotSettlementInput,
  Striker,
} from '@carromverse/shared-types';
import { generateMatchId, generateUUID, TypedEventEmitter } from '@carromverse/shared-utils';
import { BOARD_CENTER } from '../config/board.config.js';
import { CarromRulesEngine, SettledShotEvaluation } from '../engine/CarromRulesEngine.js';
import { CarromRulesManager } from '../rules/CarromRulesManager.js';
import { ScoreManager } from '../rules/ScoreManager.js';
import { TurnManager } from '../rules/TurnManager.js';

export interface GameLogicEvents {
  TURN_CHANGED: { activePlayerId: PlayerId; turnNumber: number };
  SHOT_EVALUATED: { shotResult: ShotResult; activePlayerId: PlayerId };
  SHOT_SETTLED: { evaluation: SettledShotEvaluation };
  QUEEN_STATUS_CHANGED: { status: QueenStatus; coveredBy?: PlayerId };
  MATCH_COMPLETED: { result: GameResult };
}

export class CarromStateMachine extends TypedEventEmitter<GameLogicEvents> {
  private config: GameConfiguration;
  private players: Player[];
  private engine: CarromRulesEngine;
  private turnManager: TurnManager;
  private rulesManager: CarromRulesManager;
  private scoreManager: ScoreManager;
  private striker: Striker;
  private isMatchOver: boolean = false;
  private matchStartedAt: string;
  private currentRound: number = 1;

  constructor(config: GameConfiguration, players: Player[]) {
    super();
    this.config = config;
    this.players = players;
    this.matchStartedAt = new Date().toISOString();

    // Primary rules engine
    this.engine = new CarromRulesEngine(config, players);
    this.turnManager = this.engine.getTurnManager();
    this.rulesManager = new CarromRulesManager(config);
    this.scoreManager = new ScoreManager(config, players);

    this.striker = {
      id: 'striker_main',
      position: { x: 500, y: 845 },
      velocity: { x: 0, y: 0 },
      angle: -Math.PI / 2,
      power: 0,
      state: 'placing',
      baselineNormalizedPos: 0.5,
      radius: config.boardDimensions.strikerRadius,
      mass: 3.5,
    };

    // Forward events from rules engine
    this.engine.on('TURN_CHANGED', ({ activePlayerId, turnNumber }) => {
      this.emit('TURN_CHANGED', { activePlayerId, turnNumber });
    });

    this.engine.on('QUEEN_STATUS_CHANGED', ({ status, coveredBy }) => {
      this.emit('QUEEN_STATUS_CHANGED', { status, coveredBy });
    });

    this.engine.on('SHOT_SETTLED', ({ evaluation }) => {
      this.emit('SHOT_SETTLED', { evaluation });
    });

    this.engine.on('MATCH_COMPLETED', ({ result }) => {
      this.isMatchOver = true;
      this.emit('MATCH_COMPLETED', { result });
    });
  }

  public getRulesEngine(): CarromRulesEngine {
    return this.engine;
  }

  public getCoins(): Coin[] {
    return this.engine.getCoins();
  }

  public getQueenStatus(): QueenStatus {
    return this.engine.getQueenManager().getStatus();
  }

  public getSessionState(): GameSession {
    const activePlayer = this.turnManager.getActivePlayer();
    const currentTurn = this.turnManager.getCurrentTurn();
    const scores = this.engine.getScoringEngine().getAllPlayerScores();

    return {
      id: generateMatchId(),
      config: this.config,
      players: this.players,
      status: this.isMatchOver ? 'match_end' : 'in_progress',
      currentTurn,
      scores,
      coins: this.engine.getCoins(),
      striker: this.striker,
      queenStatus: this.engine.getQueenManager().getStatus(),
      queenPocketedByPlayerId: this.engine.getQueenManager().getPocketedByPlayerId(),
      roundNumber: this.currentRound,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  /**
   * Primary single-transaction settlement processor for Phase 1.5.
   */
  public processShotSettlement(input: ShotSettlementInput): SettledShotEvaluation {
    return this.engine.processShotSettlement(input);
  }

  /**
   * Backward-compatible processShot.
   */
  public processShot(pocketedCoins: Coin[], strikerPocketed: boolean): ShotResult {
    const activePlayer = this.turnManager.getActivePlayer();
    const evaluation = this.engine.processShotSettlement({
      pocketedCoins: pocketedCoins.map((c) => ({ id: c.id, type: c.type })),
      strikerPocketed,
    });

    const shotResult: ShotResult = {
      pocketedCoins: evaluation.pocketedCoins.map((c) => c.type as any),
      pocketedCoinIds: evaluation.pocketedCoins.map((c) => c.id),
      foulCommitted: evaluation.foulOccurred,
      foulType: evaluation.primaryFoulType,
      fouls: evaluation.fouls,
      queenPocketedThisShot: evaluation.pocketedCoins.some((c) => c.type === 'queen'),
      queenCoveredThisShot: evaluation.queenCoveredThisShot,
      queenReturnedToCenter: evaluation.queenReturnedToCenter,
      extraTurnEarned: evaluation.extraTurnEarned,
      penaltyCoinsDue: evaluation.fouls.reduce((acc, f) => acc + f.penaltyCoins, 0),
      coinsToReturnToBoard: evaluation.coinsToReturnToBoard,
    };

    this.emit('SHOT_EVALUATED', { shotResult, activePlayerId: activePlayer.id });
    return shotResult;
  }
}
