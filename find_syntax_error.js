const { generateCarromPhaserHtml } = require('./packages/game-engine/dist/bridge/phaserHtmlGenerator.js');
const html = generateCarromPhaserHtml();
const lines = html.split('\n');

for (let i = 1490; i <= 1530; i++) {
  console.log(`${i}: ${lines[i - 1]}`);
}
