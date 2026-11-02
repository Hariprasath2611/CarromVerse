# @carromverse/game-engine

CarromVerse Physics and Rendering Engine powered by Matter.js and Phaser 3.

## Modules
- `board/`: Board configuration, surface geometry, and baselines
- `physics/`: Matter.js substepping physics world, zero-gravity config, collision categories, and contact resolvers
- `renderer/` & `rendering/`: Board rendering, textures, lighting, and shadows
- `scenes/`: Phaser scenes (CarromBoardScene, BootScene, PreloadScene)
- `bridge/`: React Native WebView communication bridge and HTML generator

## Tests
```bash
npm run test
```
