const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Ensure metro resolves .ts and .tsx from symlinked local packages
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// 4. Resolve .js imports pointing to .ts files in TypeScript monorepo packages, and redirect node-only modules for React Native
const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'ws') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(projectRoot, 'src/shims/ws.js'),
    };
  }
  if (moduleName === 'httpie') {
    return (defaultResolve || context.resolveRequest)(context, 'httpie/xhr', platform);
  }
  try {
    return (defaultResolve || context.resolveRequest)(context, moduleName, platform);
  } catch (err) {
    if (typeof moduleName === 'string' && moduleName.startsWith('.') && moduleName.endsWith('.js')) {
      const stripped = moduleName.slice(0, -3);
      try {
        return (defaultResolve || context.resolveRequest)(context, stripped, platform);
      } catch (_) {
        throw err;
      }
    }
    throw err;
  }
};

// 5. Enable wasm support for expo-sqlite on web
config.resolver.assetExts = [...config.resolver.assetExts, 'wasm'];

module.exports = config;

