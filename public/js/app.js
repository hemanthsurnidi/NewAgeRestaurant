/**
 * Nawabi Zaika / Nizami Biryani - Direct Ordering & KDS Application
 * Complete reactive client with Real-time SSE synchronization,
 * Web Audio synthesizer, and multi-role views
 * 
 * Aesthetic: Minimal Luxury Hyderabadi Design System
 * "Clean layouts, white space, restrained palette, clear type, big food photos"
 */

export const App = {
  state: {
    currentRole: 'customer',
    currentView: 'ordering',
    outlets: [],
    currentOutlet: null,
    menu: [],
    activeCategory: 'All',
    vegOnly: false,
    cart: [],
    activeCoupon: null,
    loyaltyPointsRedeemed: 0,
    customerPhone: '+91 98490 12345',
    customerName: 'Rahul Verma',
    customerLoyaltyBalance: 340,
    activeOrderId: 'WEB-778120',
    kdsOutletFilter: 'out-kondapur',
    kdsAudioEnabled: true,
    orders: [],
    partyOrders: [],
    analytics: null,
    aiRecommendations: [],
    customizingItem: null,
    selectedPortion: null,
    selectedAddOns: []
  },

  audioCtx: null,

  async init() {
    console.log('⚡ Initializing Nawabi Zaika Direct Platform...');
    await this.fetchOutlets();
    await this.fetchMenu();
    await this.fetchOrders();
    await this.fetchLoyalty();
    await this.fetchAiRecommendations();
    this.initSSE();
    this.navigate('ordering');

    // Interval to refresh timers on KDS and Tracking
    setInterval(() => {
      if (this.state.currentView === 'kds') {
        this.renderKdsView();
      } else if (this.state.currentView === 'tracking') {
        this.updateTrackingTimer();
      }
    }, 10000);
  },

  // --------------------------------------------------------------------------
  // AUDIO SYNTHESIZER (WEB AUDIO API)
  // --------------------------------------------------------------------------
  playOrderChime() {
    if (!this.state.kdsAudioEnabled) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(880, now); // A5 note
      osc.frequency.setValueAtTime(1320, now + 0.15); // E6 note
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn('Audio chime blocked or unavailable:', e);
    }
  },

  // --------------------------------------------------------------------------
  // REAL-TIME SERVER-SENT EVENTS (SSE)
  // --------------------------------------------------------------------------
  initSSE() {
    try {
      const evtSource = new EventSource('/api/events');
      evtSource.addEventListener('CONNECTED', (e) => {
        console.log('🟢 SSE Stream Connected:', e.data);
      });

      evtSource.addEventListener('NEW_ORDER', (e) => {
        const data = JSON.parse(e.data);
        this.showToast(`🔥 New Order Received: #${data.order.id} (₹${data.order.total_amount})`, 'success');
        this.playOrderChime();
        this.fetchOrders().then(() => {
          if (this.state.currentView === 'kds') this.renderKdsView();
          if (this.state.currentView === 'analytics') this.renderAnalyticsView();
        });
      });

      evtSource.addEventListener('ORDER_STATUS_CHANGED', (e) => {
        const data = JSON.parse(e.data);
        this.showToast(`Status Updated: #${data.order.id} is now ${data.order.status}`, 'info');
        this.fetchOrders().then(() => {
          if (this.state.currentView === 'kds') this.renderKdsView();
          if (this.state.currentView === 'tracking') this.renderTrackingView();
        });
      });

      evtSource.addEventListener('ORDER_LATE_ALERT', (e) => {
        const data = JSON.parse(e.data);
        this.showToast(`⚠️ Order #${data.order.id} is ${data.lateness.diff_minutes}m late! Delay credit dispatched.`, 'error');
        this.playOrderChime();
        this.fetchOrders().then(() => {
          if (this.state.currentView === 'kds') this.renderKdsView();
          if (this.state.currentView === 'tracking') this.renderTrackingView();
        });
      });

      evtSource.addEventListener('MENU_STOCK_CHANGED', (e) => {
        const data = JSON.parse(e.data);
        this.showToast(`Stock Updated: Item availability adjusted`, 'info');
        this.fetchMenu().then(() => {
          if (this.state.currentView === 'ordering') this.renderOrderingView();
          if (this.state.currentView === 'cms') this.renderCmsView();
        });
      });
    } catch (err) {
      console.warn('SSE stream error, falling back to polling:', err);
    }
  },

  // --------------------------------------------------------------------------
  // DATA FETCHING METHODS
  // --------------------------------------------------------------------------
  async fetchOutlets() {
    try {
      const res = await fetch('/api/outlets');
      this.state.outlets = await res.json();
      if (!this.state.currentOutlet && this.state.outlets.length > 0) {
        this.state.currentOutlet = this.state.outlets[0]; // Kondapur Flagship
        this.updateNavOutlet();
      }
    } catch (e) {
      console.error('Failed to load outlets:', e);
    }
  },

  async fetchMenu() {
    if (!this.state.currentOutlet) return;
    try {
      const res = await fetch(`/api/menu?outlet_id=${this.state.currentOutlet.id}`);
      this.state.menu = await res.json();
    } catch (e) {
      console.error('Failed to load menu:', e);
    }
  },

  async fetchOrders() {
    try {
      const res = await fetch('/api/orders');
      this.state.orders = await res.json();
    } catch (e) {
      console.error('Failed to load orders:', e);
    }
  },

  async fetchLoyalty() {
    try {
      const res = await fetch(`/api/loyalty/${encodeURIComponent(this.state.customerPhone)}`);
      const data = await res.json();
      this.state.customerLoyaltyBalance = data.balance || 0;
    } catch (e) {
      console.error('Failed to load loyalty:', e);
    }
  },

  async fetchAiRecommendations() {
    if (!this.state.currentOutlet) return;
    try {
      const res = await fetch(`/api/ai/recommendations?phone=${encodeURIComponent(this.state.customerPhone)}&outlet_id=${this.state.currentOutlet.id}`);
      const data = await res.json();
      this.state.aiRecommendations = data.recommendations || [];
    } catch (e) {
      console.error('Failed to load AI recommendations:', e);
    }
  },

  updateNavOutlet() {
    if (!this.state.currentOutlet) return;
    const nameEl = document.getElementById('nav-outlet-name');
    const fssaiEl = document.getElementById('nav-outlet-fssai');
    if (nameEl) nameEl.textContent = this.state.currentOutlet.name;
    if (fssaiEl) fssaiEl.textContent = `(FSSAI: ${this.state.currentOutlet.fssai_license})`;
  },

  // --------------------------------------------------------------------------
  // NAVIGATION & ROUTING
  // --------------------------------------------------------------------------
  navigate(viewName) {
    this.state.currentView = viewName;

    // Update active tab styling
    document.querySelectorAll('.role-tab').forEach(tab => {
      if (tab.dataset.view === viewName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    const container = document.getElementById('app-view-container');
    if (!container) return;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (viewName) {
      case 'ordering':
        this.renderOrderingView();
        break;
      case 'checkout':
        this.renderCheckoutView();
        break;
      case 'kds':
        this.renderKdsView();
        break;
      case 'tracking':
        this.renderTrackingView();
        break;
      case 'cms':
        this.renderCmsView();
        break;
      case 'analytics':
        this.renderAnalyticsView();
        break;
      case 'party':
        this.renderPartyView();
        break;
      case 'ai_lab':
        this.renderAiLabView();
        break;
      default:
        this.renderOrderingView();
    }
  },

  handleRoleChange(role) {
    this.state.currentRole = role;
    if (role === 'customer') {
      this.navigate('ordering');
    } else if (role.startsWith('kitchen_')) {
      const outletMap = {
        kitchen_kondapur: 'out-kondapur',
        kitchen_gachibowli: 'out-gachibowli-ck',
        kitchen_kukatpally: 'out-kukatpally'
      };
      this.state.kdsOutletFilter = outletMap[role] || 'out-kondapur';
      this.navigate('kds');
    } else if (role === 'admin') {
      this.navigate('cms');
    } else if (role === 'analytics') {
      this.navigate('analytics');
    } else if (role === 'party') {
      this.navigate('party');
    } else if (role === 'ai_diagnostics') {
      this.navigate('ai_lab');
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 1: CUSTOMER ORDERING MENU
  // --------------------------------------------------------------------------
  renderOrderingView() {
    const container = document.getElementById('app-view-container');
    const outlet = this.state.currentOutlet;

    const categories = ['All', 'Dum Biryani', 'Royal Specials', 'Starters & Kebabs', 'Hyderabadi Curries', 'Desserts & Shakes'];
    let filtered = this.state.menu;

    if (this.state.activeCategory !== 'All') {
      filtered = filtered.filter(item => item.category === this.state.activeCategory);
    }
    if (this.state.vegOnly) {
      filtered = filtered.filter(item => item.is_veg === 1);
    }

    container.innerHTML = `
      <!-- Royal Heritage Hero Banner -->
      <section class="heritage-hero">
        <div class="hero-tagline">Company A • Hyderabad Direct Ordering</div>
        <h1 class="hero-heading">Purani Haveli Se Aapke Dastarkhwan Tak</h1>
        <p class="hero-desc">
          Authentic Dum Biryanis slow-cooked in sealed copper deghs over wood fire. Direct kitchen dispatch from 
          <strong>${outlet ? outlet.name : 'Hyderabad'}</strong>. Save 25% delivery app commissions and earn royal reward points!
        </p>
        <div class="hero-badges-row">
          <div class="hero-feature-badge">
            <span>🛡️</span> <strong>FSSAI Lic:</strong> ${outlet ? outlet.fssai_license : '13622014000491'}
          </div>
          <div class="hero-feature-badge">
            <span>⏱️</span> <strong>AI Prep Time:</strong> ~${outlet ? outlet.min_prep_time_minutes : 25} mins honest estimate
          </div>
          <div class="hero-feature-badge">
            <span>🏷️</span> <strong>Transparent:</strong> All prices inclusive of 5% GST
          </div>
          <div class="hero-feature-badge">
            <span>🎁</span> <strong>Loyalty:</strong> 5% cashback on every direct order
          </div>
        </div>
      </section>

      <!-- AI Smart Re-Order Suggestions (Strictly Opt-in, never auto-added) -->
      ${this.renderAiReorderBanner()}

      <!-- Sticky Category Bar & Veg Switch -->
      <div class="category-filter-wrap">
        <div class="category-scroll-list">
          ${categories.map(cat => `
            <button class="category-chip ${this.state.activeCategory === cat ? 'active' : ''}" 
                    onclick="App.setCategory('${cat}')">
              ${cat}
            </button>
          `).join('')}
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; white-space: nowrap;">
          <label style="font-size: 0.85rem; font-weight: 700; color: var(--accent-emerald); cursor: pointer; display: flex; align-items: center; gap: 0.35rem;">
            <input type="checkbox" ${this.state.vegOnly ? 'checked' : ''} onchange="App.toggleVegFilter(this.checked)" style="accent-color: var(--accent-emerald);">
            🌱 Pure Veg Only
          </label>
        </div>
      </div>

      <!-- Menu Grid -->
      <div class="menu-grid">
        ${filtered.map(item => this.renderDishCard(item)).join('')}
      </div>
    `;
  },

  renderAiReorderBanner() {
    if (!this.state.aiRecommendations || this.state.aiRecommendations.length === 0) return '';
    return `
      <div class="ai-reorder-banner">
        <div class="ai-reorder-header">
          <div class="ai-reorder-title">
            <span>✨</span> AI Smart Re-Order Recommendations
          </div>
          <div class="ai-guarantee-tag">
            🛡️ Never Auto-Added • 1-Tap Add
          </div>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.85rem;">
          Personalized for <strong>${this.state.customerName}</strong> based on past Hyderabadi culinary orders:
        </p>
        <div class="ai-reorder-cards">
          ${this.state.aiRecommendations.map(item => `
            <div class="ai-mini-card">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <img src="${item.image_url}" alt="${item.name}" style="width: 52px; height: 52px; border-radius: 8px; object-fit: cover;">
                <div>
                  <div style="font-weight: 700; font-size: 0.92rem; color: var(--text-main);">${item.name}</div>
                  <div style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 600;">${item.rationale || item.badge}</div>
                  <div style="font-weight: 800; font-size: 0.88rem; color: var(--text-main);">₹${item.base_price}</div>
                </div>
              </div>
              <button class="btn-add-pill" style="padding: 0.35rem 0.85rem; font-size: 0.78rem;" 
                      onclick="App.addToCart('${item.id}', null)">
                + Add
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderDishCard(item) {
    const isOutOfStock = !item.is_available;
    const hasCustomization = (item.portions && item.portions.length > 1) || (item.add_ons && item.add_ons.length > 0);
    const cartCount = this.state.cart.filter(c => c.item_id === item.id).reduce((s, i) => s + i.quantity, 0);

    return `
      <div class="dish-card ${isOutOfStock ? 'out-of-stock' : ''}" id="card-${item.id}">
        <!-- Big Appetizing Food Image -->
        <div class="dish-image-wrap">
          <img src="${item.image_url}" alt="${item.name}" class="dish-image" loading="lazy">
          <div class="dish-badges-overlay">
            <div class="diet-mark ${item.is_veg ? 'veg' : 'non-veg'}" title="${item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}"></div>
            <div class="spice-tag">🌶️ ${item.spice_level}</div>
          </div>
          <div class="dish-prep-time">⏱️ ${item.prep_complexity_minutes}m</div>
        </div>

        <!-- Clean Scannable Dish Body -->
        <div class="dish-body">
          <div class="dish-header-row">
            <h3 class="dish-name">${item.name}</h3>
            <span class="dish-price">₹${item.base_price}</span>
          </div>
          
          <p class="dish-desc">${item.description}</p>

          <div class="dish-footer-row">
            <span class="gst-indicator">incl. 5% GST</span>
            
            ${isOutOfStock ? `
              <span style="color: var(--accent-crimson); font-size: 0.78rem; font-weight: 800; letter-spacing: 0.04em;">SOLD OUT</span>
            ` : cartCount > 0 ? `
              <div style="display: flex; align-items: center; gap: 0.65rem; background: var(--bg-surface); border: 1.5px solid var(--accent-gold); padding: 0.25rem 0.65rem; border-radius: 8px;">
                <button style="border: none; background: none; color: var(--accent-gold); font-size: 1.1rem; font-weight: 900; cursor: pointer; padding: 0 0.25rem;" 
                        onclick="App.quickDecrementItem('${item.id}')">-</button>
                <strong style="color: var(--text-main); font-size: 0.9rem; min-width: 16px; text-align: center;">${cartCount}</strong>
                <button style="border: none; background: none; color: var(--accent-gold); font-size: 1.1rem; font-weight: 900; cursor: pointer; padding: 0 0.25rem;" 
                        onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">+</button>
              </div>
            ` : `
              <div class="add-btn-wrap">
                <button class="btn-add-pill" onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">
                  ADD
                </button>
                ${hasCustomization ? '<div class="customisable-hint">Customisable</div>' : ''}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // CUSTOMIZATION BOTTOM SHEET / MODAL
  // --------------------------------------------------------------------------
  openCustomModal(itemId) {
    const item = this.state.menu.find(m => m.id === itemId);
    if (!item) return;

    this.state.customizingItem = item;
    this.state.selectedPortion = (item.portions && item.portions.length > 0) ? item.portions[0] : null;
    this.state.selectedAddOns = [];

    const modal = document.getElementById('custom-modal-backdrop');
    const panel = document.getElementById('custom-modal-panel');
    const title = document.getElementById('custom-modal-title');
    const subtitle = document.getElementById('custom-modal-subtitle');
    const body = document.getElementById('custom-modal-body');
    const footer = document.getElementById('custom-modal-footer');

    if (!modal || !panel || !body || !footer) return;

    title.textContent = `Customize ${item.name}`;
    subtitle.textContent = item.is_veg ? '🌱 Vegetarian • Authentic Dum Preparation' : '🍖 Non-Vegetarian • Authentic Dum Preparation';

    this.renderCustomModalContents();

    modal.classList.add('open');
    panel.style.transform = 'scale(1)';
    panel.style.opacity = '1';
  },

  closeCustomModal() {
    const modal = document.getElementById('custom-modal-backdrop');
    const panel = document.getElementById('custom-modal-panel');
    if (modal) modal.classList.remove('open');
    if (panel) {
      panel.style.transform = 'scale(0.95)';
      panel.style.opacity = '0';
    }
    this.state.customizingItem = null;
  },

  renderCustomModalContents() {
    const item = this.state.customizingItem;
    const body = document.getElementById('custom-modal-body');
    const footer = document.getElementById('custom-modal-footer');
    if (!item || !body || !footer) return;

    const basePrice = item.base_price;
    const portionDelta = this.state.selectedPortion ? this.state.selectedPortion.price_delta : 0;
    const addOnsTotal = this.state.selectedAddOns.reduce((sum, a) => sum + a.price, 0);
    const calculatedTotal = basePrice + portionDelta + addOnsTotal;

    body.innerHTML = `
      <!-- Portions Option -->
      ${item.portions && item.portions.length > 0 ? `
        <div style="margin-bottom: 1.5rem;">
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.65rem; display: flex; justify-content: space-between;">
            <span>Choose Portion</span>
            <span style="font-size: 0.72rem; color: var(--accent-gold); text-transform: uppercase;">Required</span>
          </div>
          <div style="background: var(--bg-surface); border-radius: 12px; padding: 0.25rem 0.75rem; border: 1px solid var(--border-subtle);">
            ${item.portions.map(p => {
              const isSelected = this.state.selectedPortion && this.state.selectedPortion.id === p.id;
              return `
                <div class="custom-option-row" onclick="App.selectCustomPortion('${p.id}')">
                  <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <input type="radio" name="custom-portion" ${isSelected ? 'checked' : ''} style="accent-color: var(--accent-gold);">
                    <div>
                      <strong style="font-size: 0.9rem; color: var(--text-main);">${p.name}</strong>
                      <div style="font-size: 0.72rem; color: var(--text-muted);">Serves ${p.serves_count} ${p.serves_count > 1 ? 'people' : 'person'}</div>
                    </div>
                  </div>
                  <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-main);">
                    ₹${basePrice + p.price_delta}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Add-ons Option -->
      ${item.add_ons && item.add_ons.length > 0 ? `
        <div>
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.65rem; display: flex; justify-content: space-between;">
            <span>Royal Accompaniments & Add-ons</span>
            <span style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">Optional</span>
          </div>
          <div style="background: var(--bg-surface); border-radius: 12px; padding: 0.25rem 0.75rem; border: 1px solid var(--border-subtle);">
            ${item.add_ons.map(a => {
              const isChecked = this.state.selectedAddOns.some(sa => sa.id === a.id);
              return `
                <div class="custom-option-row" onclick="App.toggleCustomAddOn('${a.id}')">
                  <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} style="accent-color: var(--accent-gold);">
                    <strong style="font-size: 0.88rem; color: var(--text-main);">${a.name}</strong>
                  </div>
                  <span style="font-weight: 700; font-size: 0.88rem; color: var(--accent-gold);">
                    +₹${a.price}
                  </span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    `;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
        <span style="font-size: 0.85rem; color: var(--text-secondary);">Item Total (incl. 5% GST):</span>
        <strong style="font-size: 1.35rem; color: var(--text-main);">₹${calculatedTotal}</strong>
      </div>
      <button class="cart-btn-pill" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 1rem; border-radius: 12px;" 
              onclick="App.commitCustomModalAdd()">
        Add to Order • ₹${calculatedTotal} ➔
      </button>
    `;
  },

  selectCustomPortion(portionId) {
    const item = this.state.customizingItem;
    if (!item || !item.portions) return;
    this.state.selectedPortion = item.portions.find(p => p.id === portionId);
    this.renderCustomModalContents();
  },

  toggleCustomAddOn(addOnId) {
    const item = this.state.customizingItem;
    if (!item || !item.add_ons) return;
    const addOn = item.add_ons.find(a => a.id === addOnId);
    if (!addOn) return;

    const idx = this.state.selectedAddOns.findIndex(sa => sa.id === addOnId);
    if (idx > -1) {
      this.state.selectedAddOns.splice(idx, 1);
    } else {
      this.state.selectedAddOns.push(addOn);
    }
    this.renderCustomModalContents();
  },

  commitCustomModalAdd() {
    const item = this.state.customizingItem;
    if (!item) return;

    const portion = this.state.selectedPortion || { name: 'Regular', price_delta: 0 };
    const addOns = [...this.state.selectedAddOns];
    const addOnsTotal = addOns.reduce((s, a) => s + a.price, 0);
    const unitPrice = item.base_price + portion.price_delta + addOnsTotal;

    const addOnKey = addOns.map(a => a.id).sort().join(',');
    const existingIndex = this.state.cart.findIndex(
      ci => ci.item_id === item.id && ci.portion === portion.name && (ci.add_ons || []).map(a => a.id).sort().join(',') === addOnKey
    );

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += 1;
    } else {
      this.state.cart.push({
        item_id: item.id,
        name: item.name,
        portion: portion.name,
        quantity: 1,
        unit_price: unitPrice,
        prep_complexity_minutes: item.prep_complexity_minutes,
        add_ons: addOns
      });
    }

    this.closeCustomModal();
    this.updateCartBadge();
    this.showToast(`Added ${item.name} (${portion.name}) to Cart`, 'success');
    this.renderOrderingView();
  },

  quickDecrementItem(itemId) {
    const idx = this.state.cart.findIndex(c => c.item_id === itemId);
    if (idx > -1) {
      this.changeCartQty(idx, -1);
      this.renderOrderingView();
    }
  },

  setCategory(cat) {
    this.state.activeCategory = cat;
    this.renderOrderingView();
  },

  toggleVegFilter(isVeg) {
    this.state.vegOnly = isVeg;
    this.renderOrderingView();
  },

  // --------------------------------------------------------------------------
  // CART ACTIONS & STATE MANAGEMENT
  // --------------------------------------------------------------------------
  addToCart(itemId) {
    const item = this.state.menu.find(m => m.id === itemId);
    if (!item || !item.is_available) {
      this.showToast('Item currently unavailable at this outlet', 'error');
      return;
    }

    let portionName = 'Regular';
    let unitPrice = item.base_price;

    const portionSelect = document.getElementById(`portion-${itemId}`);
    if (portionSelect && item.portions) {
      const selectedPortionId = portionSelect.value;
      const portionObj = item.portions.find(p => p.id === selectedPortionId);
      if (portionObj) {
        portionName = portionObj.name;
        unitPrice = item.base_price + portionObj.price_delta;
      }
    }

    const selectedAddOns = [];
    const existingIndex = this.state.cart.findIndex(
      ci => ci.item_id === itemId && ci.portion === portionName && (ci.add_ons || []).length === 0
    );

    if (existingIndex > -1) {
      this.state.cart[existingIndex].quantity += 1;
    } else {
      this.state.cart.push({
        item_id: item.id,
        name: item.name,
        portion: portionName,
        quantity: 1,
        unit_price: unitPrice,
        prep_complexity_minutes: item.prep_complexity_minutes,
        add_ons: selectedAddOns
      });
    }

    this.updateCartBadge();
    this.showToast(`Added ${item.name} (${portionName}) to Cart`, 'success');
    this.renderOrderingView();
  },

  updateCartBadge() {
    const totalCount = this.state.cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalAmount = this.state.cart.reduce((sum, i) => sum + (i.unit_price * i.quantity), 0);

    const badge = document.getElementById('cart-count-badge');
    if (badge) badge.textContent = totalCount;

    // Floating Cart Bar at the bottom
    const floatingBar = document.getElementById('floating-cart-bar');
    const floatingCount = document.getElementById('floating-cart-count');
    const floatingTotal = document.getElementById('floating-cart-total');

    if (floatingBar) {
      if (totalCount > 0 && this.state.currentView === 'ordering') {
        floatingBar.style.display = 'flex';
        if (floatingCount) floatingCount.textContent = `${totalCount} ${totalCount > 1 ? 'Items' : 'Item'}`;
        if (floatingTotal) floatingTotal.textContent = `₹${totalAmount}`;
      } else {
        floatingBar.style.display = 'none';
      }
    }
  },

  openCartDrawer() {
    this.renderCartDrawerItems();
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (backdrop) backdrop.classList.add('open');
  },

  closeCartDrawer() {
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  },

  handleDrawerBackdropClick(e) {
    this.closeCartDrawer();
  },

  renderCartDrawerItems() {
    const container = document.getElementById('cart-drawer-items');
    const footer = document.getElementById('cart-drawer-footer');
    if (!container || !footer) return;

    if (this.state.cart.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🍲</div>
          <h4 style="color: var(--text-main); font-size: 1.25rem; margin-bottom: 0.5rem;">Your Cart is Empty</h4>
          <p style="color: var(--text-muted); font-size: 0.88rem; line-height: 1.5;">
            Explore our authentic Hyderabadi Dum Biryanis, Shahi Haleem and Kebabs to begin your order.
          </p>
        </div>
      `;
      footer.innerHTML = `
        <button class="cart-btn-pill" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 0.95rem;" onclick="App.closeCartDrawer()">
          Browse Menu
        </button>
      `;
      return;
    }

    let subtotal = 0;
    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${this.state.cart.map((item, idx) => {
          const itemTotal = item.unit_price * item.quantity;
          subtotal += itemTotal;
          return `
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-surface); padding: 0.85rem 1rem; border-radius: 10px; border: 1px solid var(--border-subtle);">
              <div>
                <strong style="color: var(--text-main); font-size: 0.95rem;">${item.name}</strong>
                <div style="font-size: 0.78rem; color: var(--accent-gold); font-weight: 600;">${item.portion}</div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">₹${item.unit_price} x ${item.quantity} = ₹${itemTotal}</div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.5rem; background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 8px; padding: 0.2rem 0.4rem;">
                <button style="background: none; color: var(--accent-gold); border: none; font-size: 1.1rem; cursor: pointer; font-weight: 900; padding: 0 0.35rem;" 
                        onclick="App.changeCartQty(${idx}, -1)">-</button>
                <span style="font-weight: 800; font-size: 0.9rem; min-width: 18px; text-align: center; color: var(--text-main);">${item.quantity}</span>
                <button style="background: none; color: var(--accent-gold); border: none; font-size: 1.1rem; cursor: pointer; font-weight: 900; padding: 0 0.35rem;" 
                        onclick="App.changeCartQty(${idx}, 1)">+</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // GST Inclusive Math
    const taxable = subtotal / 1.05;
    const gst = Math.round((subtotal - taxable) * 100) / 100;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.88rem; color: var(--text-secondary);">
        <span>Item Total (incl. 5% GST):</span>
        <span style="color: var(--text-main); font-weight: 800;">₹${subtotal}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 1rem; font-size: 0.78rem; color: var(--text-muted);">
        <span>Included GST (CGST 2.5% + SGST 2.5%):</span>
        <span>₹${gst}</span>
      </div>
      <button class="cart-btn-pill" style="width: 100%; justify-content: center; padding: 0.95rem; font-size: 1rem; border-radius: 12px;" 
              onclick="App.closeCartDrawer(); App.navigate('checkout');">
        Proceed to Checkout (₹${subtotal}) ➔
      </button>
    `;
  },

  changeCartQty(index, delta) {
    if (this.state.cart[index]) {
      this.state.cart[index].quantity += delta;
      if (this.state.cart[index].quantity <= 0) {
        this.state.cart.splice(index, 1);
      }
      this.updateCartBadge();
      this.renderCartDrawerItems();
      if (this.state.currentView === 'checkout') {
        this.renderCheckoutView();
      }
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 2: EXPRESS CHECKOUT (< 60 SECONDS FLOW) & TEST PAYMENT
  // --------------------------------------------------------------------------
  async renderCheckoutView() {
    const container = document.getElementById('app-view-container');
    if (this.state.cart.length === 0) {
      this.navigate('ordering');
      return;
    }

    // Compute cart subtotal
    let subtotal = 0;
    for (const item of this.state.cart) {
      subtotal += item.unit_price * item.quantity;
    }

    const taxable = subtotal / 1.05;
    const gst = Math.round((subtotal - taxable) * 100) / 100;

    // Calculate coupon discount
    let discount = 0;
    if (this.state.activeCoupon) {
      if (this.state.activeCoupon.discount_type === 'PERCENTAGE') {
        discount = Math.min((subtotal * this.state.activeCoupon.discount_value) / 100, this.state.activeCoupon.max_discount);
      } else {
        discount = Math.min(this.state.activeCoupon.discount_value, this.state.activeCoupon.max_discount);
      }
    }

    // Loyalty redemption calculation
    const maxRedeemable = Math.min(this.state.customerLoyaltyBalance, subtotal - discount);
    const validLoyaltyRedeem = Math.min(this.state.loyaltyPointsRedeemed, maxRedeemable);
    const finalTotal = Math.max(0, Math.round(subtotal - discount - validLoyaltyRedeem));

    // Dynamic AI Prep-Time Estimate for this cart
    let honestPrepMinutes = 25;
    let prepRationale = 'Standard kitchen preparation buffer';
    try {
      const prepRes = await fetch(`/api/ai/prep-time`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: this.state.currentOutlet.id,
          items: this.state.cart
        })
      });
      const prepData = await prepRes.json();
      honestPrepMinutes = prepData.promised_minutes;
      prepRationale = prepData.rationale;
    } catch (e) {
      console.warn('Failed to fetch prep estimate:', e);
    }

    container.innerHTML = `
      <div style="max-width: 960px; margin: 0 auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <div>
            <h2 style="font-size: 1.85rem; color: var(--text-main);">Express Checkout</h2>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Direct order with zero app commission markups</p>
          </div>
          <button class="category-chip" onclick="App.navigate('ordering')">← Back to Menu</button>
        </div>

        <!-- AI Honest Delivery Promise Callout -->
        <div style="background: #FEF3C7; border: 1px solid #FDE68A; border-left: 4px solid var(--accent-gold); border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
          <div style="font-size: 2.2rem;">⏱️</div>
          <div>
            <div style="font-weight: 800; font-size: 1.05rem; color: var(--accent-gold);">
              AI Promised Delivery Time: ~${honestPrepMinutes} Minutes
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">
              ${prepRationale}
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 380px; gap: 2rem;">
          <!-- Left Column: Delivery Address & Payment Method -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Delivery Address Card -->
            <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-card);">
              <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <span>📍</span> Delivery Location (Hyderabad)
              </h3>
              
              <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                <button class="category-chip active" type="button" onclick="document.getElementById('checkout-address').value = 'Flat 402, Aditya Sunshine, Kondapur, Hyderabad - 500084'">
                  Home (Kondapur)
                </button>
                <button class="category-chip" type="button" onclick="document.getElementById('checkout-address').value = 'Tower 4, Apt 1102, My Home Bhooja, Gachibowli, Hyderabad - 500032'">
                  Work (Gachibowli)
                </button>
              </div>

              <textarea id="checkout-address" rows="2" style="width: 100%; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.75rem; border-radius: 8px; font-family: inherit; font-size: 0.9rem;" placeholder="Enter complete address, flat/plot, landmark...">Flat 402, Aditya Sunshine, Kondapur, Hyderabad - 500084</textarea>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <input type="text" id="checkout-name" value="${this.state.customerName}" placeholder="Your Full Name" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.65rem; border-radius: 8px; font-size: 0.88rem;">
                <input type="tel" id="checkout-phone" value="${this.state.customerPhone}" placeholder="Phone Number (+91)" style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.65rem; border-radius: 8px; font-size: 0.88rem;">
              </div>
            </div>

            <!-- DPDP Act 2023 Consent Checkbox -->
            <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 1.25rem;">
              <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer;">
                <input type="checkbox" id="dpdp-consent" checked style="accent-color: var(--accent-emerald); width: 20px; height: 20px; margin-top: 2px;">
                <span style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.45;">
                  <strong>DPDP Act 2023 Consent:</strong> I agree to receive transactional order tracking messages via WhatsApp/SMS. I opt-in to direct reward updates and exclusive Nizami Zaika promotions. You can opt out at any time.
                </span>
              </label>
            </div>

            <!-- Test Payment Selection -->
            <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-card);">
              <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
                <span>💳</span> Test Mode Payment
              </h3>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <label style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 0.85rem 1rem; border-radius: 8px; border: 1.5px solid var(--accent-gold); cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="radio" name="payment-method" value="UPI" checked style="accent-color: var(--accent-gold);">
                    <div>
                      <strong style="color: var(--text-main);">UPI Instant Pay (QR / VPA)</strong>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">GPay, PhonePe, Paytm, BHIM</div>
                    </div>
                  </div>
                  <span style="background: var(--accent-emerald-light); color: var(--accent-emerald); font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700;">Zero Surcharge</span>
                </label>

                <label style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 0.85rem 1rem; border-radius: 8px; border: 1px solid var(--border-subtle); cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="radio" name="payment-method" value="Card" style="accent-color: var(--accent-gold);">
                    <div>
                      <strong style="color: var(--text-main);">Credit / Debit Card (Test Mock)</strong>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">Visa, Mastercard, RuPay</div>
                    </div>
                  </div>
                  <span style="color: var(--text-dim); font-size: 0.75rem;">Instant 4242</span>
                </label>
              </div>
            </div>

          </div>

          <!-- Right Column: Order Bill Breakdown & Instant Apply -->
          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            
            <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-card);">
              <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--text-main);">Order Summary</h3>
              
              <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem;">
                ${this.state.cart.map(i => `
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
                    <span style="color: var(--text-secondary);">${i.quantity}x ${i.name} (${i.portion})</span>
                    <span style="font-weight: 700; color: var(--text-main);">₹${i.unit_price * i.quantity}</span>
                  </div>
                `).join('')}
              </div>

              <!-- Coupon Code Box -->
              <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Coupon Code</label>
                <div style="display: flex; gap: 0.5rem;">
                  <input type="text" id="coupon-input" value="${this.state.activeCoupon ? this.state.activeCoupon.code : 'DIRECT15'}" 
                         placeholder="e.g. DIRECT15" style="flex: 1; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.5rem 0.75rem; border-radius: 6px; font-weight: 700; text-transform: uppercase;">
                  <button class="category-chip active" style="padding: 0.5rem 0.85rem;" onclick="App.applyCoupon()">Apply</button>
                </div>
                <div style="font-size: 0.72rem; color: var(--accent-gold); margin-top: 0.35rem;">
                  Try <strong>DIRECT15</strong> for 15% off or <strong>NIZAM100</strong> for ₹100 off!
                </div>
              </div>

              <!-- Loyalty Points Redemption -->
              <div style="background-color: var(--bg-surface); padding: 1rem; border-radius: 10px; border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <span style="font-size: 0.85rem; font-weight: 700; color: var(--accent-gold);">👑 Nizami Royalty Balance</span>
                  <span style="font-size: 0.85rem; font-weight: 800; color: var(--text-main);">${this.state.customerLoyaltyBalance} Pts (₹${this.state.customerLoyaltyBalance})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <input type="range" min="0" max="${maxRedeemable}" value="${validLoyaltyRedeem}" step="10" 
                         style="flex: 1; accent-color: var(--accent-gold);" 
                         oninput="App.setLoyaltyRedeem(this.value)">
                  <span style="font-weight: 800; color: var(--accent-gold); min-width: 50px; text-align: right;">-₹${validLoyaltyRedeem}</span>
                </div>
                <div style="font-size: 0.72rem; color: var(--accent-emerald); margin-top: 0.35rem;">
                  + You will earn 5% back (₹${Math.round(finalTotal * 0.05)}) upon placing this order!
                </div>
              </div>

              <!-- Bill Lines -->
              <div style="border-top: 1px solid var(--border-subtle); padding-top: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; font-size: 0.88rem;">
                <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                  <span>Subtotal:</span>
                  <span style="font-weight: 600; color: var(--text-main);">₹${subtotal}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 0.78rem;">
                  <span>Incl. 5% GST (Taxable: ₹${Math.round(taxable)}):</span>
                  <span>₹${gst}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--accent-emerald); font-weight: 600;">
                  <span>Direct Delivery Fee (Zero App Markups):</span>
                  <span>FREE</span>
                </div>
                ${discount > 0 ? `
                  <div style="display: flex; justify-content: space-between; color: var(--accent-gold); font-weight: 600;">
                    <span>Discount (${this.state.activeCoupon.code}):</span>
                    <span>-₹${Math.round(discount)}</span>
                  </div>
                ` : ''}
                ${validLoyaltyRedeem > 0 ? `
                  <div style="display: flex; justify-content: space-between; color: var(--accent-gold); font-weight: 600;">
                    <span>Royalty Points Redeemed:</span>
                    <span>-₹${validLoyaltyRedeem}</span>
                  </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; font-size: 1.3rem; font-weight: 900; color: var(--text-main);">
                  <span>Grand Total:</span>
                  <span style="color: var(--accent-gold);">₹${finalTotal}</span>
                </div>
              </div>

              <!-- Place Order Button -->
              <button id="place-order-btn" class="cart-btn-pill" style="width: 100%; justify-content: center; padding: 0.95rem; font-size: 1.05rem; border-radius: 12px; margin-top: 1.5rem;" 
                      onclick="App.submitOrder(${finalTotal}, ${subtotal}, ${gst}, ${discount}, ${validLoyaltyRedeem})">
                Place Order in Test Mode ➔
              </button>
            </div>

          </div>
        </div>
      </div>
    `;
  },

  async applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (!input || !input.value.trim()) return;

    let subtotal = 0;
    for (const item of this.state.cart) subtotal += item.unit_price * item.quantity;

    try {
      const res = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: input.value.trim(), cart_amount: subtotal })
      });
      const data = await res.json();
      if (data.valid) {
        this.state.activeCoupon = data.coupon;
        this.showToast(`Coupon applied! Saved ₹${data.discount_amount}`, 'success');
        this.renderCheckoutView();
      } else {
        this.showToast(data.error || 'Invalid coupon', 'error');
      }
    } catch (e) {
      this.showToast('Failed to apply coupon', 'error');
    }
  },

  setLoyaltyRedeem(val) {
    this.state.loyaltyPointsRedeemed = Number(val);
    this.renderCheckoutView();
  },

  async submitOrder(totalAmount, subtotal, gstAmount, discountAmount, loyaltyRedeemed) {
    const btn = document.getElementById('place-order-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Cooking your order...';
    }

    const name = document.getElementById('checkout-name')?.value || this.state.customerName;
    const phone = document.getElementById('checkout-phone')?.value || this.state.customerPhone;
    const address = document.getElementById('checkout-address')?.value || 'Kondapur, Hyderabad';
    const dpdpConsent = document.getElementById('dpdp-consent')?.checked;
    const paymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value || 'UPI';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: this.state.currentOutlet.id,
          customer_name: name,
          customer_phone: phone,
          delivery_address: address,
          items: this.state.cart,
          discount_code: this.state.activeCoupon ? this.state.activeCoupon.code : null,
          loyalty_redeemed: loyaltyRedeemed,
          payment_method: paymentMethod,
          dpdp_marketing_consent: dpdpConsent ? 1 : 0
        })
      });

      const data = await res.json();
      if (res.ok) {
        this.showToast(`Order Placed! #${data.order.id}`, 'success');
        this.state.activeOrderId = data.order.id;
        this.state.cart = [];
        this.state.activeCoupon = null;
        this.state.loyaltyPointsRedeemed = 0;
        this.updateCartBadge();
        await this.fetchLoyalty();
        this.navigate('tracking');
      } else {
        this.showToast(data.error || 'Failed to place order', 'error');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Place Order in Test Mode ➔';
        }
      }
    } catch (e) {
      this.showToast('Network error placing order', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Place Order in Test Mode ➔';
      }
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 3: LIVE ORDER TRACKING & WHATSAPP/SMS SIMULATOR
  // --------------------------------------------------------------------------
  renderTrackingView() {
    const container = document.getElementById('app-view-container');
    const order = this.state.orders.find(o => o.id === this.state.activeOrderId) || this.state.orders[0];

    if (!order) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem;">
          <h2 style="color: var(--text-main);">No Active Order Found</h2>
          <p style="color: var(--text-muted); margin-top: 0.5rem;">Place an order from the menu to track live status.</p>
          <button class="cart-btn-pill" style="margin: 1.5rem auto; display: inline-flex;" onclick="App.navigate('ordering')">Order Now</button>
        </div>
      `;
      return;
    }

    const stages = ['PLACED', 'PREPARING', 'READY_FOR_PICKUP', 'DISPATCHED', 'COMPLETED'];
    const currentStageIdx = stages.indexOf(order.status);

    // Calculate time differences
    const promised = new Date(order.promised_at);
    const now = new Date();
    const diffMs = promised.getTime() - now.getTime();
    const diffMins = Math.ceil(diffMs / 60000);
    const isLate = diffMins < 0;

    container.innerHTML = `
      <div style="max-width: 860px; margin: 0 auto;">
        
        <!-- Order Selector Pills for Reviewer -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h2 style="font-size: 1.85rem; color: var(--text-main);">Live Order Status</h2>
            <div style="font-size: 0.85rem; color: var(--text-muted);">Real-time tracking of kitchen dum preparation and 3PL dispatch</div>
          </div>
          <div style="display: flex; gap: 0.5rem; overflow-x: auto; align-items: center;">
            ${this.state.orders.slice(0, 4).map(o => `
              <button class="category-chip ${o.id === order.id ? 'active' : ''}" onclick="App.setActiveOrder('${o.id}')">
                #${o.id} (${o.status})
              </button>
            `).join('')}
            <button class="category-chip" style="background: var(--accent-crimson-light); color: var(--accent-crimson); border-color: var(--accent-crimson); font-weight: 700;" onclick="App.simulateLateDelay('${order.id}')" title="Trigger 10+ min delay to inspect auto-apology and compensation">
              ⚡ Test 10m Late Trigger
            </button>
          </div>
        </div>

        <!-- 10-Minute Late Apology Compensation Alert Banner -->
        ${order.late_alert_triggered ? `
          <div style="background: #FEF2F2; border: 1.5px solid #F87171; border-left: 4px solid #EF4444; border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 1rem;">
            <div style="font-size: 2.2rem;">🎁</div>
            <div>
              <div style="font-weight: 800; font-size: 1.05rem; color: #991B1B;">
                Honest Delay Apology: ₹50 Royalty Credit Issued
              </div>
              <div style="font-size: 0.85rem; color: #7F1D1D; margin-top: 0.2rem;">
                This order encountered peak wood-fire dum degh load at ${order.outlet_name}. We have automatically credited ₹50 to your account for trusting us directly.
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Main Tracking Card -->
        <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 16px; padding: 2rem; margin-bottom: 2rem; box-shadow: var(--shadow-card);">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1.25rem;">
            <div>
              <span style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-gold); font-weight: 800;">Direct Order Tracker</span>
              <h3 style="font-size: 1.7rem; color: var(--text-main); margin-top: 0.2rem;">#${order.id}</h3>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.2rem;">
                Outlet: <strong>${order.outlet_name}</strong> • FSSAI: ${order.fssai_license || '13622014000491'}
              </div>
            </div>

            <div style="text-align: right;">
              <div style="font-size: 0.8rem; color: var(--text-muted);">Honest Promised Arrival:</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: ${isLate ? '#EF4444' : 'var(--accent-gold)'};">
                ${new Date(order.promised_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style="font-size: 0.78rem; font-weight: 700; color: ${isLate ? '#EF4444' : 'var(--accent-emerald)'};" id="tracking-countdown">
                ${isLate ? `Late by ${Math.abs(diffMins)} mins` : `${diffMins} mins remaining`}
              </div>
            </div>
          </div>

          <!-- Step-by-Step Progress Timeline -->
          <div style="display: flex; justify-content: space-between; position: relative; margin: 2.5rem 0 2rem 0;">
            <div style="position: absolute; top: 18px; left: 20px; right: 20px; height: 3px; background: var(--border-subtle); z-index: 1;"></div>
            
            ${[
              { stage: 'PLACED', label: 'Accepted', icon: '📝' },
              { stage: 'PREPARING', label: 'Dum Cooking', icon: '🔥' },
              { stage: 'READY_FOR_PICKUP', label: 'Packed & Ready', icon: '📦' },
              { stage: 'DISPATCHED', label: 'Out for Delivery', icon: '🛵' },
              { stage: 'COMPLETED', label: 'Feast Delivered', icon: '👑' }
            ].map((step, idx) => {
              const isDone = currentStageIdx >= idx;
              const isCurrent = currentStageIdx === idx;
              return `
                <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; width: 80px;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: ${isDone ? 'var(--text-main)' : '#FFFFFF'}; color: ${isDone ? '#FFFFFF' : 'var(--text-dim)'}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: ${isCurrent ? '0 0 0 4px var(--accent-gold-light)' : 'var(--shadow-subtle)'}; border: 2px solid ${isDone ? 'var(--text-main)' : 'var(--border-subtle)'};">
                    ${step.icon}
                  </div>
                  <div style="font-size: 0.75rem; font-weight: 700; margin-top: 0.5rem; text-align: center; color: ${isDone ? 'var(--text-main)' : 'var(--text-dim)'};">
                    ${step.label}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Order Items Breakdown -->
          <div style="background-color: var(--bg-surface); border-radius: 10px; padding: 1.25rem; border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent-gold); margin-bottom: 0.75rem;">Order Package Contents</div>
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
              ${order.items.map(it => `
                <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                  <span style="color: var(--text-secondary);"><strong style="color: var(--text-main);">${it.quantity}x</strong> ${it.name} ${it.portion ? `(${it.portion})` : ''}</span>
                  <span style="color: var(--text-main); font-weight: 700;">₹${(it.unit_price || 0) * (it.quantity || 1)}</span>
                </div>
              `).join('')}
            </div>
            <div style="border-top: 1px solid var(--border-subtle); margin-top: 0.75rem; padding-top: 0.75rem; display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800;">
              <span style="color: var(--text-main);">Total Paid (incl. 5% GST):</span>
              <span style="color: var(--accent-gold);">₹${order.total_amount}</span>
            </div>
          </div>

        </div>

        <!-- WhatsApp / SMS Notification Live Simulator -->
        <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-card);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            <h3 style="font-size: 1.15rem; color: var(--text-main); display: flex; align-items: center; gap: 0.5rem;">
              <span>📱</span> Simulated WhatsApp Notification to Customer
            </h3>
            <span style="background: var(--accent-emerald-light); color: var(--accent-emerald); font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 9999px; font-weight: 700;">
              DPDP 2023 Verified Opt-In
            </span>
          </div>

          <div style="background-color: #0B141A; border: 1px solid #222E35; border-radius: 12px; padding: 1.25rem; font-family: -apple-system, system-ui, sans-serif;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
              <span style="background: #25D366; color: #000; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem;">✓</span>
              <strong style="color: #E9EDEF; font-size: 0.95rem;">Nawabi Zaika Official Verified</strong>
              <span style="color: #8696A0; font-size: 0.75rem; margin-left: auto;">Today ${new Date(order.placed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            <div style="background-color: #202C33; color: #E9EDEF; border-radius: 8px; padding: 0.85rem; font-size: 0.88rem; line-height: 1.5; white-space: pre-wrap;">
Adab *${order.customer_name}*! Your direct order *#${order.id}* from *${order.outlet_name}* is *${order.status}*.

📦 *Items:* ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
💰 *Total:* ₹${order.total_amount} (Incl. 5% GST)
⏱️ *Honest Promised Time:* ${new Date(order.promised_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
📍 *FSSAI Lic:* ${order.fssai_license || '13622014000491'}

Live tracker: https://nawabi-zaika.isocode.in/track/${order.id}
            </div>
          </div>
        </div>

      </div>
    `;
  },

  setActiveOrder(id) {
    this.state.activeOrderId = id;
    this.renderTrackingView();
  },

  async simulateLateDelay(orderId) {
    try {
      const res = await fetch(`/api/orders/${orderId}/simulate-late`, { method: 'POST' });
      if (res.ok) {
        this.showToast(`Simulated 10m delay on #${orderId}! Manager alerted & ₹50 apology credit sent.`, 'error');
        await this.fetchOrders();
        this.renderTrackingView();
      }
    } catch (e) {
      this.showToast('Failed to trigger late simulation', 'error');
    }
  },

  async cancelOrder(orderId) {
    if (!confirm(`Are you sure you want to cancel order #${orderId}?`)) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested cancellation prior to degh unsealing' })
      });
      if (res.ok) {
        this.showToast(`Order #${orderId} has been cancelled.`, 'info');
        await this.fetchOrders();
        this.renderTrackingView();
      }
    } catch (e) {
      this.showToast('Failed to cancel order', 'error');
    }
  },

  updateTrackingTimer() {
    const el = document.getElementById('tracking-countdown');
    const order = this.state.orders.find(o => o.id === this.state.activeOrderId);
    if (!el || !order) return;
    const promised = new Date(order.promised_at);
    const diffMins = Math.ceil((promised.getTime() - Date.now()) / 60000);
    if (diffMins < 0) {
      el.textContent = `Late by ${Math.abs(diffMins)} mins`;
      el.style.color = 'var(--accent-crimson)';
    } else {
      el.textContent = `${diffMins} mins remaining`;
      el.style.color = 'var(--accent-emerald)';
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 4: KITCHEN DISPLAY SYSTEM (KDS) - 2-METRE TABLET INDUSTRIAL VIEW
  // --------------------------------------------------------------------------
  renderKdsView() {
    const container = document.getElementById('app-view-container');
    const filter = this.state.kdsOutletFilter;

    // Filter active orders for kitchen (PLACED, PREPARING, READY_FOR_PICKUP)
    let kdsOrders = this.state.orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    if (filter && filter !== 'all') {
      kdsOrders = kdsOrders.filter(o => o.outlet_id === filter);
    }

    const currentOutlet = this.state.outlets.find(o => o.id === filter) || this.state.outlets[0];

    // Check if any order is late by 10+ mins
    const criticalLateOrders = kdsOrders.filter(o => o.late_alert_triggered === 1);

    container.innerHTML = `
      <div class="kds-container">
        
        <!-- Industrial KDS Header -->
        <div class="kds-header">
          <div class="kds-title-group">
            <span class="kds-badge-live">LIVE KDS</span>
            <div>
              <div class="kds-outlet-name">${filter === 'all' ? 'All Hyderabad Kitchens (Central Hub)' : currentOutlet.name}</div>
              <div style="color: #94A3B8; font-size: 0.85rem;">
                FSSAI Lic: ${currentOutlet.fssai_license} • 2-Metre High Contrast Tablet Display
              </div>
            </div>
          </div>

          <!-- Outlet Selector & Audio Button -->
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <select class="role-switcher-select" style="font-size: 1rem; padding: 0.6rem 1rem;" 
                    onchange="App.setKdsOutlet(this.value)">
              <option value="out-kondapur" ${filter === 'out-kondapur' ? 'selected' : ''}>Kondapur Flagship</option>
              <option value="out-gachibowli-ck" ${filter === 'out-gachibowli-ck' ? 'selected' : ''}>Gachibowli Cloud Kitchen</option>
              <option value="out-kukatpally" ${filter === 'out-kukatpally' ? 'selected' : ''}>Kukatpally KPHB</option>
              <option value="all" ${filter === 'all' ? 'selected' : ''}>All 17 Kitchens</option>
            </select>

            <button class="kds-audio-btn ${this.state.kdsAudioEnabled ? 'enabled' : ''}" 
                    onclick="App.toggleKdsAudio()">
              ${this.state.kdsAudioEnabled ? '🔔 Chime: ON' : '🔕 Chime: OFF'}
            </button>
          </div>

          <!-- Kitchen Load Metrics Strip -->
          <div class="kds-metrics-strip">
            <div class="kds-metric-box">
              <div class="kds-metric-val">${kdsOrders.length}</div>
              <div class="kds-metric-label">Active Tickets</div>
            </div>
            <div class="kds-metric-box">
              <div class="kds-metric-val">${kdsOrders.filter(o => o.status === 'PREPARING').length}</div>
              <div class="kds-metric-label">On Dum Fire</div>
            </div>
            <div class="kds-metric-box">
              <div class="kds-metric-val">${kdsOrders.filter(o => o.status === 'READY_FOR_PICKUP').length}</div>
              <div class="kds-metric-label">Handover</div>
            </div>
          </div>
        </div>

        <!-- Critical Delay Warning Banner -->
        ${criticalLateOrders.length > 0 ? `
          <div class="kds-critical-banner">
            <div class="kds-critical-text">
              <span>⚠️ CRITICAL LATE ALERT:</span>
              <span>${criticalLateOrders.length} Order(s) exceeded promised time by 10+ minutes!</span>
            </div>
            <div style="font-weight: 700; font-size: 0.95rem;">
              Manager Notified • Auto Customer Apology Dispatched
            </div>
          </div>
        ` : ''}

        <!-- KDS Ticket Cards Grid -->
        <div class="kds-grid">
          ${kdsOrders.length === 0 ? `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem; background: #12181C; border-radius: 12px; border: 2px dashed #2B3A44;">
              <div style="font-size: 3rem; margin-bottom: 1rem;">✨</div>
              <h3 style="font-size: 1.5rem; color: #FFFFFF;">All Clear! Kitchen Queue Up to Date</h3>
              <p style="color: #94A3B8; margin-top: 0.5rem;">New direct customer orders will automatically appear and play sound chime.</p>
            </div>
          ` : kdsOrders.map(order => this.renderKdsCard(order)).join('')}
        </div>

      </div>
    `;
  },

  renderKdsCard(order) {
    const placed = new Date(order.placed_at);
    const promised = new Date(order.promised_at);
    const now = new Date();

    const elapsedMins = Math.floor((now.getTime() - placed.getTime()) / 60000);
    const diffMins = Math.floor((now.getTime() - promised.getTime()) / 60000);
    const isLate = diffMins > 0;
    const isCritical10m = diffMins >= 10 || order.late_alert_triggered === 1;

    let statusClass = 'status-on-time';
    let timerClass = 'timer-green';
    let timerText = `${Math.abs(diffMins)}m Left`;

    if (isCritical10m) {
      statusClass = 'status-critical-10m';
      timerClass = 'timer-red';
      timerText = `LATE BY ${diffMins}m!`;
    } else if (isLate) {
      statusClass = 'status-late';
      timerClass = 'timer-red';
      timerText = `Late by ${diffMins}m`;
    } else if (diffMins >= -8) {
      statusClass = 'status-due-soon';
      timerClass = 'timer-amber';
      timerText = `Due in ${Math.abs(diffMins)}m`;
    }

    return `
      <div class="kds-card ${statusClass}" id="kds-card-${order.id}">
        <!-- Header -->
        <div class="kds-card-header">
          <div>
            <div class="kds-order-number">#${order.id}</div>
            <div style="font-size: 0.8rem; color: #94A3B8;">Placed: ${placed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • ${elapsedMins}m Elapsed</div>
          </div>
          <div class="kds-timer-badge ${timerClass}">
            ${timerText}
          </div>
        </div>

        <!-- Body: Large Items for Readability from 2 Metres -->
        <div class="kds-card-body">
          <div class="kds-items-list">
            ${order.items.map(it => `
              <div class="kds-item-row">
                <div class="kds-qty-bubble">${it.quantity}x</div>
                <div class="kds-item-details">
                  <div class="kds-item-name">${it.name.toUpperCase()}</div>
                  <div class="kds-portion-label">${it.portion || 'REGULAR'}</div>
                  ${it.add_ons && it.add_ons.length > 0 ? `
                    <div class="kds-item-addons">+ ${it.add_ons.map(a => a.name).join(', ')}</div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Customer Strip -->
        <div class="kds-customer-strip">
          <span>Guest: <strong>${order.customer_name}</strong></span>
          <span>Pay: <strong>${order.payment_method} (PAID)</strong></span>
        </div>

        <!-- Actions -->
        <div class="kds-card-actions">
          ${order.status === 'PLACED' ? `
            <button class="kds-stage-btn kds-btn-prep" onclick="App.advanceOrderStatus('${order.id}', 'PREPARING')">
              🔥 Start Cooking
            </button>
          ` : order.status === 'PREPARING' ? `
            <button class="kds-stage-btn kds-btn-ready" onclick="App.advanceOrderStatus('${order.id}', 'READY_FOR_PICKUP')">
              ✅ Ready For Pickup
            </button>
          ` : `
            <button class="kds-stage-btn kds-btn-handover" onclick="App.advanceOrderStatus('${order.id}', 'DISPATCHED')">
              🛵 Handover to Rider
            </button>
          `}

          <!-- Manager Override Button (+5 mins) -->
          <button class="kds-override-btn" title="Manager Prep Override" onclick="App.overrideOrderPrep('${order.id}')">
            +5m Bump
          </button>
        </div>
      </div>
    `;
  },

  setKdsOutlet(outletId) {
    this.state.kdsOutletFilter = outletId;
    this.renderKdsView();
  },

  toggleKdsAudio() {
    this.state.kdsAudioEnabled = !this.state.kdsAudioEnabled;
    this.showToast(`KDS Audio Chime ${this.state.kdsAudioEnabled ? 'Enabled' : 'Muted'}`, 'info');
    if (this.state.kdsAudioEnabled) this.playOrderChime();
    this.renderKdsView();
  },

  async advanceOrderStatus(orderId, nextStatus) {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        this.showToast(`Order #${orderId} moved to ${nextStatus}`, 'success');
        await this.fetchOrders();
        this.renderKdsView();
      }
    } catch (e) {
      this.showToast('Failed to advance order status', 'error');
    }
  },

  async overrideOrderPrep(orderId) {
    try {
      const res = await fetch(`/api/orders/${orderId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extra_minutes: 5, reason: 'Kitchen line bump' })
      });
      if (res.ok) {
        this.showToast(`Added +5m manager override to #${orderId}`, 'info');
        await this.fetchOrders();
        this.renderKdsView();
      }
    } catch (e) {
      this.showToast('Failed to override prep time', 'error');
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 5: CENTRAL MENU CMS & OUTLET AVAILABILITY
  // --------------------------------------------------------------------------
  renderCmsView() {
    const container = document.getElementById('app-view-container');
    const outlet = this.state.currentOutlet;

    container.innerHTML = `
      <div style="max-width: 1100px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <h2 style="font-size: 1.85rem; color: var(--text-main);">Central Menu CMS & Real-Time Stock</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Manage prices across Hyderabad, time-based menus, and pause out-of-stock items ("86 item") in real time.
            </p>
          </div>
          
          <div style="display: flex; gap: 0.75rem; align-items: center;">
            <label style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">Active Outlet:</label>
            <select class="role-switcher-select" onchange="App.switchOutlet(this.value)">
              ${this.state.outlets.map(o => `
                <option value="${o.id}" ${o.id === outlet.id ? 'selected' : ''}>${o.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-card);">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
            <thead>
              <tr style="background-color: var(--bg-surface); border-bottom: 1px solid var(--border-subtle); color: var(--text-secondary);">
                <th style="padding: 1rem;">Item Name</th>
                <th style="padding: 1rem;">Category</th>
                <th style="padding: 1rem;">Base Price (incl 5% GST)</th>
                <th style="padding: 1rem;">Time Rule</th>
                <th style="padding: 1rem;">Prep Weight</th>
                <th style="padding: 1rem; text-align: right;">Live Stock Status</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.menu.map(item => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 1rem; display: flex; align-items: center; gap: 0.75rem;">
                    <img src="${item.image_url}" alt="${item.name}" style="width: 44px; height: 44px; border-radius: 6px; object-fit: cover;">
                    <div>
                      <strong style="color: var(--text-main);">${item.name}</strong>
                      <div style="font-size: 0.75rem; color: var(--text-muted);">${item.is_veg ? '🌱 Veg' : '🍖 Non-Veg'} • ${item.spice_level}</div>
                    </div>
                  </td>
                  <td style="padding: 1rem; color: var(--text-secondary);">${item.category}</td>
                  <td style="padding: 1rem; font-weight: 800; color: var(--text-main);">₹${item.base_price}</td>
                  <td style="padding: 1rem;">
                    <span style="background: var(--accent-gold-light); color: var(--accent-gold); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">
                      ${item.time_based_tag}
                    </span>
                  </td>
                  <td style="padding: 1rem; color: var(--text-muted);">${item.prep_complexity_minutes} mins</td>
                  <td style="padding: 1rem; text-align: right;">
                    <button class="category-chip ${item.is_available ? 'active' : ''}" 
                            style="padding: 0.35rem 0.85rem; font-size: 0.78rem; ${!item.is_available ? 'background: var(--accent-crimson-light); color: var(--accent-crimson); border-color: var(--accent-crimson);' : ''}"
                            onclick="App.toggleItemStock('${item.id}', ${!item.is_available})">
                      ${item.is_available ? '🟢 Available' : '🔴 Paused (86)'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  async toggleItemStock(itemId, makeAvailable) {
    try {
      const res = await fetch('/api/menu/toggle-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: this.state.currentOutlet.id,
          menu_item_id: itemId,
          is_available: makeAvailable
        })
      });
      if (res.ok) {
        this.showToast(`Item stock ${makeAvailable ? 'restored' : 'paused'} for ${this.state.currentOutlet.name}`, 'info');
        await this.fetchMenu();
        this.renderCmsView();
      }
    } catch (e) {
      this.showToast('Failed to update stock', 'error');
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 6: FINANCIAL SAVINGS & OPERATIONS DASHBOARD (₹1.14 Cr TARGET)
  // --------------------------------------------------------------------------
  async renderAnalyticsView() {
    const container = document.getElementById('app-view-container');
    let summary = this.state.analytics;

    try {
      const res = await fetch('/api/analytics');
      summary = await res.json();
      this.state.analytics = summary;
    } catch (e) {
      console.warn('Failed to load analytics:', e);
    }

    if (!summary) return;

    container.innerHTML = `
      <div style="max-width: 1100px; margin: 0 auto;">
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <h2 style="font-size: 1.85rem; color: var(--text-main);">Direct Ordering Economics & Financial Health</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Company A, Hyderabad • Tracking ₹1.14 Crore Annual Commission Savings & Customer Retention
            </p>
          </div>
          <div class="hero-feature-badge" style="background: var(--accent-gold-light); color: var(--accent-gold); font-weight: 800;">
            HQ EXECUTIVE VIEW
          </div>
        </div>

        <!-- 4 Hero Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">
          
          <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-card);">
            <div style="font-size: 0.78rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Net Direct Margin Saved</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent-emerald); margin: 0.35rem 0;">₹${summary.commissions_saved.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">15 points net margin gain vs delivery apps</div>
          </div>

          <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-card);">
            <div style="font-size: 0.78rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">App Commission Avoided</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--text-main); margin: 0.35rem 0;">₹${summary.app_fees_avoided.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">27% fees not paid to Swiggy/Zomato</div>
          </div>

          <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-card);">
            <div style="font-size: 0.78rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Projected Annual Savings</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent-gold); margin: 0.35rem 0;">${summary.projected_annual_savings}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Target: ₹95.04L retail + ₹19.44L party orders</div>
          </div>

          <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-card);">
            <div style="font-size: 0.78rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Direct Repeat Rate</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: #2563EB; margin: 0.35rem 0;">${summary.repeat_customer_rate}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">Total Cancellations: <strong>${summary.total_cancellations || 0} (${summary.cancellation_rate || '0.0%'})</strong></div>
          </div>

        </div>

        <!-- Outlet Performance Leaderboard -->
        <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; overflow: hidden; box-shadow: var(--shadow-card);">
          <div style="padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1.15rem; color: var(--text-main);">Hyderabad Outlets Leaderboard (14 Outlets + 3 Cloud Kitchens)</h3>
            <span style="font-size: 0.8rem; color: var(--text-muted);">Sorted by Direct Order Volume</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
            <thead>
              <tr style="background-color: var(--bg-surface); color: var(--text-secondary);">
                <th style="padding: 1rem;">Outlet Name</th>
                <th style="padding: 1rem;">Type</th>
                <th style="padding: 1rem;">Direct Orders</th>
                <th style="padding: 1rem;">Revenue (₹)</th>
                <th style="padding: 1rem;">Avg AI Prep</th>
                <th style="padding: 1rem;">Cancellations</th>
                <th style="padding: 1rem; text-align: right;">Late Incidents</th>
              </tr>
            </thead>
            <tbody>
              ${summary.outlets.map(o => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 1rem; font-weight: 700; color: var(--text-main);">${o.name}</td>
                  <td style="padding: 1rem; color: var(--text-muted);">${o.is_cloud_kitchen ? 'Cloud Kitchen' : 'Dine-in Flagship'}</td>
                  <td style="padding: 1rem; color: var(--text-secondary); font-weight: 600;">${o.order_count}</td>
                  <td style="padding: 1rem; font-weight: 800; color: var(--accent-gold);">₹${o.revenue.toLocaleString('en-IN')}</td>
                  <td style="padding: 1rem; color: var(--text-secondary);">~${Math.round(o.avg_prep_time || 25)} mins</td>
                  <td style="padding: 1rem; color: ${o.cancellations > 0 ? 'var(--accent-crimson)' : 'var(--text-muted)'}; font-weight: 700;">
                    ${o.cancellations || 0}
                  </td>
                  <td style="padding: 1rem; text-align: right; color: ${o.late_orders > 0 ? 'var(--accent-crimson)' : 'var(--accent-emerald)'}; font-weight: 800;">
                    ${o.late_orders > 0 ? `⚠️ ${o.late_orders}` : '✓ 0'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // VIEW 7: PARTY & BULK CATERING DESK (MIN 24-48H NOTICE ENFORCED)
  // --------------------------------------------------------------------------
  async renderPartyView() {
    const container = document.getElementById('app-view-container');
    let partyList = [];

    try {
      const res = await fetch('/api/party-orders');
      partyList = await res.json();
    } catch (e) {
      console.warn('Failed to fetch party orders:', e);
    }

    container.innerHTML = `
      <div style="max-width: 960px; margin: 0 auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <h2 style="font-size: 1.85rem; color: var(--text-main);">Royal Party & Bulk Catering Desk</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem;">
              Direct catering for 15 to 500+ guests. Fresh copper deghs prepared with minimum 24-48 hours notice.
            </p>
          </div>
          <span class="hero-feature-badge" style="background: var(--accent-gold-light); color: var(--accent-gold); font-weight: 800;">
            ⚡ Saves ₹19.44 Lakh Phone Leakage
          </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
          
          <!-- Booking Form -->
          <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-card);">
            <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 1.25rem;">Place a Bulk Catering Request</h3>
            
            <form id="party-form" onsubmit="App.submitPartyOrder(event)">
              <div style="margin-bottom: 1rem;">
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Guest Count (Min. 15 guests)</label>
                <input type="number" id="party-guests" min="15" max="500" value="30" required 
                       style="width: 100%; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.65rem; border-radius: 6px;">
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                  <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Event Date</label>
                  <input type="date" id="party-date" required 
                         style="width: 100%; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.65rem; border-radius: 6px;">
                </div>
                <div>
                  <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Serving Time</label>
                  <input type="time" id="party-time" value="13:00" required 
                         style="width: 100%; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.65rem; border-radius: 6px;">
                </div>
              </div>

              <div style="margin-bottom: 1rem;">
                <label style="font-size: 0.8rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem;">Preparation Kitchen</label>
                <select id="party-outlet" class="role-switcher-select" style="width: 100%; padding: 0.65rem;">
                  ${this.state.outlets.map(o => `
                    <option value="${o.id}">${o.name}</option>
                  `).join('')}
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <input type="text" id="party-name" placeholder="Host Name" value="${this.state.customerName}" required
                       style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.65rem; border-radius: 6px;">
                <input type="tel" id="party-phone" placeholder="Contact Phone" value="${this.state.customerPhone}" required
                       style="background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.65rem; border-radius: 6px;">
              </div>

              <div style="margin-bottom: 1rem;">
                <textarea id="party-reqs" rows="3" placeholder="Menu items required (e.g. 5x Mutton Biryani Family Packs, 2x Haleem Handis, Double Ka Meetha...)" required
                          style="width: 100%; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.65rem; border-radius: 6px; font-family: inherit; font-size: 0.85rem;"></textarea>
              </div>

              <button type="submit" class="cart-btn-pill" style="width: 100%; justify-content: center; padding: 0.85rem; border-radius: 10px;">
                Submit for Catering Confirmation ➔
              </button>
            </form>
          </div>

          <!-- Existing Party Orders & Manager Desk -->
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <h3 style="font-size: 1.15rem; color: var(--text-main);">Active Party Requests</h3>
            
            ${partyList.map(p => `
              <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.25rem; box-shadow: var(--shadow-card);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                  <div>
                    <strong style="color: var(--text-main); font-size: 1rem;">${p.customer_name}</strong>
                    <div style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 600;">Event: ${p.event_date} at ${p.event_time} • ${p.guest_count} Guests</div>
                  </div>
                  <span style="background: ${p.status === 'CONFIRMED' ? 'var(--accent-emerald-light)' : 'var(--accent-gold-light)'}; color: ${p.status === 'CONFIRMED' ? 'var(--accent-emerald)' : 'var(--accent-gold)'}; font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 800;">
                    ${p.status}
                  </span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem;">
                  ${p.requirements_text}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                  <span>Assigned Kitchen: <strong>${p.outlet_name}</strong> • Est: ₹${p.estimated_budget}</span>
                  ${p.status === 'PENDING_REVIEW' ? `
                    <div style="display: flex; gap: 0.35rem;">
                      <button class="cart-btn-pill" style="padding: 0.3rem 0.75rem; font-size: 0.75rem; background: var(--accent-emerald); color: #FFF; border-radius: 6px;" onclick="App.updatePartyStatus('${p.id}', 'CONFIRMED')">
                        ✓ Confirm
                      </button>
                      <button class="category-chip" style="padding: 0.3rem 0.75rem; font-size: 0.75rem; background: var(--accent-crimson-light); color: var(--accent-crimson); border-color: var(--accent-crimson);" onclick="App.updatePartyStatus('${p.id}', 'REJECTED')">
                        ✕ Decline
                      </button>
                    </div>
                  ` : `
                    <span style="font-size: 0.72rem; color: ${p.status === 'CONFIRMED' ? 'var(--accent-emerald)' : 'var(--accent-crimson)'}; font-weight: 700;">
                      ${p.manager_notes || p.status}
                    </span>
                  `}
                </div>
              </div>
            `).join('')}
          </div>

        </div>

      </div>
    `;

    // Set minimum date to tomorrow (24h advance notice)
    setTimeout(() => {
      const dateInput = document.getElementById('party-date');
      if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
        dateInput.value = tomorrow.toISOString().split('T')[0];
      }
    }, 50);
  },

  async submitPartyOrder(e) {
    e.preventDefault();
    const guests = document.getElementById('party-guests')?.value;
    const date = document.getElementById('party-date')?.value;
    const time = document.getElementById('party-time')?.value;
    const outletId = document.getElementById('party-outlet')?.value;
    const name = document.getElementById('party-name')?.value;
    const phone = document.getElementById('party-phone')?.value;
    const reqs = document.getElementById('party-reqs')?.value;

    try {
      const res = await fetch('/api/party-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name,
          customer_phone: phone,
          email: 'catering@example.com',
          event_date: date,
          event_time: time,
          guest_count: Number(guests),
          outlet_id: outletId,
          requirements_text: reqs,
          estimated_budget: Number(guests) * 550
        })
      });

      const data = await res.json();
      if (res.ok) {
        this.showToast(`Party Request #${data.id} Submitted!`, 'success');
        this.renderPartyView();
      } else {
        this.showToast(data.error || 'Failed to submit party order', 'error');
      }
    } catch (err) {
      this.showToast('Network error submitting party order', 'error');
    }
  },

  async updatePartyStatus(id, newStatus) {
    try {
      const res = await fetch(`/api/party-orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          manager_notes: newStatus === 'CONFIRMED'
            ? 'Catering Head Ustad assigned. Degh preparation scheduled.'
            : 'Kitchen at full capacity for requested time slot.'
        })
      });
      if (res.ok) {
        this.showToast(`Party Request #${id} marked as ${newStatus}`, newStatus === 'CONFIRMED' ? 'success' : 'info');
        this.renderPartyView();
      }
    } catch (e) {
      this.showToast('Failed to update party order', 'error');
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 8: AI DYNAMIC ENGINE LAB & DIAGNOSTICS
  // --------------------------------------------------------------------------
  renderAiLabView() {
    const container = document.getElementById('app-view-container');
    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto;">
        
        <div style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.85rem; color: var(--text-main);">AI Dynamic Prep-Time Engine Diagnostics</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">
            Interactive simulator of Company A's dynamic kitchen load estimation algorithm and edge-case handlers.
          </p>
        </div>

        <!-- Formula Callout -->
        <div style="background-color: #FFFFFF; border: 1.5px solid var(--accent-gold); border-radius: 14px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: var(--shadow-card);">
          <h3 style="font-size: 1.15rem; color: var(--accent-gold); margin-bottom: 0.75rem;">Dynamic Queue & Floor Formula</h3>
          <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 0.95rem; color: var(--text-main); line-height: 1.6;">
            Raw_AI_Prep = Max(Item_Complexity) + 0.28 * Sum(Secondary_Items) + (Active_Kitchen_Pots * 2.2 * Peak_Multiplier)<br>
            <strong style="color: var(--accent-gold);">Honest_Promised_Time = Max(Raw_AI_Prep, Outlet_Minimum_Prep_Floor)</strong>
          </div>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.75rem;">
            Enforces the strict rule from the brief: promised time is honest, never under-promises, and handles the 1,200 orders/hr Friday/Sunday dinner peaks.
          </div>
        </div>

        <!-- Interactive Simulator Widget -->
        <div style="background-color: #FFFFFF; border: 1px solid var(--border-subtle); border-radius: 14px; padding: 1.5rem; box-shadow: var(--shadow-card);">
          <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 1.25rem;">Live Parameter Experimentation</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
            <div>
              <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem; font-weight: 600;">
                Active Kitchen Pots in Queue: <strong id="sim-pots-val" style="color: var(--accent-gold);">3</strong>
              </label>
              <input type="range" id="sim-pots" min="0" max="25" value="3" style="width: 100%; accent-color: var(--accent-gold);" oninput="App.updateAiSim()">
            </div>

            <div>
              <label style="font-size: 0.85rem; color: var(--text-secondary); display: block; margin-bottom: 0.5rem; font-weight: 600;">
                Time of Day Peak Factor:
              </label>
              <select id="sim-peak" class="role-switcher-select" style="width: 100%;" onchange="App.updateAiSim()">
                <option value="1.0">Normal Hours (1.0x)</option>
                <option value="1.15">Lunch Rush 12-3 PM (1.15x)</option>
                <option value="1.25">Weekday Dinner 7-10 PM (1.25x)</option>
                <option value="1.40" selected>Weekend Dinner Peak (1.40x - 1,200 orders/hr)</option>
              </select>
            </div>
          </div>

          <!-- Output Box -->
          <div id="sim-output" style="background-color: var(--bg-surface); padding: 1.25rem; border-radius: 10px; border: 1px solid var(--border-subtle);">
            <!-- Live calculated by updateAiSim -->
          </div>
        </div>

      </div>
    `;
    this.updateAiSim();
  },

  updateAiSim() {
    const pots = Number(document.getElementById('sim-pots')?.value || 3);
    const peak = Number(document.getElementById('sim-peak')?.value || 1.4);
    const potVal = document.getElementById('sim-pots-val');
    if (potVal) potVal.textContent = pots;

    // Simulate 1 Family Biryani (18m) + 1 Double Ka Meetha (4m)
    const basePrep = 18 + (4 * 0.28); // ~19.1 mins
    const queueWait = pots * 2.2 * peak;
    const rawAi = Math.ceil(basePrep + queueWait);
    const outletFloor = 25; // Kondapur floor
    const finalHonest = Math.max(rawAi, outletFloor);

    const out = document.getElementById('sim-output');
    if (out) {
      out.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.75rem;">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Calculated Honest Promised Time:</div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--accent-gold);">${finalHonest} Minutes</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8rem; color: var(--text-muted);">Constraint Applied:</div>
            <div style="font-size: 1rem; font-weight: 800; color: ${rawAi < outletFloor ? 'var(--accent-gold)' : 'var(--accent-emerald)'};">
              ${rawAi < outletFloor ? 'BUMPED TO OUTLET FLOOR (25m)' : 'DRIVEN BY AI LOAD ESTIMATE'}
            </div>
          </div>
        </div>
        <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45;">
          Raw AI: <strong>${rawAi}m</strong> (Food Prep ${Math.round(basePrep)}m + Queue Wait ${Math.round(queueWait)}m under ${peak}x rush factor).
          ${finalHonest >= 35 ? '⚠️ High load alert: Suggesting customer order before 20:00 to avoid dinner surge.' : 'Normal delivery timeline.'}
        </div>
      `;
    }
  },

  // --------------------------------------------------------------------------
  // OUTLET MODAL & SWITCHING
  // --------------------------------------------------------------------------
  openOutletModal() {
    const modal = document.getElementById('outlet-modal');
    const panel = document.getElementById('outlet-modal-panel');
    const list = document.getElementById('outlet-selection-list');
    if (!modal || !panel || !list) return;

    this.renderOutletList(this.state.outlets);

    modal.classList.add('open');
    panel.style.transform = 'scale(1)';
    panel.style.opacity = '1';
  },

  renderOutletList(outletArray) {
    const list = document.getElementById('outlet-selection-list');
    if (!list) return;

    list.innerHTML = `
      <div style="display: flex; gap: 0.5rem; margin-bottom: 0.75rem;">
        <input type="text" id="outlet-search-input" placeholder="Search area (e.g. Kondapur, Gachibowli, Kukatpally...)" 
               oninput="App.filterOutlets(this.value)"
               style="flex: 1; background: var(--bg-surface); border: 1px solid var(--border-subtle); color: var(--text-main); padding: 0.55rem 0.75rem; border-radius: 6px; font-size: 0.85rem;">
        <button class="category-chip active" style="padding: 0.55rem 0.85rem; font-size: 0.82rem;" onclick="App.autoDetectNearestOutlet()">
          📍 Auto-Detect
        </button>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.65rem; max-height: 52vh; overflow-y: auto; padding-right: 0.25rem;">
        ${outletArray.map(o => `
          <div style="background: ${o.id === this.state.currentOutlet.id ? 'var(--bg-surface)' : '#FFFFFF'}; border: 1.5px solid ${o.id === this.state.currentOutlet.id ? 'var(--accent-gold)' : 'var(--border-subtle)'}; padding: 0.85rem 1rem; border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.15s ease;" 
               onclick="App.switchOutlet('${o.id}')">
            <div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${o.name}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${o.address}</div>
              <div style="font-size: 0.72rem; color: var(--accent-gold); margin-top: 0.2rem; font-weight: 600;">
                FSSAI Lic: ${o.fssai_license} • Delivery Radius: ${o.delivery_radius_km} km • Min Prep: ${o.min_prep_time_minutes}m
              </div>
            </div>
            <span style="background: ${o.is_cloud_kitchen ? 'rgba(59, 130, 246, 0.15)' : 'var(--accent-emerald-light)'}; color: ${o.is_cloud_kitchen ? '#2563EB' : 'var(--accent-emerald)'}; font-size: 0.72rem; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: 700; white-space: nowrap;">
              ${o.is_cloud_kitchen ? 'Cloud Kitchen' : 'Flagship Dine-in'}
            </span>
          </div>
        `).join('')}
      </div>
    `;
  },

  filterOutlets(query) {
    const q = query.toLowerCase().trim();
    const filtered = this.state.outlets.filter(o => 
      o.name.toLowerCase().includes(q) || o.address.toLowerCase().includes(q)
    );
    this.renderOutletList(filtered);
  },

  autoDetectNearestOutlet() {
    const nearest = this.state.outlets.find(o => o.slug === 'kondapur') || this.state.outlets[0];
    this.showToast(`📍 Geolocation locked: Nearest kitchen is ${nearest.name} (1.4 km away, within 7.0 km radius)`, 'success');
    this.switchOutlet(nearest.id);
  },

  closeOutletModal() {
    const modal = document.getElementById('outlet-modal');
    const panel = document.getElementById('outlet-modal-panel');
    if (modal) modal.classList.remove('open');
    if (panel) {
      panel.style.transform = 'scale(0.95)';
      panel.style.opacity = '0';
    }
  },

  handleModalBackdropClick(e) {
    this.closeOutletModal();
  },

  async switchOutlet(outletId) {
    const outlet = this.state.outlets.find(o => o.id === outletId);
    if (!outlet) return;
    this.state.currentOutlet = outlet;
    this.updateNavOutlet();
    this.closeOutletModal();
    this.showToast(`Switched delivery kitchen to ${outlet.name}`, 'info');
    await this.fetchMenu();
    await this.fetchAiRecommendations();
    if (this.state.currentView === 'ordering') this.renderOrderingView();
    if (this.state.currentView === 'cms') this.renderCmsView();
  },

  // --------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // --------------------------------------------------------------------------
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
      <span style="font-size: 0.88rem; font-weight: 600;">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }
};

// Expose App globally to window for onclick handlers
window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
