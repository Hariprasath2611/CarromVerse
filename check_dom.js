const { execSync } = require('child_process');
const fs = require('fs');

try {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const htmlPath = 'd:\\work\\CarromVerse\\test_board.html';
  const outImg = 'd:\\work\\CarromVerse\\chrome_screen.png';
  const cmd = `"${chromePath}" --headless=new --no-sandbox --disable-gpu --window-size=500,500 --virtual-time-budget=3000 --screenshot="${outImg}" "file:///${htmlPath.replace(/\\/g, '/')}"`;
  execSync(cmd);
  if (fs.existsSync(outImg)) {
    console.log('Screenshot created successfully, size:', fs.statSync(outImg).size);
  } else {
    console.log('Screenshot file not found');
  }
} catch (e) {
  console.error('Error running Chrome:', e.message);
}
