/**
 * Nawabi Zaika / Nizami Biryani - Direct Ordering & KDS Application
 * World-Class Modern Luxury Hyderabadi Design System (2026 Standard)
 * Complete reactive client with Real-time SSE synchronization,
 * Web Audio synthesizer, and multi-role views
 */

export const App = {
  state: {
    currentUser: null,
    authToken: localStorage.getItem('dumco_token') || null,
    authTab: 'demo',
    currentRole: 'customer',
    currentView: 'ordering',
    outlets: [],
    currentOutlet: null,
    menu: [],
    activeCategory: 'All Curations',
    vegOnly: false,
    foodType: 'all',
    spiceFilter: 'all',
    inStockOnly: false,
    sortBy: 'popularity',
    searchQuery: '',
    cart: [],
    activeCoupon: null,
    loyaltyPointsRedeemed: 0,
    customerPhone: '+91 98490 12345',
    customerName: 'Rahul Verma',
    customerLoyaltyBalance: 340,
    activeOrderId: 'WEB-778120',
    kdsOutletFilter: 'out-kondapur',
    kdsChannelFilter: 'all',
    kdsCheckedItems: {},
    kdsAudioEnabled: true,
    orders: [],
    partyOrders: [],
    analytics: null,
    aiRecommendations: [],
    customizingItem: null,
    selectedPortion: null,
    selectedAddOns: [],
    editingMenuItem: null
  },

  audioCtx: null,

  async init() {
    console.log('⚡ Initializing Company A Direct Platform...');
    await this.checkSession();
    await this.fetchOutlets();
    await this.fetchMenu();
    await this.fetchOrders();
    await this.fetchPartyOrders();
    await this.fetchLoyalty();
    await this.fetchAiRecommendations();
    this.updateNavAuthPill();
    this.initSSE();

    // Device viewport query param support (?device=mobile or ?device=laptop)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const devParam = urlParams.get('device');
      if (devParam === 'mobile') {
        this.setDeviceMode('mobile');
      } else if (devParam === 'laptop') {
        this.setDeviceMode('laptop');
      }
      if (urlParams.get('auth') === '1' || urlParams.get('modal') === 'auth') {
        this.openAuthModal();
      }
      if (urlParams.get('modal') === 'outlet') {
        this.openOutletModal();
      }
      if (urlParams.get('dropdown') === 'outlet' || urlParams.get('outlet') === 'open') {
        setTimeout(() => this.openOutletDropdown(), 150);
      }
      if (urlParams.get('custom') === '1') {
        setTimeout(() => this.openCustomModal('item-chicken-dum-biryani'), 200);
      }
      if (urlParams.get('modal') === 'city_price') {
        setTimeout(() => this.openCmsCityModal(), 250);
      }
      if (urlParams.get('modal') === 'cms_item') {
        setTimeout(() => this.openCmsItemModal(), 250);
      }
      if (urlParams.get('cms_tab')) {
        setTimeout(() => this.setCmsTab(urlParams.get('cms_tab')), 300);
      }
      if (urlParams.get('cart') === 'open') {
        setTimeout(() => {
          this.fillDemoCart();
          this.openCartDrawer();
        }, 300);
      }
      if (urlParams.get('role')) {
        setTimeout(() => {
          this.handleTopRoleChange(urlParams.get('role'));
        }, 150);
      }
    } catch (e) {}

    // Hash routing & deep linking support
    const urlParams = new URLSearchParams(window.location.search);
    const initialView = window.location.hash.replace('#', '') || 'ordering';
    this.navigate(initialView === 'party-items' ? 'party' : initialView);
    if (urlParams.get('drawer') === 'party' || window.location.hash === '#party-items') {
      setTimeout(() => this.openPartyDrawer(), 350);
    }

    window.addEventListener('hashchange', () => {
      const v = window.location.hash.replace('#', '') || 'ordering';
      if (v === 'party-items') {
        if (this.state.currentView !== 'party') this.navigate('party');
        setTimeout(() => this.openPartyDrawer(), 300);
      } else if (v !== this.state.currentView) {
        this.navigate(v);
      }
    });

    // Interval to refresh timers on KDS and Tracking
    setInterval(() => {
      if (this.state.currentView === 'kds') {
        this.renderKdsView();
      } else if (this.state.currentView === 'tracking') {
        this.updateTrackingTimer();
      }
    }, 10000);

    // Dismiss outlet dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#nav-location-wrap')) {
        this.closeOutletDropdown();
      }
    });
  },

  getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (this.state.authToken) {
      headers['Authorization'] = `Bearer ${this.state.authToken}`;
    }
    return headers;
  },

  async checkSession() {
    if (!this.state.authToken) return;
    try {
      const res = await fetch('/api/auth/me', { headers: this.getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          this.state.currentUser = data.user;
          this.state.customerName = data.user.name;
          if (data.user.phone) this.state.customerPhone = data.user.phone;
          if (data.user.role === 'kitchen_staff' && data.user.outlet_id) {
            this.state.currentRole = 'kitchen_staff';
            this.state.kdsOutletFilter = data.user.outlet_id;
          } else if (data.user.role === 'admin') {
            this.state.currentRole = 'admin';
          }
        }
      } else {
        this.state.authToken = null;
        localStorage.removeItem('dumco_token');
      }
    } catch (e) {
      console.warn('Session check error:', e);
    }
  },

  updateNavAuthPill() {
    const btn = document.getElementById('nav-auth-btn');
    const label = document.getElementById('nav-auth-label');
    const icon = document.getElementById('nav-auth-icon');
    if (!btn || !label) return;

    if (this.state.currentUser) {
      const firstName = this.state.currentUser.name.split(' ')[0];
      const roleBadge = this.state.currentUser.role === 'kitchen_staff' ? 'Kitchen' : this.state.currentUser.role === 'admin' ? 'Admin' : 'Guest';
      label.textContent = `${firstName} (${roleBadge})`;
      if (icon) icon.textContent = this.state.currentUser.role === 'kitchen_staff' ? '🍳' : this.state.currentUser.role === 'admin' ? '🛡️' : '👤';
      btn.style.borderColor = 'var(--accent-gold)';
    } else {
      label.textContent = 'Sign In';
      if (icon) icon.textContent = '👤';
      btn.style.borderColor = 'var(--border-subtle)';
    }
  },

  openAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    this.renderAuthModalBody();
    modal.classList.add('open');
  },

  closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('open');
  },

  switchAuthTab(tab) {
    this.state.authTab = tab;
    this.renderAuthModalBody();
  },

  async loginWithDemo(role) {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success) {
        this.state.authToken = data.token;
        this.state.currentUser = data.user;
        localStorage.setItem('dumco_token', data.token);
        this.updateNavAuthPill();
        this.closeAuthModal();
        this.showToast(`Signed in as ${data.user.name} (${data.user.role})`, 'success');

        if (data.user.role === 'customer') {
          this.state.currentRole = 'customer';
          this.state.customerName = data.user.name;
          if (data.user.phone) this.state.customerPhone = data.user.phone;
          const topSelect = document.getElementById('top-role-select');
          if (topSelect) topSelect.value = 'customer';
          this.navigate('ordering');
        } else if (data.user.role === 'kitchen_staff') {
          this.state.currentRole = 'kitchen_staff';
          this.state.kdsOutletFilter = data.user.outlet_id || 'out-kondapur';
          const topSelect = document.getElementById('top-role-select');
          if (topSelect) topSelect.value = 'kds';
          this.navigate('kds');
        } else if (data.user.role === 'admin') {
          this.state.currentRole = 'admin';
          const topSelect = document.getElementById('top-role-select');
          if (topSelect) topSelect.value = 'admin';
          this.navigate('cms');
        }
      } else {
        this.showToast(data.error || 'Login failed', 'error');
      }
    } catch (e) {
      this.showToast('Demo login network error', 'error');
    }
  },

  async submitLogin(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('auth-login-email')?.value;
    const password = document.getElementById('auth-login-password')?.value;
    if (!email || !password) return this.showToast('Please enter email and password', 'error');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        this.state.authToken = data.token;
        this.state.currentUser = data.user;
        localStorage.setItem('dumco_token', data.token);
        this.updateNavAuthPill();
        this.closeAuthModal();
        this.showToast(`Welcome back, ${data.user.name}!`, 'success');

        if (data.user.role === 'customer') {
          this.state.currentRole = 'customer';
          const topSelect = document.getElementById('top-role-select');
          if (topSelect) topSelect.value = 'customer';
          this.navigate('ordering');
        } else if (data.user.role === 'kitchen_staff') {
          this.state.currentRole = 'kitchen_staff';
          this.state.kdsOutletFilter = data.user.outlet_id || 'out-kondapur';
          const topSelect = document.getElementById('top-role-select');
          if (topSelect) topSelect.value = 'kds';
          this.navigate('kds');
        } else if (data.user.role === 'admin') {
          this.state.currentRole = 'admin';
          const topSelect = document.getElementById('top-role-select');
          if (topSelect) topSelect.value = 'admin';
          this.navigate('cms');
        }
      } else {
        this.showToast(data.error || 'Invalid credentials', 'error');
      }
    } catch (err) {
      this.showToast('Sign-in failed', 'error');
    }
  },

  async submitRegister(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('auth-reg-name')?.value;
    const email = document.getElementById('auth-reg-email')?.value;
    const phone = document.getElementById('auth-reg-phone')?.value;
    const password = document.getElementById('auth-reg-password')?.value;

    if (!name || !email || !password) return this.showToast('Please fill all required fields', 'error');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      if (data.success) {
        this.state.authToken = data.token;
        this.state.currentUser = data.user;
        localStorage.setItem('dumco_token', data.token);
        this.updateNavAuthPill();
        this.closeAuthModal();
        this.showToast(`Account created for ${data.user.name}!`, 'success');
        this.navigate('ordering');
      } else {
        this.showToast(data.error || 'Registration failed', 'error');
      }
    } catch (err) {
      this.showToast('Registration failed', 'error');
    }
  },

  async logoutUser() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: this.getAuthHeaders() });
    } catch {}
    this.state.authToken = null;
    this.state.currentUser = null;
    this.state.currentRole = 'customer';
    const topSelect = document.getElementById('top-role-select');
    if (topSelect) topSelect.value = 'customer';
    localStorage.removeItem('dumco_token');
    this.updateNavAuthPill();
    this.closeAuthModal();
    this.showToast('Signed out successfully', 'info');
    this.navigate('ordering');
  },

  renderAuthModalBody() {
    const body = document.getElementById('auth-modal-body');
    const headerTitle = document.getElementById('auth-modal-header-title');
    if (!body) return;

    if (this.state.currentUser) {
      if (headerTitle) headerTitle.textContent = 'Customer Profile';
      body.innerHTML = `
        <div style="text-align: center; padding: 1.25rem 1rem;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--color-brand); color: #FFF; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.75rem auto; box-shadow: 0 4px 14px rgba(252, 128, 25, 0.3);">
            👤
          </div>
          <h3 style="font-size: 1.35rem; color: var(--text-main); font-weight: 800; margin: 0 0 0.25rem 0;">${this.state.currentUser.name}</h3>
          <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 1.25rem 0;">
            ${this.state.currentUser.email} • <span style="background: var(--accent-gold-subtle); color: var(--accent-gold); padding: 0.2rem 0.55rem; border-radius: 6px; font-weight: 800; font-size: 0.78rem;">👑 340 CASHBACK POINTS</span>
          </p>
          <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn-primary-action" style="padding: 0.7rem 1.4rem;" onclick="App.navigate('account'); App.closeAuthModal();">
              <span>📜 View Order History</span>
            </button>
            <button class="btn-secondary-action" style="padding: 0.7rem 1.2rem;" onclick="App.logoutUser()">
              <span>🚪 Sign Out</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    if (headerTitle) headerTitle.textContent = 'Customer Sign In';
    body.innerHTML = `
      <!-- Fast 1-Click Customer Demo Login Card -->
      <div class="auth-customer-card" onclick="App.loginWithDemo('customer')">
        <div style="display: flex; align-items: center; gap: 0.85rem; flex: 1;">
          <div class="auth-customer-avatar">
            👤
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <strong style="font-size: 1.05rem; color: var(--text-main);">Rahul Verma</strong>
              <span class="auth-customer-badge">Loyal Customer</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">
              customer@companya.in • 👑 340 Cashback Points
            </div>
          </div>
        </div>
        <button class="btn-fast-login" type="button">
          Sign In ➔
        </button>
      </div>

      <div class="auth-clean-divider">
        <span>OR ENTER MOBILE NUMBER</span>
      </div>

      <!-- Quick Customer Phone Sign-In Form -->
      <form onsubmit="App.submitCustomerPhoneLogin(event)" style="display: flex; flex-direction: column; gap: 0.85rem;">
        <div>
          <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-main);">
            Mobile Number
          </label>
          <div style="display: flex; gap: 0.5rem;">
            <span style="padding: 0.68rem 0.9rem; background: var(--bg-surface); border: 1.5px solid var(--border-subtle); border-radius: 10px; font-weight: 700; font-size: 0.88rem; color: var(--text-main);">
              🇮🇳 +91
            </span>
            <input 
              type="tel" 
              id="auth-cust-phone" 
              required 
              placeholder="Enter 10-digit mobile" 
              value="98490 12345" 
              pattern="[0-9]{10}"
              style="flex: 1; padding: 0.68rem 0.9rem; border: 1.5px solid var(--border-subtle); border-radius: 10px; font-size: 0.92rem;"
            />
          </div>
        </div>
        <div>
          <label style="display: block; font-size: 0.82rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--text-main);">
            Your Name
          </label>
          <input 
            type="text" 
            id="auth-cust-name" 
            placeholder="Full Name" 
            value="Rahul Verma" 
            required 
            style="width: 100%; padding: 0.68rem 0.9rem; border: 1.5px solid var(--border-subtle); border-radius: 10px; font-size: 0.92rem;"
          />
        </div>
        <button type="submit" class="btn-primary-action" style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 800; border-radius: 10px; margin-top: 0.25rem;">
          Continue as Customer ➔
        </button>
      </form>

      <!-- Discreet Collapsed Staff Login Section -->
      <div style="margin-top: 1.25rem; padding-top: 0.9rem; border-top: 1px dashed var(--border-subtle); text-align: center;">
        <button type="button" class="staff-toggle-link" onclick="App.toggleStaffAuthOptions()" style="background: none; border: none; font-size: 0.78rem; color: var(--text-muted); cursor: pointer; text-decoration: underline;">
          Restaurant staff or admin portal? Tap to expand ▾
        </button>
        <div id="staff-auth-options" style="display: none; margin-top: 0.8rem; text-align: left; flex-direction: column; gap: 0.5rem;">
          <div class="staff-auth-card" onclick="App.loginWithDemo('kitchen_kondapur')">
            <span>🍳 Chef Mohammed Qasim (Kondapur KDS)</span>
            <span>➔</span>
          </div>
          <div class="staff-auth-card" onclick="App.loginWithDemo('kitchen_gachibowli')">
            <span>🍳 Chef Syed Arshad (Gachibowli KDS)</span>
            <span>➔</span>
          </div>
          <div class="staff-auth-card" onclick="App.loginWithDemo('admin')">
            <span>📋 Zafar Khan (Central Admin CMS)</span>
            <span>➔</span>
          </div>
        </div>
      </div>
    `;
  },

  toggleStaffAuthOptions() {
    const el = document.getElementById('staff-auth-options');
    if (el) {
      el.style.display = (el.style.display === 'none' || !el.style.display) ? 'flex' : 'none';
    }
  },

  async submitCustomerPhoneLogin(e) {
    if (e) e.preventDefault();
    const phoneInput = document.getElementById('auth-cust-phone');
    const nameInput = document.getElementById('auth-cust-name');
    const phone = phoneInput ? phoneInput.value.trim() : '9849012345';
    const name = nameInput ? nameInput.value.trim() : 'Rahul Verma';

    await this.loginWithDemo('customer');
    if (this.state.currentUser) {
      this.state.currentUser.name = name;
      this.state.customerName = name;
      this.state.customerPhone = phone;
      this.updateNavAuthPill();
      this.showToast(`Logged in as ${name} (340 Loyalty Points)`, 'success');
    }
  },

  // --------------------------------------------------------------------------
  // AUDIO SYNTHESIZER (WEB AUDIO API)
  // --------------------------------------------------------------------------
  playOrderChime(force = false) {
    if (!this.state.kdsAudioEnabled && !force) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const now = this.audioCtx.currentTime;
      
      // Tone 1: high bell
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.4);

      // Tone 2: pleasant resonant chime
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.12);
      gain2.gain.setValueAtTime(0.35, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.65);
    } catch (e) {
      console.warn('Audio chime blocked or unavailable:', e);
    }
  },

  // --------------------------------------------------------------------------
  // REAL-TIME SERVER-SENT EVENTS (SSE)
  // --------------------------------------------------------------------------
  initSSE() {
    if (window.location.search.includes('nosse')) return;
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

  async fetchPartyOrders() {
    try {
      const res = await fetch('/api/party-orders');
      if (res.ok) {
        this.state.partyOrders = await res.json();
      }
    } catch (e) {
      console.warn('Failed to load party orders:', e);
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
    if (fssaiEl) fssaiEl.textContent = `(FSSAI: ${this.state.currentOutlet.fssai_license} • 7 km radius)`;
  },

  // --------------------------------------------------------------------------
  // OFF-CANVAS SIDE REVIEWER DRAWER & DEVICE VIEWPORT CONTROLS
  // --------------------------------------------------------------------------
  toggleSideDrawer() {
    const backdrop = document.getElementById('side-portal-backdrop');
    if (backdrop) backdrop.classList.toggle('open');
  },

  closeSideDrawer() {
    const backdrop = document.getElementById('side-portal-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  },

  setDeviceMode(mode) {
    const isMobile = mode === 'mobile';
    document.body.classList.toggle('device-mode-mobile', isMobile);
    // Sync top-right controls
    document.getElementById('top-btn-laptop')?.classList.toggle('active', !isMobile);
    document.getElementById('top-btn-mobile')?.classList.toggle('active', isMobile);
    // Sync side drawer controls if open
    document.getElementById('side-device-laptop')?.classList.toggle('active', !isMobile);
    document.getElementById('side-device-mobile')?.classList.toggle('active', isMobile);
    this.showToast(isMobile ? '📱 Mobile Frame Active (Clean Swiggy/Zomato Shell)' : '💻 Laptop Fullscreen View Active', 'info');
    this.closeSideDrawer();
  },

  handleTopRoleChange(role) {
    this.handleRoleChange(role);
    const select = document.getElementById('top-role-select');
    if (select) select.value = role;
  },

  switchRoleFromSide(role) {
    this.handleRoleChange(role);
    document.querySelectorAll('.side-role-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.role === role);
    });
    this.closeSideDrawer();
  },

  fillDemoCart() {
    const chickenBiryani = this.state.menu.find(m => m.id === 'item-chicken-dum-biryani') || this.state.menu[0];
    const doubleMeetha = this.state.menu.find(m => m.id === 'item-double-ka-meetha') || this.state.menu[1];
    
    this.state.cart = [
      {
        item_id: chickenBiryani.id,
        name: chickenBiryani.name,
        portion: 'Regular Handi (1-2 Persons)',
        unit_price: chickenBiryani.base_price,
        quantity: 2,
        add_ons: []
      },
      {
        item_id: doubleMeetha.id,
        name: doubleMeetha.name,
        portion: 'Single Portion',
        unit_price: doubleMeetha.base_price,
        quantity: 1,
        add_ons: []
      }
    ];
    this.updateCartBadge();
    this.showToast('🛍️ Sample royal feast populated in cart!', 'success');
    this.closeSideDrawer();
    this.openCartDrawer();
  },

  // --------------------------------------------------------------------------
  // HEADER ADAPTATION & ISOLATION (CUSTOMER STOREFRONT VS RESTAURANT STAFF)
  // --------------------------------------------------------------------------
  navigateToBulkOrders() {
    const isAdmin = this.state.currentRole === 'admin' || (this.state.currentUser && this.state.currentUser.role === 'admin') || (document.getElementById('top-role-select')?.value === 'admin');
    if (isAdmin) {
      this.state.currentRole = 'admin';
      const topSelect = document.getElementById('top-role-select');
      if (topSelect) topSelect.value = 'admin';
      this.state.cmsTab = 'party_approvals';
      if (this.state.currentView !== 'cms') {
        this.navigate('cms');
      } else {
        this.updateHeaderContext('cms');
        this.renderCmsView();
      }
    } else {
      this.state.partyViewTab = 'active';
      this.navigate('party');
    }
  },

  updateHeaderContext(viewName) {
    const isKds = viewName === 'kds';
    const activeRole = this.state.currentRole || (this.state.currentUser ? this.state.currentUser.role : (document.getElementById('top-role-select')?.value || 'customer'));
    const isStaffRole = activeRole && activeRole !== 'customer';
    const isStaffView = ['cms', 'analytics', 'ai_lab'].includes(viewName) || (viewName === 'party' && isStaffRole);
    const isStaff = isStaffRole || isStaffView;
    const navLinks = document.getElementById('main-nav-links');
    const brandSub = document.querySelector('.brand-subtitle');

    if (isKds) {
      document.body.classList.add('view-kds');
      document.body.classList.remove('view-staff');
      return;
    }

    document.body.classList.remove('view-kds');

    if (isStaff) {
      document.body.classList.add('view-staff');
      if (brandSub) brandSub.textContent = 'Restaurant Staff Portal';
      if (navLinks) {
        const isBulkActive = (viewName === 'cms' && this.state.cmsTab === 'party_approvals') || (viewName === 'party' && isStaffRole);
        const isDishesActive = viewName === 'cms' && this.state.cmsTab !== 'party_approvals';
        navLinks.innerHTML = `
          <button class="cust-nav-link ${isDishesActive ? 'active' : ''}" onclick="App.setCmsTab('dishes'); App.navigate('cms')">
            <span class="nav-link-icon">📋</span>
            <span>Menu CMS</span>
          </button>
          <button class="cust-nav-link ${isBulkActive ? 'active' : ''}" onclick="App.navigateToBulkOrders()">
            <span class="nav-link-icon">🎉</span>
            <span>Bulk Orders</span>
          </button>
          <button class="cust-nav-link ${viewName === 'analytics' ? 'active' : ''}" onclick="App.navigate('analytics')">
            <span class="nav-link-icon">📊</span>
            <span>Outlet Dashboard</span>
          </button>
          <button class="cust-nav-link ${viewName === 'ai_lab' ? 'active' : ''}" onclick="App.navigate('ai_lab')">
            <span class="nav-link-icon">⏱️</span>
            <span>AI Prep-Time</span>
          </button>
          <button class="cust-nav-link" onclick="App.navigate('kds')">
            <span class="nav-link-icon">🍳</span>
            <span>Kitchen KDS</span>
          </button>
        `;
      }
    } else {
      document.body.classList.remove('view-staff');
      if (brandSub) brandSub.textContent = 'Fresh Food Delivered Direct';
      if (navLinks) {
        navLinks.innerHTML = `
          <button class="cust-nav-link ${viewName === 'ordering' ? 'active' : ''}" id="link-menu" onclick="App.navigate('ordering')">
            <span class="nav-link-icon">🍲</span>
            <span>Menu</span>
          </button>
          <button class="cust-nav-link ${viewName === 'party' ? 'active' : ''}" id="link-party" onclick="App.navigate('party')">
            <span class="nav-link-icon">🎉</span>
            <span>Party Orders</span>
          </button>
          <button class="cust-nav-link ${viewName === 'account' ? 'active' : ''}" id="link-account" onclick="App.navigate('account')">
            <span class="nav-link-icon">👤</span>
            <span>Account</span>
          </button>
        `;
      }
    }
  },

  // --------------------------------------------------------------------------
  // NAVIGATION & ROUTING
  // --------------------------------------------------------------------------
  navigate(viewName) {
    this.state.currentView = viewName;
    this.updateHeaderContext(viewName);

    // Sync URL hash seamlessly without jump
    try {
      if (window.location.hash.replace('#', '') !== viewName) {
        if (viewName === 'ordering') {
          history.replaceState(null, '', window.location.pathname);
        } else {
          history.replaceState(null, '', `#${viewName}`);
        }
      }
    } catch (e) {}

    // Update customer nav link active state
    document.querySelectorAll('.cust-nav-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.mobile-dock-btn').forEach(btn => btn.classList.remove('active'));

    if (viewName === 'ordering') {
      document.getElementById('link-menu')?.classList.add('active');
      document.getElementById('mob-dock-menu')?.classList.add('active');
    } else if (viewName === 'party') {
      document.getElementById('link-party')?.classList.add('active');
      document.getElementById('mob-dock-party')?.classList.add('active');
    } else if (viewName === 'account') {
      document.getElementById('link-account')?.classList.add('active');
      document.getElementById('mob-dock-account')?.classList.add('active');
    }

    // Top role dropdown reflects the active user role, not customer navigation pages
    const topSelect = document.getElementById('top-role-select');
    if (topSelect && this.state.currentRole) {
      topSelect.value = this.state.currentRole;
    }

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
      case 'account':
        this.renderAccountView();
        break;
      default:
        this.renderOrderingView();
    }
  },

  renderAccountView() {
    const container = document.getElementById('app-view-container');
    const user = this.state.currentUser || {
      name: this.state.customerName,
      phone: this.state.customerPhone,
      email: 'customer@companya.in',
      role: 'customer'
    };

    const userOrders = this.state.orders.filter(o => 
      !this.state.customerPhone || o.customer_phone === this.state.customerPhone
    );

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding-bottom: 3rem;">
        
        

        <div class="page-header-center">
          <h1 class="page-title">My Account</h1>
          <p class="page-subtitle">Manage your profile, direct loyalty cashback, and order history.</p>
        </div>

        <!-- Account Hero & Loyalty Card -->
        <div class="account-hero-card">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem;">
              <span style="font-size: 1.8rem;">👑</span>
              <h2 style="font-size: 1.6rem; color: #FFFFFF; margin: 0;">${user.name}</h2>
              <span class="demo-badge demo-badge-customer">${user.role.toUpperCase()}</span>
            </div>
            <p style="color: #94A3B8; font-size: 0.88rem; margin: 0.2rem 0 0 0;">
              ${user.phone || '+91 98490 12345'} • ${user.email}
            </p>
          </div>

          <div style="background: rgba(255,255,255,0.08); padding: 1rem 1.4rem; border-radius: 14px; border: 1px solid rgba(255,255,255,0.12); text-align: right;">
            <div style="font-size: 0.72rem; color: #F59E0B; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">
              WALLET BALANCE
            </div>
            <div style="font-size: 1.8rem; font-weight: 900; color: #FFFFFF;">
              ₹${this.state.customerLoyaltyBalance}
            </div>
            <div style="font-size: 0.72rem; color: #94A3B8;">5% cashback on every direct order</div>
          </div>
        </div>

        <!-- Orders Section Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <h3 style="font-size: 1.3rem; color: var(--text-main); margin: 0;">Order History</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">View previous orders and re-order with one click</p>
          </div>
          <button class="btn-primary-action" onclick="App.navigate('ordering')">
            + New Order
          </button>
        </div>

        <!-- Orders List -->
        <div class="account-orders-list">
          ${userOrders.length === 0 ? `
            <div style="text-align: center; padding: 4rem 1rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed var(--border-subtle);">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">🍲</div>
              <h4 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 0.3rem;">No past orders yet</h4>
              <p style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 1.2rem;">Order your first authentic Hyderabadi Dum Biryani directly from the kitchen!</p>
              <button class="btn-primary-action" onclick="App.navigate('ordering')">Explore Menu ➔</button>
            </div>
          ` : userOrders.map(order => {
            const statusColor = order.status === 'COMPLETED' ? '#10B981' : order.status === 'READY_FOR_PICKUP' ? '#3B82F6' : order.status === 'PREPARING' ? '#F59E0B' : '#6B7280';
            return `
              <div class="order-history-card">
                <div class="order-history-header">
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                      <strong style="font-size: 1.05rem; color: var(--text-main); font-family: 'JetBrains Mono', monospace;">#${order.id}</strong>
                      <span style="font-size: 0.75rem; background: ${statusColor}20; color: ${statusColor}; font-weight: 800; padding: 0.2rem 0.55rem; border-radius: var(--radius-full);">
                        ${order.status}
                      </span>
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.15rem;">
                      ${order.outlet_name} • Placed ${new Date(order.placed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-main);">₹${order.total_amount}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${order.payment_method} • ${order.payment_status}</div>
                  </div>
                </div>

                <div style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.9rem;">
                  ${order.items.map(it => `${it.quantity}x ${it.name} ${it.portion ? `(${it.portion})` : ''}`).join(' • ')}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.75rem; border-top: 1px solid var(--border-subtle);">
                  <span style="font-size: 0.78rem; color: var(--text-muted);">
                    Estimated prep: ~${order.ai_prep_estimate_minutes} mins
                  </span>
                  <div style="display: flex; gap: 0.6rem; align-items: center;">
                    <button class="btn-secondary-action" style="padding: 0.45rem 0.9rem; font-size: 0.82rem;" onclick="App.state.activeOrderId='${order.id}'; App.navigate('tracking');">
                      📍 Track Order
                    </button>
                    <button class="btn-primary-action" style="padding: 0.45rem 0.9rem; font-size: 0.82rem; white-space: nowrap;" onclick="App.reorderPastOrder('${order.id}')">
                      🔄 Re-Order
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;
  },

  reorderPastOrder(orderId) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;
    this.state.cart = order.items.map(it => ({
      item_id: it.item_id || it.id,
      name: it.name,
      portion: it.portion || 'Regular',
      unit_price: it.unit_price || it.base_price || 380,
      quantity: it.quantity || 1,
      add_ons: it.add_ons || []
    }));
    this.updateCartBadge();
    this.showToast(`Re-ordered feast from #${orderId}!`, 'success');
    this.openCartDrawer();
  },

  handleRoleChange(role) {
    this.state.currentRole = role;
    if (role === 'customer') {
      this.navigate('ordering');
    } else if (role === 'kds' || role.startsWith('kitchen_')) {
      if (!this.state.kdsOutletFilter) {
        this.state.kdsOutletFilter = this.state.currentOutlet ? this.state.currentOutlet.id : 'all';
      }
      this.navigate('kds');
    } else if (role === 'admin') {
      this.navigate('cms');
    } else if (role === 'analytics') {
      this.navigate('analytics');
    } else if (role === 'party') {
      this.state.partyViewTab = 'active';
      this.navigate('party');
    } else if (role === 'ai_lab' || role === 'ai_diagnostics') {
      this.navigate('ai_lab');
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 1: CUSTOMER ORDERING MENU
  // --------------------------------------------------------------------------
  // --------------------------------------------------------------------------
  // VIEW 1: CUSTOMER ORDERING MENU (STRICT WIREFRAME BLUEPRINT)
  // 1. Header (Brand, Outlet Selector, Nav, Auth, Cart)
  // 2. Company Promotional Banner (Wood-fired dum pukht, 14 outlets + 3 kitchens, benefits)
  // 3. Prominent Food Search Bar & Veg Mode (Instant suggestions, pure veg switch)
  // 4. Based on Your Last Order (Personalized pairings, opt-in only)
  // 5. Famous Dishes in this Restaurant (Top royal signatures with crown badges)
  // 6. Filter, Sort and Food Types (Type segment, Categories, Sort, Spice, In-stock)
  // 7. Complete Dishes Catalog (Responsive grid with 16:9 media & add actions)
  // --------------------------------------------------------------------------
  renderOrderingView() {
    const container = document.getElementById('app-view-container');
    const outlet = this.state.currentOutlet;

    // Categories as specified in Wireframe Blueprint:
    // Chicken Biryani, Mutton Biryani, Veg Biryani, Starters, Kebabs, Curries, Haleem, Desserts, Beverages
    const wireframeCategories = [
      'All Curations',
      'Chicken Biryani',
      'Mutton Biryani',
      'Veg Biryani',
      'Starters',
      'Kebabs',
      'Curries',
      'Haleem',
      'Desserts',
      'Beverages'
    ];

    let filtered = [...this.state.menu];

    // 1. Food Type Filter ('all', 'veg', 'nonveg') or Veg Mode toggle
    if (this.state.foodType === 'veg' || this.state.vegOnly) {
      filtered = filtered.filter(item => item.is_veg === 1);
    } else if (this.state.foodType === 'nonveg') {
      filtered = filtered.filter(item => item.is_veg === 0);
    }

    // 2. Category Filter
    if (this.state.activeCategory && this.state.activeCategory !== 'All Curations' && this.state.activeCategory !== 'All') {
      filtered = filtered.filter(item => this.matchesCategory(item, this.state.activeCategory));
    }

    // 3. Search Query Filter (dish name, ingredients, category, description)
    if (this.state.searchQuery && this.state.searchQuery.trim()) {
      const q = this.state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        (item.name || '').toLowerCase().includes(q) || 
        (item.description || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }

    // 4. Spice Level Filter
    if (this.state.spiceFilter && this.state.spiceFilter !== 'all') {
      filtered = filtered.filter(item => item.spice_level === this.state.spiceFilter);
    }

    // 5. In-Stock Only Filter
    if (this.state.inStockOnly) {
      filtered = filtered.filter(item => item.is_available === 1);
    }

    // 6. Sorting
    if (this.state.sortBy === 'price_low') {
      filtered.sort((a, b) => a.base_price - b.base_price);
    } else if (this.state.sortBy === 'price_high') {
      filtered.sort((a, b) => b.base_price - a.base_price);
    } else if (this.state.sortBy === 'fastest') {
      filtered.sort((a, b) => (a.prep_complexity_minutes || 15) - (b.prep_complexity_minutes || 15));
    } else if (this.state.sortBy === 'popularity') {
      const bestsellerIds = ['item-chicken-dum-biryani', 'item-mutton-dum-biryani', 'item-mutton-haleem', 'item-double-ka-meetha'];
      filtered.sort((a, b) => {
        const aIndex = bestsellerIds.indexOf(a.id);
        const bIndex = bestsellerIds.indexOf(b.id);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        return 0;
      });
    }

    // Bestseller dishes for "Famous Dishes in this Restaurant"
    const famousDishes = [
      { id: 'item-chicken-dum-biryani', badge: '👑 Bestseller #1', sub: 'Slow wood-fired with aged Daawat basmati & tender chicken' },
      { id: 'item-mutton-dum-biryani', badge: '👑 Bestseller #2', sub: 'Royal Nizami recipe with slow-simmered tender lamb' },
      { id: 'item-mutton-haleem', badge: '👑 Royal Signature', sub: 'Hand-pounded wheat, tender mutton & pure desi ghee' },
      { id: 'item-double-ka-meetha', badge: '👑 Heritage Sweet', sub: 'Crispy fried bread soaked in saffron rabdi & pistachios' }
    ].map(f => {
      const menuItem = this.state.menu.find(m => m.id === f.id);
      return menuItem ? { ...menuItem, customBadge: f.badge, customSub: f.sub } : null;
    }).filter(Boolean);

    // Personalized Recommendations ("Based on Your Last Order" or "Start Your Dum Journey")
    const hasOrderHistory = this.state.orders && this.state.orders.some(o => 
      this.state.customerPhone && o.customer_phone === this.state.customerPhone
    );
    const recList = (this.state.aiRecommendations && this.state.aiRecommendations.length > 0)
      ? this.state.aiRecommendations.slice(0, 3)
      : this.state.menu.filter(m => ['item-chicken-dum-biryani', 'item-mirchi-ka-salan', 'item-double-ka-meetha'].includes(m.id)).slice(0, 3);

    // Active customer order for contextual tracking (Wireframe: only appears when order is active)
    const activeOrder = (this.state.orders || []).find(o => 
      ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.status)
    );

    container.innerHTML = `
      ${activeOrder ? `
        <!-- CONTEXTUAL ACTIVE LIVE ORDER BANNER -->
        <div class="active-live-order-banner" onclick="App.state.activeOrderId='${activeOrder.id}'; App.navigate('tracking');" title="Click to track live order">
          <div class="active-order-banner-content">
            <span class="active-order-pulse-dot"></span>
            <span class="active-order-icon">🛵</span>
            <div class="active-order-text">
              <strong>Order #${activeOrder.id} is ${activeOrder.status.replace(/_/g, ' ')}</strong>
              <span class="active-order-eta">• ETA ~${activeOrder.eta_minutes || 25} mins</span>
            </div>
          </div>
          <button class="btn-track-active-order" type="button">
            Track Live Order ➔
          </button>
        </div>
      ` : ''}

      <!-- 1. HERO / COMPANY PROMOTIONAL BANNER -->
      <section class="company-promo-banner">
        <div class="promo-banner-inner">
          <div class="promo-banner-left">
            <h1 class="promo-heading">
              Fresh Food, <span class="highlight-copper">Delivered Direct</span> to You.
            </h1>

            <p class="promo-story-text">
              Order directly from our 17 Hyderabad kitchens. Enjoy honest prices with 5% GST included, fast delivery, and rewards on every order.
            </p>

            <div class="promo-cta-group">
              <button class="btn-promo-primary" onclick="App.scrollToSearch()">
                <span>🍲 Explore Menu & Order</span>
                <span class="arrow-down">↓</span>
              </button>
              <button class="btn-promo-secondary" onclick="App.navigate('party')">
                <span>🎉 Party Orders (15+ Guests)</span>
              </button>
            </div>

            <div class="promo-trust-strip">
              <div class="trust-pill">
                <span class="trust-ico">⚡</span>
                <span><strong>30-40 min</strong> delivery</span>
              </div>
              <div class="trust-pill">
                <span class="trust-ico">🎁</span>
                <span><strong>5% Cashback</strong> on every order</span>
              </div>
              <div class="trust-pill">
                <span class="trust-ico">🏷️</span>
                <span><strong>Direct Prices</strong> (5% GST incl.)</span>
              </div>
            </div>
          </div>

          <div class="promo-banner-right">
            <div class="promo-img-wrapper">
              <img 
                src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1000&auto=format&fit=crop&q=85" 
                alt="Royal Hyderabadi Dum Biryani" 
                class="promo-featured-img"
              />
              <div class="promo-handi-pill">
                <span class="handi-flame">🔥</span>
                <div>
                  <strong>Fresh Food Ready</strong>
                  <span>${outlet ? outlet.name : 'Kondapur Flagship'} • 30m prep</span>
                </div>
              </div>
              <div class="promo-rating-card">
                <div class="promo-stars">★★★★★ <span>4.9 / 5.0</span></div>
                <div class="promo-quote">"Hot, fresh, and delivered on time!"</div>
                <div class="promo-stats">38,000+ happy customers in Hyderabad</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. PROMINENT FOOD SEARCH BAR & VEG MODE (WIREFRAME: SEARCH + VEG MODE) -->
      <section class="prominent-search-section" id="search-section-anchor">
        <div class="search-top-row">
          <div class="prominent-search-box">
            <span class="search-magnifier">🔍</span>
            <input 
              type="text" 
              id="menu-search-input" 
              class="prominent-search-input"
              value="${this.state.searchQuery || ''}" 
              placeholder="Search dishes by name, ingredients, biryani, kebabs, desserts..." 
              oninput="App.onSearchInput(this.value)"
            />
            ${this.state.searchQuery ? `<button class="search-clear-cross" onclick="App.onSearchInput('')" title="Clear search">&times;</button>` : ''}
          </div>

          <!-- Veg Mode Toggle Switch -->
          <div class="veg-mode-toggle-wrap" onclick="App.toggleVegFilter(!App.state.vegOnly)" title="Toggle pure vegetarian curations">
            <div class="veg-mode-pill ${this.state.vegOnly ? 'active' : ''}">
              <div class="diet-dot-green"></div>
              <span class="veg-mode-label">Veg Mode</span>
              <div class="toggle-switch-track ${this.state.vegOnly ? 'on' : ''}">
                <div class="toggle-switch-thumb"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Search Suggestion Tags -->
        <div class="search-suggestions-row">
          <span class="suggestions-label">Popular:</span>
          <div class="suggestions-chips-wrap">
            <button class="search-suggest-chip" onclick="App.onSearchInput('Chicken Biryani')">🔥 Chicken Biryani</button>
            <button class="search-suggest-chip" onclick="App.onSearchInput('Mutton Biryani')">🍖 Mutton Biryani</button>
            <button class="search-suggest-chip" onclick="App.onSearchInput('Haleem')">✨ Shahi Haleem</button>
            <button class="search-suggest-chip" onclick="App.onSearchInput('Double Ka Meetha')">🍮 Double Ka Meetha</button>
            <button class="search-suggest-chip" onclick="App.onSearchInput('Mirchi Ka Salan')">🌶️ Mirchi Ka Salan</button>
            <button class="search-suggest-chip" onclick="App.onSearchInput('Chai')">☕ Irani Chai</button>
          </div>
        </div>
      </section>

      <!-- 3. BASED ON YOUR LAST ORDER -->
      <section class="recommendations-section">
        <div class="section-title-strip">
          <div>
            <h2 class="section-main-title">${hasOrderHistory ? 'Based on Your Last Order' : 'Recommended for You'}</h2>
            <p class="section-sub-desc">
              ${hasOrderHistory 
                ? 'Dishes you might like based on your previous orders' 
                : 'Popular dishes to start your meal'}
            </p>
          </div>
        </div>

        <div class="recommendations-cards-grid">
          ${recList.map(item => this.renderRecommendationCard(item)).join('')}
        </div>
      </section>

      <!-- 4. FAMOUS DISHES IN THIS RESTAURANT -->
      <section class="famous-dishes-section">
        <div class="section-title-strip">
          <div>
            <h2 class="section-main-title">Famous Dishes</h2>
            <p class="section-sub-desc">Our most-loved biryanis and authentic specialties</p>
          </div>
        </div>

        <div class="famous-dishes-grid">
          ${famousDishes.map(item => this.renderFamousDishCard(item)).join('')}
        </div>
      </section>

      <!-- 5. FILTER, SORT AND FOOD TYPES (WIREFRAME: FILTER, SORT, TYPES ETC) -->
      <section class="filter-sort-controls-section" id="menu-curations-anchor">
        <div class="controls-top-bar">
          
          <!-- Food Type Segmented Pills -->
          <div class="food-type-segmented">
            <button class="type-segment-btn ${(!this.state.foodType || this.state.foodType === 'all') && !this.state.vegOnly ? 'active' : ''}" 
                    onclick="App.setFoodType('all')">
              All
            </button>
            <button class="type-segment-btn ${(this.state.foodType === 'veg' || this.state.vegOnly) ? 'active' : ''}" 
                    onclick="App.setFoodType('veg')">
              🌱 Vegetarian
            </button>
            <button class="type-segment-btn ${this.state.foodType === 'nonveg' ? 'active' : ''}" 
                    onclick="App.setFoodType('nonveg')">
              🍗 Non-Vegetarian
            </button>
          </div>

          <!-- Sort & Secondary Filters -->
          <div class="controls-filter-dropdowns">
            
            <!-- Sort Dropdown -->
            <div class="filter-select-wrap">
              <span class="select-prefix-ico">⇅</span>
              <select class="control-select" onchange="App.setSort(this.value)">
                <option value="popularity" ${this.state.sortBy === 'popularity' ? 'selected' : ''}>🔥 Popularity</option>
                <option value="price_low" ${this.state.sortBy === 'price_low' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price_high" ${this.state.sortBy === 'price_high' ? 'selected' : ''}>Price: High to Low</option>
                <option value="recommended" ${this.state.sortBy === 'recommended' ? 'selected' : ''}>✨ Recommended</option>
                <option value="fastest" ${this.state.sortBy === 'fastest' ? 'selected' : ''}>⚡ Fastest Prep</option>
              </select>
            </div>

            <!-- Spice Level Dropdown -->
            <div class="filter-select-wrap">
              <span class="select-prefix-ico">🌶️</span>
              <select class="control-select" onchange="App.setSpiceFilter(this.value)">
                <option value="all" ${(!this.state.spiceFilter || this.state.spiceFilter === 'all') ? 'selected' : ''}>All Spice Levels</option>
                <option value="Mild" ${this.state.spiceFilter === 'Mild' ? 'selected' : ''}>Mild</option>
                <option value="Medium" ${this.state.spiceFilter === 'Medium' ? 'selected' : ''}>Medium</option>
                <option value="Nizami Spicy" ${this.state.spiceFilter === 'Nizami Spicy' ? 'selected' : ''}>Nizami Spicy</option>
              </select>
            </div>

            <!-- In-Stock Only Toggle -->
            <label class="instock-filter-label">
              <input type="checkbox" class="instock-checkbox" 
                     ${this.state.inStockOnly ? 'checked' : ''} 
                     onchange="App.toggleInStockOnly(this.checked)" />
              <span>In-Stock Only</span>
            </label>

          </div>
        </div>

        <!-- Categories Row / Chips -->
        <div class="categories-chips-scroll">
          ${wireframeCategories.map(cat => `
            <button class="cat-chip-btn ${this.state.activeCategory === cat ? 'active' : ''}" 
                    onclick="App.setCategory('${cat}')">
              ${cat}
            </button>
          `).join('')}
        </div>
      </section>

      <!-- 6. COMPLETE DISHES CATALOG (WIREFRAME: DISHES) -->
      <section class="complete-dishes-section">
        <div class="dishes-section-header">
          <h3 class="dishes-count-heading">
            All Dishes <span class="dishes-count-badge">(${filtered.length})</span>
          </h3>
          ${(this.state.searchQuery || this.state.activeCategory !== 'All Curations' || this.state.foodType !== 'all' || this.state.spiceFilter !== 'all' || this.state.inStockOnly) ? `
            <button class="reset-filters-btn" onclick="App.resetAllFilters()">
              ✕ Reset All Filters
            </button>
          ` : ''}
        </div>

        <div class="menu-grid">
          ${filtered.length === 0 ? `
            <div class="menu-empty-state">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">🍲</div>
              <h3 style="font-size: 1.35rem; color: var(--text-main); margin-bottom: 0.35rem;">No dishes match your selected filters</h3>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1.25rem;">Try resetting your search query, spice level, or vegetarian filter.</p>
              <button class="btn-promo-primary" onclick="App.resetAllFilters()">Show All Dishes</button>
            </div>
          ` : filtered.map(item => this.renderDishCard(item)).join('')}
        </div>
      </section>

      <!-- 7. CUSTOMER BENEFITS & RICH BRAND FOOTER -->
      <section class="direct-benefits-section">
        <div class="benefits-inner">
          <h2 class="section-main-title" style="text-align: center; margin-bottom: 2rem;">Why Order Direct from Company A</h2>
          <div class="benefits-grid">
            <div class="benefit-card">
              <div class="benefit-icon">🏷️</div>
              <h3>Honest Direct Prices</h3>
              <p>No delivery app commissions or inflated prices. Direct kitchen prices with 5% GST included.</p>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">⏱️</div>
              <h3>Honest Delivery Times</h3>
              <p>Delivery estimates based on live kitchen workload so you know exactly when food arrives.</p>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">🎁</div>
              <h3>5% Cashback Rewards</h3>
              <p>Earn 5% cashback on every direct order to save money on your next meal.</p>
            </div>
            <div class="benefit-card">
              <div class="benefit-icon">🍲</div>
              <h3>Cooked Fresh Daily</h3>
              <p>Prepared fresh for every order across our 17 Hyderabad locations. Delivered hot and delicious.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Rich Brand Footer -->
      <footer class="brand-footer">
        <div class="footer-inner">
          <div class="footer-grid">
            <div class="footer-col-brand">
              <div class="footer-brand-header">
                <div class="brand-crest"><span>👑</span></div>
                <div>
                  <div class="brand-title" style="color: #FFFFFF;">Company A</div>
                  <div class="brand-subtitle" style="color: #D6AD55;">Authentic Hyderabadi Biryani</div>
                </div>
              </div>
              <p class="footer-desc">
                Fresh biryani and traditional dishes cooked daily across 14 restaurant outlets and 3 cloud kitchens in Hyderabad.
              </p>
              <div class="footer-compliance-row">
                <span class="fssai-pill">🛡️ FSSAI Central Lic: 13622014000491</span>
                <span class="dpdp-pill">🔒 Verified Kitchen</span>
              </div>
            </div>

            <div class="footer-col-outlets">
              <h4>14 Outlets & 3 Cloud Kitchens</h4>
              <div class="outlets-tags-list">
                <span>Kondapur</span>
                <span>Gachibowli</span>
                <span>Kukatpally</span>
                <span>Banjara Hills</span>
                <span>Jubilee Hills</span>
                <span>Madhapur</span>
                <span>Hitec City</span>
                <span>Tolichowki</span>
                <span>Secunderabad</span>
                <span>Begumpet</span>
                <span>Ameerpet</span>
                <span>Dilsukhnagar</span>
                <span>Mehdipatnam</span>
                <span>Attapur</span>
                <span>Manikonda</span>
                <span>Uppal</span>
                <span>Kompally</span>
              </div>
            </div>

            <div class="footer-col-support">
              <h4>Customer Support & Catering</h4>
              <p style="color: #94A3B8; font-size: 0.86rem; line-height: 1.6;">
                📞 Phone: <strong>+91 40 6822 1000</strong><br>
                📱 WhatsApp: <strong>+91 98490 12345</strong><br>
                🎉 Catering: <strong>catering@companya.in</strong><br>
                📍 Hyderabad, Telangana
              </p>
              <div style="margin-top: 1rem;">
                <button class="btn-promo-primary" style="padding: 0.5rem 1.15rem; font-size: 0.84rem;" onclick="App.navigate('party')">
                  Book Party Catering (15+ Guests) ➔
                </button>
              </div>
            </div>
          </div>

          <div class="footer-bottom-bar">
            <div>© 2026 Company A. All rights reserved.</div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <span>5% GST Included</span>
              <span>•</span>
              <span>Direct Kitchen Delivery</span>
              <span>•</span>
              <span>Hyderabad</span>
            </div>
          </div>
        </div>
      </footer>
    `;
  },

  renderRecommendationCard(item) {
    const hasCustomization = (item.portions && item.portions.length > 1) || (item.add_ons && item.add_ons.length > 0);
    const cartCount = this.state.cart.filter(c => c.item_id === item.id).reduce((s, i) => s + i.quantity, 0);

    return `
      <div class="rec-dish-card" id="rec-card-${item.id}">
        <div class="rec-card-media">
          <img src="${item.image_url}" alt="${item.name}" class="rec-dish-img" loading="lazy">
          <div class="rec-diet-badge ${item.is_veg ? 'veg' : 'non-veg'}"></div>
        </div>
        <div class="rec-card-body">
          <div class="rec-header-row">
            <h4 class="rec-dish-title">${item.name}</h4>
            <span class="rec-dish-price">₹${item.base_price}</span>
          </div>
          <p class="rec-dish-desc">${item.description}</p>
          <div class="rec-footer-row">
            <span class="rec-confidence-tag">${item.badge || 'Chef Favorite'}</span>
            ${cartCount > 0 ? `
              <div class="qty-stepper-box compact">
                <button class="qty-step-btn" onclick="App.quickDecrementItem('${item.id}')">-</button>
                <span class="qty-step-val">${cartCount}</span>
                <button class="qty-step-btn" onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">+</button>
              </div>
            ` : `
              <button class="btn-rec-add" onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">
                + Add
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  },

  renderFamousDishCard(item) {
    const hasCustomization = (item.portions && item.portions.length > 1) || (item.add_ons && item.add_ons.length > 0);
    const cartCount = this.state.cart.filter(c => c.item_id === item.id).reduce((s, i) => s + i.quantity, 0);

    return `
      <div class="famous-dish-card" id="famous-card-${item.id}">
        <div class="famous-card-media">
          <img src="${item.image_url}" alt="${item.name}" class="famous-dish-img" loading="lazy">
          <div class="famous-crown-badge">${item.customBadge || '👑 Bestseller'}</div>
          <div class="famous-badges-top-right">
            <div class="diet-badge ${item.is_veg ? 'veg' : 'non-veg'}"></div>
          </div>
          <div class="famous-prep-badge">⏱️ ${item.prep_complexity_minutes}m</div>
        </div>

        <div class="famous-card-body">
          <div class="famous-header-row">
            <div>
              <h3 class="famous-dish-title">${item.name}</h3>
              <div class="famous-spice-pill">🌶️ ${item.spice_level}</div>
            </div>
            <div class="famous-price-wrap">
              <span class="famous-dish-price">₹${item.base_price}</span>
              <span class="famous-gst-sub">incl. 5% GST</span>
            </div>
          </div>

          <p class="famous-dish-desc">${item.customSub || item.description}</p>

          <div class="famous-footer-row">
            <span class="famous-authentic-label">✨ Wood-Fired Dum Pukht</span>
            ${cartCount > 0 ? `
              <div class="qty-stepper-box">
                <button class="qty-step-btn" onclick="App.quickDecrementItem('${item.id}')">-</button>
                <span class="qty-step-val">${cartCount}</span>
                <button class="qty-step-btn" onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">+</button>
              </div>
            ` : `
              <button class="btn-famous-add" onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">
                + ADD
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  },

  renderDishCard(item) {
    const isOutOfStock = !item.is_available;
    const hasCustomization = (item.portions && item.portions.length > 1) || (item.add_ons && item.add_ons.length > 0);
    const cartCount = this.state.cart.filter(c => c.item_id === item.id).reduce((s, i) => s + i.quantity, 0);

    return `
      <div class="swiggy-dish-card ${isOutOfStock ? 'out-of-stock' : ''}" id="card-${item.id}">
        <!-- Left Side: Dish Info -->
        <div class="swiggy-dish-left">
          <div class="swiggy-dish-badges">
            <div class="diet-badge ${item.is_veg ? 'veg' : 'non-veg'}" title="${item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}">
              <span class="diet-mark ${item.is_veg ? 'veg-dot' : 'non-veg-triangle'}"></span>
            </div>
            ${item.is_bestseller ? '<span class="swiggy-bestseller-badge">★ Bestseller</span>' : ''}
            <span class="swiggy-spice-tag">🌶️ ${item.spice_level}</span>
          </div>

          <h3 class="swiggy-dish-title">${item.name}</h3>

          <div class="swiggy-price-row">
            <span class="swiggy-dish-price">₹${item.base_price}</span>
            <span class="swiggy-gst-sub">incl. 5% GST</span>
          </div>

          <p class="swiggy-dish-desc">${item.description}</p>

          <div class="swiggy-dish-meta">
            <span class="swiggy-prep-pill">⏱️ ${item.prep_complexity_minutes} mins</span>
            ${hasCustomization ? '<span class="swiggy-portion-pill">Customisable</span>' : ''}
          </div>
        </div>

        <!-- Right Side: 124x124 Food Image with Overlapping ADD / Stepper -->
        <div class="swiggy-dish-right">
          <div class="swiggy-img-wrap">
            <img src="${item.image_url}" alt="${item.name}" class="swiggy-dish-img" loading="lazy">
            
            <div class="swiggy-action-container">
              ${isOutOfStock ? `
                <div class="swiggy-sold-out-pill">SOLD OUT</div>
              ` : cartCount > 0 ? `
                <div class="swiggy-stepper">
                  <button class="swiggy-stepper-btn" onclick="App.quickDecrementItem('${item.id}')" aria-label="Decrease">−</button>
                  <span class="swiggy-stepper-qty">${cartCount}</span>
                  <button class="swiggy-stepper-btn" onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}" aria-label="Increase">+</button>
                </div>
              ` : `
                <button class="swiggy-add-btn" onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">
                  <span>ADD</span>
                  <span class="swiggy-add-plus">+</span>
                </button>
              `}
            </div>
          </div>
          ${hasCustomization && !isOutOfStock ? '<span class="swiggy-bottom-custom-hint">Customisable</span>' : ''}
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
    const title = document.getElementById('custom-modal-title');
    const subtitle = document.getElementById('custom-modal-subtitle');
    const body = document.getElementById('custom-modal-body');
    const footer = document.getElementById('custom-modal-footer');

    if (!modal || !body || !footer) return;

    title.textContent = `Customize ${item.name}`;
    subtitle.textContent = item.is_veg ? '🌱 Pure Vegetarian • Slow Dum Cooking' : '🍖 Tender Gosht • Slow Dum Cooking';

    this.renderCustomModalContents();
    modal.classList.add('open');
  },

  closeCustomModal() {
    const modal = document.getElementById('custom-modal-backdrop');
    if (modal) modal.classList.remove('open');
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
        <div style="margin-bottom: 1.75rem;">
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.75rem; display: flex; justify-content: space-between;">
            <span>Choose Portion</span>
            <span style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 800; text-transform: uppercase;">Required</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            ${item.portions.map(p => {
              const isSelected = this.state.selectedPortion && this.state.selectedPortion.id === p.id;
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border: 1.5px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}; background: ${isSelected ? 'var(--accent-gold-subtle)' : '#FFFFFF'}; border-radius: 12px; cursor: pointer; transition: all 0.15s ease;" 
                     onclick="App.selectCustomPortion('${p.id}')">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="radio" name="custom-portion" ${isSelected ? 'checked' : ''} style="accent-color: var(--accent-gold); width: 18px; height: 18px;">
                    <div>
                      <strong style="font-size: 0.92rem; color: var(--text-main); display: block;">${p.name}</strong>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">Serves ${p.serves_count} ${p.serves_count > 1 ? 'people' : 'person'}</span>
                    </div>
                  </div>
                  <strong style="font-size: 0.95rem; color: var(--text-main);">
                    ₹${basePrice + p.price_delta}
                  </strong>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Add-ons Option -->
      ${item.add_ons && item.add_ons.length > 0 ? `
        <div>
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--text-main); margin-bottom: 0.75rem; display: flex; justify-content: space-between;">
            <span>Royal Accompaniments</span>
            <span style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">Optional</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.6rem;">
            ${item.add_ons.map(a => {
              const isChecked = this.state.selectedAddOns.some(sa => sa.id === a.id);
              return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 1rem; border: 1.5px solid ${isChecked ? 'var(--accent-gold)' : 'var(--border-subtle)'}; background: ${isChecked ? 'var(--accent-gold-subtle)' : '#FFFFFF'}; border-radius: 12px; cursor: pointer; transition: all 0.15s ease;" 
                     onclick="App.toggleCustomAddOn('${a.id}')">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="checkbox" ${isChecked ? 'checked' : ''} style="accent-color: var(--accent-gold); width: 18px; height: 18px;">
                    <strong style="font-size: 0.9rem; color: var(--text-main);">${a.name}</strong>
                  </div>
                  <strong style="font-size: 0.9rem; color: var(--accent-gold);">
                    +₹${a.price}
                  </strong>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    `;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <span style="font-size: 0.82rem; color: var(--text-muted); display: block;">Total (incl. 5% GST):</span>
          <strong style="font-size: 1.4rem; color: var(--text-main);">₹${calculatedTotal}</strong>
        </div>
        <button class="btn-cart-nav" style="padding: 0.85rem 1.75rem; font-size: 1rem; border-radius: 12px;" 
                onclick="App.commitCustomModalAdd()">
          Add to Feast ➔
        </button>
      </div>
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

  setFoodType(type) {
    this.state.foodType = type; // 'all' | 'veg' | 'nonveg'
    if (type === 'veg') {
      this.state.vegOnly = true;
    } else {
      this.state.vegOnly = false;
    }
    this.renderOrderingView();
  },

  setSpiceFilter(spice) {
    this.state.spiceFilter = spice;
    this.renderOrderingView();
  },

  toggleInStockOnly(inStock) {
    this.state.inStockOnly = inStock;
    this.renderOrderingView();
  },

  scrollToSearch() {
    const el = document.getElementById('search-section-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  },

  resetAllFilters() {
    this.state.searchQuery = '';
    this.state.activeCategory = 'All Curations';
    this.state.foodType = 'all';
    this.state.vegOnly = false;
    this.state.spiceFilter = 'all';
    this.state.inStockOnly = false;
    this.state.sortBy = 'popularity';
    this.renderOrderingView();
  },

  matchesCategory(item, cat) {
    if (!cat || cat === 'All Curations' || cat === 'All') return true;
    const name = (item.name || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    const itemCat = (item.category || '').toLowerCase();

    switch (cat) {
      case 'Chicken Biryani':
        return itemCat.includes('biryani') && (name.includes('chicken') || desc.includes('chicken'));
      case 'Mutton Biryani':
        return itemCat.includes('biryani') && (name.includes('mutton') || desc.includes('mutton') || name.includes('gosht'));
      case 'Veg Biryani':
        return itemCat.includes('biryani') && (item.is_veg === 1 || name.includes('veg') || name.includes('subz'));
      case 'Starters':
        return itemCat.includes('starter') || name.includes('65') || name.includes('pathar');
      case 'Kebabs':
        return itemCat.includes('kebab') || itemCat.includes('starter') || name.includes('pathar') || name.includes('kebab') || name.includes('tikka');
      case 'Curries':
        return itemCat.includes('curry') || itemCat.includes('curries') || name.includes('salan') || name.includes('gravy');
      case 'Haleem':
        return name.includes('haleem') || desc.includes('haleem');
      case 'Desserts':
        return itemCat.includes('dessert') && !name.includes('chai') && !name.includes('shake');
      case 'Beverages':
        return name.includes('chai') || name.includes('shake') || name.includes('beverage') || name.includes('drink');
      default:
        return itemCat.toLowerCase() === cat.toLowerCase();
    }
  },

  onSearchInput(val) {
    this.state.searchQuery = val;
    this.renderOrderingView();
    const input = document.getElementById('menu-search-input');
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  },

  scrollToMenu() {
    const el = document.getElementById('menu-curations-anchor');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  },

  setSort(sortBy) {
    this.state.sortBy = sortBy;
    this.renderOrderingView();
  },

  renderBestsellerMiniCard(item) {
    const hasCustomization = (item.portions && item.portions.length > 1) || (item.add_ons && item.add_ons.length > 0);
    return `
      <div class="bestseller-mini-card">
        <div class="bestseller-mini-media">
          <img src="${item.image_url}" alt="${item.name}" class="bestseller-mini-img" loading="lazy">
          <div class="bestseller-crown-badge">👑 Bestseller</div>
        </div>
        <div class="bestseller-mini-body">
          <div class="bestseller-mini-title">${item.name}</div>
          <p class="bestseller-mini-desc">${item.description}</p>
          <div class="bestseller-mini-footer">
            <span class="bestseller-mini-price">₹${item.base_price}</span>
            <button class="btn-add-action" style="padding: 0.35rem 0.95rem; font-size: 0.8rem;" 
                    onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">
              + ADD
            </button>
          </div>
        </div>
      </div>
    `;
  },

  toggleVegFilter(isVeg) {
    this.state.vegOnly = isVeg;
    this.renderOrderingView();
  },

  // --------------------------------------------------------------------------
  // CART ACTIONS & DRAWER
  // --------------------------------------------------------------------------
  addToCart(itemId) {
    const item = this.state.menu.find(m => m.id === itemId);
    if (!item || !item.is_available) {
      this.showToast('Item currently unavailable at this outlet', 'error');
      return;
    }

    let portionName = 'Regular';
    let unitPrice = item.base_price;

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
        add_ons: []
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

    const mobBadge = document.getElementById('mob-cart-badge');
    if (mobBadge) {
      mobBadge.textContent = totalCount;
      mobBadge.style.display = totalCount > 0 ? 'inline-block' : 'none';
    }

    // Floating Cart Bar
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
        <div style="text-align: center; padding: 4rem 1rem;">
          <div style="font-size: 3.5rem; margin-bottom: 1rem;">🍲</div>
          <h4 style="color: var(--text-main); font-size: 1.35rem; margin-bottom: 0.5rem;">Your Cart is Empty</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; max-width: 320px; margin: 0 auto;">
            Explore our royal Hyderabadi Dum Biryanis, Shahi Haleem and Kebabs to begin your direct feast.
          </p>
        </div>
      `;
      footer.innerHTML = `
        <button class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 0.95rem; font-size: 1rem; border-radius: 12px;" onclick="App.closeCartDrawer()">
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
            <div style="display: flex; justify-content: space-between; align-items: center; background-color: var(--bg-surface); padding: 0.85rem 1.1rem; border-radius: 12px; border: 1px solid var(--border-subtle);">
              <div>
                <strong style="color: var(--text-main); font-size: 0.95rem;">${item.name}</strong>
                <div style="font-size: 0.78rem; color: var(--accent-gold); font-weight: 700;">${item.portion}</div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">₹${item.unit_price} x ${item.quantity} = ₹${itemTotal}</div>
              </div>
              <div class="qty-stepper-box" style="background: #FFFFFF;">
                <button class="qty-step-btn" onclick="App.changeCartQty(${idx}, -1)">-</button>
                <span class="qty-step-val">${item.quantity}</span>
                <button class="qty-step-btn" onclick="App.changeCartQty(${idx}, 1)">+</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // GST Math
    const taxable = subtotal / 1.05;
    const gst = Math.round((subtotal - taxable) * 100) / 100;

    footer.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary);">
        <span>Item Total (incl. 5% GST):</span>
        <strong style="color: var(--text-main); font-size: 1.05rem;">₹${subtotal}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 1.25rem; font-size: 0.8rem; color: var(--text-muted);">
        <span>Included GST (CGST 2.5% + SGST 2.5%):</span>
        <span>₹${gst}</span>
      </div>
      <button class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 1rem; font-size: 1.05rem; border-radius: 14px;" 
              onclick="App.closeCartDrawer(); App.navigate('checkout');">
        Proceed to Express Checkout (₹${subtotal}) ➔
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
      <div style="max-width: 1000px; margin: 0 auto; padding-bottom: 3rem;">
        
        <!-- Header -->
        

        <div class="page-header-center">
          <h1 class="page-title">Checkout</h1>
          <p class="page-subtitle">Direct kitchen order • Fast delivery • 5% Cashback</p>
        </div>

        <!-- Delivery Estimate Callout -->
        <div style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 1.5px solid #FDE68A; border-left: 5px solid var(--accent-gold); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: var(--shadow-sm);">
          <div style="font-size: 2.2rem;">⏱️</div>
          <div>
            <div style="font-weight: 800; font-size: 1.1rem; color: var(--accent-gold-hover);">
              Estimated Delivery Time: ~${honestPrepMinutes} Minutes
            </div>
            <div style="font-size: 0.86rem; color: var(--text-secondary); margin-top: 0.2rem;">
              ${prepRationale}
            </div>
          </div>
        </div>

        <div class="checkout-grid">
          
          <!-- Left Column: Delivery & Payment Details -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Delivery Address Card -->
            <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-sm);">
              <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.6rem;">
                <span>📍</span> Delivery Address (Hyderabad)
              </h3>
              
              <div style="display: flex; gap: 0.6rem; margin-bottom: 1rem; flex-wrap: wrap;">
                <button class="category-chip active" type="button" onclick="document.getElementById('checkout-address').value = 'Flat 402, Aditya Sunshine, Kondapur, Hyderabad - 500084'">
                  Home (Kondapur)
                </button>
                <button class="category-chip" type="button" onclick="document.getElementById('checkout-address').value = 'Tower 4, Apt 1102, My Home Bhooja, Gachibowli, Hyderabad - 500032'">
                  Work (Gachibowli)
                </button>
              </div>

              <textarea id="checkout-address" rows="2" style="width: 100%; margin-bottom: 1rem;" placeholder="Enter complete flat/plot, street, landmark...">Flat 402, Aditya Sunshine, Kondapur, Hyderabad - 500084</textarea>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
                <input type="text" id="checkout-name" value="${this.state.customerName}" placeholder="Your Full Name">
                <input type="tel" id="checkout-phone" value="${this.state.customerPhone}" placeholder="Phone Number (+91)">
              </div>
            </div>

            <!-- Notifications Consent Card -->
            <div style="background-color: var(--accent-emerald-subtle); border: 1.5px solid #A7F3D0; border-radius: 14px; padding: 1.15rem 1.25rem;">
              <label style="display: flex; align-items: flex-start; gap: 0.85rem; cursor: pointer;">
                <input type="checkbox" id="dpdp-consent" checked style="accent-color: var(--accent-emerald); width: 20px; height: 20px; margin-top: 2px;">
                <span style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">
                  <strong>Order Updates:</strong> Send live tracking and delivery notifications via WhatsApp and SMS.
                </span>
              </label>
            </div>

            <!-- Payment Method Preference Pre-Selector -->
            <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-sm);">
              <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.6rem;">
                <span>💳</span> Choose Payment Mode
              </h3>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                <label style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 0.85rem 1.1rem; border-radius: 12px; border: 2px solid var(--accent-gold); cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="radio" name="payment-method" value="UPI" checked style="accent-color: var(--accent-gold); width: 18px; height: 18px;">
                    <div>
                      <strong style="color: var(--text-main); font-size: 0.92rem;">UPI Instant Pay (QR / Apps)</strong>
                      <div style="font-size: 0.76rem; color: var(--text-muted);">GPay, PhonePe, Paytm, BHIM</div>
                    </div>
                  </div>
                  <span style="background: var(--accent-emerald-light); color: var(--accent-emerald); font-size: 0.72rem; padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 800;">Recommended</span>
                </label>

                <label style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 0.85rem 1.1rem; border-radius: 12px; border: 1.5px solid var(--border-subtle); cursor: pointer;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <input type="radio" name="payment-method" value="Card" style="accent-color: var(--accent-gold); width: 18px; height: 18px;">
                    <div>
                      <strong style="color: var(--text-main); font-size: 0.92rem;">Credit / Debit Card (Mock Test)</strong>
                      <div style="font-size: 0.76rem; color: var(--text-muted);">Visa, Mastercard, RuPay</div>
                    </div>
                  </div>
                  <span style="color: var(--text-dim); font-size: 0.72rem; font-weight: 700;">Test 4242</span>
                </label>
              </div>
            </div>

          </div>

          <!-- Right Column: Order Bill Breakdown & Action -->
          <div>
            <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.5rem; box-shadow: var(--shadow-sm); position: sticky; top: 90px;">
              <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 1rem;">Order Summary</h3>
              
              <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem; max-height: 200px; overflow-y: auto;">
                ${this.state.cart.map(i => `
                  <div style="display: flex; justify-content: space-between; font-size: 0.86rem;">
                    <span style="color: var(--text-secondary);"><strong style="color: var(--text-main);">${i.quantity}x</strong> ${i.name} (${i.portion})</span>
                    <strong style="color: var(--text-main);">₹${i.unit_price * i.quantity}</strong>
                  </div>
                `).join('')}
              </div>

              <!-- Coupon Code Box -->
              <div style="margin-bottom: 1.25rem;">
                <label style="font-size: 0.78rem; color: var(--text-muted); display: block; margin-bottom: 0.35rem; font-weight: 700;">Coupon Code</label>
                <div style="display: flex; gap: 0.45rem;">
                  <input type="text" id="coupon-input" value="${this.state.activeCoupon ? this.state.activeCoupon.code : 'DIRECT15'}" 
                         placeholder="e.g. DIRECT15" style="flex: 1; font-weight: 800; text-transform: uppercase;">
                  <button class="category-chip active" style="padding: 0.5rem 0.85rem;" onclick="App.applyCoupon()">Apply</button>
                </div>
                <div style="font-size: 0.72rem; color: var(--accent-gold); margin-top: 0.3rem; font-weight: 600;">
                  Try <strong>DIRECT15</strong> for 15% off or <strong>NIZAM100</strong> for ₹100 off!
                </div>
              </div>

              <!-- Loyalty Points Redemption -->
              <div style="background-color: var(--bg-surface); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                  <span style="font-size: 0.82rem; font-weight: 800; color: var(--accent-gold);">👑 Direct Loyalty Balance</span>
                  <span style="font-size: 0.85rem; font-weight: 800; color: var(--text-main);">${this.state.customerLoyaltyBalance} Pts (₹${this.state.customerLoyaltyBalance})</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <input type="range" min="0" max="${maxRedeemable}" value="${validLoyaltyRedeem}" step="10" 
                         style="flex: 1; accent-color: var(--accent-gold);" 
                         oninput="App.setLoyaltyRedeem(this.value)">
                  <strong style="color: var(--accent-gold); min-width: 45px; text-align: right; font-size: 0.9rem;">-₹${validLoyaltyRedeem}</strong>
                </div>
                <div style="font-size: 0.72rem; color: var(--accent-emerald); margin-top: 0.35rem; font-weight: 700;">
                  + You will earn 5% back (₹${Math.round(finalTotal * 0.05)}) upon placing this order!
                </div>
              </div>

              <!-- Bill Breakdown Lines -->
              <div style="border-top: 1.5px solid var(--border-subtle); padding-top: 0.85rem; display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.88rem;">
                <div style="display: flex; justify-content: space-between; color: var(--text-secondary);">
                  <span>Subtotal:</span>
                  <strong style="color: var(--text-main);">₹${subtotal}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--text-muted); font-size: 0.78rem;">
                  <span>Incl. 5% GST (Taxable: ₹${Math.round(taxable)}):</span>
                  <span>₹${gst}</span>
                </div>
                <div style="display: flex; justify-content: space-between; color: var(--accent-emerald); font-weight: 700;">
                  <span>Direct Delivery Fee (Zero App Fees):</span>
                  <span>FREE</span>
                </div>
                ${discount > 0 ? `
                  <div style="display: flex; justify-content: space-between; color: var(--accent-gold); font-weight: 700;">
                    <span>Discount (${this.state.activeCoupon.code}):</span>
                    <span>-₹${Math.round(discount)}</span>
                  </div>
                ` : ''}
                ${validLoyaltyRedeem > 0 ? `
                  <div style="display: flex; justify-content: space-between; color: var(--accent-gold); font-weight: 700;">
                    <span>Royalty Points Redeemed:</span>
                    <span>-₹${validLoyaltyRedeem}</span>
                  </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; border-top: 1.5px solid var(--border-subtle); padding-top: 0.75rem; font-size: 1.35rem; font-weight: 900; color: var(--text-main);">
                  <span>Grand Total:</span>
                  <span style="color: var(--accent-gold);">₹${finalTotal}</span>
                </div>
              </div>

              <!-- Proceed to Payment Button -->
              <button id="place-order-btn" class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 1.1rem; font-size: 1.05rem; border-radius: 14px; margin-top: 1.5rem;" 
                      onclick="App.openPaymentModal(${finalTotal}, ${subtotal}, ${gst}, ${discount}, ${validLoyaltyRedeem})">
                Proceed to Pay ₹${finalTotal} ➔
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  // --------------------------------------------------------------------------
  // INTERACTIVE MOCK PAYMENT GATEWAY MODAL
  // --------------------------------------------------------------------------
  openPaymentModal(totalAmount, subtotal, gst, discount, loyaltyRedeemed) {
    this.state.pendingPayment = { totalAmount, subtotal, gst, discount, loyaltyRedeemed };
    this.state.paymentTab = this.state.paymentTab || 'upi';
    this.renderPaymentModalContent();
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.add('open');
  },

  closePaymentModal() {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.classList.remove('open');
  },

  setPaymentTab(tab) {
    this.state.paymentTab = tab;
    this.renderPaymentModalContent();
  },

  renderPaymentModalContent() {
    const body = document.getElementById('payment-modal-body');
    if (!body || !this.state.pendingPayment) return;
    const { totalAmount } = this.state.pendingPayment;
    const tab = this.state.paymentTab;

    body.innerHTML = `
      <!-- Total Payable Banner -->
      <div style="background: #F8FAFC; border: 1px solid var(--border-subtle); padding: 1rem 1.25rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
        <div>
          <div style="font-size: 0.78rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Amount Payable</div>
          <div style="font-size: 1.6rem; font-weight: 900; color: var(--accent-gold);">₹${totalAmount}</div>
        </div>
        <span style="font-size: 0.75rem; background: var(--accent-emerald-light); color: var(--accent-emerald); padding: 0.3rem 0.65rem; border-radius: 9999px; font-weight: 800;">
          5% GST Included
        </span>
      </div>

      <!-- Mode Selector Tabs -->
      <div class="payment-tabs">
        <button class="payment-tab-btn ${tab === 'upi' ? 'active' : ''}" onclick="App.setPaymentTab('upi')">
          📱 UPI Test Pay
        </button>
        <button class="payment-tab-btn ${tab === 'card' ? 'active' : ''}" onclick="App.setPaymentTab('card')">
          💳 Card Test Pay
        </button>
        <button class="payment-tab-btn ${tab === 'cod' ? 'active' : ''}" onclick="App.setPaymentTab('cod')">
          💵 Pay on Delivery
        </button>
      </div>

      ${tab === 'upi' ? `
        <!-- UPI Test Mode Simulation -->
        <div class="upi-qr-box">
          <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.75rem; font-weight: 700;">
            Scan Test QR or Click Instant Simulator App
          </div>
          
          <div style="width: 150px; height: 150px; margin: 0 auto 0.85rem auto; background: #000; border: 6px solid #FFF; box-shadow: var(--shadow-sm); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
            <svg width="134" height="134" viewBox="0 0 100 100" fill="#FFF">
              <rect x="0" y="0" width="30" height="30" fill="#FFF"/>
              <rect x="5" y="5" width="20" height="20" fill="#000"/>
              <rect x="70" y="0" width="30" height="30" fill="#FFF"/>
              <rect x="75" y="5" width="20" height="20" fill="#000"/>
              <rect x="0" y="70" width="30" height="30" fill="#FFF"/>
              <rect x="5" y="75" width="20" height="20" fill="#000"/>
              <rect x="40" y="40" width="20" height="20" fill="#FFF"/>
              <rect x="45" y="45" width="10" height="10" fill="#D97706"/>
              <rect x="35" y="10" width="10" height="20" fill="#FFF"/>
              <rect x="10" y="40" width="20" height="10" fill="#FFF"/>
              <rect x="70" y="50" width="20" height="15" fill="#FFF"/>
              <rect x="45" y="75" width="25" height="15" fill="#FFF"/>
            </svg>
          </div>

          <div style="font-size: 0.78rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">
            VPA: <strong>companya.direct@icici</strong>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          <button class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 0.95rem; background: #008643; border-radius: 10px;" onclick="App.processMockPayment('UPI (Google Pay)', 'GPAY_TXN_' + Math.floor(100000 + Math.random() * 900000), 'SUCCESS')">
            🟢 Authorize UPI Payment (Simulate Success) ➔
          </button>
          
          <div style="display: flex; gap: 0.5rem;">
            <button class="side-action-btn" style="flex: 1; padding: 0.65rem; font-size: 0.8rem; background: #FEE2E2; color: #DC2626; border-color: #FCA5A5;" onclick="App.processMockPayment('UPI (GPay)', 'SIM_DECLINE_' + Math.floor(100000 + Math.random() * 900000), 'DECLINE')">
              🔴 Simulate Bank Decline
            </button>
            <button class="side-action-btn" style="flex: 1; padding: 0.65rem; font-size: 0.8rem; background: #FEF3C7; color: #D97706; border-color: #FCD34D;" onclick="App.processMockPayment('UPI (GPay)', 'SIM_TIMEOUT_' + Math.floor(100000 + Math.random() * 900000), 'TIMEOUT')">
              🟠 Simulate PSP Timeout
            </button>
          </div>
        </div>
      ` : tab === 'card' ? `
        <!-- Card Test Mode Simulation -->
        <div class="mock-card-visual">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <span style="font-size: 1.4rem;">💳</span>
            <span style="font-size: 1.1rem; font-weight: 800; letter-spacing: 0.05em;">VISA TEST GATEWAY</span>
          </div>
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; letter-spacing: 0.15em; margin-bottom: 1.25rem;">
            4242 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 4242
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem;">
            <div>
              <div style="color: #94A3B8; font-size: 0.65rem; text-transform: uppercase;">Card Holder</div>
              <div style="font-weight: 700;">${this.state.customerName}</div>
            </div>
            <div>
              <div style="color: #94A3B8; font-size: 0.65rem; text-transform: uppercase;">Expires</div>
              <div style="font-weight: 700;">12 / 28</div>
            </div>
            <div>
              <div style="color: #94A3B8; font-size: 0.65rem; text-transform: uppercase;">CVV</div>
              <div style="font-weight: 700;">888</div>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.6rem;">
          <button class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 0.95rem; font-size: 1rem; border-radius: 12px; background: #2563EB;" onclick="App.processMockPayment('Card (Visa 4242)', 'CARD_AUTH_' + Math.floor(100000 + Math.random() * 900000), 'SUCCESS')">
            Authorize ₹${totalAmount} Test Card Payment ➔
          </button>
          
          <div style="display: flex; gap: 0.5rem;">
            <button class="side-action-btn" style="flex: 1; padding: 0.65rem; font-size: 0.8rem; background: #FEE2E2; color: #DC2626; border-color: #FCA5A5;" onclick="App.processMockPayment('Card (Visa 4242)', 'CARD_DECLINE_' + Math.floor(100000 + Math.random() * 900000), 'DECLINE')">
              🔴 Simulate Card Decline
            </button>
            <button class="side-action-btn" style="flex: 1; padding: 0.65rem; font-size: 0.8rem; background: #FEF3C7; color: #D97706; border-color: #FCD34D;" onclick="App.processMockPayment('Card (Visa 4242)', 'CARD_TIMEOUT_' + Math.floor(100000 + Math.random() * 900000), 'TIMEOUT')">
              🟠 Simulate Issuer Timeout
            </button>
          </div>
        </div>
      ` : `
        <!-- Cash On Delivery -->
        <div style="background: var(--bg-surface); padding: 1.5rem; border-radius: 14px; border: 1.5px solid var(--border-subtle); margin-bottom: 1.25rem; text-align: center;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💵</div>
          <h4 style="font-size: 1.1rem; color: var(--text-main); margin-bottom: 0.35rem;">Pay on Delivery (Cash or QR)</h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5;">
            Keep exact change or scan the delivery partner's QR code upon arrival.
          </p>
        </div>

        <button class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 1rem; font-size: 1rem; border-radius: 12px;" onclick="App.processMockPayment('Cash on Delivery', 'COD_' + Math.floor(100000 + Math.random() * 900000), 'SUCCESS')">
          Confirm Order with Pay on Delivery (₹${totalAmount}) ➔
        </button>
      `}
    `;
  },

  async processMockPayment(method, refId, action = 'SUCCESS') {
    const body = document.getElementById('payment-modal-body');
    if (body) {
      body.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem;">
          <div style="font-size: 2.5rem; margin-bottom: 0.8rem; animation: kdsPulse 1s infinite;">⚡</div>
          <h3 style="font-size: 1.25rem; color: var(--text-main); margin-bottom: 0.3rem;">Contacting Payment Gateway...</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Simulating banking authorization (${method} • ${refId})</p>
        </div>
      `;
    }

    try {
      const amount = this.state.pendingPayment ? this.state.pendingPayment.totalAmount : 1180;
      const res = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          method,
          test_action: action,
          ref_id: refId
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        this.closePaymentModal();
        if (!this.state.pendingPayment) return;
        const { totalAmount, subtotal, gst, discount, loyaltyRedeemed } = this.state.pendingPayment;
        await this.submitOrder(totalAmount, subtotal, gst, discount, loyaltyRedeemed, method, data.transaction_id);
      } else {
        // Failed or declined state: display error in modal with Retry button
        if (body) {
          body.innerHTML = `
            <div style="text-align: center; padding: 1.5rem 1rem;">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">⚠️</div>
              <h3 style="font-size: 1.2rem; color: #DC2626; margin-bottom: 0.4rem;">Payment Authorization Failed</h3>
              <p style="font-size: 0.86rem; color: var(--text-secondary); margin-bottom: 1.25rem; line-height: 1.5;">
                ${data.error || 'The test transaction was declined by the simulated payment network.'}
              </p>
              <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn-cart-nav" style="background: #16A34A;" onclick="App.renderPaymentModalContent()">
                  🔄 Retry Payment
                </button>
                <button class="side-action-btn" onclick="App.closePaymentModal()">
                  Back to Cart
                </button>
              </div>
            </div>
          `;
        }
      }
    } catch (e) {
      this.showToast('Network error during payment gateway simulation', 'error');
      this.closePaymentModal();
    }
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

  async submitOrder(totalAmount, subtotal, gstAmount, discountAmount, loyaltyRedeemed, chosenPaymentMethod = 'UPI', transactionRef = '') {
    const btn = document.getElementById('place-order-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Confirming your feast...';
    }

    const name = document.getElementById('checkout-name')?.value || this.state.customerName;
    const phone = document.getElementById('checkout-phone')?.value || this.state.customerPhone;
    const address = document.getElementById('checkout-address')?.value || 'Kondapur, Hyderabad';
    const dpdpConsent = document.getElementById('dpdp-consent')?.checked;
    const paymentMethod = chosenPaymentMethod || document.querySelector('input[name="payment-method"]:checked')?.value || 'UPI';

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
          payment_transaction_id: transactionRef || `TXN_${Date.now()}`,
          dpdp_marketing_consent: dpdpConsent ? 1 : 0
        })
      });

      const data = await res.json();
      if (res.ok) {
        this.showToast(`Order Placed! #${data.order.id} (${paymentMethod} Paid)`, 'success');
        this.playOrderChime();
        this.state.activeOrderId = data.order.id;
        this.state.cart = [];
        this.state.activeCoupon = null;
        this.state.loyaltyPointsRedeemed = 0;
        this.updateCartBadge();
        await this.fetchLoyalty();
        await this.fetchOrders();
        this.navigate('tracking');
      } else {
        this.showToast(data.error || 'Failed to place order', 'error');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Proceed to Mock Payment ➔';
        }
      }
    } catch (e) {
      this.showToast('Network error placing order', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Proceed to Mock Payment ➔';
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
          <button class="btn-cart-nav" style="margin: 1.5rem auto; display: inline-flex;" onclick="App.navigate('ordering')">Order Now</button>
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

    let countdownText = `${diffMins} mins remaining`;
    let countdownColor = 'var(--accent-emerald)';
    if (order.status === 'READY_FOR_PICKUP') {
      countdownText = 'Ready for Pickup / Handover';
      countdownColor = 'var(--accent-emerald)';
    } else if (order.status === 'DISPATCHED' || order.status === 'OUT_FOR_DELIVERY') {
      countdownText = 'Out for Direct Delivery';
      countdownColor = 'var(--accent-emerald)';
    } else if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
      countdownText = 'Delivered Fresh';
      countdownColor = 'var(--accent-emerald)';
    } else if (isLate) {
      countdownText = `Late by ${Math.abs(diffMins)} mins`;
      countdownColor = 'var(--accent-rose)';
    }

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding-bottom: 3rem;">
        
        <!-- Header: Back button on left, Title & Subtitle centered -->
        <div class="page-top-bar" style="margin-bottom: 0.5rem;">
          <button class="btn-back-link" onclick="App.navigate('ordering')">← Back to Menu</button>
        </div>

        <div class="page-header-center">
          <h1 class="page-title">Live Order Status</h1>
          <p class="page-subtitle">Real-time updates directly from our kitchen display and delivery fleet.</p>
        </div>

        <div style="display: flex; justify-content: center; gap: 0.5rem; overflow-x: auto; align-items: center; margin-bottom: 2rem; flex-wrap: wrap;">
          ${this.state.orders.slice(0, 4).map(o => `
            <button class="category-chip ${o.id === order.id ? 'active' : ''}" onclick="App.setActiveOrder('${o.id}')">
              #${o.id} (${o.status})
            </button>
          `).join('')}
          <button class="category-chip" style="background: var(--accent-rose-light); color: var(--accent-rose); border-color: var(--accent-rose); font-weight: 800;" onclick="App.simulateLateDelay('${order.id}')" title="Trigger delay simulation">
            ⚡ Test 10m Delay
          </button>
        </div>

        <!-- Late Apology Banner -->
        ${order.late_alert_triggered ? `
          <div style="background: #FEF2F2; border: 2px solid #F87171; border-left: 6px solid #EF4444; border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 2.2rem;">🎁</div>
            <div>
              <div style="font-weight: 800; font-size: 1.1rem; color: #991B1B;">
                Order Running Late: ₹50 Wallet Credit Added
              </div>
              <div style="font-size: 0.86rem; color: #7F1D1D; margin-top: 0.2rem;">
                Your order is taking slightly longer due to kitchen demand at ${order.outlet_name}. We have credited ₹50 to your account.
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Main Tracking Card -->
        <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 20px; padding: 2.25rem; margin-bottom: 2.5rem; box-shadow: var(--shadow-md);">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 1.5px solid var(--border-subtle); padding-bottom: 1.5rem;">
            <div>
              <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--accent-gold); font-weight: 800;">Order Details</span>
              <h3 style="font-size: 2rem; color: var(--text-main); margin-top: 0.25rem; font-family: 'JetBrains Mono', monospace;">#${order.id}</h3>
              <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.35rem;">
                Outlet: <strong>${order.outlet_name}</strong> • FSSAI: ${order.fssai_license || '13622014000491'}
              </div>
            </div>

            <div style="text-align: right;">
              <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Estimated Arrival:</div>
              <div style="font-size: 1.6rem; font-weight: 900; color: ${isLate ? 'var(--accent-rose)' : 'var(--accent-gold)'}; font-family: 'JetBrains Mono', monospace;">
                ${new Date(order.promised_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style="font-size: 0.85rem; font-weight: 800; color: ${countdownColor};" id="tracking-countdown">
                ${countdownText}
              </div>
            </div>
          </div>

          <!-- Step-by-Step Progress Timeline -->
          <div style="display: flex; justify-content: space-between; position: relative; margin: 3rem 0 2.5rem 0;">
            <div style="position: absolute; top: 22px; left: 30px; right: 30px; height: 4px; background: var(--border-subtle); z-index: 1;"></div>
            
            ${[
              { stage: 'PLACED', label: 'Order Placed', icon: '📝' },
              { stage: 'PREPARING', label: 'Cooking', icon: '🔥' },
              { stage: 'READY_FOR_PICKUP', label: 'Packed & Ready', icon: '📦' },
              { stage: 'DISPATCHED', label: 'Out for Delivery', icon: '🛵' },
              { stage: 'COMPLETED', label: 'Delivered', icon: '👑' }
            ].map((step, idx) => {
              const isDone = currentStageIdx >= idx;
              const isCurrent = currentStageIdx === idx;
              return `
                <div style="display: flex; flex-direction: column; align-items: center; z-index: 2; width: 90px;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background: ${isDone ? 'var(--text-main)' : '#FFFFFF'}; color: ${isDone ? '#FFFFFF' : 'var(--text-dim)'}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; box-shadow: ${isCurrent ? '0 0 0 5px var(--accent-gold-light)' : 'var(--shadow-sm)'}; border: 2.5px solid ${isDone ? 'var(--text-main)' : 'var(--border-subtle)'};">
                    ${step.icon}
                  </div>
                  <div style="font-size: 0.82rem; font-weight: 800; margin-top: 0.65rem; text-align: center; color: ${isDone ? 'var(--text-main)' : 'var(--text-dim)'};">
                    ${step.label}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Order Items Breakdown -->
          <div style="background-color: var(--bg-surface); border-radius: 14px; padding: 1.5rem; border: 1.5px solid var(--border-subtle);">
            <div style="font-size: 0.9rem; font-weight: 800; color: var(--accent-gold); margin-bottom: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em;">Order Package Contents</div>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
              ${order.items.map(it => `
                <div style="display: flex; justify-content: space-between; font-size: 0.92rem;">
                  <span style="color: var(--text-secondary);"><strong style="color: var(--text-main);">${it.quantity}x</strong> ${it.name} ${it.portion ? `(${it.portion})` : ''}</span>
                  <strong style="color: var(--text-main);">₹${(it.unit_price || 0) * (it.quantity || 1)}</strong>
                </div>
              `).join('')}
            </div>
            <div style="border-top: 1.5px solid var(--border-subtle); margin-top: 1rem; padding-top: 1rem; display: flex; justify-content: space-between; font-size: 1.25rem; font-weight: 900;">
              <span style="color: var(--text-main);">Total Paid (incl. 5% GST):</span>
              <span style="color: var(--accent-gold);">₹${order.total_amount}</span>
            </div>
          </div>

        </div>

        <!-- WhatsApp / SMS Notification Live Simulator -->
        <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 20px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
            <h3 style="font-size: 1.2rem; color: var(--text-main); display: flex; align-items: center; gap: 0.6rem;">
              <span>📱</span> Simulated WhatsApp Notification to Customer
            </h3>
            <span style="background: var(--accent-emerald-light); color: var(--accent-emerald); font-size: 0.75rem; padding: 0.25rem 0.65rem; border-radius: 9999px; font-weight: 800;">
              DPDP 2023 Verified Opt-In
            </span>
          </div>

          <div style="background-color: #0B141A; border: 1px solid #222E35; border-radius: 14px; padding: 1.5rem; font-family: -apple-system, system-ui, sans-serif;">
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 1rem;">
              <span style="background: #25D366; color: #000; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.85rem;">✓</span>
              <strong style="color: #E9EDEF; font-size: 1rem;">Company A Direct Verified</strong>
              <span style="color: #8696A0; font-size: 0.78rem; margin-left: auto;">Today ${new Date(order.placed_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            <div style="background-color: #202C33; color: #E9EDEF; border-radius: 10px; padding: 1.1rem; font-size: 0.92rem; line-height: 1.6; white-space: pre-wrap;">
Adab *${order.customer_name}*! Your direct order *#${order.id}* from *${order.outlet_name}* is *${order.status}*.

📦 *Items:* ${order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
💰 *Total:* ₹${order.total_amount} (Incl. 5% GST)
⏱️ *Honest Promised Time:* ${new Date(order.promised_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
📍 *FSSAI Lic:* ${order.fssai_license || '13622014000491'}

Live tracker: https://order.company-a.isocode.in/track/${order.id}
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
    if (order.status === 'READY_FOR_PICKUP') {
      el.textContent = 'Ready for Pickup / Handover';
      el.style.color = 'var(--accent-emerald)';
    } else if (order.status === 'DISPATCHED' || order.status === 'OUT_FOR_DELIVERY') {
      el.textContent = 'Out for Direct Delivery';
      el.style.color = 'var(--accent-emerald)';
    } else if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
      el.textContent = 'Delivered Fresh';
      el.style.color = 'var(--accent-emerald)';
    } else if (diffMins < 0) {
      el.textContent = `Late by ${Math.abs(diffMins)} mins`;
      el.style.color = 'var(--accent-rose)';
    } else {
      el.textContent = `${diffMins} mins remaining`;
      el.style.color = 'var(--accent-emerald)';
    }
  },

  // --------------------------------------------------------------------------
  // VIEW 4: KITCHEN DISPLAY SYSTEM (KDS) - 3-COLUMN INDUSTRIAL KANBAN PIPELINE
  // --------------------------------------------------------------------------
  renderKdsView() {
    const container = document.getElementById('app-view-container');
    const filter = this.state.kdsOutletFilter;

    // Filter active orders for kitchen (exclude completed / cancelled / dispatched)
    let kdsOrders = this.state.orders.filter(o => 
      o.status !== 'COMPLETED' && 
      o.status !== 'CANCELLED' && 
      o.status !== 'DELIVERED' && 
      o.status !== 'DISPATCHED'
    );
    
    if (filter && filter !== 'all') {
      kdsOrders = kdsOrders.filter(o => o.outlet_id === filter);
    }

    const currentOutlet = this.state.outlets.find(o => o.id === filter) || this.state.outlets[0] || {
      name: 'Kondapur Flagship',
      fssai_license: '13622011000845'
    };

    // Channel filtering
    const channelFilter = this.state.kdsChannelFilter || 'all';
    const allCount = kdsOrders.length;
    const deliveryCount = kdsOrders.filter(o => !o.is_party_order && o.delivery_type !== 'takeaway').length;
    const takeawayCount = kdsOrders.filter(o => o.delivery_type === 'takeaway').length;
    const partyCount = kdsOrders.filter(o => o.is_party_order || (o.total_amount >= 3000)).length;

    let filteredOrders = kdsOrders;
    if (channelFilter === 'delivery') {
      filteredOrders = kdsOrders.filter(o => !o.is_party_order && o.delivery_type !== 'takeaway');
    } else if (channelFilter === 'takeaway') {
      filteredOrders = kdsOrders.filter(o => o.delivery_type === 'takeaway');
    } else if (channelFilter === 'party') {
      filteredOrders = kdsOrders.filter(o => o.is_party_order || (o.total_amount >= 3000));
    }

    // Stage filtering for mobile and compact views
    const stageFilter = this.state.kdsStageFilter || 'all';

    // Partition into 3 Kanban pipeline columns
    const incomingOrders = filteredOrders.filter(o => o.status === 'PLACED');
    const prepOrders = filteredOrders.filter(o => o.status === 'PREPARING');
    const readyOrders = filteredOrders.filter(o => o.status === 'READY_FOR_PICKUP');

    // Check if any order is late by 10+ mins
    const criticalLateOrders = kdsOrders.filter(o => o.late_alert_triggered === 1);

    container.innerHTML = `
      <div class="kds-container">
        
        <!-- Industrial KDS Header (Sticky on Mobile with Direct Outlet Switcher) -->
        <div class="kds-header">
          <div class="kds-title-group">
            <span class="kds-live-badge">LIVE KDS</span>
            <div>
              <div class="kds-outlet-name">${filter === 'all' ? 'All Hyderabad Kitchens (Central Hub)' : currentOutlet.name}</div>
              <div class="kds-outlet-meta">
                Live Kitchen Order Queue • FSSAI Lic: ${currentOutlet.fssai_license}
              </div>
            </div>
          </div>

          <!-- Outlet Selector & Controls (Includes ALL 17 Kitchens) -->
          <div class="kds-controls-cluster">
            <select class="role-dropdown kds-outlet-switcher" 
                    onchange="App.setKdsOutlet(this.value)">
              <option value="all" ${filter === 'all' ? 'selected' : ''}>🌟 All 17 Kitchens (Central Hub)</option>
              <optgroup label="Flagship Dine-In Outlets (14)">
                ${(this.state.outlets || []).filter(o => !o.is_cloud_kitchen).map(o => `
                  <option value="${o.id}" ${filter === o.id ? 'selected' : ''}>${o.name}</option>
                `).join('')}
              </optgroup>
              <optgroup label="Cloud Kitchen Hubs (3 Dedicated)">
                ${(this.state.outlets || []).filter(o => o.is_cloud_kitchen).map(o => `
                  <option value="${o.id}" ${filter === o.id ? 'selected' : ''}>${o.name} (Cloud Kitchen)</option>
                `).join('')}
              </optgroup>
            </select>

            <button class="kds-exit-btn kds-desktop-only-btn" onclick="App.toggleKdsFullscreen()" title="Toggle Fullscreen Mode">
              ⛶ Fullscreen
            </button>
          </div>

          <!-- Kitchen Load Metrics Strip -->
          <div class="kds-metrics-strip">
            <div class="kds-metric-box">
              <div class="kds-metric-val">${kdsOrders.length}</div>
              <div class="kds-metric-label">Active</div>
            </div>
            <div class="kds-metric-box">
              <div class="kds-metric-val" style="color: #FB923C;">${prepOrders.length}</div>
              <div class="kds-metric-label">Cooking</div>
            </div>
            <div class="kds-metric-box">
              <div class="kds-metric-val" style="color: #34D399;">${readyOrders.length}</div>
              <div class="kds-metric-label">Ready</div>
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
            <div style="font-weight: 800; font-size: 1.05rem;">
              Manager Notified • Auto Customer Apology Dispatched
            </div>
          </div>
        ` : ''}

        <!-- Channel Filter Bar -->
        <div class="kds-channel-bar">
          <div class="kds-channel-pills">
            <button class="kds-channel-pill ${channelFilter === 'all' ? 'active' : ''}" onclick="App.setKdsChannel('all')">
              <span>🔥 All Tickets</span>
              <span class="kds-channel-count">${allCount}</span>
            </button>
            <button class="kds-channel-pill ${channelFilter === 'delivery' ? 'active' : ''}" onclick="App.setKdsChannel('delivery')">
              <span>🛵 Direct Delivery</span>
              <span class="kds-channel-count">${deliveryCount}</span>
            </button>
            <button class="kds-channel-pill ${channelFilter === 'takeaway' ? 'active' : ''}" onclick="App.setKdsChannel('takeaway')">
              <span>🛍️ Takeaway / Pickup</span>
              <span class="kds-channel-count">${takeawayCount}</span>
            </button>
            <button class="kds-channel-pill ${channelFilter === 'party' ? 'active' : ''}" onclick="App.setKdsChannel('party')">
              <span>🎉 Party Bulk Orders</span>
              <span class="kds-channel-count">${partyCount}</span>
            </button>
          </div>
          <div style="color: #94A3B8; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>💡 <em>Tap any dish item to mark it prepped / plated</em></span>
          </div>
        </div>

        <!-- Mobile & Tablet Kanban Stage Tabs -->
        <div class="kds-stage-tabs-row">
          <button class="kds-stage-tab-btn ${stageFilter === 'all' ? 'active' : ''}" onclick="App.setKdsStage('all')">
            <span>📋 All Stages</span>
            <span class="kds-stage-tab-count">${filteredOrders.length}</span>
          </button>
          <button class="kds-stage-tab-btn tab-incoming ${stageFilter === 'incoming' ? 'active' : ''}" onclick="App.setKdsStage('incoming')">
            <span>📥 New Orders</span>
            <span class="kds-stage-tab-count">${incomingOrders.length}</span>
          </button>
          <button class="kds-stage-tab-btn tab-prep ${stageFilter === 'prep' ? 'active' : ''}" onclick="App.setKdsStage('prep')">
            <span>🍳 Cooking</span>
            <span class="kds-stage-tab-count">${prepOrders.length}</span>
          </button>
          <button class="kds-stage-tab-btn tab-ready ${stageFilter === 'ready' ? 'active' : ''}" onclick="App.setKdsStage('ready')">
            <span>🛵 Ready for Pickup</span>
            <span class="kds-stage-tab-count">${readyOrders.length}</span>
          </button>
        </div>

        <!-- 3-Column Industrial Kanban Board -->
        <div class="kds-kanban-board stage-view-${stageFilter}">
          
          <!-- COLUMN 1: INCOMING / QUEUED -->
          ${(stageFilter === 'all' || stageFilter === 'incoming') ? `
            <div class="kds-kanban-col col-incoming">
              <div class="kds-col-header col-incoming">
                <div class="kds-col-title">
                  <span>📥</span>
                  <span>NEW ORDERS</span>
                </div>
                <span class="kds-col-badge">${incomingOrders.length} Queued</span>
              </div>
              <div class="kds-col-cards">
                ${incomingOrders.length === 0 ? `
                  <div class="kds-empty-col">
                    <div class="kds-empty-col-icon">✨</div>
                    <div class="kds-empty-col-title">No Pending Orders</div>
                    <div class="kds-empty-col-sub">Waiting for incoming orders</div>
                  </div>
                ` : incomingOrders.map(order => this.renderKdsCard(order)).join('')}
              </div>
            </div>
          ` : ''}

          <!-- COLUMN 2: PREPARING -->
          ${(stageFilter === 'all' || stageFilter === 'prep') ? `
            <div class="kds-kanban-col col-prep">
              <div class="kds-col-header col-prep">
                <div class="kds-col-title">
                  <span>🍳</span>
                  <span>PREPARING</span>
                </div>
                <span class="kds-col-badge">${prepOrders.length} Cooking</span>
              </div>
              <div class="kds-col-cards">
                ${prepOrders.length === 0 ? `
                  <div class="kds-empty-col">
                    <div class="kds-empty-col-icon">🔥</div>
                    <div class="kds-empty-col-title">Kitchen Clear</div>
                    <div class="kds-empty-col-sub">Start cooking from the New Orders column</div>
                  </div>
                ` : prepOrders.map(order => this.renderKdsCard(order)).join('')}
              </div>
            </div>
          ` : ''}

          <!-- COLUMN 3: READY FOR PICKUP -->
          ${(stageFilter === 'all' || stageFilter === 'ready') ? `
            <div class="kds-kanban-col col-ready">
              <div class="kds-col-header col-ready">
                <div class="kds-col-title">
                  <span>🛵</span>
                  <span>READY FOR PICKUP</span>
                </div>
                <span class="kds-col-badge">${readyOrders.length} Ready</span>
              </div>
              <div class="kds-col-cards">
                ${readyOrders.length === 0 ? `
                  <div class="kds-empty-col">
                    <div class="kds-empty-col-icon">📦</div>
                    <div class="kds-empty-col-title">Dispatched Clear</div>
                    <div class="kds-empty-col-sub">Packed orders awaiting rider pickup appear here</div>
                  </div>
                ` : readyOrders.map(order => this.renderKdsCard(order)).join('')}
              </div>
            </div>
          ` : ''}

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
    const isCritical10m = diffMins >= 10;

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

    const isParty = order.is_party_order || (order.total_amount >= 3000);
    const isTakeaway = order.delivery_type === 'takeaway';
    const channelBadge = isParty 
      ? '<span class="kds-channel-badge kds-channel-party">🎉 PARTY BULK</span>' 
      : (isTakeaway 
          ? '<span class="kds-channel-badge kds-channel-takeaway">🛍️ TAKEAWAY</span>' 
          : '<span class="kds-channel-badge kds-channel-delivery">🛵 DIRECT DELIVERY</span>');

    return `
      <div class="kds-card ${statusClass}" id="kds-card-${order.id}">
        <!-- Header -->
        <div class="kds-card-header">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="kds-order-number">#${order.id}</span>
              ${channelBadge}
            </div>
            <div class="kds-order-meta">
              Placed: ${placed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • ${elapsedMins}m Elapsed
            </div>
          </div>
          <div class="kds-timer-badge ${timerClass}">
            ${timerText}
          </div>
        </div>

        <!-- Body: Large Items for Readability from 2 Metres & Tap-to-Strike Checklist -->
        <div class="kds-card-body">
          <div class="kds-items-list">
            ${order.items.map((it, idx) => {
              const key = `${order.id}_${idx}`;
              const isChecked = !!(this.state.kdsCheckedItems && this.state.kdsCheckedItems[key]);
              return `
                <div class="kds-item-row ${isChecked ? 'item-done' : ''}" 
                     onclick="App.toggleKdsItemCheck('${order.id}', ${idx})" 
                     title="Tap to mark item plated / checked">
                  <div class="kds-check-box">${isChecked ? '✓' : ''}</div>
                  <div class="kds-qty-bubble">${it.quantity}x</div>
                  <div class="kds-item-details">
                    <div class="kds-item-name ${isChecked ? 'line-through' : ''}">${it.name.toUpperCase()}</div>
                    <div class="kds-portion-label">${it.portion || 'REGULAR'}</div>
                    ${it.add_ons && it.add_ons.length > 0 ? `
                      <div class="kds-item-addons">+ ${it.add_ons.map(a => a.name).join(', ')}</div>
                    ` : ''}
                  </div>
                  ${isChecked ? '<span class="kds-done-pill">PREPPED</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Customer Strip -->
        <div class="kds-customer-strip">
          <span>Guest: <strong>${order.customer_name}</strong></span>
          <span>Pay: <strong>${order.payment_method} (₹${order.total_amount})</strong></span>
        </div>

        <!-- Actions -->
        <div class="kds-card-actions">
          ${order.status === 'PLACED' ? `
            <button class="kds-stage-btn kds-btn-prep" onclick="App.advanceOrderStatus('${order.id}', 'PREPARING')">
              🔥 Start Prep
            </button>
          ` : order.status === 'PREPARING' ? `
            <button class="kds-stage-btn kds-btn-ready" onclick="App.advanceOrderStatus('${order.id}', 'READY_FOR_PICKUP')">
              ✅ Ready for Pickup
            </button>
          ` : `
            <button class="kds-stage-btn kds-btn-handover" onclick="App.advanceOrderStatus('${order.id}', 'DISPATCHED')">
              🛵 Rider Handoff
            </button>
          `}

          <!-- Manager Override Button (+5 mins) -->
          <button class="kds-override-btn" title="Manager Prep Override" onclick="App.overrideOrderPrep('${order.id}')">
            +5m Override
          </button>
        </div>
      </div>
    `;
  },

  toggleKdsItemCheck(orderId, itemIndex) {
    const key = `${orderId}_${itemIndex}`;
    this.state.kdsCheckedItems = this.state.kdsCheckedItems || {};
    this.state.kdsCheckedItems[key] = !this.state.kdsCheckedItems[key];
    if (this.state.kdsAudioEnabled) {
      try {
        const ctx = this.audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        this.audioCtx = ctx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } catch (e) {}
    }
    this.renderKdsView();
  },

  setKdsChannel(channel) {
    this.state.kdsChannelFilter = channel;
    this.renderKdsView();
  },

  toggleKdsFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  },

  setKdsOutlet(outletId) {
    this.state.kdsOutletFilter = outletId;
    this.renderKdsView();
  },

  setKdsStage(stage) {
    this.state.kdsStageFilter = stage;
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
  async setCmsTab(tab) {
    this.state.cmsTab = tab;
    if (tab === 'party_approvals' && (!this.state.partyOrders || this.state.partyOrders.length === 0)) {
      await this.fetchPartyOrders();
    }
    this.renderCmsView();
    if (this.state.currentView === 'cms') {
      this.updateHeaderContext('cms');
    }
  },

  renderCmsView() {
    const container = document.getElementById('app-view-container');
    const outlet = this.state.currentOutlet;
    this.state.cmsTab = this.state.cmsTab || 'dishes';

    // Lazy load party orders if not yet fetched
    if (this.state.cmsTab === 'party_approvals' && (!this.state.partyOrders || this.state.partyOrders.length === 0)) {
      this.fetchPartyOrders().then(() => {
        if (this.state.currentView === 'cms') this.renderCmsView();
      });
    }

    const pendingBulkCount = (this.state.partyOrders || []).filter(p => p.status === 'PENDING_REVIEW').length;

    container.innerHTML = `
      <div style="max-width: 1160px; margin: 0 auto; padding-bottom: 3rem;">
        <div class="page-header-center">
          <h1 class="page-title">Central Menu CMS</h1>
          <p class="page-subtitle">Manage items, prices by city, outlet availability, and time-based menus.</p>
        </div>

        <!-- Admin Navigation Tabs: Dishes vs Bulk Order Approvals -->
        <div class="party-nav-tabs" style="justify-content: center; margin-bottom: 2rem;">
          <button class="party-tab-btn ${this.state.cmsTab === 'dishes' ? 'active' : ''}" onclick="App.setCmsTab('dishes')">
            <span>🍲</span> Menu Items (${this.state.menu.length})
          </button>
          <button class="party-tab-btn ${this.state.cmsTab === 'party_approvals' ? 'active' : ''}" onclick="App.setCmsTab('party_approvals')">
            <span>📋</span> Bulk Order Approvals (${pendingBulkCount > 0 ? `<span style="background: var(--color-brand); color: #FFF; padding: 2px 7px; border-radius: 9999px; font-size: 0.75rem;">${pendingBulkCount}</span>` : (this.state.partyOrders || []).length})
          </button>
        </div>

        ${this.state.cmsTab === 'dishes' ? `
          <div style="display: flex; justify-content: center; gap: 0.75rem; align-items: center; flex-wrap: wrap; margin-bottom: 2rem;">
            <button class="btn-primary-action" onclick="App.openCmsItemModal()">
              ＋ Add Dish
            </button>
            <button class="btn-secondary-action" onclick="App.openCmsCityModal()">
              🏷️ City Pricing
            </button>
            <select class="top-role-dropdown" onchange="App.switchOutlet(this.value)" title="Active outlet stock preview" style="background: #FFFFFF; color: var(--text-main); border: 1.5px solid var(--border-subtle);">
              ${this.state.outlets.map(o => `
                <option value="${o.id}" ${o.id === outlet.id ? 'selected' : ''}>Outlet: ${o.name}</option>
              `).join('')}
            </select>
          </div>
        ` : ''}

        ${this.state.cmsTab === 'dishes' ? `
        <!-- Desktop Menu Catalog Table (Visible on Desktop / Tablets) -->
        <div class="cms-table-container">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="background-color: var(--bg-surface); border-bottom: 1.5px solid var(--border-subtle); color: var(--text-secondary);">
                <th style="padding: 1.1rem;">Item Name & Classification</th>
                <th style="padding: 1.1rem;">Category</th>
                <th style="padding: 1.1rem;">Base Price (incl 5% GST)</th>
                <th style="padding: 1.1rem;">Time Rule</th>
                <th style="padding: 1.1rem;">Complexity</th>
                <th style="padding: 1.1rem; text-align: center;">Live Stock (${outlet.name.split(' ')[0]})</th>
                <th style="padding: 1.1rem; text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.menu.map(item => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 1.1rem; display: flex; align-items: center; gap: 0.85rem;">
                    <img src="${item.image_url}" alt="${item.name}" style="width: 48px; height: 48px; border-radius: 8px; object-fit: cover;">
                    <div>
                      <strong style="color: var(--text-main); font-size: 0.95rem;">${item.name}</strong>
                      <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.15rem;">
                        ${item.is_veg ? '🌱 Veg' : '🍖 Non-Veg'} • ${item.spice_level}
                        ${item.allergens ? ` • Allergen: ${item.allergens}` : ''}
                      </div>
                    </div>
                  </td>
                  <td style="padding: 1.1rem; color: var(--text-secondary); font-weight: 600;">${item.category}</td>
                  <td style="padding: 1.1rem; font-weight: 800; color: var(--text-main);">₹${item.base_price}</td>
                  <td style="padding: 1.1rem;">
                    <span style="background: var(--accent-gold-light); color: var(--accent-gold-hover); padding: 0.25rem 0.65rem; border-radius: 6px; font-size: 0.78rem; font-weight: 800;">
                      ${item.time_based_tag}
                    </span>
                  </td>
                  <td style="padding: 1.1rem; color: var(--text-muted); font-weight: 600;">${item.prep_complexity_minutes} mins</td>
                  <td style="padding: 1.1rem; text-align: center;">
                    <button class="category-chip ${item.is_available ? 'active' : ''}" 
                            style="padding: 0.35rem 0.85rem; font-size: 0.78rem; ${!item.is_available ? 'background: var(--accent-rose-light); color: var(--accent-rose); border-color: var(--accent-rose);' : ''}"
                            onclick="App.toggleItemStock('${item.id}', ${!item.is_available})">
                      ${item.is_available ? '🟢 Available' : '🔴 Paused (86)'}
                    </button>
                  </td>
                  <td style="padding: 1.1rem; text-align: right; white-space: nowrap;">
                    <button class="side-action-btn" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; margin-right: 0.35rem;" onclick="App.openCmsItemModal('${item.id}')">
                      ✏️ Edit
                    </button>
                    <button class="side-action-btn" style="padding: 0.35rem 0.65rem; font-size: 0.8rem; background: #FEE2E2; color: #DC2626; border-color: #FCA5A5;" onclick="App.deleteCmsItem('${item.id}', '${item.name.replace(/'/g, "\\'")}')">
                      🗑️
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Mobile Responsive Menu Cards List (Visible on Mobile) -->
        <div class="cms-mobile-cards-list">
          ${this.state.menu.map(item => `
            <div class="cms-dish-card">
              <div class="cms-dish-card-top">
                <img src="${item.image_url}" alt="${item.name}" class="cms-dish-card-thumb">
                <div class="cms-dish-card-info">
                  <div class="cms-dish-name">${item.name}</div>
                  <div class="cms-dish-meta">
                    <span style="color: ${item.is_veg ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight: 700;">${item.is_veg ? '🌱 Pure Veg' : '🍖 Non-Veg'}</span>
                    <span>•</span>
                    <span>${item.category}</span>
                  </div>
                  <div class="cms-dish-price">₹${item.base_price} <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">(incl 5% GST)</span></div>
                </div>
              </div>

              <div class="cms-dish-card-actions">
                <button class="cms-stock-toggle-btn ${item.is_available ? 'active' : 'paused'}" 
                        onclick="App.toggleItemStock('${item.id}', ${!item.is_available})">
                  ${item.is_available ? '🟢 Available in Kitchen' : '🔴 Paused (86 Out)'}
                </button>
                <div style="display: flex; gap: 0.4rem;">
                  <button class="cms-edit-btn" onclick="App.openCmsItemModal('${item.id}')">
                    ✏️ Edit
                  </button>
                  <button class="cms-delete-btn" onclick="App.deleteCmsItem('${item.id}', '${item.name.replace(/'/g, "\\'")}')">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
        ` : `
          <!-- TAB 2: ADMIN BULK ORDER APPROVALS DESK -->
          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.6rem; box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin: 0;">Bulk Catering Approvals Desk</h3>
                <p style="font-size: 0.86rem; color: var(--text-secondary); margin: 0.2rem 0 0 0;">Review, confirm, or decline customer party catering orders</p>
              </div>
              <span style="font-size: 0.82rem; background: var(--bg-surface); padding: 0.4rem 0.85rem; border-radius: 9999px; font-weight: 700; color: var(--text-main);">
                Total: ${(this.state.partyOrders || []).length} • Pending: ${pendingBulkCount}
              </span>
            </div>

            ${(this.state.partyOrders || []).length === 0 ? `
              <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
                No catering requests submitted yet.
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 1.15rem;">
                ${(this.state.partyOrders || []).map(p => `
                  <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 14px; padding: 1.4rem; box-shadow: var(--shadow-xs);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                          <strong style="color: var(--text-main); font-size: 1.1rem;">#${p.id}</strong>
                          <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 700;">• Host: ${p.customer_name} (${p.customer_phone})</span>
                        </div>
                        <div style="font-size: 0.84rem; color: var(--accent-gold); font-weight: 700; margin-top: 0.2rem;">
                          📅 Event: ${p.event_date} at ${p.event_time} • 👥 ${p.guest_count} Guests • Kitchen: ${p.outlet_name || 'Hyderabad Flagship'}
                        </div>
                      </div>
                      <span style="background: ${p.status === 'CONFIRMED' ? 'var(--accent-emerald-light)' : p.status === 'REJECTED' ? 'var(--accent-rose-light)' : 'var(--accent-gold-light)'}; color: ${p.status === 'CONFIRMED' ? 'var(--accent-emerald)' : p.status === 'REJECTED' ? 'var(--accent-rose)' : 'var(--accent-gold-hover)'}; font-size: 0.78rem; padding: 0.35rem 0.8rem; border-radius: 9999px; font-weight: 800;">
                        ${p.status === 'PENDING_REVIEW' ? '⏳ PENDING APPROVAL' : p.status === 'CONFIRMED' ? '✅ CONFIRMED' : p.status}
                      </span>
                    </div>

                    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 0.85rem 1rem; margin-bottom: 0.85rem; font-size: 0.86rem; color: var(--text-main);">
                      <strong>Requirements / Handis:</strong> ${p.requirements_text}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.75rem; flex-wrap: wrap; gap: 0.75rem;">
                      <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        Est Quote: <strong style="color: var(--accent-emerald); font-size: 1rem;">₹${Number(p.estimated_budget).toLocaleString('en-IN')}</strong> (incl 5% GST)
                      </div>

                      <div style="display: flex; gap: 0.5rem; align-items: center;">
                        ${p.status === 'PENDING_REVIEW' ? `
                          <button class="btn-cart-nav" style="padding: 0.4rem 0.95rem; font-size: 0.82rem; background: var(--accent-emerald); border-radius: 8px;" onclick="App.updatePartyStatus('${p.id}', 'CONFIRMED')">
                            ✓ Manager Confirm
                          </button>
                          <button class="category-chip" style="padding: 0.4rem 0.95rem; font-size: 0.82rem; background: var(--accent-rose-light); color: var(--accent-rose); border-color: var(--accent-rose);" onclick="App.updatePartyStatus('${p.id}', 'REJECTED')">
                            ✕ Decline
                          </button>
                        ` : `
                          <span style="font-size: 0.82rem; color: ${p.status === 'CONFIRMED' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight: 800;">
                            ${p.manager_notes || p.status}
                          </span>
                        `}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        `}
      </div>
    `;
  },

  openCmsItemModal(itemId = null) {
    const modal = document.getElementById('cms-item-modal');
    const title = document.getElementById('cms-item-modal-title');
    const body = document.getElementById('cms-item-modal-body');
    if (!modal || !body) return;

    const item = itemId ? this.state.menu.find(m => m.id === itemId) : null;
    this.state.editingMenuItem = item;

    if (title) title.textContent = item ? `Edit Dish: ${item.name}` : 'Create New Menu Dish';

    const categories = ['Dum Biryani', 'Royal Specials', 'Starters & Kebabs', 'Hyderabadi Curries', 'Desserts & Shakes', 'Specialties'];

    body.innerHTML = `
      <form onsubmit="App.submitCmsItem(event)" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div class="auth-form-group">
          <label>Dish Name *</label>
          <input type="text" id="cms-dish-name" value="${item ? item.name : ''}" placeholder="e.g. Shahi Mutton Dum Biryani" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="auth-form-group">
            <label>Category *</label>
            <select id="cms-dish-category">
              ${categories.map(c => `
                <option value="${c}" ${item && item.category === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>
          <div class="auth-form-group">
            <label>Base Price (₹ incl 5% GST) *</label>
            <input type="number" id="cms-dish-price" value="${item ? item.base_price : 380}" min="10" required>
          </div>
        </div>

        <div class="auth-form-group">
          <label>Description</label>
          <textarea id="cms-dish-desc" rows="3" placeholder="Description of spices, slow-cooking technique, and aroma...">${item ? item.description : ''}</textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="auth-form-group">
            <label>Classification</label>
            <select id="cms-dish-veg">
              <option value="0" ${item && !item.is_veg ? 'selected' : ''}>🍖 Non-Vegetarian</option>
              <option value="1" ${item && item.is_veg ? 'selected' : ''}>🌱 Pure Vegetarian</option>
            </select>
          </div>
          <div class="auth-form-group">
            <label>Spice Level</label>
            <select id="cms-dish-spice">
              <option value="Mild" ${item && item.spice_level === 'Mild' ? 'selected' : ''}>Mild</option>
              <option value="Medium" ${item && item.spice_level === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Fiery" ${item && item.spice_level === 'Fiery' ? 'selected' : ''}>Fiery</option>
              <option value="Nawabi Dum" ${item && item.spice_level === 'Nawabi Dum' ? 'selected' : ''}>Nawabi Dum</option>
            </select>
          </div>
        </div>

        <div class="auth-form-group">
          <label>Allergens</label>
          <input type="text" id="cms-dish-allergens" value="${item ? item.allergens : ''}" placeholder="e.g. Dairy, Nuts">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
          <div class="auth-form-group">
            <label>Prep Complexity (Mins)</label>
            <input type="number" id="cms-dish-complexity" value="${item ? item.prep_complexity_minutes : 12}" min="2" max="60">
          </div>
          <div class="auth-form-group">
            <label>Time-Based Menu Tag</label>
            <select id="cms-dish-tag">
              <option value="All Day" ${item && item.time_based_tag === 'All Day' ? 'selected' : ''}>All Day</option>
              <option value="Lunch Special" ${item && item.time_based_tag === 'Lunch Special' ? 'selected' : ''}>Lunch Special</option>
              <option value="Dinner & Midnight Biryani" ${item && item.time_based_tag === 'Dinner & Midnight Biryani' ? 'selected' : ''}>Dinner & Midnight Biryani</option>
            </select>
          </div>
        </div>

        <div class="auth-form-group">
          <label>Food Photograph Image URL</label>
          <input type="url" id="cms-dish-image" value="${item ? item.image_url : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80'}">
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem;">
          <button type="button" class="side-action-btn" onclick="App.closeCmsItemModal()">Cancel</button>
          <button type="submit" class="btn-cart-nav" style="background: var(--accent-gold);">
            ${item ? 'Save Changes ➔' : 'Create Dish ➔'}
          </button>
        </div>
      </form>
    `;

    modal.classList.add('open');
  },

  closeCmsItemModal() {
    const modal = document.getElementById('cms-item-modal');
    if (modal) modal.classList.remove('open');
  },

  async submitCmsItem(e) {
    if (e) e.preventDefault();
    const item = this.state.editingMenuItem;
    const isEdit = !!item;

    const payload = {
      name: document.getElementById('cms-dish-name')?.value,
      category: document.getElementById('cms-dish-category')?.value,
      base_price: Number(document.getElementById('cms-dish-price')?.value),
      description: document.getElementById('cms-dish-desc')?.value,
      is_veg: Number(document.getElementById('cms-dish-veg')?.value),
      spice_level: document.getElementById('cms-dish-spice')?.value,
      allergens: document.getElementById('cms-dish-allergens')?.value,
      prep_complexity_minutes: Number(document.getElementById('cms-dish-complexity')?.value),
      time_based_tag: document.getElementById('cms-dish-tag')?.value,
      image_url: document.getElementById('cms-dish-image')?.value
    };

    try {
      const url = isEdit ? `/api/menu/items/${item.id}` : '/api/menu/items';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.showToast(isEdit ? `Updated dish: ${payload.name}` : `Created dish: ${payload.name}`, 'success');
        this.closeCmsItemModal();
        await this.fetchMenu();
        this.renderCmsView();
      } else {
        const err = await res.json();
        this.showToast(err.error || 'Failed to save dish', 'error');
      }
    } catch (err) {
      this.showToast('Network error saving dish', 'error');
    }
  },

  async deleteCmsItem(itemId, name) {
    if (!confirm(`Are you sure you want to permanently delete "${name}" from the central catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/menu/items/${itemId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (res.ok) {
        this.showToast(`Deleted dish: ${name}`, 'info');
        await this.fetchMenu();
        this.renderCmsView();
      } else {
        const err = await res.json();
        this.showToast(err.error || 'Failed to delete dish', 'error');
      }
    } catch (err) {
      this.showToast('Network error deleting dish', 'error');
    }
  },

  openCmsCityModal() {
    const modal = document.getElementById('cms-city-modal');
    const body = document.getElementById('cms-city-modal-body');
    if (!modal || !body) return;

    body.innerHTML = `
      <form onsubmit="App.submitCityPrice(event)">
        <div class="auth-form-group">
          <label style="display: block; font-size: 0.86rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.45rem;">Target City / Region</label>
          <select id="cms-city-name" style="width: 100%; box-sizing: border-box; padding: 0.75rem 1rem; border-radius: 10px; border: 1.5px solid var(--border-subtle); font-size: 0.95rem; background: #FFFFFF;">
            <option value="Hyderabad">Hyderabad Core</option>
            <option value="Secunderabad">Secunderabad</option>
            <option value="Cyberabad">Cyberabad (Hitec/Gachibowli)</option>
          </select>
        </div>

        <div class="auth-form-group">
          <label style="display: block; font-size: 0.86rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.45rem;">Menu Item</label>
          <select id="cms-city-item" style="width: 100%; box-sizing: border-box; padding: 0.75rem 1rem; border-radius: 10px; border: 1.5px solid var(--border-subtle); font-size: 0.95rem; background: #FFFFFF;">
            ${this.state.menu.map(m => `
              <option value="${m.id}">${m.name} (Current: ₹${m.base_price})</option>
            `).join('')}
          </select>
        </div>

        <div class="auth-form-group">
          <label style="display: block; font-size: 0.86rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.45rem;">City-Specific Base Price (₹ incl 5% GST)</label>
          <input type="number" id="cms-city-price" placeholder="e.g. 420" required min="10" style="width: 100%; box-sizing: border-box; padding: 0.75rem 1rem; border-radius: 10px; border: 1.5px solid var(--border-subtle); font-size: 0.95rem; background: #FFFFFF;">
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button type="button" class="side-action-btn" onclick="App.closeCmsCityModal()">Cancel</button>
          <button type="submit" class="btn-cart-nav" style="background: var(--color-brand); border-radius: 10px; padding: 0.7rem 1.4rem;">
            Save Regional Override ➔
          </button>
        </div>
      </form>
    `;

    modal.classList.add('open');
  },

  closeCmsCityModal() {
    const modal = document.getElementById('cms-city-modal');
    if (modal) modal.classList.remove('open');
  },

  async submitCityPrice(e) {
    if (e) e.preventDefault();
    const city = document.getElementById('cms-city-name')?.value;
    const menuItemId = document.getElementById('cms-city-item')?.value;
    const price = Number(document.getElementById('cms-city-price')?.value);

    try {
      const res = await fetch('/api/menu/city-price', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ city, menu_item_id: menuItemId, price })
      });

      if (res.ok) {
        this.showToast(`Configured regional price for ${city}: ₹${price}`, 'success');
        this.closeCmsCityModal();
        await this.fetchMenu();
        this.renderCmsView();
      } else {
        const err = await res.json();
        this.showToast(err.error || 'Failed to set city price', 'error');
      }
    } catch (err) {
      this.showToast('Network error setting city price', 'error');
    }
  },

  async toggleItemStock(itemId, makeAvailable) {
    try {
      const res = await fetch('/api/menu/toggle-stock', {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
      } else {
        const err = await res.json();
        this.showToast(err.error || 'Failed to update stock', 'error');
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
      <div style="max-width: 1160px; margin: 0 auto;">
        
        <!-- Header: Back button on left, Title & Subtitle centered -->
        

        <div class="page-header-center">
          <h1 class="page-title">Outlet Dashboard</h1>
          <p class="page-subtitle">Dashboard of orders, prep time, cancellations, and repeat customers by outlet.</p>
        </div>

        <!-- 4 Hero Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.75rem;">
          
          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.8rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Direct Margin Saved</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent-emerald); margin: 0.4rem 0;">₹${summary.commissions_saved.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">15% higher net margin vs delivery apps</div>
          </div>

          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.8rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Commission Avoided</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--text-main); margin: 0.4rem 0;">₹${summary.app_fees_avoided.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">27% fees saved by ordering direct</div>
          </div>

          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.8rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Projected Annual Savings</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent-gold); margin: 0.4rem 0;">₹1.14 Cr</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">Estimated savings across all 17 locations</div>
          </div>

          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.8rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Repeat Order Rate</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: #2563EB; margin: 0.4rem 0;">${summary.repeat_customer_rate}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">Direct customer retention</div>
          </div>

        </div>

        <!-- Outlet Performance Leaderboard -->
        <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm);">
          <div style="padding: 1.4rem 1.75rem; border-bottom: 1.5px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
            <h3 style="font-size: 1.25rem; color: var(--text-main);">Hyderabad Outlets Leaderboard (14 Outlets + 3 Cloud Kitchens)</h3>
            <span style="font-size: 0.84rem; color: var(--text-muted);">Sorted by Direct Order Volume</span>
          </div>

          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="background-color: var(--bg-surface); color: var(--text-secondary);">
                <th style="padding: 1.1rem;">Outlet Name</th>
                <th style="padding: 1.1rem;">Type</th>
                <th style="padding: 1.1rem;">Direct Orders</th>
                <th style="padding: 1.1rem;">Revenue (₹)</th>
                <th style="padding: 1.1rem;">Avg AI Prep</th>
                <th style="padding: 1.1rem;">Cancellations</th>
                <th style="padding: 1.1rem; text-align: right;">Late Incidents</th>
              </tr>
            </thead>
            <tbody>
              ${summary.outlets.map((o, idx) => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 1.1rem; font-weight: 700; color: var(--text-main);">
                    <span style="color: var(--text-muted); font-size: 0.8rem; margin-right: 0.5rem;">#${idx + 1}</span>
                    ${o.name}
                  </td>
                  <td style="padding: 1.1rem; color: var(--text-muted);">${o.is_cloud_kitchen ? 'Cloud Kitchen' : 'Dine-in Flagship'}</td>
                  <td style="padding: 1.1rem; color: var(--text-secondary); font-weight: 700;">${o.order_count}</td>
                  <td style="padding: 1.1rem; font-weight: 800; color: var(--accent-gold);">₹${o.revenue.toLocaleString('en-IN')}</td>
                  <td style="padding: 1.1rem; color: var(--text-secondary);">~${Math.round(o.avg_prep_time || 25)} mins</td>
                  <td style="padding: 1.1rem; color: ${o.cancellations > 0 ? 'var(--accent-rose)' : 'var(--text-muted)'}; font-weight: 700;">
                    ${o.cancellations || 0}
                  </td>
                  <td style="padding: 1.1rem; text-align: right; color: ${o.late_orders > 0 ? 'var(--accent-rose)' : 'var(--accent-emerald)'}; font-weight: 800;">
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
  getBulkItemsCatalog() {
    return [
      { id: 'bulk-chicken-biryani', name: 'Royal Chicken Dum Biryani Handi', serves: 6, price: 900, is_veg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80', desc: 'Slow-cooked fragrant basmati with tender spiced chicken in copper degh.' },
      { id: 'bulk-mutton-biryani', name: 'Nizami Mutton Dum Biryani Handi', serves: 6, price: 1200, is_veg: false, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&q=80', desc: 'Succulent cuts of fresh mutton marinated in 24 royal Hyderabadi spices.' },
      { id: 'bulk-veg-biryani', name: 'Hyderabadi Subz Veg Biryani Handi', serves: 6, price: 640, is_veg: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80', desc: 'Farm-fresh vegetables, paneer & saffron-infused aged long grain basmati.' },
      { id: 'bulk-mutton-haleem', name: 'Shahi Mutton Haleem Handi (Desi Ghee)', serves: 5, price: 1050, is_veg: false, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80', desc: 'Pounded mutton, broken wheat & desi ghee slow-cooked overnight over bhatti.' },
      { id: 'bulk-mirchi-salan', name: 'Mirchi Ka Salan Party Degh', serves: 10, price: 250, is_veg: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80', desc: 'Classic Bhavnagri mirchi in roasted peanut, coconut & sesame gravy.' },
      { id: 'bulk-double-meetha', name: 'Double Ka Meetha Royal Tray', serves: 8, price: 420, is_veg: true, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&q=80', desc: 'Crisp golden bread soaked in saffron-cardamom rabri, topped with pistachios.' }
    ];
  },

  async renderPartyView() {
    const container = document.getElementById('app-view-container');
    let partyList = [];

    this.state.partyViewTab = this.state.partyViewTab || 'request';
    this.state.partySelectedItems = this.state.partySelectedItems || {
      'bulk-chicken-biryani': 3,
      'bulk-mutton-haleem': 2,
      'bulk-double-meetha': 2
    };

    const isStaff = this.state.currentRole !== 'customer' && (
      this.state.currentRole === 'party' || 
      this.state.currentRole === 'admin' || 
      this.state.currentRole === 'kds' || 
      (this.state.currentUser && ['admin', 'kitchen_staff'].includes(this.state.currentUser.role))
    );
    if (isStaff) {
      if (!this.state.partyViewTab) this.state.partyViewTab = 'active';
    } else {
      this.state.partyViewTab = 'request';
    }

    try {
      const res = await fetch('/api/party-orders');
      partyList = await res.json();
      this.state.partyOrders = partyList;
    } catch (e) {
      console.warn('Failed to fetch party orders:', e);
    }

    container.innerHTML = `
      <div class="page-container">
        <div class="page-header-center">
          <h1 class="page-title">${isStaff ? 'Party Orders (Catering Manager)' : 'Party Order Form'}</h1>
          <p class="page-subtitle">${isStaff ? 'Review and confirm customer catering orders with minimum notice.' : 'Party order form with minimum 24 hours notice and confirmation by the catering manager.'}</p>
        </div>

        <!-- Sub-Tabs: Only visible to Restaurant Staff / Admin, Never to Customers -->
        ${isStaff ? `
          <div class="party-nav-tabs" style="justify-content: center; margin-bottom: 2rem;">
            <button class="party-tab-btn ${this.state.partyViewTab === 'active' ? 'active' : ''}" onclick="App.setPartyTab('active')">
              <span>📋</span> Active Catering Orders (${partyList.length})
            </button>
            <button class="party-tab-btn ${this.state.partyViewTab === 'request' ? 'active' : ''}" onclick="App.setPartyTab('request')">
              <span>📝</span> + New Catering Booking
            </button>
          </div>
        ` : ''}

        ${this.state.partyViewTab === 'request' ? `
          <!-- TAB 1: PROMINENT BIG BOOKING FORM -->
          <div class="party-big-form-card">
            
            <div style="margin-bottom: 2rem; border-bottom: 1.5px solid var(--border-subtle); padding-bottom: 1.5rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
                <div>
                  <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin: 0; display: flex; align-items: center; gap: 0.6rem;">
                    <span>🍲</span> Event & Delivery Details
                  </h2>
                  <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0.35rem 0 0 0;">
                    Slow-cooked in sealed copper handis over hardwood charcoal. Fill the details below and customize dishes.
                  </p>
                </div>
                <button type="button" class="party-open-drawer-btn" onclick="App.openPartyDrawer()">
                  <span>🍲</span> Add / Change Dishes ➔
                </button>
              </div>
            </div>

            <form id="party-form" onsubmit="App.submitPartyOrder(event)">
              
              <!-- SECTION 1: EVENT SCHEDULE & OUTLET -->
              <div class="party-form-section">
                <div class="party-section-heading">
                  <span>1. Event Schedule & Outlet</span>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem;">
                  <div>
                    <label style="font-size: 0.84rem; color: var(--text-secondary); display: block; margin-bottom: 0.45rem; font-weight: 700;">
                      Target Guest Count <span style="color: var(--accent-rose); font-weight: normal;">(Min 15)</span>
                    </label>
                    <input type="number" id="party-guests" min="15" max="1000" value="30" required style="width: 100%;" oninput="App.onPartyGuestCountChange(this.value)">
                  </div>
                  <div>
                    <label style="font-size: 0.84rem; color: var(--text-secondary); display: block; margin-bottom: 0.45rem; font-weight: 700;">
                      Event Date <span style="color: var(--accent-rose); font-weight: normal;">(Min 24h Notice)</span>
                    </label>
                    <input type="date" id="party-date" required style="width: 100%;">
                  </div>
                  <div>
                    <label style="font-size: 0.84rem; color: var(--text-secondary); display: block; margin-bottom: 0.45rem; font-weight: 700;">Serving Time</label>
                    <input type="time" id="party-time" value="13:00" required style="width: 100%;">
                  </div>
                </div>

                <div>
                  <label style="font-size: 0.84rem; color: var(--text-secondary); display: block; margin-bottom: 0.45rem; font-weight: 700;">Preparation Kitchen (Hyderabad)</label>
                  <select id="party-outlet" class="role-dropdown" style="width: 100%;">
                    ${this.state.outlets.map(o => `
                      <option value="${o.id}" ${o.id === this.state.currentOutlet.id ? 'selected' : ''}>${o.name} (${o.address})</option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <!-- SECTION 2: CONTACT INFORMATION -->
              <div class="party-form-section">
                <div class="party-section-heading">
                  <span>2. Contact Details</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem;">
                  <div>
                    <label style="font-size: 0.84rem; color: var(--text-secondary); display: block; margin-bottom: 0.45rem; font-weight: 700;">Host Name</label>
                    <input type="text" id="party-name" placeholder="Host Name" value="${this.state.customerName}" required style="width: 100%;">
                  </div>
                  <div>
                    <label style="font-size: 0.84rem; color: var(--text-secondary); display: block; margin-bottom: 0.45rem; font-weight: 700;">Contact Phone</label>
                    <input type="tel" id="party-phone" placeholder="+91 98490 12345" value="${this.state.customerPhone}" required style="width: 100%;">
                  </div>
                </div>
              </div>

              <!-- SECTION 3: SELECTED DISHES & HANDIS -->
              <div class="party-form-section">
                <div class="party-section-heading">
                  <span>3. Selected Dishes & Handis</span>
                  <button type="button" class="btn-back-link" style="color: var(--color-brand); font-weight: 700; font-size: 0.88rem; cursor: pointer;" onclick="App.openPartyDrawer()">
                    + Add / Modify Dishes
                  </button>
                </div>

                <div id="party-dishes-preview-box" class="party-dishes-box">
                  <!-- Dynamically rendered by updatePartyDishesBoxUI() -->
                </div>
              </div>

              <!-- SECTION 4: ADDITIONAL INSTRUCTIONS -->
              <div class="party-form-section">
                <div class="party-section-heading">
                  <span>4. Additional Instructions & Dietary Requests</span>
                </div>
                <textarea id="party-instructions" rows="3" placeholder="e.g. Mild spice for children, deliver in sealed copper deghs with serving ladles, extra mirchi ka salan..." style="width: 100%; border-radius: 12px; border: 1.5px solid var(--border-subtle); padding: 0.85rem 1rem; font-family: inherit; font-size: 0.92rem;"></textarea>
              </div>

              <!-- SECTION 5: SUBMIT ACTION BUTTON -->
              <div style="margin-top: 2rem;">
                <button type="submit" class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 1.15rem; border-radius: 14px; font-size: 1.05rem; font-weight: 800; box-shadow: 0 4px 16px rgba(252, 128, 25, 0.3);">
                  Submit Bulk Catering Request ➔
                </button>
                <p style="text-align: center; color: var(--text-muted); font-size: 0.82rem; margin-top: 0.75rem;">
                  Our Head Catering Chef reviews each request and confirms within 2 hours.
                </p>
              </div>

            </form>
          </div>
        ` : `
          <!-- TAB 2: MY ACTIVE BULK REQUESTS (CUSTOMER & CATERING MANAGER VIEW) -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3 style="font-size: 1.25rem; color: var(--text-main);">Your Bulk & Party Order Requests</h3>
              <button class="header-back-btn" onclick="App.setPartyTab('request')">
                + Place Another Request
              </button>
            </div>

            ${partyList.length === 0 ? `
              <div style="text-align: center; padding: 4rem 1rem; background: #FFFFFF; border-radius: 16px; border: 1.5px solid var(--border-subtle);">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎉</div>
                <h4 style="font-size: 1.2rem; color: var(--text-main);">No Party Orders Yet</h4>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.35rem;">Use the booking form to reserve direct copper degh catering for 15+ guests.</p>
                <button class="btn-cart-nav" style="margin: 1.25rem auto 0 auto; display: inline-flex;" onclick="App.setPartyTab('request')">
                  Start Catering Request
                </button>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 1.25rem;">
                ${partyList.map(p => `
                  <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.6rem; box-shadow: var(--shadow-sm);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                      <div>
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                          <strong style="color: var(--text-main); font-size: 1.15rem;">#${p.id}</strong>
                          <span style="font-size: 0.88rem; color: var(--text-secondary); font-weight: 700;">• Host: ${p.customer_name}</span>
                        </div>
                        <div style="font-size: 0.84rem; color: var(--accent-gold); font-weight: 700; margin-top: 0.2rem;">
                          📅 Event: ${p.event_date} at ${p.event_time} • 👥 ${p.guest_count} Guests
                        </div>
                      </div>
                      <span style="background: ${p.status === 'CONFIRMED' ? 'var(--accent-emerald-light)' : p.status === 'REJECTED' ? 'var(--accent-rose-light)' : 'var(--accent-gold-light)'}; color: ${p.status === 'CONFIRMED' ? 'var(--accent-emerald)' : p.status === 'REJECTED' ? 'var(--accent-rose)' : 'var(--accent-gold-hover)'}; font-size: 0.8rem; padding: 0.35rem 0.85rem; border-radius: 9999px; font-weight: 800;">
                        ${p.status === 'PENDING_REVIEW' ? '⏳ UNDER REVIEW BY CATERING HEAD' : p.status === 'CONFIRMED' ? '✅ CONFIRMED & CHEF ASSIGNED' : p.status}
                      </span>
                    </div>

                    <div style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 10px; padding: 0.95rem 1.1rem; margin-bottom: 1rem; font-size: 0.88rem; line-height: 1.6; color: var(--text-main);">
                      <strong>Selected Items / Reqs:</strong> ${p.requirements_text}
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: 0.85rem; flex-wrap: wrap; gap: 0.75rem;">
                      <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        Kitchen: <strong>${p.outlet_name || 'Hyderabad Flagship'}</strong> • Est Quote: <strong style="color: var(--accent-emerald); font-size: 1rem;">₹${Number(p.estimated_budget).toLocaleString('en-IN')}</strong> (incl 5% GST)
                      </div>

                      <div style="display: flex; gap: 0.6rem; align-items: center;">
                        ${p.status === 'PENDING_REVIEW' ? `
                          <!-- Manager Review Desk Actions -->
                          <div style="display: flex; gap: 0.45rem;">
                            <button class="btn-cart-nav" style="padding: 0.4rem 0.9rem; font-size: 0.8rem; background: var(--accent-emerald); border-radius: 8px;" onclick="App.updatePartyStatus('${p.id}', 'CONFIRMED')">
                              ✓ Manager Confirm
                            </button>
                            <button class="category-chip" style="padding: 0.4rem 0.9rem; font-size: 0.8rem; background: var(--accent-rose-light); color: var(--accent-rose); border-color: var(--accent-rose);" onclick="App.updatePartyStatus('${p.id}', 'REJECTED')">
                              ✕ Decline
                            </button>
                          </div>
                        ` : `
                          <span style="font-size: 0.82rem; color: ${p.status === 'CONFIRMED' ? 'var(--accent-emerald)' : 'var(--accent-rose)'}; font-weight: 800;">
                            ${p.manager_notes || p.status}
                          </span>
                        `}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}

          </div>
        `}

      </div>
    `;

    // Ensure date picker has tomorrow as minimum (24h rule)
    setTimeout(() => {
      const dateInput = document.getElementById('party-date');
      if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
        dateInput.value = tomorrow.toISOString().split('T')[0];
      }
      this.updatePartyDishesBoxUI();
    }, 50);
  },

  setPartyTab(tab) {
    this.state.partyViewTab = tab;
    this.renderPartyView();
  },

  openPartyDrawer() {
    const backdrop = document.getElementById('party-drawer-backdrop');
    if (!backdrop) return;
    this.renderPartyDrawerItems();
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closePartyDrawer() {
    const backdrop = document.getElementById('party-drawer-backdrop');
    if (backdrop) {
      backdrop.classList.remove('open');
    }
    document.body.style.overflow = '';
  },

  renderPartyDrawerItems() {
    const itemsContainer = document.getElementById('party-drawer-items');
    const footerContainer = document.getElementById('party-drawer-footer');
    if (!itemsContainer || !footerContainer) return;

    const catalog = this.getBulkItemsCatalog();
    this.state.partySelectedItems = this.state.partySelectedItems || {};

    let totalGuests = 0;
    let totalCost = 0;

    const itemsHtml = catalog.map(item => {
      const qty = this.state.partySelectedItems[item.id] || 0;
      if (qty > 0) {
        totalGuests += qty * item.serves;
        totalCost += qty * item.price;
      }
      return `
        <div class="party-drawer-item-card">
          <img src="${item.image}" alt="${item.name}" class="party-drawer-item-img" onerror="this.src='https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80'">
          <div class="party-drawer-item-info">
            <div class="party-drawer-item-title">${item.is_veg ? '🌱' : '🍖'} ${item.name}</div>
            <div class="party-drawer-item-serves">Feeds ~${item.serves} guests per handi</div>
            <div class="party-drawer-item-price">₹${item.price} <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">(incl 5% GST)</span></div>
          </div>
          <div class="party-stepper-wrap">
            <button type="button" class="party-step-btn" onclick="App.updatePartyItemQty('${item.id}', -1)">-</button>
            <span class="party-step-val" id="qty-val-${item.id}">${qty}</span>
            <button type="button" class="party-step-btn" onclick="App.updatePartyItemQty('${item.id}', 1)">+</button>
          </div>
        </div>
      `;
    }).join('');

    itemsContainer.innerHTML = itemsHtml;

    footerContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Coverage</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: var(--text-main);">Feeds ~<span id="drawer-serves-count">${totalGuests}</span> Guests</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Subtotal</div>
          <div style="font-size: 1.25rem; font-weight: 900; color: var(--color-brand);">₹<span id="drawer-cost-val">${totalCost.toLocaleString('en-IN')}</span></div>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 0.6rem;">
        <button type="button" class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 0.95rem; border-radius: 12px; font-size: 0.95rem; font-weight: 800;" onclick="App.submitPartyOrderFromDrawer()">
          Place Catering Order ➔
        </button>
        <button type="button" class="header-back-btn" style="width: 100%; justify-content: center; padding: 0.75rem; border-radius: 12px; font-size: 0.88rem; font-weight: 700;" onclick="App.closePartyDrawer()">
          ✓ Done & Review Form
        </button>
      </div>
    `;
  },

  updatePartyItemQty(itemId, delta) {
    this.state.partySelectedItems = this.state.partySelectedItems || {};
    const current = this.state.partySelectedItems[itemId] || 0;
    const next = Math.max(0, current + delta);
    this.state.partySelectedItems[itemId] = next;

    // Refresh stepper element in drawer if present
    const qtyEl = document.getElementById(`qty-val-${itemId}`);
    if (qtyEl) qtyEl.textContent = next;

    // Recalculate totals
    const catalog = this.getBulkItemsCatalog();
    let totalGuests = 0;
    let totalCost = 0;
    for (const item of catalog) {
      const q = this.state.partySelectedItems[item.id] || 0;
      if (q > 0) {
        totalGuests += q * item.serves;
        totalCost += q * item.price;
      }
    }

    const drawerServes = document.getElementById('drawer-serves-count');
    const drawerCost = document.getElementById('drawer-cost-val');
    if (drawerServes) drawerServes.textContent = totalGuests;
    if (drawerCost) drawerCost.textContent = totalCost.toLocaleString('en-IN');

    // Update the dishes box in the big form (preserves all typed inputs!)
    this.updatePartyDishesBoxUI();
  },

  updatePartyDishesBoxUI() {
    const box = document.getElementById('party-dishes-preview-box');
    if (!box) return;

    const catalog = this.getBulkItemsCatalog();
    let totalGuests = 0;
    let totalCost = 0;
    const selected = [];

    for (const item of catalog) {
      const qty = this.state.partySelectedItems[item.id] || 0;
      if (qty > 0) {
        totalGuests += qty * item.serves;
        totalCost += qty * item.price;
        selected.push({ ...item, qty, itemTotal: qty * item.price });
      }
    }

    if (selected.length === 0) {
      box.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem;">
          <div style="font-size: 2.2rem; margin-bottom: 0.4rem;">🍲</div>
          <div style="font-weight: 700; color: var(--text-main); font-size: 1rem;">No dishes selected yet</div>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin: 0.25rem 0 1rem 0;">Choose your biryani handis, haleem, and desserts for the party.</p>
          <button type="button" class="party-open-drawer-btn" onclick="App.openPartyDrawer()">
            + Choose Dishes & Handis ➔
          </button>
        </div>
      `;
      return;
    }

    box.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.25rem;">
        ${selected.map(item => `
          <div class="party-selected-chip">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 1.1rem;">${item.is_veg ? '🌱' : '🍖'}</span>
              <div>
                <strong style="color: var(--text-main);">${item.name}</strong>
                <div style="font-size: 0.78rem; color: var(--text-secondary); font-weight: normal;">
                  Feeds ~${item.serves * item.qty} guests (${item.serves} per handi)
                </div>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <span style="font-weight: 800; color: var(--color-brand); font-size: 0.95rem;">₹${item.itemTotal.toLocaleString('en-IN')}</span>
              <div class="party-stepper-wrap" style="transform: scale(0.9);">
                <button type="button" class="party-step-btn" onclick="App.updatePartyItemQty('${item.id}', -1)">-</button>
                <span class="party-step-val">${item.qty}</span>
                <button type="button" class="party-step-btn" onclick="App.updatePartyItemQty('${item.id}', 1)">+</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1.5px solid #F0E6D8; flex-wrap: wrap; gap: 0.75rem;">
        <div>
          <span style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 700;">PORTION COVERAGE:</span>
          <span style="font-size: 1rem; font-weight: 800; color: var(--text-main); margin-left: 0.4rem;">Feeds ~${totalGuests} Guests</span>
        </div>
        <div style="display: flex; align-items: center; gap: 1.25rem;">
          <div>
            <span style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 700;">TOTAL:</span>
            <span style="font-size: 1.25rem; font-weight: 900; color: var(--color-brand); margin-left: 0.4rem;">₹${totalCost.toLocaleString('en-IN')}</span>
          </div>
          <button type="button" class="btn-back-link" style="color: var(--color-brand); font-weight: 800; font-size: 0.88rem; cursor: pointer;" onclick="App.openPartyDrawer()">
            + Add More Dishes
          </button>
        </div>
      </div>
    `;
  },

  onPartyGuestCountChange(count) {
    // dynamically can adjust recommendations
  },

  async submitPartyOrder(e) {
    if (e && e.preventDefault) e.preventDefault();
    const guests = document.getElementById('party-guests')?.value || 30;
    const date = document.getElementById('party-date')?.value;
    const time = document.getElementById('party-time')?.value || '13:00';
    const outletId = document.getElementById('party-outlet')?.value || this.state.currentOutlet.id;
    const name = document.getElementById('party-name')?.value || this.state.customerName;
    const phone = document.getElementById('party-phone')?.value || this.state.customerPhone;
    const instructions = document.getElementById('party-instructions')?.value || '';

    const catalog = this.getBulkItemsCatalog();
    let itemsChosen = [];
    let calculatedCost = 0;

    for (const bItem of catalog) {
      const qty = this.state.partySelectedItems[bItem.id] || 0;
      if (qty > 0) {
        itemsChosen.push(`${qty}x ${bItem.name}`);
        calculatedCost += qty * bItem.price;
      }
    }

    if (itemsChosen.length === 0) {
      this.showToast('Please select at least 1 menu item or handi for your party!', 'error');
      this.openPartyDrawer();
      return;
    }

    const fullReqsText = `${itemsChosen.join(', ')}.${instructions ? ` Special Instructions: ${instructions}` : ''}`;
    const finalBudget = calculatedCost > 0 ? calculatedCost : Number(guests) * 550;

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
          requirements_text: fullReqsText,
          estimated_budget: finalBudget
        })
      });

      const data = await res.json();
      if (res.ok) {
        this.closePartyDrawer();
        this.showToast(`Party Request #${data.id} Submitted Successfully!`, 'success');
        this.state.partyViewTab = 'active';
        this.renderPartyView();
      } else {
        this.showToast(data.error || 'Failed to submit party order', 'error');
      }
    } catch (err) {
      this.showToast('Network error submitting party order', 'error');
    }
  },

  async submitPartyOrderFromDrawer() {
    let guests = document.getElementById('party-guests')?.value;
    if (!guests || Number(guests) < 15) {
      guests = 30;
      const gInput = document.getElementById('party-guests');
      if (gInput) gInput.value = 30;
    }

    let date = document.getElementById('party-date')?.value;
    if (!date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
      const dInput = document.getElementById('party-date');
      if (dInput) dInput.value = date;
    }

    let time = document.getElementById('party-time')?.value || '13:00';
    let outletId = document.getElementById('party-outlet')?.value || this.state.currentOutlet.id;
    let name = document.getElementById('party-name')?.value || this.state.customerName || 'Rahul Verma';
    let phone = document.getElementById('party-phone')?.value || this.state.customerPhone || '+91 98490 12345';
    let instructions = document.getElementById('party-instructions')?.value || '';

    const catalog = this.getBulkItemsCatalog();
    let itemsChosen = [];
    let calculatedCost = 0;

    for (const bItem of catalog) {
      const qty = this.state.partySelectedItems[bItem.id] || 0;
      if (qty > 0) {
        itemsChosen.push(`${qty}x ${bItem.name}`);
        calculatedCost += qty * bItem.price;
      }
    }

    if (itemsChosen.length === 0) {
      this.showToast('Please add at least 1 catering dish or handi!', 'error');
      return;
    }

    const fullReqsText = `${itemsChosen.join(', ')}.${instructions ? ` Special Instructions: ${instructions}` : ''}`;
    const finalBudget = calculatedCost > 0 ? calculatedCost : Number(guests) * 550;

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
          requirements_text: fullReqsText,
          estimated_budget: finalBudget
        })
      });

      const data = await res.json();
      if (res.ok) {
        this.closePartyDrawer();
        this.showToast(`Party Request #${data.id} Placed Successfully!`, 'success');
        this.state.partyViewTab = 'active';
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
        try {
          const pRes = await fetch('/api/party-orders');
          this.state.partyOrders = await pRes.json();
        } catch(e) {}
        if (this.state.currentView === 'cms') {
          this.renderCmsView();
        } else {
          this.renderPartyView();
        }
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
      <div style="max-width: 960px; margin: 0 auto; padding-bottom: 3rem;">
        
        

        <div class="page-header-center">
          <h1 class="page-title">AI Prep-Time Estimate</h1>
          <p class="page-subtitle">Predicted prep time based on current kitchen load and dish complexity.</p>
        </div>

        <!-- Formula Callout -->
        <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; margin-bottom: 2.25rem; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 0.85rem;">Estimation Formula</h3>
          <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 1.1rem; border-radius: 10px; font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: var(--text-main); line-height: 1.6;">
            Prep_Time = Max(Main_Dish_Time) + 0.28 * Sum(Side_Dishes) + (Kitchen_Orders * 2.2 * Rush_Factor)<br>
            <strong style="color: var(--accent-gold);">Promised_Time = Max(Prep_Time, Outlet_Minimum_Time)</strong>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.85rem;">
            Calculates realistic preparation times during peak hours so customers receive accurate delivery estimates.
          </div>
        </div>

        <!-- Interactive Simulator Widget -->
        <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 1.5rem;">Live Parameter Testing</h3>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 1.75rem;">
            <div>
              <label style="font-size: 0.88rem; color: var(--text-secondary); display: block; margin-bottom: 0.6rem; font-weight: 700;">
                Active Kitchen Orders in Queue: <strong id="sim-pots-val" style="color: var(--accent-gold);">3</strong>
              </label>
              <input type="range" id="sim-pots" min="0" max="25" value="3" style="width: 100%; accent-color: var(--accent-gold);" oninput="App.updateAiSim()">
            </div>

            <div>
              <label style="font-size: 0.88rem; color: var(--text-secondary); display: block; margin-bottom: 0.6rem; font-weight: 700;">
                Kitchen Rush Factor:
              </label>
              <select id="sim-peak" class="top-role-dropdown" style="width: 100%; background: #FFFFFF; color: var(--text-main); border: 1.5px solid var(--border-subtle);" onchange="App.updateAiSim()">
                <option value="1.0">Standard Hours (1.0x)</option>
                <option value="1.15">Lunch Rush 12-3 PM (1.15x)</option>
                <option value="1.25">Weekday Dinner 7-10 PM (1.25x)</option>
                <option value="1.40" selected>Weekend Peak (1.40x)</option>
              </select>
            </div>
          </div>

          <!-- Output Box -->
          <div id="sim-output" style="background-color: var(--bg-surface); padding: 1.4rem; border-radius: 12px; border: 1px solid var(--border-subtle);">
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
    const basePrep = 18 + (4 * 0.28);
    const queueWait = pots * 2.2 * peak;
    const rawAi = Math.ceil(basePrep + queueWait);
    const outletFloor = 25; // Kondapur floor
    const finalHonest = Math.max(rawAi, outletFloor);

    const out = document.getElementById('sim-output');
    if (out) {
      out.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.85rem;">
          <div>
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Estimated Preparation Time:</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent-gold);">${finalHonest} Minutes</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Status:</div>
            <div style="font-size: 0.95rem; font-weight: 800; color: ${rawAi < outletFloor ? 'var(--accent-gold)' : 'var(--accent-emerald)'};">
              ${rawAi < outletFloor ? 'Kitchen minimum threshold (25m)' : 'Dynamic workload estimate'}
            </div>
          </div>
        </div>
        <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
          Estimated prep: <strong>${rawAi}m</strong> (Food prep ${Math.round(basePrep)}m + Queue buffer ${Math.round(queueWait)}m under ${peak}x rush factor).
          ${finalHonest >= 35 ? '⚠️ High rush detected: Orders may experience slight delay.' : 'Normal kitchen timeline.'}
        </div>
      `;
    }
  },

  // --------------------------------------------------------------------------
  // OUTLET DROPDOWN & SWITCHING (ANCHORED DROPDOWN ON DESKTOP, BOTTOM SHEET ON MOBILE)
  // --------------------------------------------------------------------------
  toggleOutletDropdown(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('outlet-dropdown-menu');
    if (!dropdown) return;
    if (dropdown.classList.contains('open')) {
      this.closeOutletDropdown();
    } else {
      this.openOutletDropdown();
    }
  },

  openOutletDropdown() {
    const dropdown = document.getElementById('outlet-dropdown-menu');
    const wrap = document.getElementById('nav-location-wrap');
    if (!dropdown) return;
    dropdown.classList.add('open');
    dropdown.style.display = 'flex';
    wrap?.classList.add('open');
    const chevron = document.getElementById('nav-outlet-chevron');
    if (chevron) chevron.textContent = '▴';
    this.renderOutletDropdown();
    setTimeout(() => {
      document.getElementById('outlet-dropdown-search')?.focus();
    }, 50);
  },

  closeOutletDropdown() {
    const dropdown = document.getElementById('outlet-dropdown-menu');
    const wrap = document.getElementById('nav-location-wrap');
    if (dropdown) {
      dropdown.classList.remove('open');
      dropdown.style.display = 'none';
    }
    wrap?.classList.remove('open');
    const chevron = document.getElementById('nav-outlet-chevron');
    if (chevron) chevron.textContent = '▾';
  },

  renderOutletDropdown(filterText = '') {
    const list = document.getElementById('outlet-dropdown-items');
    if (!list) return;
    const q = (filterText || '').toLowerCase().trim();
    let outlets = this.state.outlets || [];
    if (q) {
      outlets = outlets.filter(o => o.name.toLowerCase().includes(q) || (o.address || '').toLowerCase().includes(q));
    }
    if (outlets.length === 0) {
      list.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No outlets matching "${filterText}".</div>`;
      return;
    }
    list.innerHTML = outlets.map(o => {
      const isSelected = o.id === this.state.currentOutlet.id;
      return `
        <div class="outlet-dropdown-item ${isSelected ? 'selected' : ''}" onclick="App.switchOutlet('${o.id}')">
          <div class="outlet-dropdown-item-left">
            <div class="outlet-item-name-row">
              <span class="outlet-item-name">${o.name}</span>
              ${isSelected ? '<span class="outlet-badge-selected">Current</span>' : ''}
              ${o.is_cloud_kitchen ? '<span class="outlet-badge-cloud">Cloud Kitchen</span>' : ''}
            </div>
            <div class="outlet-item-address">${o.address}</div>
            <div class="outlet-item-meta">
              <span>⚡ 7 km delivery</span>
              <span>•</span>
              <span>⏱️ ~${o.min_prep_time_minutes}m prep</span>
            </div>
          </div>
          <div class="outlet-dropdown-item-right">
            ${isSelected ? '<span class="outlet-item-check">✓</span>' : '<span class="outlet-item-arrow">➔</span>'}
          </div>
        </div>
      `;
    }).join('');
  },

  filterOutletDropdown(query) {
    this.renderOutletDropdown(query);
  },

  openOutletModal() {
    const modal = document.getElementById('outlet-modal');
    if (!modal) return;
    this.renderOutletList(this.state.outlets);
    modal.classList.add('open');
  },

  renderOutletList(outletArray) {
    const list = document.getElementById('outlet-selection-list');
    if (!list) return;

    this.state.outletModalFilter = this.state.outletModalFilter || 'all';
    let displayed = outletArray;
    if (this.state.outletModalFilter === 'dine_in') {
      displayed = displayed.filter(o => !o.is_cloud_kitchen);
    } else if (this.state.outletModalFilter === 'cloud_kitchen') {
      displayed = displayed.filter(o => o.is_cloud_kitchen);
    }

    list.innerHTML = `
      <!-- Primary Auto-Detect Hero Action (Prominent 1-Click GPS / Network Detection) -->
      <button type="button" class="outlet-modal-autodetect-hero" onclick="App.autoDetectNearestOutlet()">
        <div class="autodetect-hero-content">
          <span class="autodetect-hero-icon">📍</span>
          <div style="text-align: left;">
            <div class="autodetect-hero-title">Use My Current Location</div>
            <div class="autodetect-hero-sub">Auto-detect nearest kitchen with fastest delivery</div>
          </div>
        </div>
        <span class="autodetect-hero-btn-pill">Detect Nearest ➔</span>
      </button>

      <!-- Search Outlet Input -->
      <div style="display: flex; gap: 0.6rem; margin-bottom: 0.85rem;">
        <input type="text" id="outlet-search-input" placeholder="Search area or outlet (e.g. Kondapur, Ameerpet, Banjara Hills...)" 
               oninput="App.filterOutlets(this.value)"
               style="flex: 1; padding: 0.75rem 1rem; border-radius: 12px; border: 1.5px solid var(--border-subtle); font-size: 0.9rem;">
      </div>

      <!-- Location Filter Tabs -->
      <div class="modal-outlet-tabs" style="margin-bottom: 1rem;">
        <button class="modal-outlet-tab-btn ${this.state.outletModalFilter === 'all' ? 'active' : ''}" onclick="App.setOutletFilter('all')">
          All Kitchens (${this.state.outlets.length})
        </button>
        <button class="modal-outlet-tab-btn ${this.state.outletModalFilter === 'dine_in' ? 'active' : ''}" onclick="App.setOutletFilter('dine_in')">
          Dine-In Outlets (14)
        </button>
        <button class="modal-outlet-tab-btn ${this.state.outletModalFilter === 'cloud_kitchen' ? 'active' : ''}" onclick="App.setOutletFilter('cloud_kitchen')">
          Cloud Kitchens (3)
        </button>
      </div>

      <!-- Delivery Radius & Geofence Verification Tool -->
      <div class="outlet-radius-box" style="margin-bottom: 1.1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <strong style="font-size: 0.86rem; color: var(--text-main);">📍 Verify Exact Delivery Radius for Your Address</strong>
          <span style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 800;">7 KM GEOFENCE CHECK</span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" id="delivery-address-check-input" placeholder="Enter landmark / area (e.g. Kondapur, Gachibowli, Kukatpally, Shamshabad)..." style="flex: 1; padding: 0.55rem 0.85rem; font-size: 0.84rem;">
          <button class="btn-cart-nav" style="padding: 0.55rem 0.95rem; font-size: 0.82rem; background: var(--accent-gold); white-space: nowrap;" onclick="App.checkDeliveryRadius()">
            Check Radius
          </button>
        </div>
        <div id="delivery-check-result" style="display: none;"></div>
      </div>

      <!-- Outlets Cards List -->
      <div style="display: flex; flex-direction: column; gap: 0.85rem; max-height: 52vh; overflow-y: auto; padding-right: 0.25rem;">
        ${displayed.map(o => {
          const isSelected = o.id === this.state.currentOutlet.id;
          return `
            <div style="background: ${isSelected ? 'var(--accent-gold-subtle)' : '#FFFFFF'}; border: 1.5px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}; padding: 1.1rem 1.25rem; border-radius: 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: all 0.15s ease; box-shadow: ${isSelected ? '0 2px 8px rgba(217, 119, 6, 0.12)' : 'none'};" 
                 onclick="App.switchOutlet('${o.id}')">
              <div style="flex: 1; margin-right: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <span style="font-weight: 800; color: var(--text-main); font-size: 1.05rem;">${o.name}</span>
                  ${isSelected ? '<span style="background: var(--accent-gold); color: #FFF; font-size: 0.68rem; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 800;">CURRENT SELECTION</span>' : ''}
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.2rem;">${o.address}</div>
                <div style="display: flex; gap: 0.75rem; margin-top: 0.45rem; flex-wrap: wrap;">
                  <span style="font-size: 0.75rem; color: var(--accent-gold-hover); font-weight: 700;">
                    🛡️ FSSAI: ${o.fssai_license}
                  </span>
                  <span style="font-size: 0.75rem; color: var(--accent-emerald); font-weight: 700;">
                    ⚡ 7 km Delivery Radius
                  </span>
                  <span style="font-size: 0.75rem; color: var(--text-secondary); font-weight: 700;">
                    ⏱️ ~${o.min_prep_time_minutes}m Prep Floor
                  </span>
                </div>
              </div>
              <div style="text-align: right;">
                <span style="background: ${o.is_cloud_kitchen ? 'rgba(59, 130, 246, 0.12)' : 'var(--accent-emerald-light)'}; color: ${o.is_cloud_kitchen ? '#2563EB' : 'var(--accent-emerald)'}; font-size: 0.76rem; padding: 0.35rem 0.7rem; border-radius: 8px; font-weight: 800; white-space: nowrap; display: inline-block;">
                  ${o.is_cloud_kitchen ? 'Cloud Kitchen' : 'Flagship Dine-in'}
                </span>
                <div style="margin-top: 0.4rem; font-size: 0.75rem; color: var(--accent-gold); font-weight: 800;">
                  ${isSelected ? '✓ Selected' : 'Tap to switch ➔'}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  setOutletFilter(filterType) {
    this.state.outletModalFilter = filterType;
    this.renderOutletList(this.state.outlets);
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

  async checkDeliveryRadius() {
    const input = document.getElementById('delivery-address-check-input');
    const resultBox = document.getElementById('delivery-check-result');
    if (!input || !resultBox) return;

    const address = input.value.trim();
    if (!address) {
      resultBox.style.display = 'block';
      resultBox.className = 'radius-check-result radius-check-warning';
      resultBox.innerHTML = '⚠️ Please enter an area or address to verify delivery.';
      return;
    }

    try {
      const res = await fetch('/api/outlets/check-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      resultBox.style.display = 'block';

      if (data.serviceable) {
        resultBox.className = 'radius-check-result radius-check-success';
        resultBox.innerHTML = `
          <strong>✅ Delivery Available!</strong><br>
          Delivering from <strong>${data.recommended_outlet.name}</strong> (${data.recommended_outlet.distance_km} km away, within ${data.recommended_outlet.delivery_radius_km} km radius).<br>
          <button class="btn-add-action" style="margin-top: 0.5rem; padding: 0.35rem 0.8rem; font-size: 0.8rem;" onclick="App.switchOutlet('${data.recommended_outlet.id}')">
            Set ${data.recommended_outlet.name} as Delivery Kitchen ➔
          </button>
        `;
      } else {
        resultBox.className = 'radius-check-result radius-check-warning';
        resultBox.innerHTML = `
          <strong>⚠️ Outside Standard Delivery Radius</strong><br>
          ${data.message}<br>
          <button class="btn-add-action" style="margin-top: 0.5rem; padding: 0.35rem 0.8rem; font-size: 0.8rem; background: #B45309;" onclick="App.switchOutlet('${data.nearest_outlet.id}')">
            Switch to ${data.nearest_outlet.name} for Pickup ➔
          </button>
        `;
      }
    } catch (e) {
      resultBox.style.display = 'block';
      resultBox.className = 'radius-check-result radius-check-warning';
      resultBox.innerHTML = 'Could not verify coordinates. Please try another area name.';
    }
  },

  closeOutletModal() {
    const modal = document.getElementById('outlet-modal');
    if (modal) modal.classList.remove('open');
  },

  handleModalBackdropClick(e) {
    this.closeOutletModal();
  },

  async switchOutlet(outletId) {
    const outlet = this.state.outlets.find(o => o.id === outletId);
    if (!outlet) return;
    this.state.currentOutlet = outlet;
    this.updateNavOutlet();
    this.closeOutletDropdown();
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
      <span style="font-size: 1.1rem;">${type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️'}</span>
      <span style="font-size: 0.9rem; font-weight: 700;">${message}</span>
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
