import { Vector2D } from '@carromverse/shared-types';

export function distance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function distanceSquared(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
}

export function angleBetween(from: Vector2D, to: Vector2D): number {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function radToDeg(radians: number): number {
  return (radians * 180) / Math.PI;
}

export function normalizeVector(v: Vector2D): Vector2D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function scaleVector(v: Vector2D, scalar: number): Vector2D {
  return { x: v.x * scalar, y: v.y * scalar };
}

export function addVectors(a: Vector2D, b: Vector2D): Vector2D {
  return { x: a.x + b.x, y: a.y + b.y };
}

