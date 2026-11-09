const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../public/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Target anchor: the closing tag of #app-root-wrapper
const appWrapperCloseStr = '  </div> <!-- /#app-root-wrapper -->';
const authModalStartStr = '  <!-- AUTHENTICATION & LOGIN MODAL -->';
const mainScriptStartStr = '  <!-- MAIN SCRIPT -->';

const idxCloseWrapper = html.indexOf(appWrapperCloseStr);
const idxAuthModal = html.indexOf(authModalStartStr);
const idxMainScript = html.indexOf(mainScriptStartStr);

if (idxCloseWrapper === -1 || idxAuthModal === -1 || idxMainScript === -1) {
  console.error('Could not find markers in index.html:', { idxCloseWrapper, idxAuthModal, idxMainScript });
  process.exit(1);
}

// Slice out the modals block (from idxAuthModal to idxMainScript)
const modalsBlock = html.substring(idxAuthModal, idxMainScript);

// Remove modalsBlock from its current location
html = html.substring(0, idxAuthModal) + html.substring(idxMainScript);

// Now re-find idxCloseWrapper in modified html
const newIdxCloseWrapper = html.indexOf(appWrapperCloseStr);

// Insert modalsBlock right before appWrapperCloseStr
html = html.substring(0, newIdxCloseWrapper) + '\n' + modalsBlock + '\n' + html.substring(newIdxCloseWrapper);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully moved application modals and drawers inside #app-root-wrapper in public/index.html!');

