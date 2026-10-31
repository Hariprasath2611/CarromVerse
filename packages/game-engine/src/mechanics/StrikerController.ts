import { Striker } from '../entities/Striker.js';
import { CarromBoard } from '../board/CarromBoard.js';

export class StrikerController {
  private striker: Striker;
  private board: CarromBoard;
  private currentOffset: number = 0; // -0.95 to +0.95
  private activeSeat: number = 0; // 0 = South, 1 = East, 2 = North, 3 = West
  private isPositionLocked: boolean = false;

  constructor(striker: Striker, board: CarromBoard, activeSeat: number = 0) {
    this.striker = striker;
    this.board = board;
    this.activeSeat = activeSeat;
    this.setOffset(0);
  }

  public setOffset(offsetRatio: number): void {
    if (this.isPositionLocked) return;

    // Strict clamping along permitted baseline endpoints
    this.currentOffset = Math.max(-0.95, Math.min(0.95, offsetRatio));
    this.striker.setBaselineOffset(this.currentOffset);
  }

  public getOffset(): number {
    return this.currentOffset;
  }

  public setSeat(seatIndex: number): void {
    this.activeSeat = seatIndex;
    this.striker.setSeat(seatIndex);
    this.setOffset(0);
  }

  public getSeat(): number {
    return this.activeSeat;
  }

  public lockPosition(): void {
    this.isPositionLocked = true;
  }

  public unlockPosition(): void {
    this.isPositionLocked = false;
  }

  public isLocked(): boolean {
    return this.isPositionLocked;
  }

  public resetToCenter(): void {
    this.unlockPosition();
    this.setOffset(0);
  }
}
