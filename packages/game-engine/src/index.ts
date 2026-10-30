/**
 * @carromverse/game-engine - Package Entrypoint
 */

// Phase 1.3 Core & Architecture
export * from './types/GameTypes.js';
export * from './core/GameConfig.js';
export * from './core/GameManager.js';
export * from './core/GameEvents.js';

// Scenes
export * from './scenes/BootScene.js';
export * from './scenes/PreloadScene.js';
export * from './scenes/CarromScene.js';

// Board
export * from './board/CarromBoard.js';
export * from './board/BoardRenderer.js';
export * from './board/BoardConfig.js';
export * from './board/BoardThemes.js';

// Entities
export * from './entities/Coin.js';
export * from './entities/Queen.js';
export * from './entities/Striker.js';

// Rendering & Lighting
export * from './rendering/Lighting.js';
export * from './rendering/Shadows.js';
export * from './rendering/TextureManager.js';

// Input & Assets
export * from './input/PointerInput.js';
export * from './assets/AssetRegistry.js';

// Phase 1.1 Foundation & Bridge Compatibility
export * from './bridge/WebviewBridge.js';
export * from './core/CarromEngine.js';
export * from './physics/CarromPhysicsWorld.js';
export * from './physics/CollisionCategories.js';
export * from './config/physics.config.js';
export * from './config/game.config.js';
export * from './config/coin.config.js';
export * from './config/striker.config.js';
export * from './config/board.config.js';
export * from './events/BridgeProtocol.js';
export * from './events/GameEngineEvents.js';
export * from './entities/CoinEntity.js';
export * from './entities/StrikerEntity.js';
