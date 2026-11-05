import { PlayerSeat } from '@carromverse/shared-types';
import { BoardAnalyzer } from '../analysis/BoardAnalyzer.js';
import { CoinAnalyzer } from '../analysis/CoinAnalyzer.js';
import { StrategySelector } from '../strategy/StrategySelector.js';
import { ShotGenerator } from '../strategy/ShotGenerator.js';
import { ShotEvaluator } from '../strategy/ShotEvaluator.js';
import { getBotPersonality } from '../difficulty/DifficultyConfig.js';
import { EasyBot } from '../difficulty/EasyBot.js';
import { MediumBot } from '../difficulty/MediumBot.js';
import { HardBot } from '../difficulty/HardBot.js';
import { BotShotExecutor } from '../execution/BotShotExecutor.js';
import { ExecutableShotParams } from '../execution/ShootingController.js';
import { BoardSnapshot, CandidateShot, CoinSnapshot } from '../types/ShotTypes.js';
import { BotDecision, BotDifficulty, BotPersonality } from '../types/BotTypes.js';
import { BotStrategyMode } from '../types/StrategyTypes.js';

export interface DecisionEngineResult {
  decision: BotDecision;
  executableParams: ExecutableShotParams;
  allEvaluatedCandidates: CandidateShot[];
  strategyMode: BotStrategyMode;
  executionDurationMs: number;
}

export class BotDecisionEngine {
  private personality: BotPersonality;

  constructor(difficulty: BotDifficulty = 'MEDIUM') {
    this.personality = getBotPersonality(difficulty);
  }

  public setDifficulty(difficulty: BotDifficulty): void {
    this.personality = getBotPersonality(difficulty);
  }

  public getPersonality(): BotPersonality {
    return this.personality;
  }

  /**
   * Main AI decision method: analyzes snapshot, evaluates candidates, and generates optimal shot.
   */
  public computeShot(
    rawSnapshot: any,
    assignedColor: 'white' | 'black',
    queenStatus: 'unpocketed' | 'pending_cover' | 'covered' | 'returned_to_center' = 'unpocketed',
    seed?: number
  ): DecisionEngineResult {
    const startTime = performance.now();

    // 1. Normalize board snapshot
    const snapshot: BoardSnapshot = BoardAnalyzer.normalizeSnapshot(rawSnapshot);
    const activeCoins = BoardAnalyzer.getActiveCoins(snapshot);

    // 2. Analyze coins and queen status
    const coinAnalysis = CoinAnalyzer.analyzeCoins(activeCoins, assignedColor, queenStatus);

    // 3. Determine strategy mode
    let strategyMode: BotStrategyMode = 'OFFENSIVE';
    if (queenStatus === 'pending_cover') {
      strategyMode = 'COVER_QUEEN';
    } else if (coinAnalysis.canPocketQueen && this.personality.difficulty !== 'EASY') {
      strategyMode = 'QUEEN_HUNTER';
    }

    // 4. Determine target coin list
    const candidateTargetCoins: CoinSnapshot[] = [...coinAnalysis.targetCoins];
    if (coinAnalysis.canPocketQueen && coinAnalysis.queenCoin) {
      candidateTargetCoins.unshift(coinAnalysis.queenCoin);
    }

    // 5. Get difficulty options
    const genOptions =
      this.personality.difficulty === 'EASY'
        ? EasyBot.getShotGenerationOptions(coinAnalysis.canPocketQueen)
        : this.personality.difficulty === 'MEDIUM'
          ? MediumBot.getShotGenerationOptions(coinAnalysis.canPocketQueen)
          : HardBot.getShotGenerationOptions(coinAnalysis.canPocketQueen);

    // 6. Generate candidate shots
    const rawCandidates = ShotGenerator.generateCandidates(snapshot, candidateTargetCoins, genOptions);

    // 7. Evaluate and rank candidates
    const weights = StrategySelector.getWeights(strategyMode, this.personality);
    const rankedCandidates = ShotEvaluator.evaluateCandidates(rawCandidates, this.personality, weights);

    // 8. Select best shot
    const selectedShot = ShotEvaluator.selectBestShot(rankedCandidates, this.personality, seed);

    // 9. Prepare executable parameters (calibrated offset, angle, power, thinking delay)
    const executableParams = BotShotExecutor.prepareExecution(
      selectedShot,
      snapshot.activeSeat,
      this.personality,
      activeCoins,
      seed
    );

    const endTime = performance.now();
    const executionDurationMs = Number((endTime - startTime).toFixed(2));

    const reasoning = this.buildReasoningText(selectedShot, strategyMode, executionDurationMs);

    const decision: BotDecision = {
      shot: selectedShot,
      thinkingTimeMs: executableParams.thinkingDelayMs,
      confidence: Number((selectedShot.estimatedSuccessProbability * 100).toFixed(1)),
      reasoning,
      timestamp: Date.now(),
    };

    return {
      decision,
      executableParams,
      allEvaluatedCandidates: rankedCandidates,
      strategyMode,
      executionDurationMs,
    };
  }

  private buildReasoningText(shot: CandidateShot, mode: BotStrategyMode, durationMs: number): string {
    const targetDesc = shot.targetCoinType === 'queen' ? 'Queen' : `${shot.targetCoinType} coin`;
    const pocketCorner = BoardAnalyzer.POCKETS.find((p) => p.id === shot.pocketId)?.corner || `pocket #${shot.pocketId}`;

    return `${this.personality.name} selected ${shot.shotType} shot on ${targetDesc} towards ${pocketCorner} (Cut: ${shot.cutAngleDeg.toFixed(1)}°, Power: ${(shot.powerRatio * 100).toFixed(0)}%, Confidence: ${(shot.estimatedSuccessProbability * 100).toFixed(0)}%, Solved in ${durationMs}ms, Strategy: ${mode})`;
  }
}
