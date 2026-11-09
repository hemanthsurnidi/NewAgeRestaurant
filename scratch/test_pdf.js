import { execSync } from 'node:child_process';
import fs from 'node:fs';

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const htmlPath = 'C:\\Users\\heman\\.gemini\\antigravity\\scratch\\nizami-biryani\\scratch\\test_doc.html';
const pdfPath = 'C:\\Users\\heman\\.gemini\\antigravity\\scratch\\nizami-biryani\\scratch\\test_doc.pdf';

const cmd = `"${chrome}" --headless=new --no-sandbox --disable-gpu --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;
execSync(cmd, { stdio: 'inherit' });

console.log('PDF generated! Size:', fs.statSync(pdfPath).size);

