import Phaser from 'phaser';
import { COLLISION_CATEGORIES, COLLISION_MASKS } from '../physics/CollisionCategories.js';
import { PHYSICS_CONFIG } from '../physics/PhysicsConfig.js';
import { NORMALIZED_BOARD_CONFIG } from '../board/BoardConfig.js';

export class BoardBoundary {
  private scene: Phaser.Scene;
  private bodies: MatterJS.BodyType[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public createBoundaries(boardSize: number): MatterJS.BodyType[] {
    this.destroy();

    const fw = boardSize * NORMALIZED_BOARD_CONFIG.FRAME_WIDTH;
    const surfSize = boardSize * NORMALIZED_BOARD_CONFIG.PLAYING_SURFACE_SIZE;
    const halfSize = boardSize / 2;
    const cushionThickness = boardSize * 0.03;
    
    // Corner pocket cutouts: cushions do not extend fully to corners
    const pocketClearance = boardSize * 0.085;
    const cushionLength = surfSize - pocketClearance * 2;

    const cushionSpecs = [
      // Top Cushion
      {
        x: halfSize,
        y: fw + cushionThickness / 2,
        w: cushionLength,
        h: cushionThickness,
        label: 'cushion_top',
      },
      // Bottom Cushion
      {
        x: halfSize,
        y: boardSize - fw - cushionThickness / 2,
        w: cushionLength,
        h: cushionThickness,
        label: 'cushion_bottom',
      },
      // Left Cushion
      {
        x: fw + cushionThickness / 2,
        y: halfSize,
        w: cushionThickness,
        h: cushionLength,
        label: 'cushion_left',
      },
      // Right Cushion
      {
        x: boardSize - fw - cushionThickness / 2,
        y: halfSize,
        w: cushionThickness,
        h: cushionLength,
        label: 'cushion_right',
      },
    ];

    cushionSpecs.forEach((spec) => {
      const body = this.scene.matter.add.rectangle(spec.x, spec.y, spec.w, spec.h, {
        isStatic: true,
        restitution: PHYSICS_CONFIG.cushions.restitution,
        friction: PHYSICS_CONFIG.cushions.friction,
        label: spec.label,
        collisionFilter: {
          category: COLLISION_CATEGORIES.BOARD_BOUNDARY,
          mask: COLLISION_MASKS.BOARD_BOUNDARY,
        },
      });
      this.bodies.push(body);
    });

    return this.bodies;
  }

  public getBodies(): MatterJS.BodyType[] {
    return this.bodies;
  }

  public destroy(): void {
    this.bodies.forEach((b) => {
      if (this.scene.matter && this.scene.matter.world) {
        this.scene.matter.world.remove(b);
      }
    });
    this.bodies = [];
  }
}

