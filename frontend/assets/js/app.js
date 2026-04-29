/**
 * SOLAR AFRICA - PREMIUM MVP PLATFORM
 * Professional Client-Side Engine (Pure JS Hydration)
 * This system turns static HTML shells into a dynamic, reactive application.
 */

class SolarApp {
  constructor() {
    this.apiBase = '/api';
    this.state = {
      user: JSON.parse(localStorage.getItem('solar_user')) || null,
      token: localStorage.getItem('solar_token') || null,
      page: document.body.dataset.page || 'home',
      loading: false,
      tickerIndex: 0
    };

    // Currency Formatter
    this.formatter = new Intl.NumberFormat('fr-BI', {
      style: 'currency',
      currency: 'BIF',
      maximumFractionDigits: 0
    });

    this.init();
  }

  // --- CORE ENGINE ---

  async init() {
    console.log('☀️ Solar Africa Engine Starting...');
    
    // 1. Initial UI Setup
    this.setupGlobalListeners();
    this.setupNavigation();
    
    // 2. Route Protection & Hydration
    await this.hydrate();

    // 3. Visual Polish
    document.body.style.opacity = '1';
    this.setupIntersections();
  }

  setupGlobalListeners() {
    // Logout handling
    document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    
    // Support FAB
    const fab = document.querySelector('.support-fab');
    if (fab) {
      fab.onclick = () => window.open('https://wa.me/25760000000', '_blank');
    }
  }

  setupNavigation() {
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Default to dashboard if no hash or invalid hash
    if (!window.location.hash || !['#dashboard', '#packages', '#team', '#profile'].includes(window.location.hash)) {
      if (document.body.dataset.page !== 'home' && document.body.dataset.page !== 'auth' && document.body.dataset.page !== 'admin') {
         window.location.hash = '#dashboard';
      }
    } else {
      this.handleRoute();
    }
  }

  async handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (document.body.dataset.page === 'home' || document.body.dataset.page === 'auth' || document.body.dataset.page === 'admin') return;

    this.state.page = hash;
    
