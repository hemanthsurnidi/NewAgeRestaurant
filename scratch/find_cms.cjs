const fs = require('fs');
const path = require('path');
const target = path.join(__dirname, '..', 'public', 'js', 'app.js');
const content = fs.readFileSync(target, 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('renderCmsView')) {
    console.log(`renderCmsView found at line: ${i + 1}`);
  }
});

