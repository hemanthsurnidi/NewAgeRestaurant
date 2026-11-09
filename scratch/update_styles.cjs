const fs = require('fs');
const path = require('path');

// 1. Update public/css/kds.css
const kdsPath = path.join(__dirname, '../public/css/kds.css');
let kdsCss = fs.readFileSync(kdsPath, 'utf8');

const kdsAdditions = `
/* Balanced KDS Metric Boxes */
.kds-metrics-strip {
  display: flex !important;
  gap: 0.75rem !important;
  align-items: stretch !important;
  width: 100% !important;
}
.kds-metric-box {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  min-height: 58px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  padding: 0.5rem 0.5rem !important;
}
.kds-metric-label {
  white-space: nowrap !important;
}
`;

if (!kdsCss.includes('Balanced KDS Metric Boxes')) {
  kdsCss += kdsAdditions;
  fs.writeFileSync(kdsPath, kdsCss, 'utf8');
  console.log('Updated kds.css with balanced metric boxes');
}

// 2. Update scratch/build_full_styles.cjs
const buildScriptPath = path.join(__dirname, 'build_full_styles.cjs');
let buildScript = fs.readFileSync(buildScriptPath, 'utf8');

const newStylesBlock = `
/* ==========================================================================
   FORM & MODAL ALIGNMENT FIXES (SYMMETRICAL & CRISP)
   ========================================================================== */
.auth-form-group {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.4rem !important;
  width: 100% !important;
  margin-bottom: 0 !important;
}

.auth-form-group label {
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  color: var(--text-main) !important;
  margin-bottom: 0.15rem !important;
}

.auth-form-group input,
.auth-form-group select,
.auth-form-group textarea {
  width: 100% !important;
  box-sizing: border-box !important;
  border-radius: 12px !important;
  border: 1.5px solid var(--border-subtle) !important;
  padding: 0.7rem 0.95rem !important;
  font-size: 0.9rem !important;
  font-family: inherit !important;
  background: #FFFFFF !important;
  color: var(--text-main) !important;
  outline: none !important;
  transition: border-color 0.15s ease, box-shadow 0.15s ease !important;
}

.auth-form-group input:focus,
.auth-form-group select:focus,
.auth-form-group textarea:focus {
  border-color: var(--color-brand) !important;
  box-shadow: 0 0 0 3px rgba(252, 128, 25, 0.15) !important;
}

.auth-form-group textarea {
  resize: vertical !important;
  min-height: 75px !important;
}

#cms-item-modal .modal-card {
  max-width: 600px !important;
  width: 95% !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
}

/* ==========================================================================
   MOBILE SIMULATOR MODALS, DRAWERS & BOTTOM SHEETS (SCOPED TO PHONE FRAME)
   ========================================================================== */
body.device-mode-mobile .modal-backdrop,
body.device-mode-mobile .drawer-backdrop {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 42px !important;
  z-index: 2500 !important;
  padding: 0 !important;
  align-items: flex-end !important;
  justify-content: center !important;
  overflow: hidden !important;
}

body.device-mode-mobile .drawer-panel,
body.device-mode-mobile .cart-drawer-panel,
body.device-mode-mobile .party-drawer-panel {
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  top: auto !important;
  width: 100% !important;
  max-width: 100% !important;
  max-height: 85% !important;
  border-radius: 28px 28px 0 0 !important;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.25) !important;
  transform: translateY(0) !important;
  display: flex !important;
  flex-direction: column !important;
}

body.device-mode-mobile .modal-card {
  position: absolute !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  top: auto !important;
  width: 100% !important;
  max-width: 100% !important;
  max-height: 85% !important;
  border-radius: 28px 28px 0 0 !important;
  margin: 0 !important;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.25) !important;
  overflow-y: auto !important;
}

body.device-mode-mobile .toast-container {
  position: absolute !important;
  top: 4.2rem !important;
  left: 1rem !important;
  right: 1rem !important;
  width: calc(100% - 2rem) !important;
  max-width: calc(100% - 2rem) !important;
  z-index: 3000 !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 0.5rem !important;
  pointer-events: none !important;
}

/* Header & Cart Pill Compactness to Prevent Clipping */
body.device-mode-mobile .btn-cart-nav {
  padding: 0.35rem 0.65rem !important;
  font-size: 0.8rem !important;
  height: 34px !important;
  margin-right: 2px !important;
  flex-shrink: 0 !important;
  white-space: nowrap !important;
}

body.device-mode-mobile .btn-cart-nav .cart-label {
  display: none !important;
}

body.device-mode-mobile .outlet-selector-pill {
  max-width: 145px !important;
  padding: 0.35rem 0.6rem !important;
  font-size: 0.78rem !important;
}

body.device-mode-mobile .brand-title {
  font-size: 0.95rem !important;
}

@media (max-width: 900px) {
  .btn-cart-nav .cart-label {
    display: none !important;
  }
  .btn-cart-nav {
    padding: 0.35rem 0.65rem !important;
    font-size: 0.8rem !important;
    height: 34px !important;
    margin-right: 2px !important;
    flex-shrink: 0 !important;
  }
}

/* Balanced KDS Metric Boxes in Main CSS */
.kds-metrics-strip {
  display: flex !important;
  gap: 0.75rem !important;
  align-items: stretch !important;
  width: 100% !important;
}
.kds-metric-box {
  flex: 1 1 0 !important;
  min-width: 0 !important;
  min-height: 58px !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  justify-content: center !important;
  text-align: center !important;
  padding: 0.5rem 0.5rem !important;
}
.kds-metric-label {
  white-space: nowrap !important;
}
`;

// Insert newStylesBlock right before `fs.writeFileSync` in buildScript
const writeFileSyncMarker = "fs.writeFileSync(path.join(__dirname, '../public/css/style.css'), css, 'utf8');";

if (!buildScript.includes('MOBILE SIMULATOR MODALS, DRAWERS & BOTTOM SHEETS')) {
  buildScript = buildScript.replace(writeFileSyncMarker, newStylesBlock + '\n\n' + writeFileSyncMarker);
  fs.writeFileSync(buildScriptPath, buildScript, 'utf8');
  console.log('Updated build_full_styles.cjs with mobile simulator drawer scoping and symmetrical form alignment');
}

// Now run the build script to generate public/css/style.css
require('./build_full_styles.cjs');

