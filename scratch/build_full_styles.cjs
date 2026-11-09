const fs = require('fs');
const path = require('path');

const css = `/* ==========================================================================
   DUM & CO. — ROYAL HYDERABAD BIRYANI & DIRECT ORDERING PLATFORM
   Swiggy & Zomato Modern Commercial Design Standard (2026 Production Grade)
   Ultra-clean, crisp contrast, vibrant appetizing food accents, rock-solid layout
   ========================================================================== */

:root {
  /* Food App Design Tokens (Swiggy / Zomato Standard) */
  --color-brand: #FC8019;           /* Vibrant Food Orange */
  --color-brand-hover: #E56F0D;
  --color-brand-light: #FFF2E6;
  --color-brand-subtle: #FFF9F5;

  --color-primary: #FC8019;
  --color-secondary: #FFFFFF;
  --color-accent: #FC8019;
  --color-highlight: #F59E0B;

  --bg-app: #F8F9FA;                /* Clean modern light gray canvas */
  --bg-card: #FFFFFF;               /* Crisp pure white card */
  --bg-surface: #F1F2F4;            /* Cool subtle gray surface */
  --bg-surface-hover: #E8EAED;
  --bg-subtle: #FFFFFF;

  --text-main: #1C1C28;             /* Deep Charcoal headline standard */
  --text-secondary: #686B78;        /* Clean Muted Grey subtext */
  --text-muted: #93959F;
  --text-dim: #B4B6BC;

  --accent-gold: #FC8019;
  --accent-gold-hover: #E56F0D;
  --accent-gold-light: #FFF2E6;

  --accent-emerald: #1BA672;        /* Pure Veg Crisp Emerald Green */
  --accent-emerald-hover: #15885C;
  --accent-emerald-light: #E8F7F0;
  --accent-emerald-subtle: #F2FAF5;

  --accent-rose: #E43B3B;           /* Non-Veg Crisp Crimson */
  --accent-rose-light: #FDECEC;

  --border-subtle: #E8E8ED;         /* Hairline clean border */
  --border-strong: #D4D5D9;
  --border-focus: #FC8019;

  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Modern Crisp Elevation Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.09);
  --shadow-xl: 0 16px 36px rgba(0, 0, 0, 0.12);
  --shadow-brand: 0 4px 16px rgba(252, 128, 25, 0.25);
  --shadow-add-btn: 0 2px 8px rgba(0, 0, 0, 0.12);

  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

/* ==========================================================================
   RESET & BASE TYPOGRAPHY
   ========================================================================== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans);
  background-color: var(--bg-app);
  color: var(--text-main);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-sans);
  font-weight: 700;
  color: var(--text-main);
  letter-spacing: -0.02em;
  line-height: 1.25;
}

p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

button {
  font-family: var(--font-sans);
  cursor: pointer;
  border: none;
  outline: none;
  background: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

input, textarea, select {
  font-family: var(--font-sans);
  color: var(--text-main);
  background-color: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.95rem;
  font-size: 0.92rem;
  transition: all 0.2s ease;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(252, 128, 25, 0.15);
}

/* ==========================================================================
   PERSISTENT TOP REVIEWER & BRAND BAR (ALWAYS OUTSIDE AT TOP-RIGHT)
   ========================================================================== */
.top-announcement-bar {
  background: #0F172A;
  color: #F8FAFC;
  padding: 0 1.5rem;
  height: 42px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #1E293B;
  position: relative;
  z-index: 60;
  font-size: 0.82rem;
}

.announcement-inner {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  gap: 1rem;
}

.announcement-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #F8FAFC;
  font-size: 0.8rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.live-dot {
  width: 8px;
  height: 8px;
  background-color: var(--accent-emerald);
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 6px var(--accent-emerald);
  animation: pulseDot 2s infinite;
}

@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.brand-strip-tag {
  color: #FC8019;
  font-weight: 800;
}

.strip-divider {
  color: #334155;
}

.strip-benefit {
  color: #94A3B8;
  font-weight: 500;
}

/* Reviewer Controls Outside Top Right (Strictly 1 Row, Zero Wrapping) */
.top-reviewer-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: nowrap;
  white-space: nowrap;
  flex-shrink: 0;
}

.top-device-switcher {
  display: inline-flex;
  align-items: center;
  background: #1E293B;
  border: 1px solid #334155;
  padding: 2px;
  border-radius: 6px;
}

.top-device-btn {
  padding: 0.25rem 0.65rem;
  font-size: 0.76rem;
  font-weight: 700;
  color: #94A3B8;
  background: transparent;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  line-height: 1.2;
}

.top-device-btn:hover {
  color: #FFFFFF;
}

.top-device-btn.active {
  background: #FC8019;
  color: #FFFFFF;
}

.top-role-wrap {
  display: inline-flex;
  align-items: center;
}

.top-role-dropdown {
  background: #1E293B;
  border: 1px solid #334155;
  color: #FFFFFF;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  cursor: pointer;
  height: 28px;
  outline: none;
}

.top-role-dropdown:focus {
  border-color: #FC8019;
}

.top-quick-btn {
  background: #1E293B;
  border: 1px solid #334155;
  color: #CBD5E1;
  padding: 0.25rem 0.65rem;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 700;
  height: 28px;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.top-quick-btn:hover {
  background: #334155;
  color: #FFFFFF;
  border-color: #475569;
}

/* ==========================================================================
   MAIN HEADER NAVIGATION (ROCK SOLID, FIXED & MODERN)
   ========================================================================== */
.header-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #FFFFFF;
  border-bottom: 1px solid var(--border-subtle);
  padding: 0.75rem 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
}

/* Brand Wrap */
.brand-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  cursor: pointer;
  flex-shrink: 0;
}

.brand-crest {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #FC8019 0%, #E56F0D 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 4px 12px rgba(252, 128, 25, 0.35);
  flex-shrink: 0;
}

.brand-info {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.brand-subtitle {
  font-size: 0.74rem;
  color: var(--color-brand);
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* Outlet Selector Pill — Fixed width, rigid, never squishes or moves */
.outlet-selector-pill {
  width: 230px;
  min-width: 230px;
  max-width: 230px;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background-color: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 0.45rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: var(--shadow-xs);
  text-align: left;
}

.outlet-selector-pill:hover {
  border-color: var(--color-brand);
  box-shadow: 0 4px 12px rgba(252, 128, 25, 0.15);
}

.pulse-ring {
  font-size: 1.15rem;
  flex-shrink: 0;
}

.outlet-pill-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.outlet-pill-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
}

.outlet-pill-title-row strong {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-icon {
  font-size: 0.8rem;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.outlet-fssai {
  font-size: 0.72rem;
  color: var(--text-secondary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Location Dropdown Wrapper */
.nav-location-dropdown-wrap {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

/* Outlet Dropdown Menu (Anchored below pill on Desktop) */
.outlet-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 360px;
  max-height: 480px;
  background: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.16);
  z-index: 2000;
  display: none;
  flex-direction: column;
  overflow: hidden;
  animation: dropdownFadeIn 0.18s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dropdownFadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.outlet-dropdown-header {
  padding: 1rem 1.15rem 0.85rem 1.15rem;
  background: #FFFFFF;
  border-bottom: 1.5px solid var(--border-subtle);
  flex-shrink: 0;
}

.outlet-dropdown-top-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
}

.outlet-dropdown-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
  padding: 0.2rem;
}

.outlet-dropdown-close:hover {
  color: var(--text-main);
}

.outlet-dropdown-search-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: 10px;
  padding: 0.45rem 0.75rem;
}

.outlet-dropdown-search-wrap input {
  border: none;
  background: transparent;
  outline: none;
  width: 100%;
  font-size: 0.85rem;
  color: var(--text-main);
}

.outlet-dropdown-autodetect-btn {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.6rem 0.85rem;
  margin-top: 0.6rem;
  background: var(--accent-emerald-light);
  border: 1.5px solid var(--accent-emerald);
  border-radius: 10px;
  color: var(--color-brand);
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s ease;
}

.outlet-dropdown-autodetect-btn:hover {
  background: #E2EFE9;
  transform: translateY(-1px);
}

.outlet-modal-autodetect-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.85rem 1.15rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #174B3A 0%, #1f634d 100%);
  border: none;
  border-radius: 14px;
  color: #FFFFFF;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(23, 75, 58, 0.22);
  transition: all 0.18s ease;
}

.outlet-modal-autodetect-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(23, 75, 58, 0.32);
}

.autodetect-hero-content {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.autodetect-hero-icon {
  font-size: 1.35rem;
  background: rgba(255, 255, 255, 0.2);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.autodetect-hero-title {
  font-weight: 800;
  font-size: 0.98rem;
  line-height: 1.2;
}

.autodetect-hero-sub {
  font-size: 0.78rem;
  color: #E8E5DC;
  margin-top: 2px;
}

.autodetect-hero-btn-pill {
  font-weight: 800;
  font-size: 0.82rem;
  background: #FFFFFF;
  color: #174B3A;
  padding: 0.45rem 0.95rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.outlet-dropdown-list {
  padding: 0.5rem;
  overflow-y: auto;
  max-height: 380px;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.outlet-dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.85rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}

.outlet-dropdown-item:hover {
  background: var(--bg-surface);
  border-color: var(--border-subtle);
}

.outlet-dropdown-item.selected {
  background: var(--accent-gold-subtle);
  border-color: var(--accent-gold);
}

.outlet-dropdown-item-left {
  flex: 1;
  min-width: 0;
}

.outlet-item-name-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.outlet-item-name {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.outlet-badge-selected {
  background: var(--color-brand);
  color: #FFFFFF;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
}

.outlet-badge-cloud {
  background: rgba(59, 130, 246, 0.12);
  color: #2563EB;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
}

.outlet-item-address {
  font-size: 0.76rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.outlet-item-meta {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  font-size: 0.7rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  font-weight: 600;
}

.outlet-item-check {
  font-size: 1rem;
  color: var(--color-brand);
  font-weight: 800;
}

.outlet-item-arrow {
  font-size: 0.82rem;
  color: var(--text-muted);
  transition: transform 0.15s ease;
}

.outlet-dropdown-item:hover .outlet-item-arrow {
  color: var(--color-brand);
  transform: translateX(3px);
}

/* Nav Right Cluster */
.nav-right-cluster {
  display: flex;
  align-items: center;
  gap: 1.15rem;
}

/* Segmented Navigation Links */
.customer-nav-links {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background-color: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  padding: 0.3rem;
  border-radius: var(--radius-full);
}

.cust-nav-link {
  color: var(--text-secondary);
  font-weight: 700;
  font-size: 0.86rem;
  padding: 0.45rem 1rem;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  background: transparent;
  white-space: nowrap;
}

.cust-nav-link:hover {
  color: var(--color-brand);
  background-color: rgba(255, 255, 255, 0.85);
}

.cust-nav-link.active {
  color: #FFFFFF !important;
  background-color: var(--color-brand) !important;
  box-shadow: 0 2px 8px rgba(252, 128, 25, 0.35) !important;
}

.nav-link-icon {
  font-size: 0.95rem;
}

/* Nav Action Buttons */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.btn-auth-nav {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background-color: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  color: var(--text-main);
  padding: 0.48rem 1rem;
  border-radius: var(--radius-full);
  font-size: 0.86rem;
  font-weight: 700;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s ease;
}

.btn-auth-nav:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.btn-cart-nav {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-brand);
  color: #FFFFFF;
  padding: 0.5rem 1.15rem;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: 800;
  box-shadow: var(--shadow-brand);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-cart-nav:hover {
  background: var(--color-brand-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(252, 128, 25, 0.4);
}

.cart-icon-wrap {
  font-size: 1.05rem;
}

.cart-badge-count {
  background: #FFFFFF;
  color: var(--color-brand);
  font-size: 0.76rem;
  font-weight: 800;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: var(--radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ==========================================================================
   APP SCROLL BODY & MAIN CONTENT
   ========================================================================== */
.app-scroll-body {
  flex: 1;
  width: 100%;
}

.main-content {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 1.75rem 1.5rem 4rem 1.5rem;
}

.mobile-bottom-dock {
  display: none;
}

/* ==========================================================================
   1. HERO / COMPANY PROMOTIONAL BANNER
   ========================================================================== */
.company-promo-banner {
  background: linear-gradient(135deg, #FFF6EE 0%, #FFFFFF 65%);
  border: 1.5px solid #FFE4D0;
  border-radius: var(--radius-xl);
  padding: 2.25rem 2.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(252, 128, 25, 0.08);
  position: relative;
  overflow: hidden;
}

.promo-banner-inner {
  display: grid;
  grid-template-columns: 1.25fr 0.95fr;
  gap: 2.5rem;
  align-items: center;
}

.promo-kicker-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #FFEBD9;
  color: #C04B00;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  margin-bottom: 0.95rem;
}

.live-dot-gold {
  width: 8px;
  height: 8px;
  background-color: var(--color-brand);
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 6px var(--color-brand);
}

.promo-heading {
  font-size: 2.35rem;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-main);
  letter-spacing: -0.03em;
  margin-bottom: 1rem;
}

.highlight-copper {
  color: var(--color-brand);
  background: linear-gradient(120deg, #FC8019 0%, #D65A00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.promo-story-text {
  font-size: 0.98rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.promo-cta-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.btn-promo-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-brand);
  color: #FFFFFF;
  padding: 0.8rem 1.6rem;
  border-radius: var(--radius-md);
  font-size: 0.96rem;
  font-weight: 800;
  box-shadow: var(--shadow-brand);
  transition: all 0.2s ease;
}

.btn-promo-primary:hover {
  background: var(--color-brand-hover);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(252, 128, 25, 0.4);
}

.btn-promo-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #FFFFFF;
  color: var(--text-main);
  border: 1.5px solid var(--border-subtle);
  padding: 0.8rem 1.4rem;
  border-radius: var(--radius-md);
  font-size: 0.94rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.btn-promo-secondary:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.promo-trust-strip {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding-top: 1rem;
  border-top: 1px dashed #FFE4D0;
}

.trust-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.trust-ico {
  font-size: 0.95rem;
}

/* Banner Right Media */
.promo-banner-right {
  position: relative;
}

.promo-img-wrapper {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
}

.promo-featured-img {
  width: 100%;
  height: 290px;
  object-fit: cover;
  display: block;
}

.promo-handi-pill {
  position: absolute;
  top: 14px;
  left: 14px;
  background: rgba(28, 28, 40, 0.88);
  backdrop-filter: blur(8px);
  color: #FFFFFF;
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.promo-rating-card {
  position: absolute;
  bottom: 14px;
  right: 14px;
  left: 14px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.promo-stars {
  color: #FC8019;
  font-size: 0.82rem;
  font-weight: 800;
  margin-bottom: 0.2rem;
}

.promo-quote {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
}

.promo-stats {
  font-size: 0.74rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

/* ==========================================================================
   2. PROMINENT FOOD SEARCH BAR & VEG MODE
   ========================================================================== */
.prominent-search-section {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  margin-bottom: 2.25rem;
  box-shadow: var(--shadow-sm);
}

.search-top-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.prominent-search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-magnifier {
  position: absolute;
  left: 1rem;
  font-size: 1.15rem;
  color: var(--text-muted);
  pointer-events: none;
}

.prominent-search-input {
  width: 100%;
  padding: 0.9rem 2.8rem 0.9rem 2.9rem;
  background-color: var(--bg-surface);
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  font-size: 0.98rem;
  color: var(--text-main);
  transition: all 0.2s ease;
}

.prominent-search-input:focus {
  background-color: #FFFFFF;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(252, 128, 25, 0.12);
}

.search-clear-cross {
  position: absolute;
  right: 1rem;
  font-size: 1.3rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.2rem;
  line-height: 1;
}

.search-clear-cross:hover {
  color: var(--text-main);
}

/* Veg Mode Toggle Switch (Swiggy Signature) */
.veg-mode-toggle-wrap {
  cursor: pointer;
  user-select: none;
}

.veg-mode-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  background-color: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  padding: 0.65rem 1rem;
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
}

.veg-mode-pill.active {
  border-color: var(--accent-emerald);
  background-color: var(--accent-emerald-light);
}

.diet-dot-green {
  width: 10px;
  height: 10px;
  background-color: var(--accent-emerald);
  border-radius: 50%;
}

.veg-mode-label {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-main);
}

.toggle-switch-track {
  width: 38px;
  height: 22px;
  background-color: #D1D5DB;
  border-radius: var(--radius-full);
  padding: 2px;
  transition: all 0.25s ease;
  position: relative;
}

.toggle-switch-track.on {
  background-color: var(--accent-emerald);
}

.toggle-switch-thumb {
  width: 18px;
  height: 18px;
  background-color: #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.toggle-switch-track.on .toggle-switch-thumb {
  transform: translateX(16px);
}

/* Suggestions Row */
.search-suggestions-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 0.85rem;
  border-top: 1px solid #F0F1F3;
  flex-wrap: wrap;
}

.suggestions-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
}

.suggestions-chips-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.search-suggest-chip {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: var(--text-main);
  padding: 0.35rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.15s ease;
}

.search-suggest-chip:hover {
  background: #FFFFFF;
  border-color: var(--color-brand);
  color: var(--color-brand);
}

/* ==========================================================================
   3. "BASED ON YOUR LAST ORDER" & 4. "FAMOUS DISHES"
   ========================================================================== */
.recommendations-section,
.famous-dishes-section {
  margin-bottom: 2.75rem;
}

.section-title-strip {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.35rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.section-tag-gold {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--color-brand);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
}

.section-main-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
}

.section-sub-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.opt-in-guarantee-pill,
.famous-guarantee-pill {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-full);
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--text-secondary);
}

/* Recommendations Grid (3 Cards) */
.recommendations-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.rec-dish-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s ease;
}

.rec-dish-card:hover {
  box-shadow: var(--shadow-md);
  border-color: #D4D5D9;
  transform: translateY(-2px);
}

.rec-card-media {
  position: relative;
  width: 90px;
  height: 90px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.rec-dish-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.rec-diet-badge {
  position: absolute;
  top: 6px;
  left: 6px;
}

.rec-card-body {
  flex: 1;
  min-width: 0;
}

.rec-header-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.rec-dish-title {
  font-size: 0.96rem;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rec-dish-price {
  font-size: 0.98rem;
  font-weight: 800;
  color: var(--text-main);
}

.rec-dish-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.65rem;
}

.rec-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.rec-confidence-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-brand);
}

.btn-rec-add,
.btn-famous-add {
  background: #FFFFFF;
  color: var(--accent-emerald);
  border: 1.5px solid var(--accent-emerald);
  padding: 0.35rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.82rem;
  font-weight: 800;
  box-shadow: var(--shadow-xs);
  transition: all 0.15s ease;
}

.btn-rec-add:hover,
.btn-famous-add:hover {
  background: var(--accent-emerald);
  color: #FFFFFF;
}

/* Famous Dishes Grid (4 Cards) */
.famous-dishes-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.famous-dish-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-xs);
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}

.famous-dish-card:hover {
  box-shadow: var(--shadow-md);
  border-color: #D4D5D9;
  transform: translateY(-3px);
}

.famous-card-media {
  position: relative;
  height: 160px;
  background-color: #E2E8F0;
  overflow: hidden;
}

.famous-dish-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.famous-dish-card:hover .famous-dish-img {
  transform: scale(1.05);
}

.famous-crown-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #FFFFFF;
  color: #B45309;
  font-size: 0.74rem;
  font-weight: 800;
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.famous-badges-top-right {
  position: absolute;
  top: 10px;
  right: 10px;
}

.famous-prep-badge {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(28, 28, 40, 0.85);
  color: #FFFFFF;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full);
}

.famous-card-body {
  padding: 1.15rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.famous-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.famous-dish-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.25;
}

.famous-spice-pill {
  font-size: 0.72rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.famous-price-wrap {
  text-align: right;
  flex-shrink: 0;
}

.famous-dish-price {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-main);
  display: block;
}

.famous-gst-sub {
  font-size: 0.68rem;
  color: var(--text-muted);
}

.famous-dish-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 1rem;
  flex: 1;
}

.famous-footer-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border-subtle);
}

.famous-authentic-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-brand);
}

/* ==========================================================================
   5. FILTER, SORT AND CATEGORY CONTROLS
   ========================================================================== */
.filter-sort-controls-section {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-xs);
}

.controls-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
  margin-bottom: 1.15rem;
}

.food-type-segmented {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  padding: 0.3rem;
  border-radius: var(--radius-full);
}

.type-segment-btn {
  padding: 0.45rem 1.1rem;
  border-radius: var(--radius-full);
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  background: transparent;
}

.type-segment-btn.active {
  background: #FFFFFF;
  color: var(--text-main);
  box-shadow: var(--shadow-sm);
}

.controls-filter-dropdowns {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.filter-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.select-prefix-ico {
  position: absolute;
  left: 0.75rem;
  font-size: 0.9rem;
  pointer-events: none;
}

.control-select {
  padding: 0.5rem 1.75rem 0.5rem 2.2rem;
  font-size: 0.86rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2210%22%20height%3D%226%22%20viewBox%3D%220%200%2010%206%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1%201l4%204%204-4%22%20stroke%3D%22%23686B78%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  cursor: pointer;
}

.instock-filter-label {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-main);
  cursor: pointer;
  user-select: none;
  background: var(--bg-surface);
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
}

.instock-checkbox {
  accent-color: var(--color-brand);
  cursor: pointer;
}

/* Category Chips Scroll */
.categories-chips-scroll {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  scrollbar-width: none;
}

.categories-chips-scroll::-webkit-scrollbar {
  display: none;
}

.cat-chip-btn {
  padding: 0.45rem 1.05rem;
  border-radius: var(--radius-full);
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  white-space: nowrap;
  transition: all 0.15s ease;
}

.cat-chip-btn:hover {
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.cat-chip-btn.active {
  background: var(--color-brand);
  color: #FFFFFF;
  border-color: var(--color-brand);
  box-shadow: 0 2px 8px rgba(252, 128, 25, 0.35);
}

/* ==========================================================================
   6. SWIGGY SIGNATURE 2-COLUMN DISH CARDS
   ========================================================================== */
.complete-dishes-section {
  margin-bottom: 3.5rem;
}

.dishes-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.dishes-count-heading {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-main);
}

.dishes-count-badge {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 1.15rem;
}

.reset-filters-btn {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-full);
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent-rose);
  transition: all 0.15s ease;
}

.reset-filters-btn:hover {
  background: var(--accent-rose-light);
  border-color: var(--accent-rose);
}

/* Grid: 2 Columns on Desktop, 1 Column on Mobile */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

/* Swiggy 2-Column Card */
.swiggy-dish-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.35rem;
  display: flex;
  justify-content: space-between;
  gap: 1.35rem;
  box-shadow: var(--shadow-xs);
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
}

.swiggy-dish-card:hover {
  border-color: #D4D5D9;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.swiggy-dish-card.out-of-stock {
  opacity: 0.65;
}

/* Left Column: Dish Info (Flex 1) */
.swiggy-dish-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.swiggy-dish-badges {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.45rem;
}

/* FSSAI Veg / Non-Veg Marks */
.diet-badge {
  width: 17px;
  height: 17px;
  background-color: #FFFFFF;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.diet-badge.veg {
  border: 1.5px solid var(--accent-emerald);
}

.diet-badge.non-veg {
  border: 1.5px solid var(--accent-rose);
}

.diet-mark.veg-dot {
  width: 8px;
  height: 8px;
  background-color: var(--accent-emerald);
  border-radius: 50%;
}

.diet-mark.non-veg-triangle {
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 8px solid var(--accent-rose);
}

.swiggy-bestseller-badge {
  background: #FFF7ED;
  color: #B45309;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-xs);
  border: 1px solid #FFEDD5;
}

.swiggy-spice-tag {
  font-size: 0.72rem;
  color: var(--text-secondary);
}

.swiggy-dish-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.25;
  margin-bottom: 0.35rem;
}

.swiggy-price-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.swiggy-dish-price {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
}

.swiggy-gst-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.swiggy-dish-desc {
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.85rem;
  flex: 1;
}

.swiggy-dish-meta {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.swiggy-prep-pill {
  background: var(--bg-surface);
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-full);
  font-weight: 600;
}

.swiggy-portion-pill {
  color: var(--color-brand);
  font-weight: 700;
}

/* Right Column: 120x120 Image with Overlapping ADD / Stepper */
.swiggy-dish-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.swiggy-img-wrap {
  position: relative;
  width: 124px;
  height: 124px;
  border-radius: var(--radius-md);
  overflow: visible;
}

.swiggy-dish-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.swiggy-action-container {
  position: absolute;
  bottom: -14px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  z-index: 5;
}

/* Swiggy White Signature ADD Button */
.swiggy-add-btn {
  width: 100%;
  height: 36px;
  background: #FFFFFF;
  color: var(--accent-emerald);
  border: 1px solid #D4D5D9;
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  box-shadow: var(--shadow-add-btn);
  transition: all 0.15s ease;
  user-select: none;
}

.swiggy-add-btn:hover {
  background-color: #F8FAF9;
  border-color: var(--accent-emerald);
  transform: scale(1.03);
}

.swiggy-add-plus {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
}

/* Stepper (- 1 +) */
.swiggy-stepper {
  width: 100%;
  height: 36px;
  background: #FFFFFF;
  border: 1px solid var(--accent-emerald);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-add-btn);
  overflow: hidden;
}

.swiggy-stepper-btn {
  width: 32px;
  height: 100%;
  background: transparent;
  color: var(--accent-emerald);
  font-size: 1.15rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.swiggy-stepper-btn:hover {
  background: var(--accent-emerald-light);
}

.swiggy-stepper-qty {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--accent-emerald);
}

.swiggy-sold-out-pill {
  width: 100%;
  height: 32px;
  background: #E2E8F0;
  color: #64748B;
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  letter-spacing: 0.04em;
}

.swiggy-bottom-custom-hint {
  font-size: 0.68rem;
  color: var(--text-muted);
  margin-top: 18px;
  text-align: center;
}

/* Quantity Stepper Compact Box */
.qty-stepper-box {
  display: inline-flex;
  align-items: center;
  background: #FFFFFF;
  border: 1.5px solid var(--accent-emerald);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-xs);
  overflow: hidden;
}

.qty-step-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-emerald);
  font-weight: 800;
  font-size: 1rem;
  transition: background 0.15s ease;
}

.qty-step-btn:hover {
  background: var(--accent-emerald-light);
}

.qty-step-val {
  padding: 0 0.5rem;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--accent-emerald);
}

/* Empty State */
.menu-empty-state {
  grid-column: 1 / -1;
  text-align: center;
  background: #FFFFFF;
  border: 1.5px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 3.5rem 2rem;
}

/* ==========================================================================
   7. DIRECT BENEFITS & RICH BRAND FOOTER
   ========================================================================== */
.direct-benefits-section {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 3rem 2.5rem;
  margin-bottom: 3.5rem;
  box-shadow: var(--shadow-xs);
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.75rem;
}

.benefit-card {
  text-align: left;
}

.benefit-icon {
  font-size: 2rem;
  margin-bottom: 0.85rem;
}

.benefit-card h3 {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0.5rem;
}

.benefit-card p {
  font-size: 0.86rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

/* Brand Footer */
.brand-footer {
  background: #111827;
  color: #E5E7EB;
  padding: 3.5rem 1.5rem 2rem 1.5rem;
  margin-top: auto;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.3fr 1.4fr 1.3fr;
  gap: 2.5rem;
  padding-bottom: 2.5rem;
  border-bottom: 1px solid #1F2937;
}

.footer-brand-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.footer-desc {
  color: #9CA3AF;
  font-size: 0.86rem;
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

.footer-compliance-row {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
}

.fssai-pill, .dpdp-pill {
  background: #1F2937;
  color: #D1D5DB;
  font-size: 0.74rem;
  padding: 0.3rem 0.65rem;
  border-radius: var(--radius-full);
}

.footer-col-outlets h4,
.footer-col-support h4 {
  font-size: 1.05rem;
  color: #FFFFFF;
  margin-bottom: 1rem;
  font-weight: 800;
}

.outlets-tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.outlets-tags-list span {
  background: #1F2937;
  color: #D1D5DB;
  font-size: 0.76rem;
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-xs);
}

.footer-bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1.5rem;
  font-size: 0.8rem;
  color: #6B7280;
  flex-wrap: wrap;
  gap: 1rem;
}

/* ==========================================================================
   MODALS & DRAWERS (CART, AUTH, OUTLET, PAYMENT, DISH CUSTOMIZATION)
   ========================================================================== */
.modal-backdrop,
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(6px);
  z-index: 2500;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.modal-backdrop.open,
.drawer-backdrop.open {
  display: flex;
  opacity: 1;
}

.modal-card {
  background: #FFFFFF;
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  transform: translateY(20px);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.sheet-drag-handle {
  width: 44px;
  height: 5px;
  background: #CBD5E1;
  border-radius: 999px;
  margin: 10px auto 4px auto;
  display: none;
  flex-shrink: 0;
}

.modal-backdrop.open .modal-card {
  transform: translateY(0);
}

.modal-header {
  padding: 1.35rem 1.6rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
}

.modal-subtitle {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.modal-close-btn,
.drawer-close-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.modal-close-btn:hover,
.drawer-close-btn:hover {
  background: #E2E8F0;
  color: var(--text-main);
}

.modal-body {
  padding: 1.6rem;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  padding: 1.25rem 1.6rem;
  border-top: 1px solid var(--border-subtle);
  background: #F9FAFB;
  border-radius: 0 0 var(--radius-xl) var(--radius-xl);
}

/* ==========================================================================
   AUTHENTICATION MODAL STYLING (CLEAN SWIGGY/ZOMATO STANDARD)
   ========================================================================== */
.auth-tab-group {
  display: flex;
  background: #F1F5F9;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 1.25rem;
  gap: 4px;
}

.auth-tab-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #64748B;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.auth-tab-btn:hover {
  color: #0F172A;
}

.auth-tab-btn.active {
  background: #FFFFFF;
  color: #FC8019;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.demo-account-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.demo-account-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  background: #FFFFFF;
  border: 1.5px solid #E2E8F0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.demo-account-card:hover {
  border-color: #FC8019;
  background: #FFF9F5;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(252, 128, 25, 0.12);
}

.demo-account-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.demo-account-name-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.demo-account-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0F172A;
}

.demo-account-sub {
  font-size: 0.78rem;
  color: #64748B;
}

.demo-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  letter-spacing: 0.02em;
}

.demo-badge-customer {
  background: #E0F2FE;
  color: #0369A1;
}

.demo-badge-kitchen {
  background: #FEF3C7;
  color: #B45309;
}

.demo-badge-admin {
  background: #F3E8FF;
  color: #7E22CE;
}

.demo-login-btn {
  padding: 0.4rem 0.85rem;
  background: #FC8019;
  color: #FFFFFF;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.demo-account-card:hover .demo-login-btn {
  background: #E56F0D;
}

/* Active Live Order Tracking Banner */
.active-live-order-banner {
  background: linear-gradient(90deg, #1E293B 0%, #0F172A 100%);
  border: 1.5px solid #334155;
  border-radius: 14px;
  padding: 0.85rem 1.25rem;
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
  transition: all 0.2s ease;
}

.active-live-order-banner:hover {
  border-color: var(--color-brand);
  box-shadow: 0 6px 24px rgba(252, 128, 25, 0.25);
}

.active-order-banner-content {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.active-order-pulse-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25);
  animation: pulseDot 1.5s infinite;
  flex-shrink: 0;
}

@keyframes pulseDot {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

.active-order-icon {
  font-size: 1.4rem;
}

.active-order-text strong {
  font-size: 0.95rem;
  color: #FFFFFF;
}

.active-order-eta {
  font-size: 0.82rem;
  color: #94A3B8;
  margin-left: 0.4rem;
}

.btn-track-active-order {
  background: var(--color-brand);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1.1rem;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(252, 128, 25, 0.3);
  transition: transform 0.15s ease;
}

.btn-track-active-order:hover {
  transform: translateY(-1px);
}

/* Customer Sign-In Modal Styles */
.auth-customer-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
  background: linear-gradient(135deg, #FFFDF8 0%, #FFF7E8 100%);
  border: 1.5px solid var(--accent-gold);
  border-radius: 14px;
  padding: 1rem 1.15rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.1);
}

.auth-customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(217, 119, 6, 0.18);
  border-color: var(--color-brand);
}

.auth-customer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-brand);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(252, 128, 25, 0.25);
}

.auth-customer-badge {
  background: var(--accent-emerald-light);
  color: var(--accent-emerald);
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.btn-fast-login {
  background: var(--color-brand);
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 0.95rem;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  white-space: nowrap;
}

.auth-clean-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.25rem 0 1rem 0;
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.auth-clean-divider::before,
.auth-clean-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid var(--border-subtle);
}

.auth-clean-divider span {
  padding: 0 0.85rem;
}

.staff-auth-card {
  padding: 0.65rem 0.85rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
}

.staff-auth-card:hover {
  background: #FFF7E8;
  border-color: var(--color-brand);
  color: var(--color-brand);
}

.btn-primary-action {
  background: #FC8019;
  color: #FFFFFF;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.btn-primary-action:hover {
  background: #E56F0D;
}

.btn-secondary-action {
  background: #F1F5F9;
  color: #475569;
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.9rem;
  border: 1px solid #CBD5E1;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
}

.btn-secondary-action:hover {
  background: #E2E8F0;
  color: #0F172A;
}

/* ==========================================================================
   STANDARDIZED PAGE LAYOUT & HEADERS (CLEAN UNIFORM ALIGNMENT)
   ========================================================================== */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.page-top-bar {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: #FC8019;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  width: fit-content;
  transition: all 0.15s ease;
}

.btn-back-link:hover {
  color: #E56F0D;
  transform: translateX(-2px);
}

.page-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

/* ==========================================================================
   CENTERED PAGE HEADINGS WITH LEFT-ALIGNED BACK BUTTON (USER SPEC)
   ========================================================================== */
.page-header-center {
  text-align: center;
  margin: 0.25rem auto 1.75rem auto;
  max-width: 760px;
}

.page-header-center .page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main);
  letter-spacing: -0.02em;
  margin: 0;
  text-align: center;
}

.page-header-center .page-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin: 0.4rem auto 0 auto;
  line-height: 1.5;
  text-align: center;
}

/* Hide customer elements when viewing restaurant/staff views */
body.view-kds #main-header,
body.view-kds #mobile-dock {
  display: none !important;
}

body.view-staff #cart-button,
body.view-staff .outlet-selector-pill,
body.view-staff #mobile-dock {
  display: none !important;
}

/* Ensure KDS takes full height cleanly when customer header is hidden */
body.view-kds #app-view-container {
  padding-top: 0 !important;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  margin: 0;
}

.page-subtitle {
  font-size: 0.92rem;
  color: #6B7280;
  margin: 0.25rem 0 0 0;
}

/* Order History Cards */
.account-orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.order-history-card {
  background: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  border-radius: 16px;
  padding: 1.35rem 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.order-history-card:hover {
  border-color: var(--accent-gold);
  box-shadow: var(--shadow-md);
}

.order-history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.85rem;
}

/* Action Buttons */
.btn-primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--accent-gold);
  color: #FFFFFF;
  font-weight: 700;
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-size: 0.88rem;
  transition: all 0.2s ease;
}

.btn-primary-action:hover {
  background: var(--accent-gold-hover);
  transform: translateY(-1px);
}

.btn-secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #F1F5F9;
  color: var(--text-main);
  font-weight: 700;
  padding: 0.55rem 1.15rem;
  border-radius: 10px;
  border: 1.5px solid var(--border-subtle);
  cursor: pointer;
  font-size: 0.88rem;
  transition: all 0.2s ease;
}

.btn-secondary-action:hover {
  background: #E2E8F0;
  border-color: #CBD5E1;
}

.btn-return-customer {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 1rem;
  font-size: 0.88rem;
  font-weight: 700;
  background: #F1F5F9;
  color: var(--text-main);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-return-customer:hover {
  background: #E2E8F0;
}

/* Party Catering Page Specific Styles */
.party-nav-tabs {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.75rem;
  border-bottom: 2px solid #E5E7EB;
  padding-bottom: 0.5rem;
}

.party-tab-btn {
  padding: 0.6rem 1.2rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: #6B7280;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.15s ease;
}

.party-tab-btn:hover {
  color: #111827;
  background: #F3F4F6;
}

.party-tab-btn.active {
  color: #FC8019;
  background: #FFF7ED;
}

.party-item-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #FFFFFF;
  border: 1.5px solid #E5E7EB;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  transition: all 0.15s ease;
}

.party-item-card:hover {
  border-color: #D1D5DB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.party-item-img {
  width: 68px;
  height: 68px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.party-item-info {
  flex: 1;
}

.party-item-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
}

.party-item-serves {
  font-size: 0.8rem;
  color: #6B7280;
  margin-top: 0.15rem;
}

.party-item-price {
  font-size: 0.92rem;
  font-weight: 800;
  color: #059669;
  margin-top: 0.2rem;
}

.party-stepper-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #F3F4F6;
  padding: 4px 8px;
  border-radius: 8px;
}

.party-step-btn {
  width: 28px;
  height: 28px;
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-weight: 800;
  font-size: 1rem;
  color: #111827;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.1s ease;
}

.party-step-btn:hover {
  background: #FC8019;
  color: #FFFFFF;
  border-color: #FC8019;
}

.party-step-val {
  min-width: 20px;
  text-align: center;
  font-weight: 800;
  font-size: 0.92rem;
  color: #111827;
}

.party-portion-meter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFF7ED;
  border: 1.5px solid #FED7AA;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  margin-top: 1rem;
}

/* Slide-Over Cart Drawer */
.drawer-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 440px;
  background: #FFFFFF;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 1001;
}

.drawer-backdrop.open .drawer-panel {
  transform: translateX(0);
}

.drawer-header {
  padding: 1.35rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header-title h3 {
  font-size: 1.2rem;
  font-weight: 800;
}

.drawer-header-title p {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.drawer-body {
  padding: 1.25rem 1.5rem;
  flex: 1;
  overflow-y: auto;
}

.drawer-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border-subtle);
  background: #F9FAFB;
}

/* Floating Mobile Cart Bar */
.floating-cart-bar {
  position: fixed;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  max-width: 500px;
  margin: 0 auto;
  background: var(--color-brand);
  color: #FFFFFF;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 30px rgba(252, 128, 25, 0.4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  z-index: 90;
  animation: slideUpCart 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUpCart {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.floating-cart-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.floating-cart-icon {
  font-size: 1.4rem;
}

.floating-cart-title {
  font-size: 0.82rem;
  font-weight: 600;
  opacity: 0.9;
}

.floating-cart-price {
  font-size: 1.1rem;
  font-weight: 800;
}

.floating-cart-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 800;
  font-size: 0.95rem;
}

/* ==========================================================================
   CUSTOMER ACCOUNT VIEW
   ========================================================================== */
.account-hero-card {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  color: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  box-shadow: var(--shadow-md);
}

.royalty-wallet-badge {
  background: linear-gradient(135deg, #FC8019 0%, #D65A00 100%);
  padding: 1.15rem 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 20px rgba(252, 128, 25, 0.35);
  text-align: right;
}

.wallet-label {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  opacity: 0.9;
}

.wallet-amount {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0.2rem 0;
}

.wallet-cashback-tag {
  font-size: 0.74rem;
  opacity: 0.9;
}

/* Past Orders Card */
.past-order-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.35rem;
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow-xs);
}

.order-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.85rem;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: 0.85rem;
}

.order-id-txt {
  font-weight: 800;
  color: var(--text-main);
  font-size: 1rem;
}

.order-status-badge {
  padding: 0.25rem 0.65rem;
  border-radius: var(--radius-full);
  font-size: 0.74rem;
  font-weight: 800;
  text-transform: uppercase;
}

.status-confirmed { background: #FEF3C7; color: #B45309; }
.status-preparing { background: #E0E7FF; color: #3730A3; }
.status-ready     { background: #D1FAE5; color: #065F46; }
.status-delivered { background: #E8F7F0; color: #15885C; }

/* ==========================================================================
   PARTY & BULK CATERING INTERACTIVE BUILDER
   ========================================================================== */
.party-nav-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.75rem;
  border-bottom: 1.5px solid var(--border-subtle);
  padding-bottom: 0.5rem;
}

.party-tab-btn {
  padding: 0.65rem 1.25rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.party-tab-btn:hover {
  color: var(--color-brand);
  background: var(--bg-surface);
}

.party-tab-btn.active {
  color: #FFFFFF;
  background: var(--color-brand);
}

.party-item-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 0.85rem 1.15rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: var(--shadow-xs);
}

.party-item-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.party-item-info {
  flex: 1;
  min-width: 0;
}

.party-item-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--text-main);
}

.party-item-serves {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.party-item-price {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-main);
  margin-top: 0.15rem;
}

.party-stepper-wrap {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
}

.party-step-btn {
  width: 30px;
  height: 30px;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-brand);
  display: flex;
  align-items: center;
  justify-content: center;
}

.party-step-val {
  padding: 0 0.5rem;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--text-main);
}

.party-summary-card {
  background: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 90px;
}

/* Big Centered Form Card */
.party-big-form-card {
  max-width: 860px;
  margin: 0 auto;
  background: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

@media (max-width: 640px) {
  .party-big-form-card {
    padding: 1.5rem 1.15rem;
    border-radius: 16px;
  }
}

.party-form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.75rem;
  border-bottom: 1px solid var(--border-subtle);
}

.party-form-section:last-of-type {
  border-bottom: none;
  margin-bottom: 1rem;
  padding-bottom: 0;
}

.party-section-heading {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 1.15rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.party-dishes-box {
  background: #FDFBF7;
  border: 1.5px solid #F0E6D8;
  border-radius: 16px;
  padding: 1.35rem;
}

.party-selected-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 0.85rem 1.1rem;
  margin-bottom: 0.65rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text-main);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.party-selected-chip:last-child {
  margin-bottom: 0;
}

.party-drawer-panel {
  max-width: 480px;
}

.party-drawer-item-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: 14px;
  padding: 0.9rem 1rem;
  margin-bottom: 0.85rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.party-drawer-item-card:hover {
  border-color: #E2E8F0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.party-drawer-item-img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.party-drawer-item-info {
  flex: 1;
  min-width: 0;
}

.party-drawer-item-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
}

.party-drawer-item-serves {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 0.15rem;
}

.party-drawer-item-price {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--color-brand);
  margin-top: 0.25rem;
}

.party-open-drawer-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-brand);
  color: #FFFFFF;
  font-size: 0.92rem;
  font-weight: 800;
  padding: 0.75rem 1.35rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(252, 128, 25, 0.25);
}

.party-open-drawer-btn:hover {
  background: var(--color-brand-hover);
  transform: translateY(-1px);
}

/* ==========================================================================
   LIVE ORDER TRACKING VIEW
   ========================================================================== */
.tracking-stepper-box {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
}

.tracking-steps-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  margin: 1.5rem 0 2rem 0;
}

.tracking-step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  text-align: center;
}

.step-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #E2E8F0;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  border: 3px solid #FFFFFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.step-circle.active {
  background: var(--color-brand);
  color: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(252, 128, 25, 0.25);
  animation: pulseDot 2s infinite;
}

.step-circle.done {
  background: var(--accent-emerald);
  color: #FFFFFF;
}

.step-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-main);
}

.rider-contact-card {
  background: #FFFFFF;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.rider-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.rider-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #FFEBD9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

/* ==========================================================================
   OFF-CANVAS SIDE REVIEWER PORTAL (Right Drawer)
   ========================================================================== */
.side-portal-trigger {
  display: none !important;
}

.side-portal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1050;
  display: none;
}

.side-portal-backdrop.open {
  display: block;
}

.side-portal-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  max-width: 360px;
  background: #0F172A;
  color: #FFFFFF;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 1051;
  transform: translateX(100%);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.side-portal-backdrop.open .side-portal-panel {
  transform: translateX(0);
}

.side-portal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #1E293B;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.side-portal-close {
  color: #94A3B8;
  font-size: 1.5rem;
}

.side-portal-close:hover {
  color: #FFFFFF;
}

.side-portal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.side-section {
  margin-bottom: 1.5rem;
}

.side-section-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #64748B;
  display: block;
  margin-bottom: 0.65rem;
}

.side-toggle-group {
  display: flex;
  gap: 0.5rem;
  background: #1E293B;
  padding: 0.3rem;
  border-radius: var(--radius-sm);
}

.side-group-btn {
  flex: 1;
  padding: 0.5rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: #94A3B8;
  border-radius: var(--radius-xs);
  text-align: center;
}

.side-group-btn.active {
  background: #334155;
  color: #FFFFFF;
}

.side-role-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.side-role-btn {
  background: #1E293B;
  border: 1px solid #334155;
  color: #CBD5E1;
  padding: 0.65rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.84rem;
  font-weight: 600;
  text-align: left;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  transition: all 0.15s ease;
}

.side-role-btn:hover {
  background: #334155;
  color: #FFFFFF;
}

.side-role-btn.active {
  background: var(--color-brand);
  color: #FFFFFF;
  border-color: var(--color-brand);
}

.side-action-btn {
  background: #334155;
  color: #FFFFFF;
  padding: 0.65rem;
  border-radius: var(--radius-sm);
  font-size: 0.84rem;
  font-weight: 700;
  width: 100%;
  text-align: center;
}

.side-action-btn:hover {
  background: #475569;
}

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  background: #1E293B;
  color: #FFFFFF;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  gap: 0.65rem;
  animation: slideToast 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: auto;
}

.toast.success { border-left: 4px solid var(--accent-emerald); }
.toast.error   { border-left: 4px solid var(--accent-rose); }
.toast.info    { border-left: 4px solid var(--color-brand); }

@keyframes slideToast {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* ==========================================================================
   RESPONSIVE DESIGN (TABLETS & MOBILE <= 900px)
   ========================================================================== */
@media (max-width: 900px) {
  /* 1. Header Navigation: Compact 1-Row Header */
  .header-nav {
    padding: 0.5rem 0.75rem !important;
  }

  .nav-container {
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    gap: 0.4rem !important;
    width: 100% !important;
  }

  .brand-wrap {
    gap: 0.4rem !important;
    flex-shrink: 0 !important;
  }

  .brand-crest {
    width: 32px !important;
    height: 32px !important;
    font-size: 1.05rem !important;
    border-radius: 8px !important;
  }

  .brand-title {
    font-size: 1.05rem !important;
  }

  .brand-subtitle {
    display: none !important;
  }

  .outlet-selector-pill {
    width: auto !important;
    min-width: 0 !important;
    max-width: 170px !important;
    padding: 0.35rem 0.75rem !important;
    font-size: 0.8rem !important;
    flex-shrink: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.35rem !important;
    height: 36px !important;
    border-radius: 9999px !important;
  }

  .outlet-pill-title-row strong {
    font-size: 0.82rem !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    max-width: 110px !important;
  }

  .outlet-fssai {
    display: none !important;
  }

  /* Hide Desktop Nav items from header on mobile */
  .customer-nav-links {
    display: none !important;
  }

  .btn-auth-nav {
    display: none !important;
  }

  .nav-right-cluster {
    gap: 0 !important;
    flex-shrink: 0 !important;
  }

  .nav-actions {
    gap: 0 !important;
    flex-shrink: 0 !important;
  }

  .btn-cart-nav {
    padding: 0.38rem 0.7rem !important;
    font-size: 0.78rem !important;
    flex-shrink: 0 !important;
  }

  /* Fixed Native Bottom App Dock */
  .mobile-bottom-dock {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 58px;
    background: #FFFFFF;
    border-top: 1px solid var(--border-subtle);
    display: flex !important;
    justify-content: space-around;
    align-items: center;
    z-index: 100;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  /* Mobile Bottom Sheet Standard for all Modals */
  .sheet-drag-handle {
    display: block !important;
  }

  .modal-backdrop {
    padding: 0 !important;
    align-items: flex-end !important;
    justify-content: center !important;
  }

  .modal-card {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 24px 24px 0 0 !important;
    border-bottom: none !important;
    max-height: 85vh !important;
    margin: 0 !important;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.25) !important;
    transform: translateY(100%);
    animation: slideUpBottomSheet 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
  }

  .modal-backdrop.open .modal-card {
    transform: translateY(0) !important;
  }

  .nav-location-dropdown-wrap {
    position: static !important;
  }

  .header-nav {
    position: relative !important;
  }

  .outlet-dropdown-menu {
    position: absolute !important;
    top: calc(100% + 4px) !important;
    left: 10px !important;
    right: 10px !important;
    width: auto !important;
    max-width: calc(100vw - 20px) !important;
    max-height: 480px !important;
    border-radius: 16px !important;
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28) !important;
    z-index: 9999 !important;
    background: #FFFFFF !important;
  }

  .mobile-dock-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    font-size: 0.72rem;
    font-weight: 700;
    color: var(--text-secondary);
    background: transparent;
    padding: 0.3rem;
    flex: 1;
  }

  .mobile-dock-btn.active {
    color: var(--color-brand);
  }

  .mobile-dock-ico {
    font-size: 1.25rem;
  }

  /* Floating Cart bar docks above bottom nav */
  .floating-cart-bar {
    bottom: 68px !important;
  }

  /* Main content padding for bottom dock */
  .main-content {
    padding: 1rem 1rem 6rem 1rem !important;
  }

  /* Grids Stacked */
  .promo-banner-inner {
    grid-template-columns: 1fr !important;
    gap: 1.25rem !important;
  }

  .promo-heading {
    font-size: 1.65rem !important;
  }

  .promo-story-text {
    font-size: 0.88rem !important;
    line-height: 1.5 !important;
    margin-bottom: 1.15rem !important;
  }

  .promo-featured-img {
    height: 200px !important;
  }

  .recommendations-cards-grid {
    grid-template-columns: 1fr !important;
  }

  .famous-dishes-grid {
    grid-template-columns: 1fr 1fr !important;
  }

  .menu-grid {
    grid-template-columns: 1fr !important;
  }

  .benefits-grid {
    grid-template-columns: 1fr !important;
    gap: 1.25rem !important;
  }

  .footer-grid {
    grid-template-columns: 1fr !important;
    gap: 1.75rem !important;
  }
}

@media (max-width: 600px) {
  .famous-dishes-grid {
    grid-template-columns: 1fr !important;
  }

  .search-top-row {
    flex-direction: column !important;
    align-items: stretch !important;
  }

  .veg-mode-toggle-wrap {
    align-self: flex-start !important;
  }

  .controls-top-bar {
    flex-direction: column !important;
    align-items: stretch !important;
  }
}

/* ==========================================================================
   DEVICE SIMULATOR MODE (PHONE VIEWPORT SHELL ON LAPTOP)
   ========================================================================== */
body.device-mode-mobile {
  background: #0B1120 !important;
  min-height: 100vh;
  margin: 0;
  padding: 0 0 2rem 0;
}

/* Keep Top Reviewer Bar sticky at top of browser viewport outside phone */
body.device-mode-mobile .top-announcement-bar {
  background: #0F172A !important;
  border-bottom: 1px solid #1E293B !important;
  color: #94A3B8 !important;
  padding: 0.4rem 1.5rem !important;
}

body.device-mode-mobile .brand-strip-tag {
  color: #FC8019 !important;
}

body.device-mode-mobile .strip-benefit {
  color: #94A3B8 !important;
}

body.device-mode-mobile .top-device-switcher {
  background: #1E293B !important;
  border-color: #334155 !important;
}

body.device-mode-mobile .top-device-btn {
  color: #94A3B8 !important;
}

body.device-mode-mobile .top-device-btn.active {
  background: #FC8019 !important;
  color: #FFFFFF !important;
}

body.device-mode-mobile .top-role-dropdown {
  background: #1E293B !important;
  border-color: #334155 !important;
  color: #FFFFFF !important;
}

body.device-mode-mobile .top-quick-btn {
  background: #1E293B !important;
  border-color: #334155 !important;
  color: #CBD5E1 !important;
}

/* Hide side portal trigger since top controls are persistent */
body.device-mode-mobile .side-portal-trigger {
  display: none !important;
}

/* Realistic Smartphone Frame Shell (NO SCROLLBARS ON PHONE BODY) */
body.device-mode-mobile #app-root-wrapper {
  max-width: 414px !important;
  width: 100% !important;
  margin: 1.5rem auto 0 auto !important;
  background: #FFFFFF !important;
  border-radius: 46px !important;
  box-shadow: 0 25px 80px -10px rgba(0, 0, 0, 0.8), 0 0 0 10px #1E293B, 0 0 0 12px #334155 !important;
  overflow: hidden !important;
  position: relative !important;
  height: 840px !important;
  max-height: 840px !important;
  display: flex !important;
  flex-direction: column !important;
  border: 4px solid #000000 !important;
}

/* Dynamic Island Phone Top Notch */
body.device-mode-mobile #app-root-wrapper::before {
  content: "" !important;
  display: block !important;
  width: 110px !important;
  height: 22px !important;
  background: #000000 !important;
  border-radius: 12px !important;
  margin: 8px auto 4px auto !important;
  flex-shrink: 0 !important;
  z-index: 99 !important;
}

/* Header in Phone Frame (54px Rigid) */
body.device-mode-mobile .header-nav {
  flex-shrink: 0 !important;
  padding: 0.45rem 0.85rem !important;
  background: #FFFFFF !important;
  border-bottom: 1px solid var(--border-subtle) !important;
}

body.device-mode-mobile .nav-container {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 0.35rem !important;
  width: 100% !important;
}

body.device-mode-mobile .brand-wrap {
  gap: 0.4rem !important;
  flex-shrink: 0 !important;
}

body.device-mode-mobile .brand-crest {
  width: 32px !important;
  height: 32px !important;
  font-size: 1rem !important;
  border-radius: 8px !important;
}

body.device-mode-mobile .brand-title {
  font-size: 1.05rem !important;
}

body.device-mode-mobile .brand-subtitle,
body.device-mode-mobile .outlet-fssai,
body.device-mode-mobile .customer-nav-links,
body.device-mode-mobile .btn-auth-nav {
  display: none !important;
}

body.device-mode-mobile .outlet-selector-pill {
  width: auto !important;
  min-width: 0 !important;
  max-width: 165px !important;
  padding: 0.35rem 0.75rem !important;
  font-size: 0.8rem !important;
  flex-shrink: 0 !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.35rem !important;
  height: 36px !important;
  border-radius: 9999px !important;
}

body.device-mode-mobile .outlet-pill-title-row strong {
  font-size: 0.82rem !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 105px !important;
}

body.device-mode-mobile .nav-right-cluster {
  gap: 0 !important;
  flex-shrink: 0 !important;
}

body.device-mode-mobile .nav-actions {
  gap: 0 !important;
  flex-shrink: 0 !important;
}

body.device-mode-mobile .btn-cart-nav {
  padding: 0.38rem 0.7rem !important;
  font-size: 0.78rem !important;
  flex-shrink: 0 !important;
}

/* Scrollable Container Inside Phone (ZERO UGLY NATIVE SCROLLBARS) */
body.device-mode-mobile .app-scroll-body {
  flex: 1 !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  scrollbar-width: none !important;
  position: relative !important;
}

body.device-mode-mobile .app-scroll-body::-webkit-scrollbar {
  display: none !important;
}

body.device-mode-mobile .toast-container {
  bottom: auto !important;
  top: 4.5rem !important;
  right: 1.5rem !important;
}

/* Phone Screen Bottom Navigation Dock (Sticky to Phone Bottom) */
body.device-mode-mobile .mobile-bottom-dock {
  position: relative !important;
  bottom: auto !important;
  left: auto !important;
  right: auto !important;
  width: 100% !important;
  flex-shrink: 0 !important;
  height: 62px !important;
  padding-bottom: 6px !important;
  background: #FFFFFF !important;
  border-top: 1px solid var(--border-subtle) !important;
  display: flex !important;
  justify-content: space-around !important;
  align-items: center !important;
  z-index: 100 !important;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06) !important;
}

/* Modals inside Phone Simulator: Native Bottom Sheets bound inside Phone Frame */
body.device-mode-mobile .sheet-drag-handle {
  display: block !important;
}

body.device-mode-mobile .modal-backdrop {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0, 0, 0, 0.65) !important;
  z-index: 2500 !important;
  padding: 0 !important;
  display: none !important;
  align-items: flex-end !important;
  justify-content: center !important;
}

body.device-mode-mobile .modal-backdrop.open {
  display: flex !important;
}

body.device-mode-mobile .modal-card {
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  top: auto !important;
  width: 100% !important;
  max-width: 414px !important;
  margin: 0 auto !important;
  border-radius: 24px 24px 0 0 !important;
  border-bottom: none !important;
  max-height: 85vh !important;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.35) !important;
  transform: translateY(100%);
  animation: slideUpBottomSheet 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
}

body.device-mode-mobile .modal-backdrop.open .modal-card {
  transform: translateY(0) !important;
}

body.device-mode-mobile .nav-location-dropdown-wrap {
  position: static !important;
}

body.device-mode-mobile .header-nav {
  position: relative !important;
}

body.device-mode-mobile .outlet-dropdown-menu {
  position: absolute !important;
  top: calc(100% + 4px) !important;
  left: 10px !important;
  right: 10px !important;
  width: auto !important;
  max-width: calc(100% - 20px) !important;
  max-height: 480px !important;
  border-radius: 16px !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35) !important;
  z-index: 9999 !important;
  background: #FFFFFF !important;
}

body.device-mode-mobile .mobile-dock-btn {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 0.15rem !important;
  font-size: 0.7rem !important;
  font-weight: 700 !important;
  color: var(--text-secondary) !important;
  flex: 1 !important;
  padding: 0.25rem !important;
}

body.device-mode-mobile .mobile-dock-btn.active {
  color: var(--color-brand) !important;
}

body.device-mode-mobile .mobile-dock-ico {
  font-size: 1.2rem !important;
}

/* Floating Cart in Phone Frame */
body.device-mode-mobile .floating-cart-bar {
  position: absolute !important;
  bottom: 66px !important;
  left: 10px !important;
  right: 10px !important;
  max-width: none !important;
  padding: 0.75rem 1rem !important;
  border-radius: var(--radius-md) !important;
}

/* Clean Spacing for Phone Content */
body.device-mode-mobile .main-content {
  padding: 1rem 0.95rem 5rem 0.95rem !important;
}

body.device-mode-mobile .company-promo-banner {
  padding: 1.25rem 1rem !important;
  margin-bottom: 1.25rem !important;
  border-radius: var(--radius-lg) !important;
}

body.device-mode-mobile .promo-banner-inner {
  grid-template-columns: 1fr !important;
  gap: 1rem !important;
}

body.device-mode-mobile .promo-heading {
  font-size: 1.45rem !important;
  line-height: 1.25 !important;
}

body.device-mode-mobile .promo-story-text {
  font-size: 0.82rem !important;
  line-height: 1.45 !important;
  margin-bottom: 0.85rem !important;
}

body.device-mode-mobile .promo-cta-group {
  gap: 0.5rem !important;
  margin-bottom: 0.85rem !important;
}

body.device-mode-mobile .btn-promo-primary {
  padding: 0.65rem 1.15rem !important;
  font-size: 0.86rem !important;
  width: 100% !important;
  justify-content: center !important;
}

body.device-mode-mobile .btn-promo-secondary {
  padding: 0.65rem 1.15rem !important;
  font-size: 0.86rem !important;
  width: 100% !important;
  justify-content: center !important;
}

body.device-mode-mobile .promo-featured-img {
  height: 170px !important;
}

body.device-mode-mobile .prominent-search-section {
  padding: 1rem !important;
  margin-bottom: 1.5rem !important;
}

body.device-mode-mobile .search-top-row {
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 0.65rem !important;
}

body.device-mode-mobile .veg-mode-toggle-wrap {
  align-self: flex-start !important;
}

body.device-mode-mobile .recommendations-cards-grid {
  grid-template-columns: 1fr !important;
  gap: 0.85rem !important;
}

body.device-mode-mobile .famous-dishes-grid {
  grid-template-columns: 1fr !important;
  gap: 1rem !important;
}

body.device-mode-mobile .controls-top-bar {
  flex-direction: column !important;
  align-items: stretch !important;
  gap: 0.75rem !important;
}

body.device-mode-mobile .menu-grid {
  grid-template-columns: 1fr !important;
  gap: 1rem !important;
}

body.device-mode-mobile .swiggy-dish-card {
  padding: 1rem !important;
  gap: 0.85rem !important;
}

body.device-mode-mobile .swiggy-img-wrap {
  width: 105px !important;
  height: 105px !important;
}

body.device-mode-mobile .swiggy-dish-img {
  width: 105px !important;
  height: 105px !important;
}

body.device-mode-mobile .swiggy-action-container {
  width: 88px !important;
  bottom: -12px !important;
}

body.device-mode-mobile .swiggy-add-btn {
  height: 32px !important;
  font-size: 0.8rem !important;
}

body.device-mode-mobile .benefits-grid {
  grid-template-columns: 1fr !important;
  gap: 1rem !important;
}

body.device-mode-mobile .footer-grid {
  grid-template-columns: 1fr !important;
  gap: 1.5rem !important;
}

/* ==========================================================================
   GLOBAL HORIZONTAL SCROLLBAR REMOVAL (CLEAN TOUCH CAROUSELS)
   ========================================================================== */
.filter-carousel,
.kds-channel-pills,
.kds-stage-tabs-row,
.modal-outlet-tabs,
.kds-channel-bar {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.filter-carousel::-webkit-scrollbar,
.kds-channel-pills::-webkit-scrollbar,
.kds-stage-tabs-row::-webkit-scrollbar,
.modal-outlet-tabs::-webkit-scrollbar,
.kds-channel-bar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

/* ==========================================================================
   ADMIN MENU MANAGEMENT (CMS) - RESPONSIVE DATA TABLE & MOBILE CARDS
   ========================================================================== */
.cms-table-container {
  display: block;
  width: 100%;
  background: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.cms-mobile-cards-list {
  display: none;
}

@media (max-width: 800px) {
  .cms-table-container {
    display: none !important;
  }
  .cms-mobile-cards-list {
    display: flex !important;
    flex-direction: column !important;
    gap: 0.85rem !important;
  }
}

body.device-mode-mobile .cms-table-container {
  display: none !important;
}

body.device-mode-mobile .cms-mobile-cards-list {
  display: flex !important;
  flex-direction: column !important;
  gap: 0.85rem !important;
}

.cms-dish-card {
  background: #FFFFFF;
  border: 1.5px solid var(--border-subtle);
  border-radius: 14px;
  padding: 0.95rem 1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cms-dish-card-top {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.cms-dish-card-thumb {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid var(--border-subtle);
}

.cms-dish-card-info {
  flex: 1;
  min-width: 0;
}

.cms-dish-name {
  font-weight: 800;
  font-size: 0.95rem;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
}

.cms-dish-meta {
  font-size: 0.78rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.2rem;
}

.cms-dish-price {
  font-weight: 800;
  font-size: 0.96rem;
  color: var(--color-brand);
  margin-top: 0.25rem;
}

.cms-dish-card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  border-top: 1px solid var(--border-subtle);
  padding-top: 0.65rem;
}

.cms-stock-toggle-btn {
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.76rem;
  font-weight: 800;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.cms-stock-toggle-btn.active {
  background: var(--accent-emerald-light);
  color: var(--accent-emerald);
  border-color: var(--accent-emerald);
}

.cms-stock-toggle-btn.paused {
  background: var(--accent-rose-light);
  color: var(--accent-rose);
  border-color: var(--accent-rose);
}

.cms-edit-btn {
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  background: var(--bg-surface);
  border: 1.5px solid var(--border-subtle);
  color: var(--text-main);
  cursor: pointer;
}

.cms-delete-btn {
  padding: 0.45rem 0.65rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 700;
  background: #FEE2E2;
  color: #DC2626;
  border: 1.5px solid #FCA5A5;
  cursor: pointer;
}

/* Symmetrical Form Fields in Modals */
.auth-form-group select,
.auth-form-group input {
  width: 100% !important;
  box-sizing: border-box !important;
}



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

fs.writeFileSync(path.join(__dirname, '../public/css/style.css'), css, 'utf8');
console.log('Successfully wrote updated style.css with persistent top reviewer bar and pristine phone simulator!');
