import { BotPersonality } from '../types/BotTypes.js';
import { AngleCalculator } from '../strategy/AngleCalculator.js';

export interface ExecutableShotParams {
  offsetRatio: number;
  aimAngle: number;
  powerRatio: number;
  thinkingDelayMs: number;
}

export class ShootingController {
  /**
   * Applies difficulty-based calibration (aim error and power variation) to candidate shot.
   */
  public static calibrateShot(
    candidateAngle: number,
    candidatePower: number,
    candidateOffset: number,
    personality: BotPersonality,
    randomSeed?: number
  ): ExecutableShotParams {
    const angleNoise = this.generateGaussianNoise(personality.aimingErrorMaxRad, randomSeed);
    const powerNoise = this.generateUniformNoise(personality.powerVariation, randomSeed ? randomSeed + 1 : undefined);

    const finalAngle = AngleCalculator.normalizeAngle(candidateAngle + angleNoise);
    const finalPower = Math.max(0.25, Math.min(0.95, Number((candidatePower * (1 + powerNoise)).toFixed(2))));

    // Thinking delay calculation
    const delayMin = personality.thinkingDelayMinMs;
    const delayMax = personality.thinkingDelayMaxMs;
    const thinkingDelayMs = Math.floor(delayMin + (randomSeed ? this.seededRandom(randomSeed + 2) : Math.random()) * (delayMax - delayMin));

    return {
      offsetRatio: candidateOffset,
      aimAngle: finalAngle,
      powerRatio: finalPower,
      thinkingDelayMs,
    };
  }

  /**
   * Box-Muller transform for Gaussian distributed noise with standard deviation sigma.
   */
  private static generateGaussianNoise(sigma: number, seed?: number): number {
    if (sigma <= 0.0001) return 0;
    const u1 = Math.max(0.0001, seed !== undefined ? this.seededRandom(seed) : Math.random());
    const u2 = seed !== undefined ? this.seededRandom(seed + 10) : Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * sigma;
  }

  /**
   * Uniform noise in [-variation, +variation].
   */
  private static generateUniformNoise(variation: number, seed?: number): number {
    if (variation <= 0.0001) return 0;
    const rng = seed !== undefined ? this.seededRandom(seed) : Math.random();
    return (rng * 2 - 1) * variation;
  }

  private static seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }
}

