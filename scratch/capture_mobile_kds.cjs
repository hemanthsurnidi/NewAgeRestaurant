const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const out = 'C:\\Users\\heman\\.gemini\\antigravity\\brain\\77db5490-f1e2-49ad-8d02-6dc410e6a52d\\shot_v5_kds_mobile_tickets.png';

execFileSync(chrome, [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--window-size=1440,1400',
  '--virtual-time-budget=2500',
  `--screenshot=${out}`,
  'http://localhost:5000/?nosse=1&device=mobile#kds'
]);

console.log('Result:', fs.existsSync(out));
