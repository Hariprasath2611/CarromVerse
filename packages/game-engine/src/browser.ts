/**
 * @carromverse/game-engine/browser - Browser & Canvas Exports (Requires DOM / Window / Phaser)
 */

export * from './index.js';

// Core Engine & Phaser Configurations
export * from './core/GameConfig.js';
export * from './core/GameManager.js';
export * from './core/CarromEngine.js';

// Phaser Scenes
export * from './scenes/BootScene.js';
export * from './scenes/PreloadScene.js';
export * from './scenes/CarromScene.js';
export * from './scenes/CarromBoardScene.js';

// Phaser Board & Rendering
export * from './board/CarromBoard.js';
export * from './board/BoardRenderer.js';
export * from './rendering/TextureManager.js';

// Phaser Entities
export * from './entities/Coin.js';
export * from './entities/Queen.js';
export * from './entities/Striker.js';
export * from './entities/BoardBoundary.js';
export * from './entities/PocketSensor.js';
export * from './entities/CoinEntity.js';
export * from './entities/StrikerEntity.js';

// Phaser Physics & Mechanics
export * from './physics/PhysicsWorld.js';
export * from './physics/CarromPhysicsWorld.js';
export * from './physics/CollisionManager.js';
export * from './physics/PhysicsManager.js';
export * from './mechanics/FrictionController.js';
export * from './mechanics/PocketDetection.js';

// Phaser Input
export * from './input/PointerInput.js';
export * from './input/InputManager.js';

