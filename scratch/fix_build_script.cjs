const fs = require('fs');
const path = require('path');

const buildScriptPath = path.join(__dirname, 'build_full_styles.cjs');
let code = fs.readFileSync(buildScriptPath, 'utf8');

// Target the erroneous placement
const badMarker = '`;\n\n\n/* ==========================================================================\n   FORM & MODAL ALIGNMENT FIXES (SYMMETRICAL & CRISP)';
if (code.includes(badMarker)) {
  const parts = code.split('`;');
  // parts[0] is everything before `;\n\n\n/* ...
  // In parts[1], we have the new styles followed by fs.writeFileSync
  const writeMarker = "fs.writeFileSync(path.join(__dirname, '../public/css/style.css'), css, 'utf8');";
  const subParts = parts[1].split(writeMarker);
  const newStyles = subParts[0].trim();
  
  // Clean assembly: parts[0] + '\n\n' + newStyles + '\n`;\n\n' + writeMarker + subParts[1];
  code = parts[0] + '\n\n' + newStyles + '\n`;\n\n' + writeMarker + subParts[1];
  fs.writeFileSync(buildScriptPath, code, 'utf8');
  console.log('Successfully fixed build_full_styles.cjs syntax!');
} else {
  console.log('Bad marker not found, checking...');
}

