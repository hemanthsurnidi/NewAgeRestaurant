const fs = require('fs');
const content = fs.readFileSync('public/js/app.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('renderCmsView')) {
    console.log(`renderCmsView found at line: ${i + 1}`);
  }
});

