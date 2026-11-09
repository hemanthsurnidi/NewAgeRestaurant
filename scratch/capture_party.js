const { execSync } = require('child_process');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outPath = 'C:\\Users\\heman\\.gemini\\antigravity\\brain\\77db5490-f1e2-49ad-8d02-6dc410e6a52d\\shot_v13_customer_party.png';
const url = 'http://localhost:5000/?nosse=1&role=customer#party';
execSync(`"${chrome}" --headless=new --no-sandbox --disable-gpu --window-size=1440,950 --virtual-time-budget=3000 --screenshot="${outPath}" "${url}"`);
console.log('Done!');

