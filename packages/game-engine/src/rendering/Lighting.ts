import { Vector2D } from '../types/GameTypes.js';

export interface LightSource {
  direction: Vector2D; // Normalized directional vector
  ambientIntensity: number;
  diffuseIntensity: number;
  specularColor: string;
}

export const DEFAULT_LIGHTING: LightSource = {
  direction: { x: -0.7071, y: -0.7071 }, // light coming from top-left
  ambientIntensity: 0.65,
  diffuseIntensity: 0.35,
  specularColor: '#FFFFFF',
};

/**
 * Calculates specular highlight offset for an entity of radius R.
 */
export function calculateHighlightOffset(radius: number, lightDir: Vector2D = DEFAULT_LIGHTING.direction): Vector2D {
  return {
    x: lightDir.x * radius * 0.38,
    y: lightDir.y * radius * 0.38,
  };
}
