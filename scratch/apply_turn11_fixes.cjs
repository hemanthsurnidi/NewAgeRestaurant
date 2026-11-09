const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '../public/js/app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// -----------------------------------------------------------------------------
// 1. In renderKdsView: REMOVE "← Exit to Menu" and "🔔 Chime" button
// -----------------------------------------------------------------------------
// Remove Exit to Menu button
appJs = appJs.replace(
  /<button class="kds-exit-btn"[^>]*onclick="App\.navigate\('ordering'\)"[^>]*>[\s\S]*?← Exit to Menu[\s\S]*?<\/button>\s*/g,
  ''
);

// Remove Chime button
appJs = appJs.replace(
  /<button class="kds-audio-btn[^"]*"[^>]*onclick="App\.toggleKdsAudio\(\)"[^>]*>[\s\S]*?<\/button>\s*/g,
  ''
);

// -----------------------------------------------------------------------------
// 2. Remove "← Back to Customer Menu" / "← Back to Menu" from:
//    - Admin CMS (renderCmsView)
//    - Operations & Analytics (renderAnalyticsView)
//    - AI Simulator (renderAiLabView)
//    - Party & Bulk Catering (renderPartyView)
// -----------------------------------------------------------------------------
// Admin CMS
appJs = appJs.replace(
  `<div class="page-top-bar" style="margin-bottom: 0.5rem;">
          <button class="btn-back-link" onclick="App.navigate('ordering')">← Back to Customer Menu</button>
        </div>`,
  ''
);

// Analytics
appJs = appJs.replace(
  `<div class="page-top-bar" style="margin-bottom: 0.5rem;">
          <button class="btn-back-link" onclick="App.navigate('ordering')">← Back to Customer Menu</button>
        </div>`,
  ''
);

// AI Lab
appJs = appJs.replace(
  `<div class="page-top-bar" style="margin-bottom: 0.5rem;">
          <button class="btn-back-link" onclick="App.navigate('ordering')">← Back to Customer Menu</button>
        </div>`,
  ''
);

// Party Catering
appJs = appJs.replace(
  `<div class="page-top-bar" style="margin-bottom: 0.5rem;">
          <button class="btn-back-link" onclick="App.navigate('ordering')">← Back to Menu</button>
        </div>`,
  ''
);

// Account view
appJs = appJs.replace(
  `<div class="page-top-bar" style="margin-bottom: 0.5rem;">
          <button class="btn-back-link" onclick="App.navigate('ordering')">← Back to Menu</button>
        </div>`,
  ''
);

// -----------------------------------------------------------------------------
// 3. Fix updateHeaderContext: Remove "Kitchen KDS" and "Customer Menu" links
//    that break the header when in staff view.
// -----------------------------------------------------------------------------
const oldStaffNav = `navLinks.innerHTML = \`
          <button class="cust-nav-link \${viewName === 'cms' ? 'active' : ''}" onclick="App.navigate('cms')">
            <span class="nav-link-icon">📋</span>
            <span>Menu CMS</span>
          </button>
          <button class="cust-nav-link \${viewName === 'analytics' ? 'active' : ''}" onclick="App.navigate('analytics')">
            <span class="nav-link-icon">📊</span>
            <span>Reports</span>
          </button>
          <button class="cust-nav-link \${viewName === 'ai_lab' ? 'active' : ''}" onclick="App.navigate('ai_lab')">
            <span class="nav-link-icon">⏱️</span>
            <span>Simulator</span>
          </button>
          <button class="cust-nav-link" onclick="App.navigate('kds')">
            <span class="nav-link-icon">🍳</span>
            <span>Kitchen KDS</span>
          </button>
          <button class="cust-nav-link" style="color: var(--color-brand); font-weight: 800;" onclick="App.navigate('ordering')">
            <span class="nav-link-icon">←</span>
            <span>Customer Menu</span>
          </button>
        \`;`;

