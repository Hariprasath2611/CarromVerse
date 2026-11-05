import { BOT_PERSONALITIES } from './DifficultyConfig.js';
import { BotPersonality } from '../types/BotTypes.js';
import { ShotGenerationOptions } from '../strategy/ShotGenerator.js';

export class MediumBot {
  public static readonly personality: BotPersonality = BOT_PERSONALITIES.MEDIUM;

  public static getShotGenerationOptions(includeQueen: boolean): ShotGenerationOptions {
    return {
      samplingPoints: 15,
      maxCutAngleDeg: this.personality.maxCutAngleDeg,
      includeQueen,
      allowBankShots: true,
    };
  }

  public static calculateThinkingDelay(): number {
    const min = this.personality.thinkingDelayMinMs;
    const max = this.personality.thinkingDelayMaxMs;
    return Math.floor(min + Math.random() * (max - min));
  }
}

