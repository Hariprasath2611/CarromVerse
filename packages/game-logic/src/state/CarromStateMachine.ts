import {
  Coin,
  GameConfiguration,
  GameResult,
  GameSession,
  Player,
  PlayerId,
  QueenStatus,
  ShotResult,
  Striker,
} from '@carromverse/shared-types';
import { generateMatchId, generateUUID, TypedEventEmitter } from '@carromverse/shared-utils';
import { BOARD_CENTER, DEFAULT_BOARD_DIMENSIONS } from '../config/board.config.js';
import { CarromRulesManager, ShotEvaluationInput } from '../rules/CarromRulesManager.js';
import { ScoreManager } from '../rules/ScoreManager.js';
import { TurnManager } from '../rules/TurnManager.js';

export interface GameLogicEvents {
  TURN_CHANGED: { activePlayerId: PlayerId; turnNumber: number };
  SHOT_EVALUATED: { shotResult: ShotResult; activePlayerId: PlayerId };
  QUEEN_STATUS_CHANGED: { status: QueenStatus; coveredBy?: PlayerId };
  MATCH_COMPLETED: { result: GameResult };
}

export class CarromStateMachine extends TypedEventEmitter<GameLogicEvents> {
  private config: GameConfiguration;
  private players: Player[];
  private turnManager: TurnManager;
  private rulesManager: CarromRulesManager;
  private scoreManager: ScoreManager;
  private coins: Coin[] = [];
  private striker: Striker;
  private queenStatus: QueenStatus = 'unpocketed';
  private queenPocketedByPlayerId?: PlayerId;
  private currentRound: number = 1;
  private matchStartedAt: string;
  private isMatchOver: boolean = false;

  constructor(config: GameConfiguration, players: Player[]) {
    super();
    this.config = config;
    this.players = players;
    this.turnManager = new TurnManager(config.mode, players, config.turnTimeLimitSeconds);
    this.rulesManager = new CarromRulesManager(config);
    this.scoreManager = new ScoreManager(config, players);
    this.matchStartedAt = new Date().toISOString();

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

    this.initializeCoins();
  }

  private initializeCoins(): void {
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

    // Inner circle ring (6 coins: alternating White and Black)
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

    // Outer circle ring (12 coins: 6 White, 6 Black)
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

  public getSessionState(): GameSession {
    const activePlayer = this.turnManager.getActivePlayer();
    const currentTurn = this.turnManager.createInitialTurn();

    return {
      id: generateMatchId(),
      config: this.config,
      players: this.players,
      status: this.isMatchOver ? 'match_end' : 'in_progress',
      currentTurn,
      scores: this.scoreManager.getAllScores(),
      coins: this.coins,
      striker: this.striker,
      queenStatus: this.queenStatus,
      queenPocketedByPlayerId: this.queenPocketedByPlayerId,
      roundNumber: this.currentRound,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  public processShot(pocketedCoins: Coin[], strikerPocketed: boolean): ShotResult {
    const activePlayer = this.turnManager.getActivePlayer();

    const result = this.rulesManager.evaluateShot({
      player: activePlayer,
      pocketedCoins,
      strikerPocketed,
      queenStatus: this.queenStatus,
      queenPocketedByPlayerId: this.queenPocketedByPlayerId,
    });

    // Update pocketed coins state
    for (const pCoin of pocketedCoins) {
      const match = this.coins.find((c) => c.id === pCoin.id);
      if (match) {
        if (match.type === 'queen' && result.queenReturnedToCenter) {
          match.position = { x: BOARD_CENTER.x, y: BOARD_CENTER.y };
          match.state = 'on_board';
          match.velocity = { x: 0, y: 0 };
        } else {
          match.state = 'pocketed';
          match.pocketedBy = activePlayer.id;
        }
      }
    }

    // Update Queen status
    if (result.queenCoveredThisShot) {
      this.queenStatus = 'covered';
      this.queenPocketedByPlayerId = activePlayer.id;
      this.emit('QUEEN_STATUS_CHANGED', { status: 'covered', coveredBy: activePlayer.id });
    } else if (result.queenPocketedThisShot && !result.foulCommitted) {
      this.queenStatus = 'pending_cover';
      this.queenPocketedByPlayerId = activePlayer.id;
      this.emit('QUEEN_STATUS_CHANGED', { status: 'pending_cover', coveredBy: activePlayer.id });
    } else if (result.queenReturnedToCenter) {
      this.queenStatus = 'returned_to_board';
      this.queenPocketedByPlayerId = undefined;
      this.emit('QUEEN_STATUS_CHANGED', { status: 'returned_to_board' });
    }

    // Update scores
    for (const pCoin of pocketedCoins) {
      if (pCoin.type !== 'queen' || result.queenCoveredThisShot) {
        this.scoreManager.recordPocketedCoin(activePlayer.id, pCoin);
      }
    }

    if (result.foulCommitted) {
      this.scoreManager.recordFoul(activePlayer.id, result.penaltyCoinsDue);
    }

    this.emit('SHOT_EVALUATED', { shotResult: result, activePlayerId: activePlayer.id });

    // Check match completion
    const winnerCheck = this.scoreManager.checkWinner(this.players, this.coins, this.currentRound);
    if (winnerCheck.hasWinner) {
      this.isMatchOver = true;
      const gameResult: GameResult = {
        id: generateUUID(),
        sessionId: generateMatchId(),
        mode: this.config.mode,
        variant: this.config.variant,
        winnerId: winnerCheck.winner?.id,
        winnerName: winnerCheck.winner?.name,
        winningTeamId: winnerCheck.winner?.teamId,
        isDraw: !!winnerCheck.isDraw,
        finalScores: this.scoreManager.getAllScores(),
        durationSeconds: 0,
        totalTurns: this.turnManager.getTurnNumber(),
        startedAt: this.matchStartedAt,
        completedAt: new Date().toISOString(),
        isSynced: false,
        syncAttemptCount: 0,
      };

      this.emit('MATCH_COMPLETED', { result: gameResult });
    } else {
      // Advance turn
      const nextTurn = this.turnManager.advanceTurn(result.extraTurnEarned);
      this.emit('TURN_CHANGED', {
        activePlayerId: nextTurn.activePlayerId,
        turnNumber: nextTurn.turnNumber,
      });
    }

    return result;
  }
}
