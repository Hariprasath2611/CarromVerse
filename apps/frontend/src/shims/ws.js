// Polyfill/shim for 'ws' in React Native environment
module.exports = typeof WebSocket !== 'undefined' ? WebSocket : (globalThis.WebSocket || null);