    // Highlight active nav items
    const navLinks = document.querySelectorAll('.bottom-nav a, .desktop-nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${hash}`) link.classList.add('active');
    });

    // Inject Template
    const main = document.querySelector('.main-content');
    if (main) {
      main.style.opacity = '0';
      setTimeout(async () => {
        main.innerHTML = this.getTemplate(hash);
        main.style.opacity = '1';
        await this.hydrate();
      }, 200);
    }
  }

  getTemplate(page) {
    const templates = {
      dashboard: `
        <div class="dash-banner glass-panel" style="margin: 20px 5%;">
          <div class="banner-content"><h2>Welcome back</h2><p>Your solar investments are growing 🚀</p></div>
          <div class="user-profile-mini"><img src="https://ui-avatars.com/api/?name=User&background=random" alt="User" id="user-avatar-mini"></div>
        </div>
        <div class="metrics-grid" style="padding: 0 5%;">
          <div class="m-card blue"><span>Wallet Balance</span><strong id="wallet-balance">...</strong></div>
          <div class="m-card green"><span>Welcome Bonus</span><strong id="welcome-bonus">...</strong></div>
          <div class="m-card white"><span>Total Earnings</span><strong id="total-earnings">...</strong></div>
          <div class="m-card white"><span>Active Package</span><strong id="active-package" class="text-yellow">...</strong></div>
        </div>
        <div class="chart-section premium-card" style="margin: 20px 5%;">
          <div class="chart-header"><h4>Earnings Growth</h4><span class="badge up">↑ 12.5%</span></div>
          <div id="wallet-chart" class="chart-canvas"></div>
        </div>
        <div class="quick-actions" style="padding: 0 5%; display: flex; gap: 16px;">
          <button id="deposit-btn" class="btn btn-blue btn-full" onclick="window.location.hash='#packages'">Deposit Funds</button>
          <button id="withdraw-btn" class="btn btn-outline btn-full">Withdraw</button>
        </div>
        <div style="padding: 24px 5%;"><div class="section-head"><h3>Recent Activity</h3></div><div class="activity-list" id="activity-list"></div></div>
      `,
      packages: `
        <div style="padding: 24px 5% 0;"><h2 style="font-size: 24px; font-weight: 800; margin-bottom: 4px;">Solar Plans</h2><p style="color: var(--text-muted); font-size: 14px;">Choose the best solar plan that fits your needs and start earning instantly.</p></div>
        <div class="header-stats-row">
          <div class="top-badge"><div class="icon-box bg-light-green">✅</div><div class="text-box"><span>Instant Reward</span><strong>Get paid immediately</strong></div></div>
          <div class="top-badge"><div class="icon-box bg-light-yellow">⚡</div><div class="text-box"><span>100% Secure</span><strong>Safe & trusted platform</strong></div></div>
          <div class="top-badge"><div class="icon-box bg-light-blue">🛡️</div><div class="text-box"><span>Clean Energy</span><strong>Powering Burundi</strong></div></div>
          <div class="top-badge"><div class="icon-box bg-light-purple">🎧</div><div class="text-box"><span>24/7 Support</span><strong>We are here for you</strong></div></div>
        </div>
        <div style="padding: 0 5%; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
           <h3 style="font-size: 18px; font-weight: 800;">24 Solar Plans Available</h3>
        </div>
        <div class="pkg-list"></div>
      `,
      team: `
        <div style="padding: 24px 5% 0;"><h2 style="font-size: 24px; font-weight: 800; margin-bottom: 4px;">Referral Team</h2><p style="color: var(--text-muted); font-size: 14px;">Invite your friends and earn bonuses for every investment they make.</p></div>
        <div style="padding: 24px 5%;">
          <div class="team-container premium-card">
            <div class="ref-link-box">
              <h4>Your Referral Link</h4>
              <div class="link-input-group">
                <input type="text" id="ref-link" readonly value="" style="background: #f1f5f9; padding: 12px; border-radius: 8px; border: none; flex: 1;" />
                <button class="btn btn-blue" onclick="window.app.copyRef()">Copy</button>
              </div>
            </div>
            <div class="ref-stats-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px;">
              <div class="ref-stat-card" style="background: #f8fafc; padding: 16px; border-radius: 12px; text-align: center;"><span style="font-size: 12px; color: var(--text-muted);">Total Referrals</span><strong id="ref-count" style="display: block; font-size: 20px;">0</strong></div>
              <div class="ref-stat-card" style="background: #f8fafc; padding: 16px; border-radius: 12px; text-align: center;"><span style="font-size: 12px; color: var(--text-muted);">Active</span><strong id="ref-active" style="display: block; font-size: 20px;">0</strong></div>
              <div class="ref-stat-card" style="background: #f8fafc; padding: 16px; border-radius: 12px; text-align: center;"><span style="font-size: 12px; color: var(--text-muted);">Total Bonus</span><strong id="ref-bonus" style="display: block; font-size: 20px; color: var(--primary-green);">0 BIF</strong></div>
            </div>
          </div>
        </div>
      `,
      profile: `
        <div class="profile-header" style="text-align: center; padding: 40px 5%; background: white; margin-bottom: 20px;">
          <img src="https://ui-avatars.com/api/?name=User&size=120&background=random" alt="Avatar" style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 16px; border: 4px solid #f1f5f9;">
          <h2 id="profile-name" style="font-size: 20px; font-weight: 800;">Member User</h2>
          <p id="profile-phone" style="color: var(--text-muted); font-size: 14px;">+257 60 000 000</p>
        </div>
        <div style="padding: 0 5%;">
          <div class="premium-card" style="display: flex; flex-direction: column; gap: 4px; padding: 8px 0;">
             <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;"><span>Personal Info</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
             <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;"><span>Investment History</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
             <div style="padding: 16px 20px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;"><span>Security Settings</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
             <div style="padding: 16px 20px; color: #ef4444; font-weight: 600; cursor: pointer;" id="logout-btn" onclick="window.app.logout()">Logout Account</div>
          </div>
        </div>
      `
    };
    return templates[page] || '';
  }

  async hydrate() {
    const { page, token } = this.state;

    if (['dashboard', 'packages', 'team', 'profile', 'admin'].includes(page) && !token) {
      window.location.href = 'login.html';
      return;
    }

    if (page === 'admin' && this.state.user?.role !== 'admin') {
      window.location.href = 'dashboard.html';
      return;
    }

    switch (page) {
      case 'dashboard': await this.hydrateDashboard(); break;
      case 'packages':  await this.hydratePackages(); break;
      case 'team':      await this.hydrateTeam(); break;
      case 'profile':   await this.hydrateProfile(); break;
      case 'admin':     await this.hydrateAdmin(); break;
      case 'home':      this.animateLandingStats(); break;
      case 'auth':      this.hydrateAuth(); break;
    }
  }

  // --- AUTH HYDRATION ---

  hydrateAuth() {
    // LOGIN FORM
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        if (btn) { btn.disabled = true; btn.textContent = 'Signing in...'; }
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || data.error || 'Login failed');
          localStorage.setItem('solar_token', data.token || data.data?.token);
          localStorage.setItem('solar_user', JSON.stringify(data.user || data.data?.user));
          window.location.href = 'dashboard.html';
        } catch (err) {
          this.showToast(err.message, 'error');
          if (btn) { btn.disabled = false; btn.textContent = 'Sign In'; }
        }
      });
    }

    // REGISTER FORM
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('register-btn');
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || data.error || 'Registration failed');
          this.showToast('Account created! Please sign in.', 'success');
          setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        } catch (err) {
          this.showToast(err.message, 'error');
          if (btn) { btn.disabled = false; btn.textContent = 'Create Account'; }
        }
      });
    }
  }

  // --- API ENGINE ---

  async fetchAPI(endpoint, options = {}) {
    try {
      this.setLoading(true);
      const headers = { 
        'Content-Type': 'application/json',
        ...options.headers 
      };
      if (this.state.token) headers['Authorization'] = `Bearer ${this.state.token}`;

      const response = await fetch(`${this.apiBase}/${endpoint}`, { ...options, headers });
      
      if (response.status === 401) {
        this.logout();
        return null;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      return result.data || result;
    } catch (err) {
      console.error(`[Engine] API Error (${endpoint}):`, err);
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  // --- DASHBOARD HYDRATION ---

  async hydrateDashboard() {
    const data = await this.fetchAPI('dashboard');
    if (!data) return;

    // 1. Personalize
    const banner = document.querySelector('.dash-banner h2');
    if (banner && this.state.user) {
      banner.textContent = `Welcome, ${this.state.user.name.split(' ')[0]}`;
    }

    // 2. Metrics (with soft update)
    this.updateElement('wallet-balance', data.wallet_balance);
    this.updateElement('welcome-bonus', data.welcome_bonus);
    this.updateElement('total-earnings', data.total_earnings);
    this.updateElement('active-package', data.active_package);

    // 3. Components
    this.renderWalletChart();
    this.renderActivity(data.activity || data.recentActivity);
    this.initLiveTicker();
    this.setupDashboardActions();
  }

  renderWalletChart() {
    const container = document.getElementById('wallet-chart');
    if (!container) return;

    const values = [30, 45, 35, 60, 55, 80, 95]; // Trend data
    container.innerHTML = values.map(() => `<div class="chart-bar" style="height: 0%"></div>`).join('');
    
    setTimeout(() => {
      container.querySelectorAll('.chart-bar').forEach((bar, i) => {
        bar.style.height = `${values[i]}%`;
      });
    }, 400);
  }

  renderActivity(activity) {
    const list = document.getElementById('activity-list');
    if (!list || !activity) return;

    list.innerHTML = activity.map(item => `
      <div class="act-item">
        <div class="act-icon ${item.value?.includes('+') ? 'green' : 'yellow'}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <div class="act-details">
          <strong>${item.title}</strong>
          <span>${item.date || 'Recent'}</span>
        </div>
        <div class="act-value ${item.value?.includes('+') ? 'green' : ''}">${item.value}</div>
      </div>
    `).join('');
  }

  initLiveTicker() {
    const container = document.getElementById('live-payouts');
    if (!container) return;

    const payouts = [
      { name: 'Sam L.', amount: '250,000 BIF', bank: 'Lumicash' },
      { name: 'Jean K.', amount: '120,000 BIF', bank: 'Ecocash' },
      { name: 'Marie C.', amount: '500,000 BIF', bank: 'Interbank' },
      { name: 'David R.', amount: '300,000 BIF', bank: 'Lumicash' }
    ];

    const rotate = () => {
      const p = payouts[this.state.tickerIndex % payouts.length];
      container.innerHTML = `
        <div class="ticker-item glass-panel">
          <div class="ticker-left">
            <strong>${p.name}</strong>
            <span>Successfully withdrawn via ${p.bank}</span>
          </div>
          <div class="ticker-right">+${p.amount}</div>
        </div>
      `;
      this.state.tickerIndex++;
    };

    rotate();
    setInterval(rotate, 5000);
  }

  setupDashboardActions() {
    const depositBtn = document.getElementById('deposit-btn');
    const withdrawBtn = document.getElementById('withdraw-btn');

    if (depositBtn) depositBtn.onclick = () => window.location.href = 'packages.html';
    
    if (withdrawBtn) {
      withdrawBtn.onclick = async () => {
        const amount = prompt('Enter withdrawal amount (BIF):');
        if (amount) {
          const val = parseFloat(amount.replace(/[^0-9.]/g, ''));
          if (isNaN(val) || val < 1000) return this.showToast('Minimum 1,000 BIF', 'error');
          
          const res = await this.fetchAPI('withdrawals', {
            method: 'POST',
            body: JSON.stringify({ amount: this.formatter.format(val) })
          });
          if (res) this.showToast(`Request for ${this.formatter.format(val)} submitted!`);
        }
      };
    }
  }

  // --- PACKAGES HYDRATION ---

  async hydratePackages() {
    const data = await this.fetchAPI('packages');
    const list = document.querySelector('.pkg-list');
    if (!list || !data) return;

    list.innerHTML = data.map((p, i) => {
      const variant = i % 6; // Use 6 color variants
      const num = (i + 1).toString().padStart(2, '0');
      
      // Select icon based on variant
      const icons = [
        '<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>', // Sun
        '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="7" y1="3" x2="7" y2="17"></line><line x1="12" y1="3" x2="12" y2="17"></line><line x1="17" y1="3" x2="17" y2="17"></line>', // Panel
        '<path d="M11 12h2M12 11v2"></path><circle cx="12" cy="12" r="10"></circle>', // Plus
        '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>', // Layers
        '<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>', // Pulse
        '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>' // Gear
      ];

      return `
        <div class="package-card pkg-variant-${variant} premium-card">
          <span class="pkg-number">${num}</span>
          <div class="pkg-header">
            <div class="pkg-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${icons[variant]}
              </svg>
            </div>
            <div class="pkg-price-tag">
              <strong>${p.amount}</strong>
              <span>Amount</span>
            </div>
          </div>
          <h3>${p.name}</h3>
          <div class="pkg-reward-box">
            <strong>${p.bonus}</strong>
            <span>Instant Reward</span>
          </div>
          <button class="btn-choose" onclick="window.app.invest('${p.id}', '${p.name}', '${p.amount}')">Choose Plan</button>
        </div>
      `;
    }).join('');
  }

  async invest(id, name, amount) {
    if (confirm(`Invest ${amount} in ${name}?`)) {
      const res = await this.fetchAPI('deposits', {
        method: 'POST',
        body: JSON.stringify({ package_name: name, amount })
      });
      if (res) {
        this.showToast('Investment request submitted! Awaiting approval.');
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
      }
    }
  }

  // --- TEAM HYDRATION ---

  async hydrateTeam() {
    // Populate referral link
    const refLinkInput = document.getElementById('ref-link');
    if (refLinkInput && this.state.user) {
      refLinkInput.value = `https://solarafrica.com/ref/${this.state.user.id || 'USER123'}`;
    }
    
    // Populate dummy stats for now or fetch if available
    this.updateElement('ref-count', '12');
    this.updateElement('ref-active', '5');
    this.updateElement('ref-bonus', '15,000 BIF');
  }

  copyRef() {
    const link = document.getElementById('ref-link');
    if (link) {
      link.select();
      document.execCommand('copy');
      this.showToast('Referral link copied to clipboard!', 'success');
    }
  }

  // --- PROFILE HYDRATION ---

  async hydrateProfile() {
    if (this.state.user) {
      this.updateElement('profile-name', this.state.user.name);
      this.updateElement('profile-phone', this.state.user.phone || '+257 000 000 00');
    }
  }

  // --- ADMIN ENGINE ---

  async hydrateAdmin() {
    const data = await this.fetchAPI('admin/stats');
    if (!data) return;

    this.adminData = data;
    this.hydrateAdminMetrics(data.metrics);
    this.setupAdminNavigation();
    this.initTransactionLedger(); // Default tab
  }

  hydrateAdminMetrics(m) {
    const map = {
      'admin-total-users': m.total_users,
      'admin-total-deposits': (m.total_deposits / 1000).toFixed(1) + 'k',
      'admin-total-withdrawals': (m.total_withdrawals / 1000).toFixed(1) + 'k'
    };
    Object.entries(map).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
  }

  setupAdminNavigation() {
    const links = document.querySelectorAll('.sidebar-nav-link[data-target]');
    const views = document.querySelectorAll('.admin-view');

    links.forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const target = link.dataset.target;
        
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        views.forEach(v => v.style.display = 'none');
        document.getElementById(target).style.display = 'block';

        if (target === 'view-transactions') this.initTransactionLedger();
        if (target === 'view-users') this.initUserManagement();
        if (target === 'view-packages') this.initPackageManagement();
      };
    });
  }

  // Admin Management Views
  initTransactionLedger() {
    console.log("Admin: Initializing Transaction Ledger...");
    // Ideally this would fetch from 'admin/transactions'
  }

  initUserManagement() {
    console.log("Admin: Initializing User Management...");
    // Ideally this would fetch from 'admin/users'
  }

  initPackageManagement() {
    console.log("Admin: Initializing Package Management...");
    // Ideally this would fetch from 'admin/packages'
  }

  // Admin Modals
  openPackageModal() {
    const modal = document.getElementById('package-modal');
    if (modal) modal.style.display = 'flex';
  }

  closePackageModal() {
    const modal = document.getElementById('package-modal');
    if (modal) modal.style.display = 'none';
  }

  // --- UTILITIES ---

  setLoading(isLoading) {
    this.state.loading = isLoading;
    document.body.classList.toggle('loading', isLoading);
  }

  updateElement(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = value || 'N/A';
      el.style.opacity = '1';
    }, 200);
  }

  showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('visible'), 10);
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  logout() {
    localStorage.clear();
    window.location.href = 'login.html';
  }

  animateLandingStats() {
    const stats = document.querySelectorAll('.floating-card strong');
    stats.forEach(s => {
      const targetText = s.textContent.replace(/[^0-9]/g, '');
      const target = parseInt(targetText);
      if (isNaN(target)) return;
      
      let current = 0;
      const step = target / 50;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          s.textContent = target.toLocaleString() + (s.textContent.includes('BIF') ? ' BIF' : '+');
          clearInterval(interval);
        } else {
          s.textContent = Math.floor(current).toLocaleString() + (s.textContent.includes('BIF') ? ' BIF' : '+');
        }
      }, 30);
    });
  }

  setupIntersections() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.premium-card, .package-card').forEach(el => observer.observe(el));
  }
}

// Start Platform
document.addEventListener('DOMContentLoaded', () => { window.app = new SolarApp(); });