const newStaffNav = `navLinks.innerHTML = \`
          <button class="cust-nav-link \${viewName === 'cms' ? 'active' : ''}" onclick="App.navigate('cms')">
            <span class="nav-link-icon">📋</span>
            <span>Menu CMS</span>
          </button>
          <button class="cust-nav-link \${viewName === 'party' ? 'active' : ''}" onclick="App.navigate('party')">
            <span class="nav-link-icon">🎉</span>
            <span>Bulk Orders</span>
          </button>
          <button class="cust-nav-link \${viewName === 'analytics' ? 'active' : ''}" onclick="App.navigate('analytics')">
            <span class="nav-link-icon">📊</span>
            <span>Reports</span>
          </button>
          <button class="cust-nav-link \${viewName === 'ai_lab' ? 'active' : ''}" onclick="App.navigate('ai_lab')">
            <span class="nav-link-icon">⏱️</span>
            <span>Simulator</span>
          </button>
        \`;`;

if (appJs.includes(oldStaffNav)) {
  appJs = appJs.replace(oldStaffNav, newStaffNav);
} else {
  console.log('Notice: oldStaffNav pattern matching via regex');
  appJs = appJs.replace(
    /navLinks\.innerHTML = `[\s\S]*?Kitchen KDS[\s\S]*?Customer Menu[\s\S]*?`;/,
    newStaffNav
  );
}

// -----------------------------------------------------------------------------
// 4. In navigate(viewName): DO NOT CHANGE top-role-select to party when
//    a customer navigates to party orders!
// -----------------------------------------------------------------------------
const oldTopSelectSync = `// Keep persistent top reviewer role dropdown synchronized with active view
    const topSelect = document.getElementById('top-role-select');
    if (topSelect) {
      if (viewName === 'ordering') topSelect.value = 'customer';
      else if (viewName === 'party') topSelect.value = 'party';
      else if (viewName === 'kds') {
        if (this.state.currentRole && this.state.currentRole.startsWith('kitchen_')) {
          topSelect.value = this.state.currentRole;
        } else {
          topSelect.value = 'kitchen_kondapur';
        }
      } else if (viewName === 'cms') topSelect.value = 'admin';
      else if (viewName === 'analytics') topSelect.value = 'analytics';
      else if (viewName === 'ai_lab') topSelect.value = 'ai_lab';
    }`;

const newTopSelectSync = `// Top role dropdown reflects the active user role, not customer navigation pages
    const topSelect = document.getElementById('top-role-select');
    if (topSelect && this.state.currentRole) {
      topSelect.value = this.state.currentRole;
    }`;

if (appJs.includes(oldTopSelectSync)) {
  appJs = appJs.replace(oldTopSelectSync, newTopSelectSync);
} else {
  console.log('Notice: oldTopSelectSync replacement via regex');
  appJs = appJs.replace(
    /\/\/ Keep persistent top reviewer role dropdown synchronized with active view[\s\S]*?else if \(viewName === 'ai_lab'\) topSelect\.value = 'ai_lab';\s*\}/,
    newTopSelectSync
  );
}

// -----------------------------------------------------------------------------
// 5. In renderPartyView: Strict check for isStaff.
//    If currentRole === 'customer', customer sees the booking form!
// -----------------------------------------------------------------------------
const oldPartyIsStaff = `const isStaff = this.state.currentRole === 'party' || 
                    this.state.currentRole === 'admin' || 
                    this.state.currentRole === 'kds' || 
                    (this.state.currentUser && ['admin', 'kitchen_staff'].includes(this.state.currentUser.role));
    if (isStaff) {
      if (!this.state.partyViewTab) this.state.partyViewTab = 'active';
    } else {
      this.state.partyViewTab = 'request';
    }`;

const newPartyIsStaff = `const isStaff = this.state.currentRole !== 'customer' && (
      this.state.currentRole === 'party' || 
      this.state.currentRole === 'admin' || 
      this.state.currentRole === 'kds' || 
      (this.state.currentUser && ['admin', 'kitchen_staff'].includes(this.state.currentUser.role))
    );
    if (isStaff) {
      if (!this.state.partyViewTab) this.state.partyViewTab = 'active';
    } else {
      this.state.partyViewTab = 'request';
    }`;

