const metroResolver = require('metro-resolver');
const path = require('path');
const fs = require('fs');

const fromFile = path.resolve('packages/bot-ai/src/index.ts');
const targetModule = './types/BotTypes.js';

console.log('Resolving from:', fromFile);
console.log('Target module:', targetModule);

// Simulate Metro context
const context = {
  originModulePath: fromFile,
  allowHMR: false,
  customResolverOptions: {},
  dev: true,
  doesFileExist: (filePath) => fs.existsSync(filePath),
  extraNodeModules: null,
  isAssetFile: () => false,
  mainFields: ['react-native', 'browser', 'main'],
  nodeModulesPaths: [
    path.resolve('apps/frontend/node_modules'),
    path.resolve('node_modules'),
  ],
  preferNativePlatform: true,
  resolveAsset: () => null,
  resolveHasteModule: () => null,
  resolveHastePackage: () => null,
  resolveRequest: (ctx, moduleName, platform) => {
    return metroResolver.resolve(ctx, moduleName, platform);
  },
  sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs', 'cjs'],
};

// Test 1: Standard resolve should fail
try {
  const res = metroResolver.resolve(context, targetModule, 'android');
  console.log('Standard resolve succeeded (unexpected):', res);
} catch (e) {
  console.log('Standard resolve failed as expected:', e.message);
}

// Test 2: Custom resolveRequest with fallback
function customResolve(ctx, moduleName, platform) {
  try {
    return metroResolver.resolve(ctx, moduleName, platform);
  } catch (err) {
    if (typeof moduleName === 'string' && moduleName.endsWith('.js')) {
      const stripped = moduleName.slice(0, -3);
      try {
        return metroResolver.resolve(ctx, stripped, platform);
      } catch (_) {
        throw err;
      }
    }
    throw err;
  }
}

try {
  const res = customResolve(context, targetModule, 'android');
  console.log('Custom resolve succeeded!', res);
} catch (e) {
  console.error('Custom resolve failed:', e);
}
