import { QueenStatus } from '@carromverse/shared-types';
import { BotDecisionEngine, DecisionEngineResult } from './BotDecisionEngine.js';
import { BotDifficulty, BotPersonality } from '../types/BotTypes.js';

export interface BotControllerCallbacks {
  onThinkingStart?: (message: string, durationMs: number) => void;
  onPositionStriker?: (offset: number) => void;
  onAimReady?: (angle: number, power: number) => void;
  onShoot?: (power: number, angle: number) => void;
}

export class BotController {
  private engine: BotDecisionEngine;
  private isThinking: boolean = false;
  private pendingTimer: any = null;
  private callbacks: BotControllerCallbacks = {};

  constructor(difficulty: BotDifficulty = 'MEDIUM', callbacks: BotControllerCallbacks = {}) {
    this.engine = new BotDecisionEngine(difficulty);
    this.callbacks = callbacks;
  }

  public setCallbacks(callbacks: BotControllerCallbacks): void {
    this.callbacks = callbacks;
  }

  public setDifficulty(difficulty: BotDifficulty): void {
    this.engine.setDifficulty(difficulty);
  }

  public getPersonality(): BotPersonality {
    return this.engine.getPersonality();
  }

  public isCurrentlyThinking(): boolean {
    return this.isThinking;
  }

  /**
   * Triggers the bot's turn sequence.
   */
  public handleBotTurn(
    boardSnapshot: any,
    assignedColor: 'white' | 'black',
    queenStatus: QueenStatus = 'unpocketed'
  ): Promise<DecisionEngineResult> {
    this.cancelPendingActions();
    this.isThinking = true;

    return new Promise((resolve) => {
      // 1. Compute optimal decision
      const result = this.engine.computeShot(boardSnapshot, assignedColor, queenStatus);
      const personality = this.engine.getPersonality();

      // Thinking status text
      const thinkingText =
        personality.difficulty === 'EASY'
          ? `${personality.name} is thinking...`
          : personality.difficulty === 'MEDIUM'
            ? `${personality.name} is analysing...`
            : `${personality.name} is calculating...`;

      this.callbacks.onThinkingStart?.(thinkingText, result.decision.thinkingTimeMs);

      // Thinking phase delay (makes gameplay feel natural)
      const thinkDelay = result.decision.thinkingTimeMs;

      this.pendingTimer = setTimeout(() => {
        if (!this.isThinking) return;

        // Step 2: Move striker to chosen baseline position
        this.callbacks.onPositionStriker?.(result.executableParams.offsetRatio);

        // Short aim animation phase (400ms) so user sees the bot lining up the shot
        this.pendingTimer = setTimeout(() => {
          if (!this.isThinking) return;

          this.callbacks.onAimReady?.(result.executableParams.aimAngle, result.executableParams.powerRatio);

          // Step 3: Shoot
          this.pendingTimer = setTimeout(() => {
            if (!this.isThinking) return;
            this.isThinking = false;
            this.callbacks.onShoot?.(result.executableParams.powerRatio, result.executableParams.aimAngle);
            resolve(result);
          }, 300);
        }, 400);
      }, thinkDelay);
    });
  }

  /**
   * Cancels any pending thinking or shooting timers.
   */
  public cancelPendingActions(): void {
    this.isThinking = false;
    if (this.pendingTimer) {
      clearTimeout(this.pendingTimer);
      this.pendingTimer = null;
    }
  }

  public dispose(): void {
    this.cancelPendingActions();
  }
}