if (appJs.includes(oldPartyIsStaff)) {
  appJs = appJs.replace(oldPartyIsStaff, newPartyIsStaff);
} else {
  appJs = appJs.replace(
    /const isStaff = this\.state\.currentRole === 'party'[\s\S]*?this\.state\.partyViewTab = 'request';\s*\}/,
    newPartyIsStaff
  );
}

// -----------------------------------------------------------------------------
// 6. Update renderCmsView: Add Bulk Order Approvals Tab with Confirm/Decline
// -----------------------------------------------------------------------------
const oldCmsViewStart = `  renderCmsView() {
    const container = document.getElementById('app-view-container');
    const outlet = this.state.currentOutlet;

    container.innerHTML = \`
      <div style="max-width: 1160px; margin: 0 auto; padding-bottom: 3rem;">
        <div class="page-header-center">
          <h1 class="page-title">Menu Management</h1>
          <p class="page-subtitle">Manage dishes, pricing, categories, and stock across Hyderabad outlets.</p>
        </div>

        <div style="display: flex; justify-content: center; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 2rem;">
          <button class="btn-primary-action" onclick="App.openCmsItemModal()">
            ＋ Add Dish
          </button>
          <button class="btn-secondary-action" onclick="App.openCmsCityModal()">
            🏷️ City Pricing
          </button>
          <select class="top-role-dropdown" onchange="App.switchOutlet(this.value)" title="Active outlet stock preview" style="background: #FFFFFF; color: var(--text-main); border: 1.5px solid var(--border-subtle);">
            \${this.state.outlets.map(o => \`
              <option value="\${o.id}" \${o.id === outlet.id ? 'selected' : ''}>Outlet: \${o.name}</option>
            \`).join('')}
          </select>
        </div>`;

