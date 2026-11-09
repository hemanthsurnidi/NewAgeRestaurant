const fs = require('fs');
const path = require('path');

const appJsPath = path.join(__dirname, '../public/js/app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

// 1. Replace brand occurrences of Dum & Co.
appJs = appJs.replace(/Initializing Dum & Co\. Direct Platform\.\.\./g, 'Initializing Company A Direct Platform...');
appJs = appJs.replace(/Why Order Direct from Dum & Co\./g, 'Why Order Direct from Company A');
appJs = appJs.replace(/<div class="brand-title" style="color: #FFFFFF;">Dum & Co\.<\/div>/g, '<div class="brand-title" style="color: #FFFFFF;">Company A</div>');
appJs = appJs.replace(/© 2026 Dum & Co\. All rights reserved\./g, '© 2026 Company A. All rights reserved.');
appJs = appJs.replace(/catering@dumco\.in/g, 'catering@companya.in');
appJs = appJs.replace(/customer@dumco\.in/g, 'customer@companya.in');
appJs = appJs.replace(/kondapur@dumco\.in/g, 'kondapur@companya.in');
appJs = appJs.replace(/gachibowli@dumco\.in/g, 'gachibowli@companya.in');
appJs = appJs.replace(/kukatpally@dumco\.in/g, 'kukatpally@companya.in');
appJs = appJs.replace(/admin@dumco\.in/g, 'admin@companya.in');

// 2. Remove Test Bell and fix Active label in KDS view
const testBellStr = `<button class="kds-exit-btn kds-desktop-only-btn" onclick="App.playOrderChime(true)" title="Test chime audio">
              🔊 Test Bell
            </button>`;

if (appJs.includes(testBellStr)) {
  appJs = appJs.replace(testBellStr, '');
} else {
  // Try regex if whitespace differs
  appJs = appJs.replace(/<button class="kds-exit-btn kds-desktop-only-btn"[^>]*onclick="App\.playOrderChime\(true\)"[^>]*>[\s\S]*?🔊 Test Bell[\s\S]*?<\/button>/g, '');
}

// Fix Active Tickets label to Active
appJs = appJs.replace(/<div class="kds-metric-label">Active Tickets<\/div>/g, '<div class="kds-metric-label">Active</div>');

// 3. Fix handleRoleChange for party role
appJs = appJs.replace(
  `} else if (role === 'party') {
      this.navigate('party');
    }`,
  `} else if (role === 'party') {
      this.state.partyViewTab = 'active';
      this.navigate('party');
    }`
);

// 4. Update renderPartyView for clear staff vs customer separation
const oldIsStaffParty = `const isStaff = this.state.currentUser && ['admin', 'kitchen_staff'].includes(this.state.currentUser.role);
    if (!isStaff) {
      this.state.partyViewTab = 'request';
    }`;

const newIsStaffParty = `const isStaff = this.state.currentRole === 'party' || 
                    this.state.currentRole === 'admin' || 
                    this.state.currentRole === 'kds' || 
                    (this.state.currentUser && ['admin', 'kitchen_staff'].includes(this.state.currentUser.role));
    if (isStaff) {
      if (!this.state.partyViewTab) this.state.partyViewTab = 'active';
    } else {
      this.state.partyViewTab = 'request';
    }`;

if (appJs.includes(oldIsStaffParty)) {
  appJs = appJs.replace(oldIsStaffParty, newIsStaffParty);
} else {
  console.log('Notice: oldIsStaffParty marker not found verbatim, checking pattern...');
  appJs = appJs.replace(
    /const isStaff = this\.state\.currentUser && \['admin', 'kitchen_staff'\]\.includes\(this\.state\.currentUser\.role\);\s*if \(!isStaff\) \{\s*this\.state\.partyViewTab = 'request';\s*\}/g,
    newIsStaffParty
  );
}

// Update party view title to distinguish staff operations vs customer
appJs = appJs.replace(
  `<h1 class="page-title">Party & Bulk Catering</h1>
          <p class="page-subtitle">Authentic wood-fire degh catering for 15 to 500+ guests with 24 hours advance notice.</p>`,
  `<h1 class="page-title">\${isStaff ? 'Party & Bulk Catering Operations' : 'Party & Bulk Catering'}</h1>
          <p class="page-subtitle">\${isStaff ? 'Central catering desk: active customer orders, degh allocations, and manager confirmations' : 'Authentic wood-fire degh catering for 15 to 500+ guests with 24 hours advance notice.'}</p>`
);

// Update party subtabs so active requests comes first and is clearly labelled
appJs = appJs.replace(
  `<button class="party-tab-btn \${this.state.partyViewTab === 'request' ? 'active' : ''}" onclick="App.setPartyTab('request')">
              <span>📝</span> Request Bulk Catering
            </button>
            <button class="party-tab-btn \${this.state.partyViewTab === 'active' ? 'active' : ''}" onclick="App.setPartyTab('active')">
              <span>📋</span> Active Requests (\${partyList.length})
            </button>`,
  `<button class="party-tab-btn \${this.state.partyViewTab === 'active' ? 'active' : ''}" onclick="App.setPartyTab('active')">
              <span>📋</span> Active Catering Orders (\${partyList.length})
            </button>
            <button class="party-tab-btn \${this.state.partyViewTab === 'request' ? 'active' : ''}" onclick="App.setPartyTab('request')">
              <span>📝</span> + New Catering Booking
            </button>`
);

// 5. Update openCmsItemModal form markup for clean symmetrical layout
const oldCmsFormStart = `body.innerHTML = \`
      <form onsubmit="App.submitCmsItem(event)">
        <div class="auth-form-group">
          <label>Dish Name *</label>
          <input type="text" id="cms-dish-name" value="\${item ? item.name : ''}" placeholder="e.g. Shahi Mutton Dum Biryani" required>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <div class="auth-form-group" style="flex: 1;">
            <label>Category *</label>
            <select id="cms-dish-category">
              \${categories.map(c => \`
                <option value="\${c}" \${item && item.category === c ? 'selected' : ''}>\${c}</option>
              \`).join('')}
            </select>
          </div>
          <div class="auth-form-group" style="flex: 1;">
            <label>Base Price (₹ incl 5% GST) *</label>
            <input type="number" id="cms-dish-price" value="\${item ? item.base_price : 380}" min="10" required>
          </div>
        </div>

        <div class="auth-form-group">
          <label>Description</label>
          <textarea id="cms-dish-desc" rows="2" placeholder="Description of spices, slow-cooking technique, and aroma...">\${item ? item.description : ''}</textarea>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <div class="auth-form-group" style="flex: 1;">
            <label>Classification</label>
            <select id="cms-dish-veg">
              <option value="0" \${item && !item.is_veg ? 'selected' : ''}>🍖 Non-Vegetarian</option>
              <option value="1" \${item && item.is_veg ? 'selected' : ''}>🌱 Pure Vegetarian</option>
            </select>
          </div>
          <div class="auth-form-group" style="flex: 1;">
            <label>Spice Level</label>
            <select id="cms-dish-spice">
              <option value="Mild" \${item && item.spice_level === 'Mild' ? 'selected' : ''}>Mild</option>
              <option value="Medium" \${item && item.spice_level === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Fiery" \${item && item.spice_level === 'Fiery' ? 'selected' : ''}>Fiery</option>
              <option value="Nawabi Dum" \${item && item.spice_level === 'Nawabi Dum' ? 'selected' : ''}>Nawabi Dum</option>
            </select>
          </div>
          <div class="auth-form-group" style="flex: 1;">
            <label>Allergens</label>
            <input type="text" id="cms-dish-allergens" value="\${item ? item.allergens : ''}" placeholder="e.g. Dairy, Nuts">
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <div class="auth-form-group" style="flex: 1;">
            <label>Prep Complexity (Mins)</label>
            <input type="number" id="cms-dish-complexity" value="\${item ? item.prep_complexity_minutes : 12}" min="2" max="60">
          </div>
          <div class="auth-form-group" style="flex: 1;">
            <label>Time-Based Menu Tag</label>
            <select id="cms-dish-tag">
              <option value="All Day" \${item && item.time_based_tag === 'All Day' ? 'selected' : ''}>All Day</option>
              <option value="Lunch Special" \${item && item.time_based_tag === 'Lunch Special' ? 'selected' : ''}>Lunch Special</option>
              <option value="Dinner & Midnight Biryani" \${item && item.time_based_tag === 'Dinner & Midnight Biryani' ? 'selected' : ''}>Dinner & Midnight Biryani</option>
            </select>
          </div>
        </div>

        <div class="auth-form-group">
          <label>Food Photograph Image URL</label>
          <input type="url" id="cms-dish-image" value="\${item ? item.image_url : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'}">
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" class="side-action-btn" onclick="App.closeCmsItemModal()">Cancel</button>
          <button type="submit" class="btn-cart-nav" style="background: var(--accent-gold);">
            \${item ? 'Save Changes ➔' : 'Create Dish ➔'}
          </button>
        </div>
      </form>
    \`;`;

const newCmsForm = `body.innerHTML = \`
      <form onsubmit="App.submitCmsItem(event)" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div class="auth-form-group">
          <label>Dish Name *</label>
          <input type="text" id="cms-dish-name" value="\${item ? item.name : ''}" placeholder="e.g. Shahi Mutton Dum Biryani" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="auth-form-group">
            <label>Category *</label>
            <select id="cms-dish-category">
              \${categories.map(c => \`
                <option value="\${c}" \${item && item.category === c ? 'selected' : ''}>\${c}</option>
              \`).join('')}
            </select>
          </div>
          <div class="auth-form-group">
            <label>Base Price (₹ incl 5% GST) *</label>
            <input type="number" id="cms-dish-price" value="\${item ? item.base_price : 380}" min="10" required>
          </div>
        </div>

        <div class="auth-form-group">
          <label>Description</label>
          <textarea id="cms-dish-desc" rows="3" placeholder="Description of spices, slow-cooking technique, and aroma...">\${item ? item.description : ''}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="auth-form-group">
            <label>Classification</label>
            <select id="cms-dish-veg">
              <option value="0" \${item && !item.is_veg ? 'selected' : ''}>🍖 Non-Vegetarian</option>
              <option value="1" \${item && item.is_veg ? 'selected' : ''}>🌱 Pure Vegetarian</option>
            </select>
          </div>
          <div class="auth-form-group">
            <label>Spice Level</label>
            <select id="cms-dish-spice">
              <option value="Mild" \${item && item.spice_level === 'Mild' ? 'selected' : ''}>Mild</option>
              <option value="Medium" \${item && item.spice_level === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Fiery" \${item && item.spice_level === 'Fiery' ? 'selected' : ''}>Fiery</option>
              <option value="Nawabi Dum" \${item && item.spice_level === 'Nawabi Dum' ? 'selected' : ''}>Nawabi Dum</option>
            </select>
          </div>
        </div>

        <div class="auth-form-group">
          <label>Allergens</label>
          <input type="text" id="cms-dish-allergens" value="\${item ? item.allergens : ''}" placeholder="e.g. Dairy, Nuts">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="auth-form-group">
            <label>Prep Complexity (Mins)</label>
            <input type="number" id="cms-dish-complexity" value="\${item ? item.prep_complexity_minutes : 12}" min="2" max="60">
          </div>
          <div class="auth-form-group">
            <label>Time-Based Menu Tag</label>
            <select id="cms-dish-tag">
              <option value="All Day" \${item && item.time_based_tag === 'All Day' ? 'selected' : ''}>All Day</option>
              <option value="Lunch Special" \${item && item.time_based_tag === 'Lunch Special' ? 'selected' : ''}>Lunch Special</option>
              <option value="Dinner & Midnight Biryani" \${item && item.time_based_tag === 'Dinner & Midnight Biryani' ? 'selected' : ''}>Dinner & Midnight Biryani</option>
            </select>
          </div>
        </div>

        <div class="auth-form-group">
          <label>Food Photograph Image URL</label>
          <input type="url" id="cms-dish-image" value="\${item ? item.image_url : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'}">
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" class="side-action-btn" onclick="App.closeCmsItemModal()">Cancel</button>
          <button type="submit" class="btn-cart-nav" style="background: var(--accent-gold);">
            \${item ? 'Save Changes ➔' : 'Create Dish ➔'}
          </button>
        </div>
      </form>
    \`;`;

if (appJs.includes(oldCmsFormStart)) {
  appJs = appJs.replace(oldCmsFormStart, newCmsForm);
} else {
  console.log('Notice: oldCmsFormStart not matched verbatim, using regex replacement');
  appJs = appJs.replace(/body\.innerHTML = `\s*<form onsubmit="App\.submitCmsItem\(event\)">[\s\S]*?<\/form>\s*`;/, newCmsForm);
}

fs.writeFileSync(appJsPath, appJs, 'utf8');
console.log('Successfully updated public/js/app.js with fixes!');

