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
   getTemplate(page) {
    const templates = {
      dashboard: `
        <div class="dash-hero-banner">
          <div class="dash-hero-text">
            <p class="dash-hero-sub">Welcome to</p>
            <h2 class="dash-hero-title">Invest in clean energy,<br>earn a bright future.</h2>
          </div>
          <img class="dash-hero-img" src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=300&q=80" alt="Solar Panel">
        </div>

        <div class="dash-metrics-row">
          <div class="dash-metric-card blue">
            <span class="dash-metric-label">Wallet Balance</span>
            <strong class="dash-metric-value" id="wallet-balance">...</strong>
          </div>
          <div class="dash-metric-card green">
            <span class="dash-metric-label">Welcome Bonus</span>
            <strong class="dash-metric-value" id="welcome-bonus">...</strong>
          </div>
        </div>

        <div class="dash-sub-stats">
          <div class="dash-sub-item">
            <span>Total Earnings</span>
            <strong id="total-earnings">...</strong>
          </div>
          <div class="dash-sub-divider"></div>
          <div class="dash-sub-item">
            <span>Active Package</span>
            <strong id="active-package" style="color:#1565C0">...</strong>
          </div>
        </div>

        <div class="section-block">
          <div class="section-block-header">
            <h3>Recent Activity</h3>
            <a href="#" class="view-all-link">View all</a>
          </div>
          <div class="activity-list" id="activity-list"></div>
        </div>
      `,
      packages: `
        <div class="page-header-plain">
          <h2>Packages</h2>
        </div>
        <div class="pkg-list-vertical" id="pkg-list-vertical"></div>
      `,
      team: `
        <div class="page-header-plain">
          <h2>Team / Referral</h2>
        </div>
        <div class="section-block">
          <p class="section-label">My Referral Link</p>
          <div class="ref-link-row">
            <input type="text" id="ref-link" readonly value="" class="ref-link-input" />
            <button class="ref-copy-btn" onclick="window.app.copyRef()">Copy</button>
          </div>
        </div>
        <div class="ref-stats-row">
          <div class="ref-stat-box">
            <strong id="ref-count">0</strong>
            <span>Referrals</span>
          </div>
          <div class="ref-stat-box">
            <strong id="ref-active">0</strong>
            <span>Active</span>
          </div>
          <div class="ref-stat-box accent">
            <strong id="ref-bonus">0 BIF</strong>
            <span>Total Earnings</span>
          </div>
        </div>
        <div class="section-block">
          <p class="section-label">Invite Your Friends</p>
          <p style="font-size:13px;color:#666;margin-bottom:14px;">Share your link and start earning together.</p>
          <div class="invite-btns">
            <button class="invite-btn whatsapp" onclick="window.app.shareWhatsApp()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </button>
            <button class="invite-btn telegram" onclick="window.app.shareTelegram()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              Telegram
            </button>
            <button class="invite-btn more" onclick="window.app.shareMore()">
              ••• More
            </button>
          </div>
        </div>
        <div class="section-block">
          <p class="section-label">Top Referrals</p>
          <div id="top-referrals-list" class="top-referrals-list"></div>
        </div>
      `,
      profile: `
        <div class="profile-hero">
          <img id="profile-avatar" src="https://ui-avatars.com/api/?name=User&size=200&background=1565C0&color=fff" alt="Avatar" class="profile-avatar-img">
          <h2 id="profile-name" class="profile-name">Member User</h2>
          <p id="profile-phone" class="profile-phone">+257 60 000 000</p>
          <div class="profile-country">
            <img src="https://flagcdn.com/w20/bi.png" alt="Burundi" style="width:20px;height:14px;border-radius:2px;">
            <span>Burundi</span>
          </div>
        </div>
        <div class="profile-menu">
          <div class="profile-menu-item" onclick="window.app.editProfile()">
            <span>Profile Information</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div class="profile-menu-item" onclick="window.location.hash='#packages'">
            <span>Deposit History</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div class="profile-menu-item">
            <span>Withdrawals</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div class="profile-menu-item">
            <span>Change Password</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div class="profile-menu-item">
            <span>Support Center</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
        <div style="padding: 20px 16px;">
          <button class="logout-btn-red" id="logout-btn" onclick="window.app.logout()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
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
    const banner = document.querySelector('.dash-hero-title');
    if (banner && this.state.user) {
      // Keep the hero title as is from template
    }

    this.updateElement('wallet-balance', data.wallet_balance || '0 BIF');
    this.updateElement('welcome-bonus', data.welcome_bonus || '0 BIF');
    this.updateElement('total-earnings', data.total_earnings || '0 BIF');
    this.updateElement('active-package', data.active_package || 'No Active Plan');

    this.hydrateActivity(data.activities || []);
  }

  hydrateActivity(activities) {
    const list = document.getElementById('activity-list');
    if (!list) return;

    if (activities.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No recent activity</p>';
      return;
    }

    list.innerHTML = activities.map(act => `
      <div class="act-item">
        <div class="act-icon ${act.type === 'bonus' ? 'green' : 'yellow'}">
          ${act.type === 'bonus' ? '🎁' : '⚡'}
        </div>
        <div class="act-details">
          <strong>${act.title}</strong>
          <span>${act.date}</span>
        </div>
        <div class="act-value ${act.amount.includes('+') ? 'green' : ''}">${act.amount}</div>
      </div>
    `).join('');
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
    const list = document.getElementById('pkg-list-vertical');
    if (!list || !data) return;

    list.innerHTML = data.map((p, i) => {
      return `
        <div class="pkg-item-row" onclick="window.app.invest('${p.id}', '${p.name}', '${p.amount}')">
          <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=100&q=80" class="pkg-item-img" alt="${p.name}">
          <div class="pkg-item-info">
            <h4>${p.name}</h4>
            <p>${p.amount}</p>
          </div>
          <div class="pkg-item-bonus">
            <span>Bonus</span>
            <strong>${p.bonus}</strong>
          </div>
        </div>
      `;
    }).join('');
  }
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
    
    // Populate stats
    this.updateElement('ref-count', '128');
    this.updateElement('ref-active', '96');
    this.updateElement('ref-bonus', '1,450,000 BIF');

    // Top Referrals List
    const topList = document.getElementById('top-referrals-list');
    if (topList) {
      const tops = [
        { name: 'Jean N.', amount: '2,350,000 BIF' },
        { name: 'Divine M.', amount: '1,890,000 BIF' },
        { name: 'Samuel K.', amount: '1,250,000 BIF' }
      ];
      topList.innerHTML = tops.map((t, i) => `
        <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #f1f5f9;">
          <div style="display:flex; gap:12px;">
            <span style="font-weight:700;color:#999;">${i+1}.</span>
            <span style="font-weight:600;">${t.name}</span>
          </div>
          <span style="font-weight:700;">${t.amount}</span>
        </div>
      `).join('');
    }
  }

  shareWhatsApp() {
    const text = `Join Solar Africa and start earning! ${document.getElementById('ref-link')?.value}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  }

  shareTelegram() {
    const text = `Join Solar Africa and start earning!`;
    const url = document.getElementById('ref-link')?.value;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  }

  shareMore() {
    if (navigator.share) {
      navigator.share({
        title: 'Solar Africa',
        text: 'Join Solar Africa and start earning!',
        url: document.getElementById('ref-link')?.value
      });
    } else {
      this.copyRef();
    }
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