// Check if renderCmsView still has the old back link
appJs = appJs.replace(
  /renderCmsView\(\)\s*\{[\s\S]*?<h1 class="page-title">Menu Management<\/h1>[\s\S]*?<p class="page-subtitle">Manage dishes, pricing, categories, and stock across Hyderabad outlets\.<\/p>\s*<\/div>/,
  `renderCmsView() {
    const container = document.getElementById('app-view-container');
    const outlet = this.state.currentOutlet;
    this.state.cmsTab = this.state.cmsTab || 'dishes';
    const pendingBulkCount = (this.state.partyOrders || []).filter(p => p.status === 'PENDING_REVIEW').length;

    container.innerHTML = \`
      <div style="max-width: 1160px; margin: 0 auto; padding-bottom: 3rem;">
        <div class="page-header-center">
          <h1 class="page-title">Admin Management</h1>
          <p class="page-subtitle">Manage menu catalog, city pricing, and approve bulk party orders.</p>
        </div>

        <!-- Admin Navigation Tabs: Dishes vs Bulk Order Approvals -->
        <div class="party-nav-tabs" style="justify-content: center; margin-bottom: 2rem;">
          <button class="party-tab-btn \${this.state.cmsTab === 'dishes' ? 'active' : ''}" onclick="App.setCmsTab('dishes')">
            <span>🍲</span> Dishes & Menu (\${this.state.menu.length})
          </button>
          <button class="party-tab-btn \${this.state.cmsTab === 'party_approvals' ? 'active' : ''}" onclick="App.setCmsTab('party_approvals')">
            <span>📋</span> Bulk Order Approvals (\${pendingBulkCount > 0 ? \`<span style="background: var(--color-brand); color: #FFF; padding: 2px 7px; border-radius: 9999px; font-size: 0.75rem;">\${pendingBulkCount}</span>\` : (this.state.partyOrders || []).length})
          </button>
        </div>

        \${this.state.cmsTab === 'dishes' ? \`
          <div style="display: flex; justify-content: center; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 2rem;">
            <button class="btn-primary-action" onclick="App.openCmsItemModal()">
              ＋ Add Dish
            </button>
            <button class="btn-secondary-action" onclick="App.openCmsCityModal()">
              🏷️ City Pricing
            </button>
            <select class="top-role-dropdown" onchange="App.switchOutlet(this.value)" title="Active outlet stock preview" style="background: #FFFFFF; color: var(--text-main); border: 1.5px solid var(--border-subtle);">
              \${this.state.outlets.map(o => \`
                <option value="\${o.id}" \${o.id === outlet.id ? 'selected' : ''}>Outlet: \${o.name}</option>
              \`).join('')}
            </select>
          </div>
        \` : ''}`
);

// Close the cmsTab condition around the dishes tables
appJs = appJs.replace(
  `<!-- Mobile Dish Cards List (Visible on Mobile Viewport) -->
        <div class="cms-mobile-cards-list">
          \${this.state.menu.map(item => \`
            <div class="cms-dish-card">
              <div class="cms-dish-card-top">
                <img src="\${item.image_url}" alt="\${item.name}" class="cms-dish-card-img">
                <div style="flex: 1; min-width: 0;">
                  <strong style="color: var(--text-main); font-size: 0.95rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${item.name}</strong>
                  <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 700;">\${item.category} • \${item.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}</span>
                  <div style="font-size: 0.88rem; font-weight: 800; color: var(--color-brand); margin-top: 0.2rem;">₹\${item.base_price}</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.65rem; margin-top: 0.25rem;">
                <button class="cms-stock-toggle-btn \${(outlet.stock_overrides || {})[item.id] === false ? 'paused' : 'available'}"
                        onclick="App.toggleDishStock('\${item.id}')">
                  \${(outlet.stock_overrides || {})[item.id] === false ? '⛔ 86 Paused' : '✅ In Stock'}
                </button>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="cms-edit-btn" onclick="App.openCmsItemModal('\${item.id}')">
                    Edit
                  </button>
                  <button class="cms-delete-btn" onclick="App.deleteCmsItem('\${item.id}')">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          \`).join('')}
        </div>
      </div>
    \`;
  },`,
  `<!-- Mobile Dish Cards List (Visible on Mobile Viewport) -->
        <div class="cms-mobile-cards-list">
          \${this.state.menu.map(item => \`
            <div class="cms-dish-card">
              <div class="cms-dish-card-top">
                <img src="\${item.image_url}" alt="\${item.name}" class="cms-dish-card-img">
                <div style="flex: 1; min-width: 0;">
                  <strong style="color: var(--text-main); font-size: 0.95rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">\${item.name}</strong>
                  <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 700;">\${item.category} • \${item.is_veg ? '🌱 Veg' : '🍖 Non-Veg'}</span>
                  <div style="font-size: 0.88rem; font-weight: 800; color: var(--color-brand); margin-top: 0.2rem;">₹\${item.base_price}</div>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.65rem; margin-top: 0.25rem;">
                <button class="cms-stock-toggle-btn \${(outlet.stock_overrides || {})[item.id] === false ? 'paused' : 'available'}"
                        onclick="App.toggleDishStock('\${item.id}')">
                  \${(outlet.stock_overrides || {})[item.id] === false ? '⛔ 86 Paused' : '✅ In Stock'}
                </button>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="cms-edit-btn" onclick="App.openCmsItemModal('\${item.id}')">
                    Edit
                  </button>
                  <button class="cms-delete-btn" onclick="App.deleteCmsItem('\${item.id}')">
                    ✕
                  </button>
                </div>
              </div>
            </div>
          \`).join('')}
        </div>
        \` : \`
          <!-- TAB 2: ADMIN BULK ORDER APPROVALS DESK -->
          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.6rem; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin: 0;">Bulk Catering Approvals Desk</h3>
                <p style="font-size: 0.86rem; color: var(--text-secondary); margin: 0.2rem 0 0 0;">Review, confirm, or decline customer party catering orders</p>
              </div>
              <span style="font-size: 0.82rem; background: var(--bg-surface); padding: 0.4rem 0.85rem; border-radius: 9999px; font-weight: 700; color: var(--text-main);">
                Total: \${(this.state.partyOrders || []).length} • Pending: \${pendingBulkCount}
              </span>
            </div>

            \${(this.state.partyOrders || []).length === 0 ? \`
              <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                No catering requests submitted yet.
              </div>
            \` : \`
              <div style="display: flex; flex-direction: column; gap: 1.15rem;">
                \${(this.state.partyOrders || []).map(p => \`
                  <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 14px; padding: 1.4rem; box-shadow: var(--shadow-xs);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                          <strong style="color: var(--text-main); font-size: 1.1rem;">#\${p.id}</strong>
                          <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 700;">• Host: \${p.customer_name} (\${p.customer_phone})</span>
                        </div>
                        <div style="font-size: 0.84rem; color: var(--accent-gold); font-weight: 700; margin-top: 0.2rem;">
                          📅 Event: \${p.event_date} at \${p.event_time} • 👥 \${p.guest_count} Guests • Kitchen: \${p.outlet_name || 'Hyderabad Flagship'}
                        </div>
                      </div>
                      <span style="background: \${p.status === 'CONFIRMED' ? 'var(--accent-emerald-light)' : p.status === 'REJECTED' ? 'var(--accent-rose-light)' : 'var(--accent-gold-light)'}; color: \${p.status === 'CONFIRMED' ? 'var(--accent-emerald)' : p.status === 'REJECTED' ? 'var(--accent-rose)' : 'var(--accent-gold-hover)'}; font-size: 0.78rem; padding: 0.35rem 0.8rem; border-radius: 9999px; font-weight: 800;">
                        \${p.status === 'PENDING_REVIEW' ? '⏳ PENDING APPROVAL' : p.status === 'CONFIRMED' ? '✅ CONFIRMED' : p.status}
                      </span>
                    </div>

                    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 0.85rem 1rem; margin-bottom: 0.85rem; font-size: 0.86rem; color: var(--text-main);">
                      <strong>Requirements / Handis:</strong> \${p.requirements_text}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; flex-wrap: wrap; gap: 0.75rem;">
                      <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        Est Quote: <strong style="color: var(--accent-emerald); font-size: 1rem;">₹\${Number(p.estimated_budget).toLocaleString('en-IN')}</strong> (incl 5% GST)
                      </div>

                      <div style="display: flex; gap: 0.5rem; align-items: center;">
                        \${p.status === 'PENDING_REVIEW' ? \`
                          <button class="btn-cart-nav" style="padding: 0.4rem 0.95rem; font-size: 0.82rem; background: var(--accent-emerald); border-radius: 8px;" onclick="App.updatePartyStatus('\${p.id}', 'CONFIRMED')">
                            ✓ Manager Confirm
                          </button>
                          <button class="category-chip" style="padding: 0.4rem 0.95rem; font-size: 0.82rem; background: var(--accent-rose-light); color: var(--accent-rose); border-color: var(--accent-rose);" onclick="App.updatePartyStatus('\${p.id}', 'REJECTED')">
                            ✕ Decline
                          </button>
                        \` : \`
                          <span style="font-size: 0.82rem; color: \${p.status === 'CONFIRMED' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight: 800;">
                            \${p.manager_notes || p.status}
                          </span>
                        \`}
                      </div>
                    </div>
                  </div>
                \`).join('')}
              </div>
            \`}
          </div>
        \`}
      </div>
    \`;
  },`
);

// Add setCmsTab helper method if not present
if (!appJs.includes('setCmsTab(tab)')) {
  appJs = appJs.replace(
    'renderCmsView() {',
    `setCmsTab(tab) {
    this.state.cmsTab = tab;
    this.renderCmsView();
  },

  renderCmsView() {`
  );
}

// In updatePartyStatus, refresh CMS view if currentView === 'cms'
appJs = appJs.replace(
  `this.showToast(\`Party Request #\${id} marked as \${newStatus}\`, newStatus === 'CONFIRMED' ? 'success' : 'info');
        this.renderPartyView();`,
  `this.showToast(\`Party Request #\${id} marked as \${newStatus}\`, newStatus === 'CONFIRMED' ? 'success' : 'info');
        try {
          const pRes = await fetch('/api/party-orders');
          this.state.partyOrders = await pRes.json();
        } catch(e) {}
        if (this.state.currentView === 'cms') {
          this.renderCmsView();
        } else {
          this.renderPartyView();
        }`
);

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('Successfully applied Turn 11 fixes to public/js/app.js!');

