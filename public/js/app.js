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
    activeCategory: 'All',
    vegOnly: false,
    searchQuery: '',
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
    selectedAddOns: [],
    editingMenuItem: null
  },

  audioCtx: null,

  async init() {
    console.log('⚡ Initializing Dum & Co. Direct Platform...');
    await this.checkSession();
    await this.fetchOutlets();
    await this.fetchMenu();
    await this.fetchOrders();
    await this.fetchLoyalty();
    await this.fetchAiRecommendations();
    this.updateNavAuthPill();
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
          this.state.customerName = data.user.name;
          if (data.user.phone) this.state.customerPhone = data.user.phone;
          this.navigate('ordering');
        } else if (data.user.role === 'kitchen_staff') {
          this.state.kdsOutletFilter = data.user.outlet_id || 'out-kondapur';
          this.navigate('kds');
        } else if (data.user.role === 'admin') {
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

        if (data.user.role === 'customer') this.navigate('ordering');
        else if (data.user.role === 'kitchen_staff') {
          this.state.kdsOutletFilter = data.user.outlet_id || 'out-kondapur';
          this.navigate('kds');
        } else if (data.user.role === 'admin') this.navigate('cms');
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
    localStorage.removeItem('dumco_token');
    this.updateNavAuthPill();
    this.closeAuthModal();
    this.showToast('Signed out successfully', 'info');
    this.navigate('ordering');
  },

  renderAuthModalBody() {
    const body = document.getElementById('auth-modal-body');
    if (!body) return;

    if (this.state.currentUser) {
      body.innerHTML = `
        <div style="text-align: center; padding: 1.5rem 1rem;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">👑</div>
          <h3 style="font-size: 1.3rem; color: var(--text-main); margin-bottom: 0.25rem;">${this.state.currentUser.name}</h3>
          <p style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 1.25rem;">
            ${this.state.currentUser.email} • Role: <strong>${this.state.currentUser.role.toUpperCase()}</strong>
            ${this.state.currentUser.outlet_name ? ` (${this.state.currentUser.outlet_name})` : ''}
          </p>
          <div style="display: flex; gap: 0.8rem; justify-content: center; flex-wrap: wrap;">
            <button class="btn-cart-nav" style="background: var(--text-main);" onclick="App.navigate('account'); App.closeAuthModal();">
              View Order History
            </button>
            <button class="side-action-btn" style="background: #FEE2E2; color: #DC2626; border-color: #FCA5A5;" onclick="App.logoutUser()">
              Sign Out
            </button>
          </div>
        </div>
      `;
      return;
    }

    const tab = this.state.authTab || 'demo';
    body.innerHTML = `
      <div class="auth-tab-group">
        <button class="auth-tab-btn ${tab === 'demo' ? 'active' : ''}" onclick="App.switchAuthTab('demo')">
          ⚡ 1-Click Demo
        </button>
        <button class="auth-tab-btn ${tab === 'login' ? 'active' : ''}" onclick="App.switchAuthTab('login')">
          Sign In
        </button>
        <button class="auth-tab-btn ${tab === 'register' ? 'active' : ''}" onclick="App.switchAuthTab('register')">
          New Customer
        </button>
      </div>

      ${tab === 'demo' ? `
        <div style="margin-bottom: 0.75rem;">
          <p style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.85rem;">
            Select a verified reviewer persona to authenticate instantly with real cryptographically hashed credentials:
          </p>
          
          <div class="demo-account-card" onclick="App.loginWithDemo('customer')">
            <div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">Rahul Verma</span>
                <span class="demo-badge demo-badge-customer">Customer</span>
              </div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.15rem;">customer@dumco.in • 340 Loyalty Points</div>
            </div>
            <span style="color: var(--accent-gold); font-weight: 800; font-size: 0.84rem;">Login ➔</span>
          </div>

          <div class="demo-account-card" onclick="App.loginWithDemo('kitchen_kondapur')">
            <div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">Chef Mohammed Qasim</span>
                <span class="demo-badge demo-badge-kitchen">Kitchen Staff</span>
              </div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.15rem;">kondapur@dumco.in • Kondapur Flagship KDS</div>
            </div>
            <span style="color: var(--accent-gold); font-weight: 800; font-size: 0.84rem;">Login ➔</span>
          </div>

          <div class="demo-account-card" onclick="App.loginWithDemo('kitchen_gachibowli')">
            <div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">Chef Syed Arshad</span>
                <span class="demo-badge demo-badge-kitchen">Kitchen Staff</span>
              </div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.15rem;">gachibowli@dumco.in • Gachibowli Cloud Kitchen</div>
            </div>
            <span style="color: var(--accent-gold); font-weight: 800; font-size: 0.84rem;">Login ➔</span>
          </div>

          <div class="demo-account-card" onclick="App.loginWithDemo('kitchen_kukatpally')">
            <div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">Chef Nageshwar Rao</span>
                <span class="demo-badge demo-badge-kitchen">Kitchen Staff</span>
              </div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.15rem;">kukatpally@dumco.in • Kukatpally KPHB</div>
            </div>
            <span style="color: var(--accent-gold); font-weight: 800; font-size: 0.84rem;">Login ➔</span>
          </div>

          <div class="demo-account-card" onclick="App.loginWithDemo('admin')">
            <div>
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-main);">Zafar Khan</span>
                <span class="demo-badge demo-badge-admin">Central Admin</span>
              </div>
              <div style="font-size: 0.76rem; color: var(--text-muted); margin-top: 0.15rem;">admin@dumco.in • Central Menu CMS & Analytics</div>
            </div>
            <span style="color: var(--accent-gold); font-weight: 800; font-size: 0.84rem;">Login ➔</span>
          </div>
        </div>
      ` : tab === 'login' ? `
        <form onsubmit="App.submitLogin(event)">
          <div class="auth-form-group">
            <label>Email Address</label>
            <input type="email" id="auth-login-email" value="customer@dumco.in" required>
          </div>
          <div class="auth-form-group">
            <label>Password</label>
            <input type="password" id="auth-login-password" value="Customer@123" required>
          </div>
          <button type="submit" class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 0.95rem; margin-top: 0.5rem; background: var(--text-main);">
            Sign In with Password ➔
          </button>
        </form>
      ` : `
        <form onsubmit="App.submitRegister(event)">
          <div class="auth-form-group">
            <label>Full Name</label>
            <input type="text" id="auth-reg-name" placeholder="e.g. Rahul Verma" required>
          </div>
          <div class="auth-form-group">
            <label>Email Address</label>
            <input type="email" id="auth-reg-email" placeholder="name@example.com" required>
          </div>
          <div class="auth-form-group">
            <label>Mobile Number (for WhatsApp / SMS Updates)</label>
            <input type="tel" id="auth-reg-phone" placeholder="+91 98490 12345" required>
          </div>
          <div class="auth-form-group">
            <label>Password</label>
            <input type="password" id="auth-reg-password" placeholder="Min 8 characters" required>
          </div>
          <button type="submit" class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 0.85rem; font-size: 0.95rem; margin-top: 0.5rem; background: var(--accent-gold);">
            Create Customer Account ➔
          </button>
        </form>
      `}
    `;
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
    document.getElementById('side-device-laptop')?.classList.toggle('active', !isMobile);
    document.getElementById('side-device-mobile')?.classList.toggle('active', isMobile);
    this.showToast(isMobile ? '📱 Mobile Frame Active (390px Viewport)' : '💻 Laptop Fullscreen View Active', 'info');
    this.closeSideDrawer();
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
  // NAVIGATION & ROUTING
  // --------------------------------------------------------------------------
  navigate(viewName) {
    this.state.currentView = viewName;

    // Header Back button visibility
    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
      backBtn.style.display = (viewName === 'ordering') ? 'none' : 'inline-flex';
    }

    // Update customer nav link active state
    document.querySelectorAll('.cust-nav-link').forEach(link => link.classList.remove('active'));
    if (viewName === 'ordering') {
      document.getElementById('link-menu')?.classList.add('active');
    } else if (viewName === 'party') {
      document.getElementById('link-party')?.classList.add('active');
    } else if (viewName === 'tracking') {
      document.getElementById('link-tracking')?.classList.add('active');
    } else if (viewName === 'account') {
      document.getElementById('link-account')?.classList.add('active');
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
      email: 'customer@dumco.in',
      role: 'customer'
    };

    const userOrders = this.state.orders.filter(o => 
      !this.state.customerPhone || o.customer_phone === this.state.customerPhone
    );

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding-bottom: 3rem;">
        
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
              ROYALTY BALANCE
            </div>
            <div style="font-size: 1.8rem; font-weight: 900; color: #FFFFFF; font-family: 'JetBrains Mono', monospace;">
              ${this.state.customerLoyaltyBalance} <span style="font-size: 0.9rem; color: #F59E0B;">pts</span>
            </div>
            <div style="font-size: 0.72rem; color: #94A3B8;">1 pt = ₹1 instant checkout credit</div>
          </div>
        </div>

        <!-- Orders Section Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
          <div>
            <h3 style="font-size: 1.3rem; color: var(--text-main); margin: 0;">Order History & Live Status</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">Track current kitchen preparations and re-order previous feasts</p>
          </div>
          <button class="btn-cart-nav" onclick="App.navigate('ordering')">
            + New Order
          </button>
        </div>

        <!-- Orders List -->
        <div class="account-orders-list">
          ${userOrders.length === 0 ? `
            <div style="text-align: center; padding: 4rem 1rem; background: #FFFFFF; border-radius: 16px; border: 1.5px dashed var(--border-subtle);">
              <div style="font-size: 3rem; margin-bottom: 0.5rem;">🍲</div>
              <h4 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 0.3rem;">No past orders found</h4>
              <p style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 1.2rem;">Order your first authentic Hyderabadi Dum Biryani directly from the kitchen!</p>
              <button class="btn-cart-nav" onclick="App.navigate('ordering')">Explore Direct Menu ➔</button>
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

                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem;">
                  <span style="font-size: 0.78rem; color: var(--text-muted);">
                    Promised delivery: ~${order.ai_prep_estimate_minutes} mins
                  </span>
                  <div style="display: flex; gap: 0.6rem;">
                    <button class="side-action-btn" style="padding: 0.35rem 0.85rem; font-size: 0.8rem;" onclick="App.state.activeOrderId='${order.id}'; App.navigate('tracking');">
                      📍 Track Live
                    </button>
                    <button class="btn-add-action" style="padding: 0.35rem 0.85rem; font-size: 0.8rem;" onclick="App.reorderPastOrder('${order.id}')">
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

    const categories = ['All Curations', 'Dum Biryani', 'Royal Specials', 'Starters & Kebabs', 'Hyderabadi Curries', 'Desserts & Shakes'];
    let filtered = this.state.menu;

    if (this.state.activeCategory !== 'All Curations' && this.state.activeCategory !== 'All') {
      filtered = filtered.filter(item => item.category === this.state.activeCategory);
    }
    if (this.state.vegOnly) {
      filtered = filtered.filter(item => item.is_veg === 1);
    }
    if (this.state.searchQuery && this.state.searchQuery.trim()) {
      const q = this.state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q));
    }

    container.innerHTML = `
      <!-- Luxury Hero Banner -->
      <section class="hero-luxury-banner">
        <div class="hero-kicker">
          <span>👑</span> Company A • Hyderabad Direct Platform • 15% Net Margin Saved
        </div>
        <h1 class="hero-headline">The Royal Dum Biryani of Hyderabad.</h1>
        <p class="hero-lead">
          Slow wood-fire cooked in sealed copper deghs across 14 outlets & 3 cloud kitchens. Direct dispatch from 
          <strong>${outlet ? outlet.name : 'Hyderabad'}</strong>. No 25% app middleman fees, 100% authentic recipe.
        </p>
        <div class="hero-stats-row">
          <div class="hero-stat-card">
            <span>🛡️</span> <strong>FSSAI Lic:</strong> ${outlet ? outlet.fssai_license : '13622014000491'}
          </div>
          <div class="hero-stat-card">
            <span>⏱️</span> <strong>AI Dynamic Prep:</strong> ~${outlet ? outlet.min_prep_time_minutes : 25}m honest promise
          </div>
          <div class="hero-stat-card">
            <span>🏷️</span> <strong>Zero Markups:</strong> All prices include 5% GST
          </div>
          <div class="hero-stat-card">
            <span>🎁</span> <strong>Royal Loyalty:</strong> 5% cashback on direct orders
          </div>
        </div>
      </section>

      <!-- AI Smart Re-Order Suggestions (Strictly Opt-in, never auto-added) -->
      ${this.renderAiReorderBanner()}

      <!-- Sticky Category Bar & Search -->
      <div class="category-filter-bar">
        <div class="category-chips-list">
          ${categories.map(cat => `
            <button class="category-chip ${this.state.activeCategory === cat ? 'active' : ''}" 
                    onclick="App.setCategory('${cat}')">
              ${cat}
            </button>
          `).join('')}
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <label class="veg-filter-label">
            <input type="checkbox" class="veg-toggle-input" ${this.state.vegOnly ? 'checked' : ''} onchange="App.toggleVegFilter(this.checked)">
            <span>🌱 Pure Veg Only</span>
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
      <div class="ai-smart-banner">
        <div class="ai-banner-header">
          <div class="ai-banner-title">
            <span>✨</span> AI Smart Re-Order Recommendations
          </div>
          <div class="ai-guarantee-pill">
            🛡️ Strictly Opt-In • Never Auto-Added
          </div>
        </div>
        <p class="ai-banner-desc">
          Personalized for <strong>${this.state.customerName}</strong> based on past Hyderabadi culinary orders:
        </p>
        <div class="ai-recommendations-grid">
          ${this.state.aiRecommendations.map(item => `
            <div class="ai-dish-pill-card">
              <div style="display: flex; align-items: center; gap: 0.85rem;">
                <img src="${item.image_url}" alt="${item.name}" class="ai-dish-thumb">
                <div>
                  <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${item.name}</div>
                  <div style="font-size: 0.75rem; color: var(--accent-gold); font-weight: 700;">${item.rationale || item.badge}</div>
                  <div style="font-weight: 800; font-size: 0.92rem; color: var(--text-main); margin-top: 0.15rem;">₹${item.base_price}</div>
                </div>
              </div>
              <button class="btn-add-action" style="padding: 0.35rem 0.9rem; font-size: 0.8rem;" 
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
        <div class="dish-card-media">
          <img src="${item.image_url}" alt="${item.name}" class="dish-card-image" loading="lazy">
          
          <div class="dish-badges-left">
            <div class="diet-badge ${item.is_veg ? 'veg' : 'non-veg'}" title="${item.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}"></div>
            <div class="dish-spice-pill">🌶️ ${item.spice_level}</div>
          </div>
          
          <div class="dish-prep-badge">⏱️ ${item.prep_complexity_minutes}m</div>
        </div>

        <!-- Scannable Body -->
        <div class="dish-card-body">
          <div class="dish-header-row">
            <h3 class="dish-title">${item.name}</h3>
            <span class="dish-price-tag">₹${item.base_price}</span>
          </div>
          
          <p class="dish-description">${item.description}</p>

          <div class="dish-footer">
            <span class="dish-gst-note">incl. 5% GST</span>
            
            ${isOutOfStock ? `
              <span style="color: var(--accent-rose); font-size: 0.8rem; font-weight: 800; letter-spacing: 0.05em;">SOLD OUT</span>
            ` : cartCount > 0 ? `
              <div class="qty-stepper-box">
                <button class="qty-step-btn" onclick="App.quickDecrementItem('${item.id}')">-</button>
                <span class="qty-step-val">${cartCount}</span>
                <button class="qty-step-btn" onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">+</button>
              </div>
            ` : `
              <div>
                <button class="btn-add-action" onclick="${hasCustomization ? `App.openCustomModal('${item.id}')` : `App.addToCart('${item.id}')`}">
                  + ADD
                </button>
                ${hasCustomization ? '<div class="customisable-label">Customisable</div>' : ''}
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
      <div style="max-width: 1000px; margin: 0 auto;">
        
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem;">
          <div>
            <h2 style="font-size: 2rem; color: var(--text-main);">Express Checkout</h2>
            <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.2rem;">
              Direct order • Zero delivery app commission markups • 5% Royal Cashback
            </p>
          </div>
          <button class="category-chip" onclick="App.navigate('ordering')">← Back to Menu</button>
        </div>

        <!-- AI Honest Delivery Promise Callout -->
        <div style="background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%); border: 1.5px solid #FDE68A; border-left: 5px solid var(--accent-gold); border-radius: 16px; padding: 1.5rem 1.75rem; margin-bottom: 2.25rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: var(--shadow-sm);">
          <div style="font-size: 2.5rem;">⏱️</div>
          <div>
            <div style="font-weight: 800; font-size: 1.15rem; color: var(--accent-gold-hover);">
              AI Promised Delivery Time: ~${honestPrepMinutes} Minutes
            </div>
            <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.25rem;">
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
                <span>📍</span> Delivery Location (Hyderabad)
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

            <!-- DPDP Act 2023 Consent Card -->
            <div style="background-color: var(--accent-emerald-subtle); border: 1.5px solid #A7F3D0; border-radius: 14px; padding: 1.25rem;">
              <label style="display: flex; align-items: flex-start; gap: 0.85rem; cursor: pointer;">
                <input type="checkbox" id="dpdp-consent" checked style="accent-color: var(--accent-emerald); width: 22px; height: 22px; margin-top: 2px;">
                <span style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;">
                  <strong>DPDP Act 2023 Consent:</strong> I agree to receive transactional order tracking messages via WhatsApp/SMS. I opt-in to direct reward updates and exclusive Company A promotions. You can opt out at any time.
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

              <!-- Proceed to Mock Payment Button -->
              <button id="place-order-btn" class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 1.1rem; font-size: 1.05rem; border-radius: 14px; margin-top: 1.5rem;" 
                      onclick="App.openPaymentModal(${finalTotal}, ${subtotal}, ${gst}, ${discount}, ${validLoyaltyRedeem})">
                Proceed to Mock Payment (₹${finalTotal}) ➔
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

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto;">
        
        <!-- Header & Back Button -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <button class="header-back-btn" onclick="App.navigate('ordering')">← Back to Menu</button>
            <div>
              <h2 style="font-size: 2rem; color: var(--text-main);">Live Order Status</h2>
              <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.2rem;">Real-time tracking of kitchen dum preparation and 3PL dispatch</div>
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem; overflow-x: auto; align-items: center;">
            ${this.state.orders.slice(0, 4).map(o => `
              <button class="category-chip ${o.id === order.id ? 'active' : ''}" onclick="App.setActiveOrder('${o.id}')">
                #${o.id} (${o.status})
              </button>
            `).join('')}
            <button class="category-chip" style="background: var(--accent-rose-light); color: var(--accent-rose); border-color: var(--accent-rose); font-weight: 800;" onclick="App.simulateLateDelay('${order.id}')" title="Trigger 10+ min delay to inspect auto-apology and compensation">
              ⚡ Test 10m Late Trigger
            </button>
          </div>
        </div>

        <!-- 10-Minute Late Apology Compensation Alert Banner -->
        ${order.late_alert_triggered ? `
          <div style="background: #FEF2F2; border: 2px solid #F87171; border-left: 6px solid #EF4444; border-radius: 16px; padding: 1.5rem 1.75rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 2.75rem;">🎁</div>
            <div>
              <div style="font-weight: 800; font-size: 1.15rem; color: #991B1B;">
                Honest Delay Apology: ₹50 Royalty Credit Issued
              </div>
              <div style="font-size: 0.88rem; color: #7F1D1D; margin-top: 0.25rem;">
                This order encountered peak wood-fire dum degh load at ${order.outlet_name}. We have automatically credited ₹50 to your account for trusting us directly.
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Main Tracking Card -->
        <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 20px; padding: 2.25rem; margin-bottom: 2.5rem; box-shadow: var(--shadow-md);">
          
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; border-bottom: 1.5px solid var(--border-subtle); padding-bottom: 1.5rem;">
            <div>
              <span style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--accent-gold); font-weight: 800;">Direct Order Tracker</span>
              <h3 style="font-size: 2rem; color: var(--text-main); margin-top: 0.25rem; font-family: 'JetBrains Mono', monospace;">#${order.id}</h3>
              <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.35rem;">
                Outlet: <strong>${order.outlet_name}</strong> • FSSAI: ${order.fssai_license || '13622014000491'}
              </div>
            </div>

            <div style="text-align: right;">
              <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Honest Promised Arrival:</div>
              <div style="font-size: 1.6rem; font-weight: 900; color: ${isLate ? 'var(--accent-rose)' : 'var(--accent-gold)'}; font-family: 'JetBrains Mono', monospace;">
                ${new Date(order.promised_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div style="font-size: 0.85rem; font-weight: 800; color: ${isLate ? 'var(--accent-rose)' : 'var(--accent-emerald)'};" id="tracking-countdown">
                ${isLate ? `Late by ${Math.abs(diffMins)} mins` : `${diffMins} mins remaining`}
              </div>
            </div>
          </div>

          <!-- Step-by-Step Progress Timeline -->
          <div style="display: flex; justify-content: space-between; position: relative; margin: 3rem 0 2.5rem 0;">
            <div style="position: absolute; top: 22px; left: 30px; right: 30px; height: 4px; background: var(--border-subtle); z-index: 1;"></div>
            
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
    if (diffMins < 0) {
      el.textContent = `Late by ${Math.abs(diffMins)} mins`;
      el.style.color = 'var(--accent-rose)';
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
            <span class="kds-live-badge">LIVE KDS</span>
            <div>
              <div class="kds-outlet-name">${filter === 'all' ? 'All Hyderabad Kitchens (Central Hub)' : currentOutlet.name}</div>
              <div class="kds-outlet-meta">
                FSSAI Lic: ${currentOutlet.fssai_license} • 2-Metre High Contrast Tablet Display
              </div>
            </div>
          </div>

          <!-- Outlet Selector & Audio Button -->
          <div style="display: flex; gap: 0.85rem; align-items: center; flex-wrap: wrap;">
            <button class="kds-exit-btn" onclick="App.navigate('ordering')" title="Return to customer menu">
              ← Exit to Customer Menu
            </button>

            <select class="role-dropdown" style="font-size: 1rem; padding: 0.65rem 1.1rem; background: #1E293B; color: #FFF; border-color: #334155;" 
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
            <div style="font-weight: 800; font-size: 1.05rem;">
              Manager Notified • Auto Customer Apology Dispatched
            </div>
          </div>
        ` : ''}

        <!-- KDS Ticket Cards Grid -->
        <div class="kds-grid">
          ${kdsOrders.length === 0 ? `
            <div style="grid-column: 1 / -1; text-align: center; padding: 5rem 2rem; background: #0F172A; border-radius: 16px; border: 2px dashed #334155;">
              <div style="font-size: 3.5rem; margin-bottom: 1rem;">✨</div>
              <h3 style="font-size: 1.6rem; color: #FFFFFF;">All Clear! Kitchen Queue Up to Date</h3>
              <p style="color: #94A3B8; margin-top: 0.5rem; font-size: 1.05rem;">New direct customer orders will automatically appear and play sound chime.</p>
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
            <div class="kds-order-meta">Placed: ${placed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • ${elapsedMins}m Elapsed</div>
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
      <div style="max-width: 1160px; margin: 0 auto; padding-bottom: 3rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <h2 style="font-size: 2rem; color: var(--text-main); margin: 0;">Central Menu CMS & Catalog</h2>
              <span class="demo-badge demo-badge-admin">HQ Admin</span>
            </div>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">
              Create, edit, or delete dishes, configure regional pricing, and pause out-of-stock items in real time across 17 locations.
            </p>
          </div>
          
          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <button class="btn-cart-nav" style="background: var(--accent-gold); padding: 0.55rem 1.1rem; font-size: 0.88rem;" onclick="App.openCmsItemModal()">
              ＋ Create New Dish
            </button>
            <button class="side-action-btn" style="padding: 0.55rem 1rem; font-size: 0.88rem;" onclick="App.openCmsCityModal()">
              🏙️ City Prices
            </button>
            <button class="btn-return-customer" onclick="App.navigate('ordering')">
              ← Customer View
            </button>
            <select class="role-dropdown" onchange="App.switchOutlet(this.value)" title="Active outlet stock preview">
              ${this.state.outlets.map(o => `
                <option value="${o.id}" ${o.id === outlet.id ? 'selected' : ''}>${o.name}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm);">
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
      <form onsubmit="App.submitCmsItem(event)">
        <div class="auth-form-group">
          <label>Dish Name *</label>
          <input type="text" id="cms-dish-name" value="${item ? item.name : ''}" placeholder="e.g. Shahi Mutton Dum Biryani" required>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <div class="auth-form-group" style="flex: 1;">
            <label>Category *</label>
            <select id="cms-dish-category">
              ${categories.map(c => `
                <option value="${c}" ${item && item.category === c ? 'selected' : ''}>${c}</option>
              `).join('')}
            </select>
          </div>
          <div class="auth-form-group" style="flex: 1;">
            <label>Base Price (₹ incl 5% GST) *</label>
            <input type="number" id="cms-dish-price" value="${item ? item.base_price : 380}" min="10" required>
          </div>
        </div>

        <div class="auth-form-group">
          <label>Description</label>
          <textarea id="cms-dish-desc" rows="2" placeholder="Description of spices, slow-cooking technique, and aroma...">${item ? item.description : ''}</textarea>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <div class="auth-form-group" style="flex: 1;">
            <label>Classification</label>
            <select id="cms-dish-veg">
              <option value="0" ${item && !item.is_veg ? 'selected' : ''}>🍖 Non-Vegetarian</option>
              <option value="1" ${item && item.is_veg ? 'selected' : ''}>🌱 Pure Vegetarian</option>
            </select>
          </div>
          <div class="auth-form-group" style="flex: 1;">
            <label>Spice Level</label>
            <select id="cms-dish-spice">
              <option value="Mild" ${item && item.spice_level === 'Mild' ? 'selected' : ''}>Mild</option>
              <option value="Medium" ${item && item.spice_level === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Fiery" ${item && item.spice_level === 'Fiery' ? 'selected' : ''}>Fiery</option>
              <option value="Nawabi Dum" ${item && item.spice_level === 'Nawabi Dum' ? 'selected' : ''}>Nawabi Dum</option>
            </select>
          </div>
          <div class="auth-form-group" style="flex: 1;">
            <label>Allergens</label>
            <input type="text" id="cms-dish-allergens" value="${item ? item.allergens : ''}" placeholder="e.g. Dairy, Nuts">
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem;">
          <div class="auth-form-group" style="flex: 1;">
            <label>Prep Complexity (Mins)</label>
            <input type="number" id="cms-dish-complexity" value="${item ? item.prep_complexity_minutes : 12}" min="2" max="60">
          </div>
          <div class="auth-form-group" style="flex: 1;">
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
          <label>Target City / Region</label>
          <select id="cms-city-name">
            <option value="Hyderabad">Hyderabad Core</option>
            <option value="Secunderabad">Secunderabad</option>
            <option value="Cyberabad">Cyberabad (Hitec/Gachibowli)</option>
          </select>
        </div>

        <div class="auth-form-group">
          <label>Menu Item</label>
          <select id="cms-city-item">
            ${this.state.menu.map(m => `
              <option value="${m.id}">${m.name} (Current: ₹${m.base_price})</option>
            `).join('')}
          </select>
        </div>

        <div class="auth-form-group">
          <label>City-Specific Base Price (₹ incl 5% GST)</label>
          <input type="number" id="cms-city-price" placeholder="e.g. 420" required min="10">
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem;">
          <button type="button" class="side-action-btn" onclick="App.closeCmsCityModal()">Cancel</button>
          <button type="submit" class="btn-cart-nav" style="background: var(--accent-gold);">
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
        
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <h2 style="font-size: 2rem; color: var(--text-main);">Direct Ordering Economics & Financial Health</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">
              Company A, Hyderabad • Tracking ₹1.14 Crore Annual Commission Savings & Customer Retention
            </p>
          </div>
          <div style="display: flex; gap: 0.85rem; align-items: center;">
            <button class="btn-return-customer" onclick="App.navigate('ordering')">
              ← Exit to Customer Menu
            </button>
            <div style="background: var(--accent-gold-light); color: var(--accent-gold-hover); padding: 0.45rem 1rem; border-radius: var(--radius-full); font-weight: 800; font-size: 0.84rem;">
              HQ EXECUTIVE VIEW
            </div>
          </div>
        </div>

        <!-- 4 Hero Metric Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2.75rem;">
          
          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.8rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Net Direct Margin Saved</div>
            <div style="font-size: 2.4rem; font-weight: 900; color: var(--accent-emerald); margin: 0.4rem 0; font-family: 'JetBrains Mono', monospace;">₹${summary.commissions_saved.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">15 points net margin gain vs delivery apps</div>
          </div>

          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.8rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">App Commission Avoided</div>
            <div style="font-size: 2.4rem; font-weight: 900; color: var(--text-main); margin: 0.4rem 0; font-family: 'JetBrains Mono', monospace;">₹${summary.app_fees_avoided.toLocaleString('en-IN')}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">27% fees not paid to Swiggy/Zomato</div>
          </div>

          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.8rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Projected Annual Savings</div>
            <div style="font-size: 2.4rem; font-weight: 900; color: var(--accent-gold); margin: 0.4rem 0; font-family: 'JetBrains Mono', monospace;">${summary.projected_annual_savings}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">Target: ₹95.04L retail + ₹19.44L party orders</div>
          </div>

          <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
            <div style="font-size: 0.8rem; color: var(--accent-gold); text-transform: uppercase; font-weight: 800; letter-spacing: 0.05em;">Direct Repeat Rate</div>
            <div style="font-size: 2.4rem; font-weight: 900; color: #2563EB; margin: 0.4rem 0; font-family: 'JetBrains Mono', monospace;">${summary.repeat_customer_rate}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">Total Cancellations: <strong>${summary.total_cancellations || 0} (${summary.cancellation_rate || '0.0%'})</strong></div>
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
  async renderPartyView() {
    const container = document.getElementById('app-view-container');
    let partyList = [];

    this.state.partyViewTab = this.state.partyViewTab || 'request';
    this.state.partySelectedItems = this.state.partySelectedItems || {
      'bulk-chicken-biryani': 3,
      'bulk-mutton-haleem': 2,
      'bulk-double-meetha': 2
    };

    try {
      const res = await fetch('/api/party-orders');
      partyList = await res.json();
      this.state.partyOrders = partyList;
    } catch (e) {
      console.warn('Failed to fetch party orders:', e);
    }

    const bulkItemsCatalog = [
      { id: 'bulk-chicken-biryani', name: 'Royal Chicken Dum Biryani Handi', serves: 6, price: 900, is_veg: false, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80' },
      { id: 'bulk-mutton-biryani', name: 'Nizami Mutton Dum Biryani Handi', serves: 6, price: 1200, is_veg: false, image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&q=80' },
      { id: 'bulk-veg-biryani', name: 'Hyderabadi Subz Veg Biryani Handi', serves: 6, price: 640, is_veg: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80' },
      { id: 'bulk-mutton-haleem', name: 'Shahi Mutton Haleem Handi (Desi Ghee)', serves: 5, price: 1050, is_veg: false, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&q=80' },
      { id: 'bulk-mirchi-salan', name: 'Mirchi Ka Salan Party Degh', serves: 10, price: 250, is_veg: true, image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=300&q=80' },
      { id: 'bulk-double-meetha', name: 'Double Ka Meetha Royal Tray', serves: 8, price: 420, is_veg: true, image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&q=80' }
    ];

    // Calculate totals
    let calculatedGuests = 0;
    let calculatedCost = 0;
    let selectedSummary = [];

    for (const bItem of bulkItemsCatalog) {
      const qty = this.state.partySelectedItems[bItem.id] || 0;
      if (qty > 0) {
        calculatedGuests += qty * bItem.serves;
        calculatedCost += qty * bItem.price;
        selectedSummary.push(`${qty}x ${bItem.name}`);
      }
    }

    container.innerHTML = `
      <div style="max-width: 1080px; margin: 0 auto;">
        
        <!-- Top Back Bar & Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <button class="header-back-btn" onclick="App.navigate('ordering')">
              ← Back to Menu
            </button>
            <div>
              <h2 style="font-size: 2rem; color: var(--text-main);">Party & Bulk Catering Desk</h2>
              <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.15rem;">
                Direct wood-fire copper degh catering for 15 to 500+ guests. Fresh preparation with min 24h notice.
              </p>
            </div>
          </div>
          <div style="background: var(--accent-gold-light); color: var(--accent-gold-hover); padding: 0.45rem 1rem; border-radius: var(--radius-full); font-weight: 800; font-size: 0.84rem;">
            ⚡ Saves ₹19.44 Lakh Phone Leakage
          </div>
        </div>

        <!-- Sub-Tabs: Request New Catering vs Active Requests -->
        <div class="party-nav-tabs">
          <button class="party-tab-btn ${this.state.partyViewTab === 'request' ? 'active' : ''}" onclick="App.setPartyTab('request')">
            <span>📝</span> Request Bulk Catering
          </button>
          <button class="party-tab-btn ${this.state.partyViewTab === 'active' ? 'active' : ''}" onclick="App.setPartyTab('active')">
            <span>📋</span> My Active Bulk Requests (${partyList.length})
          </button>
        </div>

        ${this.state.partyViewTab === 'request' ? `
          <!-- TAB 1: INTERACTIVE REQUEST BUILDER -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; align-items: start;">
            
            <!-- Left Column: Interactive Menu Item Selector -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="font-size: 1.15rem; color: var(--text-main);">1. Select Dishes & Handis</h3>
                <span style="font-size: 0.78rem; color: var(--accent-gold); font-weight: 800; text-transform: uppercase;">Direct Kitchen Quality</span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${bulkItemsCatalog.map(item => {
                  const qty = this.state.partySelectedItems[item.id] || 0;
                  return `
                    <div class="party-item-card">
                      <img src="${item.image}" alt="${item.name}" class="party-item-img" onerror="this.src='https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=80'">
                      <div class="party-item-info">
                        <div class="party-item-title">${item.is_veg ? '🌱' : '🍖'} ${item.name}</div>
                        <div class="party-item-serves">Feeds ~${item.serves} guests per handi</div>
                        <div class="party-item-price">₹${item.price} <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">(incl 5% GST)</span></div>
                      </div>
                      <div class="party-stepper-wrap">
                        <button type="button" class="party-step-btn" onclick="App.updatePartyItemQty('${item.id}', -1)">-</button>
                        <span class="party-step-val">${qty}</span>
                        <button type="button" class="party-step-btn" onclick="App.updatePartyItemQty('${item.id}', 1)">+</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>

              <!-- Portion Coverage Meter -->
              <div class="party-portion-meter">
                <div>
                  <div style="font-size: 0.8rem; color: var(--accent-gold); font-weight: 800; text-transform: uppercase;">Live Portion Estimator</div>
                  <div style="font-size: 1.1rem; font-weight: 900; color: var(--text-main); margin-top: 0.2rem;">
                    Feeds ~<span id="party-serves-count">${calculatedGuests}</span> Guests
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">Calculated from selected handi portions</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 700;">Estimated Subtotal</div>
                  <div style="font-size: 1.35rem; font-weight: 900; color: var(--accent-emerald);">
                    ₹<span id="party-cost-val">${calculatedCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div style="font-size: 0.72rem; color: var(--text-muted);">Incl. 5% GST & transport</div>
                </div>
              </div>
            </div>

            <!-- Right Column: Event Details & Instructions -->
            <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
              <h3 style="font-size: 1.15rem; color: var(--text-main); margin-bottom: 1.25rem;">2. Event & Delivery Details</h3>
              
              <form id="party-form" onsubmit="App.submitPartyOrder(event)">
                <div style="margin-bottom: 1rem;">
                  <label style="font-size: 0.82rem; color: var(--text-secondary); display: block; margin-bottom: 0.4rem; font-weight: 700;">Target Guest Count (Min. 15 guests)</label>
                  <input type="number" id="party-guests" min="15" max="1000" value="30" required style="width: 100%;" oninput="App.onPartyGuestCountChange(this.value)">
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1rem;">
                  <div>
                    <label style="font-size: 0.82rem; color: var(--text-secondary); display: block; margin-bottom: 0.4rem; font-weight: 700;">Event Date (Min 24h Notice)</label>
                    <input type="date" id="party-date" required style="width: 100%;">
                  </div>
                  <div>
                    <label style="font-size: 0.82rem; color: var(--text-secondary); display: block; margin-bottom: 0.4rem; font-weight: 700;">Serving Time</label>
                    <input type="time" id="party-time" value="13:00" required style="width: 100%;">
                  </div>
                </div>

                <div style="margin-bottom: 1rem;">
                  <label style="font-size: 0.82rem; color: var(--text-secondary); display: block; margin-bottom: 0.4rem; font-weight: 700;">Preparation Kitchen (Hyderabad)</label>
                  <select id="party-outlet" class="role-dropdown" style="width: 100%;">
                    ${this.state.outlets.map(o => `
                      <option value="${o.id}" ${o.id === this.state.currentOutlet.id ? 'selected' : ''}>${o.name} (${o.address})</option>
                    `).join('')}
                  </select>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1rem;">
                  <div>
                    <label style="font-size: 0.82rem; color: var(--text-secondary); display: block; margin-bottom: 0.4rem; font-weight: 700;">Host Name</label>
                    <input type="text" id="party-name" placeholder="Host Name" value="${this.state.customerName}" required style="width: 100%;">
                  </div>
                  <div>
                    <label style="font-size: 0.82rem; color: var(--text-secondary); display: block; margin-bottom: 0.4rem; font-weight: 700;">Contact Phone</label>
                    <input type="tel" id="party-phone" placeholder="+91 98490 12345" value="${this.state.customerPhone}" required style="width: 100%;">
                  </div>
                </div>

                <!-- Textarea for Additional Instructions -->
                <div style="margin-bottom: 1.25rem;">
                  <label style="font-size: 0.82rem; color: var(--text-secondary); display: block; margin-bottom: 0.4rem; font-weight: 700;">Additional Instructions & Dietary Requests</label>
                  <textarea id="party-instructions" rows="3" placeholder="e.g. Mild spice for children, deliver in sealed copper deghs with serving ladles, extra mirchi ka salan..." style="width: 100%;"></textarea>
                </div>

                <button type="submit" class="btn-cart-nav" style="width: 100%; justify-content: center; padding: 0.95rem; border-radius: 12px; font-size: 0.95rem;">
                  Submit Bulk Catering Request ➔
                </button>
              </form>
            </div>

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
    }, 50);
  },

  setPartyTab(tab) {
    this.state.partyViewTab = tab;
    this.renderPartyView();
  },

  updatePartyItemQty(itemId, delta) {
    this.state.partySelectedItems = this.state.partySelectedItems || {};
    const current = this.state.partySelectedItems[itemId] || 0;
    const next = Math.max(0, current + delta);
    this.state.partySelectedItems[itemId] = next;
    this.renderPartyView();
  },

  onPartyGuestCountChange(count) {
    // dynamically can adjust recommendations
  },

  async submitPartyOrder(e) {
    e.preventDefault();
    const guests = document.getElementById('party-guests')?.value;
    const date = document.getElementById('party-date')?.value;
    const time = document.getElementById('party-time')?.value;
    const outletId = document.getElementById('party-outlet')?.value;
    const name = document.getElementById('party-name')?.value;
    const phone = document.getElementById('party-phone')?.value;
    const instructions = document.getElementById('party-instructions')?.value || '';

    // Calculate chosen dishes
    const bulkItemsCatalog = [
      { id: 'bulk-chicken-biryani', name: 'Royal Chicken Dum Biryani Handi', serves: 6, price: 900 },
      { id: 'bulk-mutton-biryani', name: 'Nizami Mutton Dum Biryani Handi', serves: 6, price: 1200 },
      { id: 'bulk-veg-biryani', name: 'Hyderabadi Subz Veg Biryani Handi', serves: 6, price: 640 },
      { id: 'bulk-mutton-haleem', name: 'Shahi Mutton Haleem Handi (Desi Ghee)', serves: 5, price: 1050 },
      { id: 'bulk-mirchi-salan', name: 'Mirchi Ka Salan Party Degh', serves: 10, price: 250 },
      { id: 'bulk-double-meetha', name: 'Double Ka Meetha Royal Tray', serves: 8, price: 420 }
    ];

    let itemsChosen = [];
    let calculatedCost = 0;

    for (const bItem of bulkItemsCatalog) {
      const qty = this.state.partySelectedItems[bItem.id] || 0;
      if (qty > 0) {
        itemsChosen.push(`${qty}x ${bItem.name}`);
        calculatedCost += qty * bItem.price;
      }
    }

    if (itemsChosen.length === 0) {
      this.showToast('Please select at least 1 menu item or handi for your party!', 'error');
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
      <div style="max-width: 960px; margin: 0 auto;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <div>
            <h2 style="font-size: 2rem; color: var(--text-main);">AI Dynamic Prep-Time Engine Diagnostics</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.2rem;">
              Interactive simulator of Company A's dynamic kitchen load estimation algorithm and edge-case handlers.
            </p>
          </div>
          <button class="btn-return-customer" onclick="App.navigate('ordering')">
            ← Exit to Customer Menu
          </button>
        </div>

        <!-- Formula Callout -->
        <div style="background: #FFFFFF; border: 2px solid var(--accent-gold); border-radius: 16px; padding: 1.75rem; margin-bottom: 2.25rem; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.2rem; color: var(--accent-gold-hover); margin-bottom: 0.85rem;">Dynamic Queue & Floor Formula</h3>
          <div style="background-color: var(--bg-surface); border: 1px solid var(--border-subtle); padding: 1.1rem; border-radius: 10px; font-family: 'JetBrains Mono', monospace; font-size: 0.92rem; color: var(--text-main); line-height: 1.6;">
            Raw_AI_Prep = Max(Item_Complexity) + 0.28 * Sum(Secondary_Items) + (Active_Kitchen_Pots * 2.2 * Peak_Multiplier)<br>
            <strong style="color: var(--accent-gold);">Honest_Promised_Time = Max(Raw_AI_Prep, Outlet_Minimum_Prep_Floor)</strong>
          </div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.85rem;">
            Enforces the strict rule from the brief: promised time is honest, never under-promises, and handles the 1,200 orders/hr Friday/Sunday dinner peaks.
          </div>
        </div>

        <!-- Interactive Simulator Widget -->
        <div style="background: #FFFFFF; border: 1.5px solid var(--border-subtle); border-radius: 16px; padding: 1.75rem; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 1.5rem;">Live Parameter Experimentation</h3>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.75rem; margin-bottom: 1.75rem;">
            <div>
              <label style="font-size: 0.88rem; color: var(--text-secondary); display: block; margin-bottom: 0.6rem; font-weight: 700;">
                Active Kitchen Pots in Queue: <strong id="sim-pots-val" style="color: var(--accent-gold);">3</strong>
              </label>
              <input type="range" id="sim-pots" min="0" max="25" value="3" style="width: 100%; accent-color: var(--accent-gold);" oninput="App.updateAiSim()">
            </div>

            <div>
              <label style="font-size: 0.88rem; color: var(--text-secondary); display: block; margin-bottom: 0.6rem; font-weight: 700;">
                Time of Day Peak Factor:
              </label>
              <select id="sim-peak" class="role-dropdown" style="width: 100%;" onchange="App.updateAiSim()">
                <option value="1.0">Normal Hours (1.0x)</option>
                <option value="1.15">Lunch Rush 12-3 PM (1.15x)</option>
                <option value="1.25">Weekday Dinner 7-10 PM (1.25x)</option>
                <option value="1.40" selected>Weekend Dinner Peak (1.40x - 1,200 orders/hr)</option>
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
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Calculated Honest Promised Time:</div>
            <div style="font-size: 2.2rem; font-weight: 900; color: var(--accent-gold); font-family: 'JetBrains Mono', monospace;">${finalHonest} Minutes</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">Constraint Applied:</div>
            <div style="font-size: 1.05rem; font-weight: 800; color: ${rawAi < outletFloor ? 'var(--accent-gold)' : 'var(--accent-emerald)'};">
              ${rawAi < outletFloor ? 'BUMPED TO OUTLET FLOOR (25m)' : 'DRIVEN BY AI LOAD ESTIMATE'}
            </div>
          </div>
        </div>
        <div style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
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
      <!-- Delivery Radius & Geofence Verification Tool -->
      <div class="outlet-radius-box">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <strong style="font-size: 0.88rem; color: var(--text-main);">📍 Verify Delivery Radius for Your Address</strong>
          <span style="font-size: 0.72rem; color: var(--accent-gold); font-weight: 800;">DETERMINISTIC GEO-CALC</span>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <input type="text" id="delivery-address-check-input" placeholder="Enter landmark / area (e.g. Kondapur, Gachibowli, Kukatpally, Shamshabad)..." style="flex: 1; padding: 0.6rem 0.85rem; font-size: 0.85rem;">
          <button class="btn-cart-nav" style="padding: 0.6rem 1rem; font-size: 0.82rem; background: var(--accent-gold); white-space: nowrap;" onclick="App.checkDeliveryRadius()">
            Check Radius
          </button>
        </div>
        <div id="delivery-check-result" style="display: none;"></div>
      </div>

      <!-- Location Filter Tabs -->
      <div class="modal-outlet-tabs">
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

      <!-- Search & Auto-Detect Row -->
      <div style="display: flex; gap: 0.6rem; margin-bottom: 1.1rem;">
        <input type="text" id="outlet-search-input" placeholder="Search area (e.g. Kondapur, Gachibowli, Kukatpally, Jubilee Hills...)" 
               oninput="App.filterOutlets(this.value)"
               style="flex: 1; padding: 0.75rem 1rem;">
        <button class="btn-cart-nav" style="padding: 0.65rem 1.1rem; border-radius: 10px; font-size: 0.84rem; background: var(--text-main);" onclick="App.autoDetectNearestOutlet()">
          📍 Auto-Detect
        </button>
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
