/**
 * @carromverse/game-engine - Package Entrypoint (Headless / React Native / Node.js safe)
 *
 * This entrypoint is 100% free of browser DOM dependencies (window, document)
 * and can be safely imported by React Native, Node.js servers, and tests.
 *
 * For browser-specific Phaser scenes and canvas renderers, import '@carromverse/game-engine/browser'.
 */

// Core Types & Protocols
export * from './types/GameTypes.js';
export * from './core/GameEvents.js';
export * from './events/BridgeProtocol.js';
export * from './events/GameEngineEvents.js';

// Board Configuration & Geometry
export * from './board/BoardConfig.js';
export * from './board/BoardThemes.js';
export * from './board/LayoutConfig.js';
export * from './config/board.config.js';
export * from './config/coin.config.js';
export * from './config/striker.config.js';
export * from './assets/AssetRegistry.js';

// Physics Configuration & Utilities (Headless / Zero DOM dependencies)
export * from './physics/PhysicsConfig.js';
export * from './physics/PhysicsEvents.js';
export * from './physics/CollisionCategories.js';
export * from './config/physics.config.js';
export * from './utils/VectorUtils.js';
export * from './utils/PhysicsUtils.js';
export * from './mechanics/MotionDetector.js';
export * from './mechanics/AimingController.js';
export * from './mechanics/ShootingController.js';
export * from './mechanics/StrikerController.js';
export * from './systems/PhysicsSync.js';
export * from './systems/GameEventManager.js';
export * from './rendering/Lighting.js';
export * from './rendering/Shadows.js';

// WebView Bridge & HTML Generator (Self-Contained Phaser Engine for WebView)
export * from './bridge/phaserHtmlGenerator.js';
export * from './bridge/WebviewBridge.js';
