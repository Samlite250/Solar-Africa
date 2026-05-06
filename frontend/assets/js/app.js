/**
 * SOLAR AFRICA - PREMIUM MVP PLATFORM
 * Professional Client-Side Engine (Pure JS Hydration)
 * This system turns static HTML shells into a dynamic, reactive application.
 */

class SolarApp {
  constructor() {
    this.apiBase = '/api';
    this.state = {
      user: JSON.parse(window.localStorage.getItem('solar_user') || 'null'),
      token: window.localStorage.getItem('solar_token'),
      view: 'dashboard',
      page: document.body.dataset.page || 'home',
      loading: false,
      tickerIndex: 0,
      settings: {},
      pagination: {
        adminUsers: 1,
        adminDeposits: 1,
        adminWithdrawals: 1,
        userActivity: 1,
        userTeam: 1
      },
      currency: {
        'Burundi': { symbol: 'FBu', rate: 1 },
        'Kenya': { symbol: 'KSh', rate: 1 },
        'Uganda': { symbol: 'UGX', rate: 1 },
        'Tanzania': { symbol: 'TSH', rate: 1 },
        'Rwanda': { symbol: '$', rate: 1 },
        'International': { symbol: 'USDT', rate: 1 }
      }
    };

    // Currency Formatter
    this.formatter = new Intl.NumberFormat('fr-BI', {
      style: 'currency',
      currency: 'BIF',
      maximumFractionDigits: 0
    });

    this.init();
  }

  formatSupportLink(val, type = 'whatsapp') {
    if (!val) return '#';
    if (val.startsWith('http')) return val;
    if (type === 'whatsapp') {
      // Clean non-numeric characters for WhatsApp
      const clean = val.replace(/\D/g, '');
      return `https://wa.me/${clean}`;
    }
    if (type === 'telegram') {
      const clean = val.replace('@', '');
      return `https://t.me/${clean}`;
    }
    return val;
  }

  getPaginatedData(array, page, limit = 10) {
    const start = (page - 1) * limit;
    return array.slice(start, start + limit);
  }

  renderPaginationControls(array, page, limit = 10, key = '') {
    if (array.length <= limit) return '';
    const totalPages = Math.ceil(array.length / limit);
    
    return `
      <div style="display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; padding: 10px;">
        <button onclick="window.app.changePage('${key}', ${page - 1})" ${page === 1 ? 'disabled' : ''} class="btn-admin" style="background:#f1f5f9; color:#475569; padding: 8px 16px; border-radius: 8px; border:1px solid #e2e8f0; cursor:pointer; opacity:${page === 1 ? '0.5' : '1'}; transition: all 0.2s;">
          ← Previous
        </button>
        <span style="font-size: 13px; font-weight: 700; color: #64748b;">Page ${page} of ${totalPages}</span>
        <button onclick="window.app.changePage('${key}', ${page + 1})" ${page === totalPages ? 'disabled' : ''} class="btn-admin" style="background:#f1f5f9; color:#475569; padding: 8px 16px; border-radius: 8px; border:1px solid #e2e8f0; cursor:pointer; opacity:${page === totalPages ? '0.5' : '1'}; transition: all 0.2s;">
          Next →
        </button>
      </div>
    `;
  }

  changePage(key, newPage) {
    if (newPage < 1) return;
    this.state.pagination[key] = newPage;
    this.hydrate();
  }

  formatCurrency(val, country = null) {
    if (!val) return '0';
    const userCountry = country || this.state.user?.country || 'Burundi';
    const info = this.state.currency[userCountry] || this.state.currency['Burundi'];
    
    // If value is a string with currency (like "80,000 BIF"), extract the number
    let numericVal = val;
    if (typeof val === 'string') {
      numericVal = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
    }
    
    const converted = numericVal * info.rate;
    const formatted = converted.toLocaleString(undefined, { maximumFractionDigits: (info.symbol === '$' || info.symbol === 'USDT') ? 2 : 0 });
    
    return info.symbol === '$' ? `$${formatted}` : `${formatted} ${info.symbol}`;
  }

  // --- CORE ENGINE ---

  async init() {
    console.log('☀️ Solar Africa Engine Starting...');
    
    // Fetch global settings early
    try {
      const settingsRes = await this.fetchAPI('settings');
      this.state.settings = settingsRes?.data || {};
    } catch (e) { console.warn('Settings fetch failed'); }
    
    // 1. Initial UI Setup
    this.setupGlobalListeners();
    this.setupNavigation();
    
    // 2. Route Protection & Hydration
    await this.hydrate();

    // 2.5 Fresh Profile Fetch (Ensures latest country/phone even if localStorage is stale)
    if (this.state.token) {
      try {
        const profile = await this.fetchAPI('profile');
        if (profile?.data) {
          this.state.user = { ...this.state.user, ...profile.data };
          localStorage.setItem('solar_user', JSON.stringify(this.state.user));
          console.log('[Engine] Profile synchronized with server');
        }
      } catch (e) {
        console.warn('[Engine] Failed to sync profile:', e.message);
      }
    }

    // 3. Start Notification Polling
    this.startNotificationPolling();

    // 4. Visual Polish
    document.body.style.opacity = '1';
    this.setupIntersections();
  }

  setupGlobalListeners() {
    // Logout handling
    document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    
    // Support FAB
    const fab = document.querySelector('.support-fab');
    if (fab) {
      fab.onclick = () => {
        const url = this.formatSupportLink(this.state.settings?.whatsapp_group);
        window.open(url, '_blank');
      };
    }
  }

  setupNavigation() {
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Default to dashboard if no hash or invalid hash
    if (!window.location.hash || !['#dashboard', '#packages', '#task', '#profile'].includes(window.location.hash)) {
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
        <div class="dash-hero-banner">
          <div class="dash-hero-text">
            <p class="dash-hero-sub" style="display: flex; align-items: center; gap: 6px;">
              Welcome, <strong style="font-weight: 900; font-size: 1.1em;">${this.state.user?.name || 'Investor'}</strong>
              <img src="https://flagcdn.com/w20/${((c) => ({'Burundi':'bi','Rwanda':'rw','Kenya':'ke','Uganda':'ug','Tanzania':'tz'})[c] || 'bi')(this.state.user?.country || 'Burundi')}.png" alt="Country Flag" style="width:16px;height:12px;border-radius:2px;display:inline-block;box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            </p>
            <h2 class="dash-hero-title">Invest in clean energy,<br>earn a bright future.</h2>
          </div>
        </div>

        <div class="dash-metrics-row" style="margin-bottom: 16px;">
          <div class="dash-metric-card blue">
            <span class="dash-metric-label">Wallet Balance</span>
            <strong class="dash-metric-value" id="wallet-balance">...</strong>
          </div>
          <div class="dash-metric-card green">
            <span class="dash-metric-label">Welcome Bonus</span>
            <strong class="dash-metric-value" id="welcome-bonus">...</strong>
          </div>
        </div>

        <button onclick="window.app.showWithdrawModal()" class="btn btn-full" style="background:#f1f5f9; color:#1e293b; font-weight:800; padding:16px; border-radius:18px; border:1px solid #e2e8f0; cursor:pointer; width:100%; margin-bottom: 24px; display: flex; align-items: center; justify-content: center; gap: 10px; transition: transform 0.2s;">
          <div style="width: 32px; height: 32px; background: #fefce8; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #a16207;">💸</div>
          <span>Withdraw Funds</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="3" style="margin-left: auto;"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        <div class="dash-sub-stats" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
          <div class="dash-sub-item">
            <span>Total Earnings</span>
            <strong id="total-earnings">...</strong>
          </div>
          <div class="dash-sub-item">
            <span>Active Package</span>
            <strong id="active-package" style="color:#f59e0b">...</strong>
          </div>
        </div>

        <div class="section-block" style="margin-bottom: 24px;">
          <div class="section-block-header" style="margin-bottom:12px;">
            <h3 style="font-size: 15px; font-weight: 800; color: #1e293b;">Team & Tasks</h3>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
              <div style="flex: 1; background: linear-gradient(135deg, #0b6cff 0%, #00b0ff 100%); border: 1px solid rgba(255,255,255,0.1); padding: 12px 14px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                <span style="font-size: 12px; color: rgba(255,255,255,0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; font-family: monospace;">...register.html?ref=${this.state.user?.name || 'user'}</span>
                <button onclick="window.app.copyRefLink()" style="background: white; border: none; color: #0b6cff; font-weight: 800; font-size: 10px; cursor: pointer; padding: 6px 12px; border-radius: 8px; margin-left: 8px; letter-spacing: 0.5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">COPY</button>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
              <button onclick="window.location.hash = '#task'" class="btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); color: white; border: none; border-radius: 14px; font-weight: 800; font-size: 14px; padding: 14px; display: flex; align-items: center; gap: 10px; transition: transform 0.2s; box-shadow: 0 8px 16px rgba(22, 163, 74, 0.25);">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                 Watch Daily Tasks
              </button>
              <button onclick="window.location.hash = '#team'" class="btn" style="width: 100%; justify-content: center; background: white; color: #0b6cff; border: 2px solid #0b6cff; border-radius: 14px; font-weight: 800; font-size: 14px; padding: 13px; display: flex; align-items: center; gap: 10px; transition: transform 0.2s;">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                 View My Team
              </button>
            </div>
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
      team: `
        <div class="page-header" style="background: white; border-bottom: 1px solid #f1f5f9; padding: 24px 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 48px; height: 48px; background: #0b6cff; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; box-shadow: 0 8px 16px rgba(11, 108, 255, 0.2);">🚀</div>
            <div>
              <h2 style="font-size: 22px; font-weight: 800; color: #111827;">Business Center</h2>
              <p style="font-size: 13px; color: #64748b;">Manage your network earnings & team growth.</p>
            </div>
          </div>
        </div>
        <div style="padding: 20px 16px;">
          <div class="premium-card" style="margin-bottom: 24px; background: linear-gradient(135deg, #0b6cff 0%, #00b0ff 100%); border: none; box-shadow: 0 10px 25px rgba(11, 108, 255, 0.25);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
              <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: rgba(255,255,255,0.8); letter-spacing: 1px;">Network Invite Link</span>
              <div style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 6px; font-size: 10px; color: white; font-weight: 700;">ACTIVE</div>
            </div>
            <div style="background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2); padding: 14px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px;">
              <span id="ref-link-display" style="font-size: 13px; font-weight: 700; color: white; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: monospace;">...register.html?ref=${this.state.user?.name || 'user'}</span>
              <button onclick="window.app.copyRefLink()" style="background: white; color: #0b6cff; border: none; padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 800; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">COPY</button>
            </div>
          </div>
          
          <h3 style="font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 16px;">Direct Referrals</h3>
          <div id="team-list" class="team-list">
            <div style="padding: 40px; text-align: center; color: #64748b;">
              <div class="spinner" style="margin: 0 auto 12px;"></div>
              Fetching your team...
            </div>
          </div>
        </div>
      `,
      packages: `
        <div class="page-header-plain" style="padding: 20px 16px; text-align: center;">
          <h2 style="font-size: 22px; font-weight: 800;">Packages</h2>
        </div>
        <div class="pkg-list-vertical" id="pkg-list-vertical"></div>
      `,
      task: `
        <div class="page-header-plain" style="padding: 20px 16px; display: flex; align-items: center; gap: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="window.location.hash='#dashboard'"><path d="M15 18l-6-6 6-6"/></svg>
          <h2 style="font-size: 20px; font-weight: 800;">Daily Tasks</h2>
        </div>
        <div class="section-block">
          <p style="font-size: 15px; font-weight: 800; margin-bottom: 4px;">Earn by watching</p>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 24px;">Watch short videos from our advertisers (max 20s) to earn instant rewards.</p>
          
          <div id="task-video-container" style="display: none; background: #000; border-radius: 12px; overflow: hidden; margin-bottom: 24px; position: relative;">
            <video id="task-video" style="width: 100%; aspect-ratio: 16/9; display: block;" playsinline preload="auto" referrerpolicy="no-referrer"></video>
            <div id="task-video-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.5); color: white; font-weight: 800; font-size: 20px;">
              <button id="task-play-btn" style="background: #16a34a; color: white; border: none; padding: 12px 24px; border-radius: 30px; font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Play Video
              </button>
            </div>
            <div id="task-timer" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.7); color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; display: none;">00:20</div>
          </div>

          <div id="task-list" style="display: flex; flex-direction: column; gap: 12px;"></div>
        </div>
      `,
      profile: `
        <div class="profile-hero">
          <div style="position: absolute; top: 16px; left: 16px; z-index: 10;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" onclick="window.location.hash='#dashboard'" style="cursor:pointer; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));"><path d="M15 18l-6-6 6-6"/></svg>
          </div>
          <div class="profile-avatar-initials">
            ${this.state.user?.name?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <h2 class="profile-name">${this.state.user?.name || 'Investor'}</h2>
          <p class="profile-phone">${this.state.user?.phone || 'No phone number'}</p>
          
          <div class="profile-badge">
            ${(() => {
              const c = (this.state.user?.country || 'Burundi').toLowerCase();
              if (c.includes('global')) return '🌍';
              let code = 'bi';
              if (c.includes('kenya')) code = 'ke';
              else if (c.includes('uganda')) code = 'ug';
              else if (c.includes('rwanda')) code = 'rw';
              else if (c.includes('tanzania')) code = 'tz';
              return `<img src="https://flagcdn.com/w40/${code}.png" style="width:18px;height:12px;border-radius:2px;">`;
            })()}
            <span>${this.state.user?.country || 'Burundi'} • VIP Member</span>
          </div>
        </div>

        <div class="profile-content">
          <h3 class="profile-section-label">Account Settings</h3>
          <div class="profile-menu">
            <div class="profile-menu-item" onclick="window.app.editProfile()">
              <div class="profile-menu-icon" style="background:#e0f2fe; color:#0369a1;">👤</div>
              <div class="profile-menu-text">
                <strong>Personal Information</strong>
                <span>Name, Phone, and Country</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
            </div>
            <div class="profile-menu-item" onclick="window.app.showChangePassword()">
              <div class="profile-menu-icon" style="background:#f1f5f9; color:#475569;">🔒</div>
              <div class="profile-menu-text">
                <strong>Security</strong>
                <span>Update your password</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>

          <h3 class="profile-section-label">Financial & Network</h3>
          <div class="profile-menu">
            <div class="profile-menu-item" onclick="window.location.hash = '#team'">
              <div class="profile-menu-icon" style="background:#f0fdf4; color:#166534;">🤝</div>
              <div class="profile-menu-text">
                <strong>My Network</strong>
                <span>View your downlines & earnings</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
            </div>
            <div class="profile-menu-item" onclick="window.app.showDepositHistory()">
              <div class="profile-menu-icon" style="background:#fff7ed; color:#9a3412;">💰</div>
              <div class="profile-menu-text">
                <strong>Deposit History</strong>
                <span>All your investment records</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
            </div>
            <div class="profile-menu-item" onclick="window.app.showWithdrawalHistory()">
              <div class="profile-menu-icon" style="background:#fef2f2; color:#991b1b;">📤</div>
              <div class="profile-menu-text">
                <strong>Withdrawal History</strong>
                <span>Check your payout status</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>

          <h3 class="profile-section-label">Support & Help</h3>
          <div class="profile-menu">
            <div class="profile-menu-item" onclick="window.app.showSupportCenter()">
              <div class="profile-menu-icon" style="background:#f5f3ff; color:#5b21b6;">🎧</div>
              <div class="profile-menu-text">
                <strong>Customer Support</strong>
                <span>24/7 Assistance via WhatsApp</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="3"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>

          <button class="logout-btn-premium" onclick="window.app.logout()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform: rotate(180deg);"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      `
    };
    return templates[page] || '';
  }

  async hydrate() {
    const { page, token } = this.state;

    if (['dashboard', 'packages', 'task', 'profile', 'admin', 'team'].includes(page) && !token) {
      window.location.href = 'login.html';
      return;
    }

    if (page === 'admin' && this.state.user?.role !== 'admin') {
      window.location.href = 'admin-login.html';
      return;
    }

    switch (page) {
      case 'dashboard': await this.hydrateDashboard(); break;
      case 'packages':  await this.hydratePackages(); break;
      case 'task':      await this.hydrateTask(); break;
      case 'profile':   await this.hydrateProfile(); break;
      case 'team':      await this.hydrateTeam(); break;
      case 'admin':     await this.hydrateAdmin(); break;
      case 'admin-login': this.hydrateAdminLogin(); break;
      case 'home':      this.animateLandingStats(); this.hydrateLandingPackages(); break;
      case 'auth':      this.hydrateAuth(); break;
    }
  }

  hydrateAdminLogin() {
    const adminForm = document.getElementById('admin-login-form');
    if (adminForm) {
      adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('admin-login-btn');
        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;
        if (btn) { btn.disabled = true; btn.textContent = 'Verifying...'; }
        
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || data.error || 'Gateway access denied');
          
          if (data.user?.role !== 'admin') {
            throw new Error('Access Revoked: Insufficient privileges.');
          }

          localStorage.setItem('solar_token', data.token || data.data?.token);
          localStorage.setItem('solar_user', JSON.stringify(data.user || data.data?.user));
          
          this.showToast('Admin Access Granted. Teleporting...', 'success');
          setTimeout(() => { window.location.href = 'admin.html'; }, 1000);
          
        } catch (err) {
          this.showToast(err.message, 'error');
          if (btn) { btn.disabled = false; btn.textContent = 'Access Gateway'; }
        }
      });
    }
  }

  // --- AUTH HYDRATION ---

  async hydrateAdmin() {
    // 1. Setup Admin Sidebar Navigation
    const navLinks = document.querySelectorAll('.sidebar-nav-link');
    const views = document.querySelectorAll('.admin-view');
    const viewTitle = document.getElementById('current-view-title');
    const viewSub = document.getElementById('current-view-subtitle');
    
    if (navLinks.length > 0) {
      navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          navLinks.forEach(nav => nav.classList.remove('active'));
          link.classList.add('active');
          const target = link.getAttribute('data-target');
          views.forEach(v => v.style.display = 'none');
          const targetView = document.getElementById(target);
          if (targetView) {
            targetView.style.display = 'block';
            targetView.style.animation = 'slideUp 0.4s ease-out';
          }
          if (viewTitle) {
            viewTitle.textContent = link.textContent.trim();
            const subs = {
              'view-dashboard': 'Overview of Solar Africa Platform',
              'view-users': 'Manage platform members globally',
              'view-packages': 'Control investment tiers',
              'view-transactions': 'Approve or reject deposits/withdrawals',
              'view-notifications': 'Send global alerts to users',
              'view-settings': 'Configure platform rules'
            };
            if (viewSub) viewSub.textContent = subs[target] || '';
          }
          // On mobile, close sidebar after selecting a tab
          const sidebar = document.querySelector('.admin-sidebar');
          if (sidebar && window.innerWidth <= 768) sidebar.classList.remove('open');
        });
      });
    }

    // 2. Fetch Admin Stats securely
    const data = await this.fetchAPI('admin/stats');
    if (!data) return; // if 401 it will logout
    
    // 3. Populate Metrics View
    const { metrics, deposits, packages, users, withdrawals } = data;
    if (metrics) {
      const e = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
      e('admin-total-users', (metrics.users||0).toLocaleString());
      e('admin-total-deposits', (metrics.deposits||0).toLocaleString());
      e('admin-total-bonuses', metrics.total_payouts || '0 BIF');
      e('admin-total-withdrawals', (metrics.withdrawals||0).toLocaleString());
      e('admin-total-profit', metrics.total_profit || '0 BIF');

      // Populate Recent Deposits List on Dashboard
      const recentDepositsEl = document.getElementById('recent-deposits-list');
      if (recentDepositsEl && deposits) {
        const recent = (deposits.data || deposits).slice(0, 5); // handle both array or {data:[]}
        recentDepositsEl.innerHTML = recent.map(d => `
          <div class="list-item" style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #f1f5f9;">
            <div>
              <div style="font-weight:700; font-size:13px; color:#1e293b;">${d.user_name}</div>
              <div style="font-size:11px; color:#64748b;">${new Date(d.created_at).toLocaleDateString()}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-weight:800; font-size:13px; color:#16a34a;">+${d.amount}</div>
              <div style="font-size:10px; font-weight:700; color:${d.status==='approved'?'#16a34a':'#d97706'}; text-transform:uppercase;">${d.status}</div>
            </div>
          </div>
        `).join('') || '<div style="padding:20px; text-align:center; color:#94a3b8;">No recent deposits</div>';
      }
    }

    // 4. Populate Users Table (with Balance + Edit)
    if (users) {
      this.adminUsersData = users;
      this.renderAdminUsers();

      const searchInput = document.getElementById('admin-user-search');
      const sortSelect = document.getElementById('admin-user-sort');
      if (searchInput && !searchInput.dataset.bound) {
        searchInput.addEventListener('input', () => { this.state.pagination.adminUsers = 1; this.renderAdminUsers(); });
        searchInput.dataset.bound = 'true';
      }
      if (sortSelect && !sortSelect.dataset.bound) {
        sortSelect.addEventListener('change', () => { this.state.pagination.adminUsers = 1; this.renderAdminUsers(); });
        sortSelect.dataset.bound = 'true';
      }
    }

    // 5. Populate Packages Table
    const pkgTable = document.getElementById('admin-package-mgmt');
    if (pkgTable && packages) {
      pkgTable.innerHTML = packages.map(p => `
        <tr>
          <td><strong style="color:#0f172a;">${p.name}</strong></td>
          <td style="color:#10b981;font-weight:700;">${p.amount}</td>
          <td style="color:#0b6cff;font-weight:700;">${p.bonus}</td>
          <td><span style="background:#eff6ff;color:#0b6cff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${p.active} active</span></td>
          <td><span style="background:#dcfce7;color:#16a34a;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">LIVE</span></td>
          <td><button onclick="window.app.deletePackage(${p.id})" class="btn-admin" style="background:#fee2e2;color:#dc2626;border:none;padding:6px 12px;font-size:11px;cursor:pointer;">Delete</button></td>
        </tr>
      `).join('');
    }

    // 6. Populate Transactions Ledger
    const transTable = document.getElementById('full-transaction-ledger');
    if (transTable && deposits) {
      const page = this.state.pagination.adminDeposits;
      const paginatedDeposits = this.getPaginatedData(deposits, page);
      transTable.innerHTML = paginatedDeposits.map(d => `
        <tr>
          <td style="color:#64748b;font-family:monospace;font-size:12px;">#DEP-${d.id}</td>
          <td><span style="background:#eff6ff;color:#0b6cff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:800;text-transform:uppercase;">DEPOSIT</span></td>
          <td><strong>${d.user_name}</strong></td>
          <td style="color:#10b981;font-weight:700;">${this.formatCurrency(d.amount, d.country)}</td>
          <td style="color:#64748b;font-size:13px;">${new Date(d.created_at).toLocaleDateString()}</td>
          <td><span style="background:${d.status==='approved'?'#dcfce7':(d.status==='rejected'?'#fee2e2':'#fef3c7')};color:${d.status==='approved'?'#16a34a':(d.status==='rejected'?'#dc2626':'#d97706')};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${d.status.toUpperCase()}</span></td>
          <td>
            ${d.status === 'pending' ? `
              <button class="btn-admin btn-admin-primary" onclick="window.app.updateDeposit(${d.id}, 'approved')" style="padding:6px 12px;font-size:11px;">Approve</button>
              <button class="btn-admin btn-admin-outline" onclick="window.app.updateDeposit(${d.id}, 'rejected')" style="padding:6px 12px;font-size:11px;">Reject</button>
            ` : `<span style="color:#94a3b8;font-size:12px;">Processed</span>`}
          </td>
        </tr>
      `).join('');

      const controls = this.renderPaginationControls(deposits, page, 10, 'adminDeposits');
      const pagContainer = document.getElementById('pagination-deposits');
      if (pagContainer) pagContainer.innerHTML = controls;
    }

    const withdrawTable = document.getElementById('admin-withdrawals-list');
    if (withdrawTable && withdrawals) {
      const page = this.state.pagination.adminWithdrawals;
      const paginatedWithdrawals = this.getPaginatedData(withdrawals, page);
      withdrawTable.innerHTML = paginatedWithdrawals.map(w => `
        <tr>
          <td><strong>${w.user_name}</strong></td>
          <td style="color:#dc2626;font-weight:700;">-${this.formatCurrency(w.amount, w.country)}</td>
          <td><span style="background:#f4f7fe;color:#334155;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:800;text-transform:uppercase;">${w.type || 'wallet'}</span></td>
          <td style="color:#0b6cff;font-weight:700;font-size:12px;">${w.method || '<span style="color:#94a3b8;">Default</span>'}</td>
          <td style="color:#64748b;font-size:13px;">${new Date(w.created_at).toLocaleDateString()}</td>
          <td><span style="background:${w.status==='approved'?'#dcfce7':(w.status==='rejected'?'#fee2e2':'#fef3c7')};color:${w.status==='approved'?'#16a34a':(w.status==='rejected'?'#dc2626':'#d97706')};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${w.status.toUpperCase()}</span></td>
          <td>
            ${w.status === 'pending' ? `
              <button class="btn-admin btn-admin-primary" onclick="window.app.updateWithdrawal(${w.id}, 'approved')" style="padding:6px 12px;font-size:11px;">Approve</button>
              <button class="btn-admin btn-admin-outline" onclick="window.app.updateWithdrawal(${w.id}, 'rejected')" style="padding:6px 12px;font-size:11px;">Reject</button>
            ` : `<span style="color:#94a3b8;font-size:12px;">Processed</span>`}
          </td>
        </tr>
      `).join('');

      const controls = this.renderPaginationControls(withdrawals, page, 10, 'adminWithdrawals');
      const pagContainer = document.getElementById('pagination-withdrawals');
      if (pagContainer) pagContainer.innerHTML = controls;
    }

    // 7. Bind Push Notification Form
    const notifForm = document.getElementById('push-notif-form');
    if (notifForm && !notifForm.dataset.bound) {
      notifForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true; btn.textContent = 'Pushing...';
        const title = document.getElementById('notif-title').value;
        const message = document.getElementById('notif-message').value;
        const type = document.getElementById('notif-type').value;
        const res = await this.fetchAPI('admin/notifications', {
          method: 'POST',
          body: JSON.stringify({ title, message, type })
        });
        if (res) {
          this.showToast('Global Notification Pushed!', 'success');
          e.target.reset();
        }
        btn.disabled = false; btn.textContent = 'Push Notification Now';
      });
      notifForm.dataset.bound = 'true';
    }

    // 8. Bind Package Creation Form
    const packageForm = document.getElementById('package-form');
    if (packageForm && !packageForm.dataset.bound) {
      packageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true; btn.textContent = 'Creating...';
        
        const name = document.getElementById('pkg-name').value;
        const amount = document.getElementById('pkg-amount').value;
        const bonus = document.getElementById('pkg-bonus').value;
        const description = document.getElementById('pkg-desc').value;
        const active = 0; // Default active users

        const res = await this.fetchAPI('admin/packages', {
          method: 'POST',
          body: JSON.stringify({ name, amount, bonus, description, active })
        });

        if (res) {
          this.showToast('Package created successfully!', 'success');
          e.target.reset();
          this.closePackageModal();
          this.hydrateAdmin(); // Refresh the table
        }
        btn.disabled = false; btn.textContent = 'Create Package';
      });
      packageForm.dataset.bound = 'true';
    }

    // 9. Bind Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && !logoutBtn.dataset.bound) {
      logoutBtn.addEventListener('click', () => this.logout());
      logoutBtn.dataset.bound = 'true';
    }

    // 10. Bind User Edit Form (Profile + Balance)
    const balanceForm = document.getElementById('balance-edit-form');
    if (balanceForm && !balanceForm.dataset.bound) {
      balanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-save');
        btn.disabled = true; btn.textContent = 'Saving...';
        const userId = document.getElementById('balance-user-id').value;
        
        const payload = {
          name: document.getElementById('edit-user-name').value,
          email: document.getElementById('edit-user-email').value,
          phone: document.getElementById('edit-user-phone').value,
          country: document.getElementById('edit-user-country').value,
          referred_by: document.getElementById('edit-user-upline').value,
          wallet_balance: document.getElementById('edit-wallet-balance').value,
          welcome_bonus: document.getElementById('edit-welcome-bonus').value,
          total_earnings: document.getElementById('edit-total-earnings').value
        };

        const res = await this.fetchAPI(`admin/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (res) {
          this.showToast('User profile updated successfully!', 'success');
          document.getElementById('balance-modal-overlay').style.display = 'none';
          this.hydrateAdmin();
        }
        btn.disabled = false; btn.textContent = 'Save Changes';
      });
      balanceForm.dataset.bound = 'true';
    }

    // 11. Populate Payment Methods Table
    const pmRes = await this.fetchAPI('payment-methods');
    const paymentTable = document.getElementById('payment-methods-list');
    if (paymentTable) {
      let methods = Array.isArray(pmRes) ? pmRes : (pmRes?.data || []);
      // Inject the default Burundi payment if it doesn't exist in the database yet
      if (!methods.find(p => p.country === 'Burundi')) {
        methods.push({
          id: 'new-burundi',
          country: 'Burundi',
          provider: '1. Pfonda *163#\n2. Hitamo Kurungika\n3. Inimero: 67270398\n4. Amazina: RUKUNDO LOAUNGE\n5. Hama Wemeze'
        });
      }
      this.paymentMethodsData = methods; // Store in memory
      const flags = { Burundi:'🇧🇮', Uganda:'🇺🇬', Kenya:'🇰🇪', Rwanda:'🇷🇼', Tanzania:'🇹🇿', Congo:'🇨🇩' };
      paymentTable.innerHTML = methods.map(p => `
        <tr>
          <td style="white-space:nowrap;vertical-align:top;padding-top:16px;"><strong>${flags[p.country]||'🌍'} ${p.country}</strong></td>
          <td style="width:100%;vertical-align:top;"><div style="white-space:pre-wrap; font-size:13px; color:#334155; line-height:1.6; background:#f8fafc; padding:12px; border-radius:8px; border:1px solid #e2e8f0; margin-bottom:0;">${(p.provider || '').replace(/\\n/g, '\n').replace(/</g, '&lt;')}</div></td>
          <td style="display:flex;gap:6px;flex-wrap:nowrap;justify-content:flex-end;vertical-align:top;padding-top:16px;">
            <button onclick="window.app.openEditPaymentModal('${p.id}')" class="btn-admin btn-admin-primary" style="padding:6px 12px;font-size:11px;white-space:nowrap;">Edit</button>
            <button onclick="window.app.deletePaymentMethod('${p.id}')" class="btn-admin" style="background:#fee2e2;color:#dc2626;border:none;padding:6px 12px;font-size:11px;cursor:pointer;white-space:nowrap;">Delete</button>
          </td>
        </tr>
      `).join('');
    }

    // 12. Bind Payment Method Form
    const pmForm = document.getElementById('payment-method-form');
    if (pmForm && !pmForm.dataset.bound) {
      pmForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-save');
        btn.disabled = true; btn.textContent = 'Saving...';
        let id = document.getElementById('pm-id').value;
        const payload = {
          country: document.getElementById('pm-country').value,
          provider: document.getElementById('pm-instructions').value,
          dial_code: ' ',
          phone: ' ',
          account_name: document.getElementById('pm-header').value
        };
        
        // If it's the mock entry, we need to create it instead of updating
        if (id === 'new-burundi') {
          id = '';
        }
        
        const endpoint = id ? `admin/payment-methods/${id}` : 'admin/payment-methods';
        const method = id ? 'PUT' : 'POST';
        const res = await this.fetchAPI(endpoint, { method, body: JSON.stringify(payload) });
        if (res) {
          this.showToast(id ? 'Payment method updated!' : 'Payment method created!', 'success');
          document.getElementById('payment-modal-overlay').style.display = 'none';
          e.target.reset();
          document.getElementById('pm-id').value = '';
          this.hydrateAdmin();
        }
        btn.disabled = false; btn.textContent = 'Save Payment Method';
      });
      pmForm.dataset.bound = 'true';
    }

    // 13. Populate Video Tasks Table
    const tasksRes = await this.fetchAPI('tasks');
    const tasksList = document.getElementById('tasks-list');
    const tasksArr = Array.isArray(tasksRes) ? tasksRes : [];
    this.tasksData = tasksArr;
    if (tasksList) {
      tasksList.innerHTML = tasksArr.length ? tasksArr.map(t => `
        <tr>
          <td style="font-size:22px; text-align:center;">${t.icon || '☀️'}</td>
          <td><strong>${t.title}</strong></td>
          <td style="max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; color:#64748b;">
            <a href="${t.video_url}" target="_blank" style="color:#0b6cff;">${t.video_url}</a>
          </td>
          <td style="text-align:center;">${t.duration}s</td>
          <td style="color:#16a34a; font-weight:700;">${t.reward}</td>
          <td style="display:flex; gap:6px;">
            <button onclick="window.app.openEditTaskModal('${t.id}')" class="btn-admin btn-admin-primary" style="padding:6px 12px;font-size:11px;">Edit</button>
            <button onclick="window.app.deleteTask('${t.id}')" class="btn-admin" style="background:#fee2e2;color:#dc2626;border:none;padding:6px 12px;font-size:11px;cursor:pointer;">Delete</button>
          </td>
        </tr>`).join('') : `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px;">No custom tasks yet. Click "+ Add Video Task" to create one.</td></tr>`;
    }

    // 14. Bind Task Form
    const taskForm = document.getElementById('task-form');
    if (taskForm && !taskForm.dataset.bound) {
      taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-save');
        const uploadStatus = document.getElementById('upload-status');
        const videoFileInput = document.getElementById('task-video-file');
        
        btn.disabled = true; btn.textContent = 'Saving...';
        
        let videoUrl = document.getElementById('task-video-url').value;
        
        // 1. Handle file upload if present
        if (videoFileInput.files && videoFileInput.files[0]) {
            uploadStatus.style.display = 'block';
            uploadStatus.textContent = '⏳ Uploading video file...';
            
            const formData = new FormData();
            formData.append('video', videoFileInput.files[0]);
            
            try {
                const uploadRes = await fetch(`${this.apiBase}/admin/tasks/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${this.state.token}` },
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
                videoUrl = uploadData.url;
                uploadStatus.textContent = '✅ Upload complete!';
            } catch (err) {
                this.showToast(err.message, 'error');
                btn.disabled = false; btn.textContent = 'Save Task';
                uploadStatus.style.display = 'none';
                return;
            }
        }

        if (!videoUrl || videoUrl.startsWith('File selected:')) {
            this.showToast('Please provide a video URL or upload a file.', 'error');
            btn.disabled = false; btn.textContent = 'Save Task';
            return;
        }

        const id = document.getElementById('task-id').value;
        const payload = {
          icon: document.getElementById('task-icon').value,
          title: document.getElementById('task-title').value,
          video_url: videoUrl,
          duration: document.getElementById('task-duration').value,
          reward: document.getElementById('task-reward').value
        };
        const endpoint = id ? `admin/tasks/${id}` : 'admin/tasks';
        const method = id ? 'PUT' : 'POST';
        const res = await this.fetchAPI(endpoint, { method, body: JSON.stringify(payload) });
        if (res) {
          this.showToast(id ? 'Task updated!' : 'Task created!', 'success');
          document.getElementById('task-modal-overlay').style.display = 'none';
          e.target.reset();
          document.getElementById('task-video-url').readOnly = false;
          uploadStatus.style.display = 'none';
          this.hydrateAdmin();
        }
        btn.disabled = false; btn.textContent = 'Save Task';
      });
      taskForm.dataset.bound = 'true';
    }

    // 15. Fetch & Bind Global Settings
    const settingsRes = await this.fetchAPI('settings');
    const settings = settingsRes?.data || {};
    if (document.getElementById('setting-whatsapp')) {
      document.getElementById('setting-whatsapp').value = settings.whatsapp_group || '';
      document.getElementById('setting-telegram').value = settings.telegram_channel || '';
      document.getElementById('setting-email').value = settings.support_email || '';
      document.getElementById('setting-crypto').value = settings.crypto_address || '';
      
      // Populate Checkboxes
      const savedCountries = (settings.crypto_countries || '').split(',').map(c => c.trim().toLowerCase());
      document.querySelectorAll('input[name="crypto-country"]').forEach(cb => {
        cb.checked = savedCountries.includes(cb.value.toLowerCase());
      });
    }

    const settingsForm = document.getElementById('global-settings-form');
    if (settingsForm && !settingsForm.dataset.bound) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.disabled = true; btn.textContent = 'Saving Settings...';
        
        // Collect checked countries
        const selectedCountries = Array.from(document.querySelectorAll('input[name="crypto-country"]:checked'))
          .map(cb => cb.value)
          .join(', ');

        const payload = {
          whatsapp_group: document.getElementById('setting-whatsapp').value,
          telegram_channel: document.getElementById('setting-telegram').value,
          support_email: document.getElementById('setting-email').value,
          crypto_address: document.getElementById('setting-crypto').value,
          crypto_countries: selectedCountries
        };

        const res = await this.fetchAPI('admin/settings', { method: 'PUT', body: JSON.stringify(payload) });
        if (res) {
          this.showToast('Platform settings updated!', 'success');
          btn.style.background = '#22c55e';
          btn.textContent = '✅ Settings Saved';
          setTimeout(() => {
            btn.style.background = '';
            btn.disabled = false; 
            btn.textContent = 'Save Platform Settings';
          }, 3000);
        } else {
          btn.disabled = false; btn.textContent = 'Save Platform Settings';
        }
      });
      settingsForm.dataset.bound = 'true';
    }

    // 16. Initialize Charts
    this.initAdminCharts();
  }

  initAdminCharts() {
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (!revenueCtx) return;

    // Destroy existing charts if they exist to prevent memory leaks/glitches
    if (window.revenueChartInst) window.revenueChartInst.destroy();
    if (window.statusChartInst) window.statusChartInst.destroy();

    const gradient = revenueCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(67, 24, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(67, 24, 255, 0)');

    window.revenueChartInst = new Chart(revenueCtx, {
      type: 'bar',
      data: {
        labels: ['SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB'],
        datasets: [{
          label: 'Revenue',
          data: [50, 64, 48, 66, 49, 68],
          backgroundColor: '#0b6cff',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
          x: { grid: { display: false } }
        }
      }
    });

    const statusCtx = document.getElementById('statusChart')?.getContext('2d');
    if (statusCtx) {
        window.statusChartInst = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Approved', 'Pending', 'Rejected'],
                datasets: [{
                    data: [70, 20, 10],
                    backgroundColor: ['#05CD99', '#FFB547', '#EE5D50'],
                    borderWidth: 0,
                    cutout: '80%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
  }

  renderAdminUsers() {
    const userTable = document.getElementById('full-user-list');
    if (!userTable || !this.adminUsersData) return;

    const searchTerm = (document.getElementById('admin-user-search')?.value || '').toLowerCase();
    const sortVal = document.getElementById('admin-user-sort')?.value || 'newest';

    let filtered = this.adminUsersData.filter(u => 
      (u.name || '').toLowerCase().includes(searchTerm) || 
      (u.email || '').toLowerCase().includes(searchTerm)
    );

    filtered.sort((a, b) => {
      if (sortVal === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortVal === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      
      const balA = parseFloat((a.wallet_balance || '0').replace(/[^0-9.-]+/g, '')) || 0;
      const balB = parseFloat((b.wallet_balance || '0').replace(/[^0-9.-]+/g, '')) || 0;
      
      if (sortVal === 'balance-high') return balB - balA;
      if (sortVal === 'balance-low') return balA - balB;
      return 0;
    });

    const page = this.state.pagination.adminUsers || 1;
    const paginatedUsers = this.getPaginatedData(filtered, page);
    const startIndex = (page - 1) * 10; 

    userTable.innerHTML = paginatedUsers.map((u, i) => `
      <tr>
        <td style="color:#94a3b8;font-weight:700;font-size:12px;">#${startIndex + i + 1}</td>
        <td><div style="display:flex;align-items:center;gap:12px;">
          <img src="https://ui-avatars.com/api/?name=${u.name}&background=eff6ff&color=0b6cff" style="width:36px;height:36px;border-radius:10px;">
          <strong style="color:#0f172a;">${u.name}</strong>
        </div></td>
        <td style="color:#64748b;font-size:13px;">${u.email||'N/A'}</td>
        <td style="color:#0b6cff;font-size:12px;font-weight:700;">${u.upline||'SOLAR'}</td>
        <td style="color:#64748b;font-size:13px;">${new Date(u.created_at).toLocaleDateString()}</td>
        <td style="color:#10b981;font-weight:700;">${this.formatCurrency(u.wallet_balance, u.country)}</td>
        <td><span style="background:${u.status==='active'?'#dcfce7':'#fee2e2'};color:${u.status==='active'?'#16a34a':'#dc2626'};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${(u.status||'active').toUpperCase()}</span></td>
        <td style="display:flex;gap:6px;flex-wrap:wrap;">
          <button onclick="window.app.openBalanceModal('${u.user_id}', '${u.name}', '${this.formatCurrency(u.wallet_balance, u.country)}', '${this.formatCurrency(u.welcome_bonus, u.country)}', '${this.formatCurrency(u.total_earnings, u.country)}', '${u.email||''}', '${u.phone||''}', '${u.country||''}', '${u.upline||''}')" class="btn-admin btn-admin-primary" style="padding:6px 12px;font-size:11px;">Edit User</button>
          <button onclick="window.app.toggleUserStatus(${u.id}, '${u.status==='active'?'suspended':'active'}')" class="btn-admin ${u.status==='active'?'btn-admin-outline':'btn-admin-primary'}" style="padding:6px 12px;font-size:11px;">${u.status==='active'?'Suspend':'Activate'}</button>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="8" style="text-align:center;padding:20px;color:#94a3b8;">No users found matching your search.</td></tr>`;

    const controls = this.renderPaginationControls(filtered, page, 10, 'adminUsers');
    const pagContainer = document.getElementById('pagination-users');
    if (pagContainer) pagContainer.innerHTML = controls;
  }

  // Admin Actions
  openBalanceModal(userId, name, walletBalance, welcomeBonus, totalEarnings, email, phone, country, upline) {
    document.getElementById('balance-user-id').value = userId;
    document.getElementById('balance-modal-user').textContent = `Editing profile: ${name}`;
    
    // Profile Fields
    document.getElementById('edit-user-name').value = name || '';
    document.getElementById('edit-user-email').value = email || '';
    document.getElementById('edit-user-phone').value = phone || '';
    document.getElementById('edit-user-country').value = country || '';
    document.getElementById('edit-user-upline').value = upline || '';
    
    // Balance Fields
    document.getElementById('edit-wallet-balance').value = walletBalance;
    document.getElementById('edit-welcome-bonus').value = welcomeBonus;
    document.getElementById('edit-total-earnings').value = totalEarnings;
    
    document.getElementById('balance-modal-overlay').style.display = 'flex';
  }

  // Payment Method Actions
  openAddPaymentModal() {
    document.getElementById('pm-id').value = '';
    document.getElementById('payment-modal-title').textContent = 'Add Payment Method';
    document.getElementById('payment-method-form').reset();
    document.getElementById('payment-modal-overlay').style.display = 'flex';
  }
  
  openEditPaymentModal(id) {
    const pm = this.paymentMethodsData?.find(p => String(p.id) === String(id));
    if (!pm) return;
    
    document.getElementById('pm-id').value = pm.id;
    document.getElementById('payment-modal-title').textContent = 'Edit Payment Method';
    document.getElementById('pm-country').value = pm.country;
    document.getElementById('pm-header').value = pm.account_name || '';
    document.getElementById('pm-instructions').value = pm.provider || '';
    document.getElementById('payment-modal-overlay').style.display = 'flex';
  }

  insertFormat(elementId, openTag, closeTag) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const selectedText = text.substring(start, end);
    el.value = text.substring(0, start) + openTag + selectedText + closeTag + text.substring(end);
    el.focus();
    el.selectionStart = start + openTag.length;
    el.selectionEnd = end + openTag.length;
  }

  async deletePaymentMethod(id) {
    if (!confirm('Delete this payment method?')) return;
    const res = await this.fetchAPI(`admin/payment-methods/${id}`, { method: 'DELETE' });
    if (res) { this.showToast('Payment method deleted!', 'success'); this.hydrateAdmin(); }
  }

  // ── Admin Video Task Methods ──────────────────────────────────────────────

  openAddTaskModal() {
    document.getElementById('task-id').value = '';
    document.getElementById('task-modal-title').textContent = 'Add Video Task';
    document.getElementById('task-form').reset();
    document.getElementById('task-icon').value = '☀️';
    document.getElementById('task-reward').value = '3,500 FBu';
    document.getElementById('task-duration').value = '15';
    document.getElementById('task-video-url').readOnly = false;
    document.getElementById('upload-status').style.display = 'none';
    document.getElementById('task-modal-overlay').style.display = 'flex';
  }

  openEditTaskModal(id) {
    const task = this.tasksData?.find(t => String(t.id) === String(id));
    if (!task) return;
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-modal-title').textContent = 'Edit Video Task';
    document.getElementById('task-icon').value = task.icon || '☀️';
    document.getElementById('task-title').value = task.title || '';
    document.getElementById('task-video-url').value = task.video_url || '';
    document.getElementById('task-duration').value = task.duration || 15;
    document.getElementById('task-reward').value = task.reward || '3,500 FBu';
    document.getElementById('task-video-url').readOnly = false;
    document.getElementById('upload-status').style.display = 'none';
    document.getElementById('task-modal-overlay').style.display = 'flex';
  }

  async deleteTask(id) {
    if (!confirm('Delete this video task?')) return;
    const res = await this.fetchAPI(`admin/tasks/${id}`, { method: 'DELETE' });
    if (res) { this.showToast('Task deleted!', 'success'); this.hydrateAdmin(); }
  }

  async updateDeposit(id, status) {
    if (!confirm(`Are you sure you want to mark deposit #${id} as ${status.toUpperCase()}?`)) return;
    const res = await this.fetchAPI(`admin/deposits/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (res) {
      this.showToast(`Deposit ${status} successfully`, 'success');
      this.hydrateAdmin(); // Refresh
    }
  }
  
  async deletePackage(id) {
    if (!confirm('Are you sure you want to delete this package?')) return;
    const res = await this.fetchAPI(`admin/packages/${id}`, { method: 'DELETE' });
    if (res) {
      this.showToast('Package deleted!', 'success');
      this.hydrateAdmin();
    }
  }

  async toggleUserStatus(id, status) {
    if (!confirm(`Are you sure you want to ${status==='active'?'ACTIVATE':'SUSPEND'} this user?`)) return;
    const res = await this.fetchAPI(`admin/users/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (res) {
      this.showToast(`User ${status}`, 'success');
      this.hydrateAdmin();
    }
  }

  openPackageModal() { document.getElementById('package-modal').style.display = 'flex'; }
  closePackageModal() { document.getElementById('package-modal').style.display = 'none'; }

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
        const phone = document.getElementById('phone').value.trim();
        const country = document.getElementById('country').value;
        const password = document.getElementById('password').value;
        if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
        const ref = localStorage.getItem('solar_ref');
        const finalCountry = country === 'Other' ? document.getElementById('other_country').value.trim() : country;
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, country: finalCountry, password, referred_by: ref })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || data.error || 'Registration failed');
          
          // If email verification is required, show a specific message
          if (data.requiresEmailVerification) {
            this.showToast('Account created! Please check your email to verify.', 'success');
          } else {
            this.showToast('Account created successfully!', 'success');
          }

          // Immediately redirect to login
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1000);
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || errorData.message || `HTTP ${response.status}`;
        this.showToast(msg, 'error');
        throw new Error(msg);
      }
      const result = await response.json();
      return result.data || result;
    } catch (err) {
      console.error(`[Engine] API Error (${endpoint}):`, err.message);
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  // --- NOTIFICATION SYSTEM ---
  startNotificationPolling() {
    if (!this.state.token) return;
    this.fetchNotifications();
    setInterval(() => this.fetchNotifications(), 30000);
  }

  async fetchNotifications() {
    if (!this.state.token) return;
    const res = await this.fetchAPI('notifications');
    const data = res?.data || res;
    if (!Array.isArray(data)) return;
    
    this.state.notifications = data;
    const unreadCount = data.filter(n => !n.read).length;
    
    const badges = document.querySelectorAll('#notif-badge, .notif-badge');
    badges.forEach(badge => {
      if (unreadCount > 0) {
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.justifyContent = 'center';
        badge.style.fontSize = '10px';
        badge.style.fontWeight = '800';
        badge.style.color = 'white';
        badge.style.width = '16px';
        badge.style.height = '16px';
        badge.style.background = '#dc2626';
        badge.style.borderRadius = '50%';
        badge.style.border = '2px solid white';
        badge.style.position = 'absolute';
        badge.style.top = '-4px';
        badge.style.right = '-4px';
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      } else {
        badge.style.display = 'none';
      }
    });
  }

  showNotifications() {
    const notifs = this.state.notifications || [];
    const notifHTML = notifs.length === 0
      ? '<div style="padding:40px;text-align:center;color:#64748b;">🔔<br><br>No new notifications</div>'
      : notifs.map(n => `
          <div onclick="window.app.markAsRead('${n.id}', this)" style="padding: 16px; border-bottom: 1px solid #f1f5f9; cursor: pointer; background: ${n.read ? 'white' : '#f0f7ff'}; display:flex; gap:12px;">
            <div style="width:10px;height:10px;border-radius:50%;background:${n.read ? '#e2e8f0' : '#0b6cff'};margin-top:5px;flex-shrink:0;"></div>
            <div>
              <strong style="display:block;font-size:14px;margin-bottom:2px;">${n.title}</strong>
              <p style="font-size:13px;color:#4b5563;line-height:1.4;margin-bottom:4px;">${n.message}</p>
              <span style="font-size:11px;color:#94a3b8;">${new Date(n.created_at).toLocaleDateString()}</span>
            </div>
          </div>`).join('');
    this.showModal('Notifications', notifHTML);
  }

  showModal(title, html) {
    const existing = document.getElementById('app-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'app-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
    
    modal.innerHTML = `
      <div style="background:white; width:100%; max-width:500px; border-radius:32px 32px 0 0; overflow:hidden; animation: slideUp 0.3s ease-out;">
        <div style="padding: 20px; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #f1f5f9;">
          <strong style="font-size:18px;">${title}</strong>
          <button onclick="document.getElementById('app-modal').remove()" style="background:#f1f5f9; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;">Close</button>
        </div>
        <div class="modal-body" style="max-height:70vh; overflow-y:auto;">
          ${html}
        </div>
      </div>
    `;
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
  }

  showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;top:80px;left:50%;transform:translateX(-50%);background:${type==='error'?'#dc2626':'#16a34a'};color:white;padding:16px;border-radius:12px;font-weight:700;font-size:14px;z-index:999999;box-shadow:0 10px 25px rgba(0,0,0,0.2);transition:all 0.3s ease;text-align:center;width:90%;max-width:400px;line-height:1.5;word-wrap:break-word;box-sizing:border-box;`;
    toast.textContent = msg;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, -10px)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // --- DASHBOARD HYDRATION ---
  async hydrateDashboard() {
    const data = await this.fetchAPI('dashboard');
    
    // Store completed tasks in state
    this.state.completedTasks = data?.completedTasks || [];

    // Use Mockup Data if API fails or for initial match
    this.updateElement('wallet-balance', this.formatCurrency(data?.wallet_balance || 0));
    this.updateElement('welcome-bonus', this.formatCurrency(data?.welcome_bonus || 0));
    this.updateElement('total-earnings', this.formatCurrency(data?.total_earnings || 0));
    this.updateElement('active-package', data?.active_package || 'None');

    const activities = data?.activities || [];
    this.hydrateActivity(activities);
  }

  hydrateActivity(activities) {
    const list = document.getElementById('activity-list');
    if (!list) return;

    if (!activities || activities.length === 0) {
      list.innerHTML = `
        <div style="padding: 32px 16px; text-align: center; color: #64748b;">
          <div style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;">📋</div>
          <p style="font-size: 13px; font-weight: 500;">No recent activities yet.</p>
          <p style="font-size: 11px; opacity: 0.7;">Your deposits and task rewards will appear here.</p>
        </div>
      `;
      return;
    }

    const page = this.state.pagination.userActivity;
    const paginatedActivities = this.getPaginatedData(activities, page);

    list.innerHTML = paginatedActivities.map(act => {
      let iconClass = 'blue';
      let icon = '⚡';
      if (act.type === 'bonus') { iconClass = 'green'; icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 12V8H4v4M2 12h20M12 22V12M12 8V2"/></svg>'; }
      if (act.type === 'deposit') { iconClass = 'yellow'; icon = '💰'; }
      if (act.type === 'package') { iconClass = 'green'; icon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>'; }
      
      return `
        <div class="act-item">
          <div class="act-icon ${iconClass}">
            ${icon}
          </div>
          <div class="act-details">
            <strong>${act.title}</strong>
            <span>${act.date || 'Today, 10:30 AM'}</span>
          </div>
          <div class="act-value ${act.value?.includes('+') ? 'green' : ''}">${this.formatCurrency(act.value)}</div>
        </div>
      `;
    }).join('') + `<div id="pagination-activity"></div>`;

    const controls = this.renderPaginationControls(activities, page, 10, 'userActivity');
    const pagContainer = document.getElementById('pagination-activity');
    if (pagContainer) pagContainer.innerHTML = controls;
  }

  // --- PACKAGES HYDRATION ---

  async hydratePackages() {
    const data = await this.fetchAPI('packages');
    const list = document.getElementById('pkg-list-vertical');
    if (!list) return;

    const mockPkgs = [
      { name: 'Mono Starter',    amount: '80,000 BIF',    bonus: '210,000 BIF',   img: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Poly Basic',      amount: '120,000 BIF',   bonus: '320,000 BIF',   img: 'https://images.pexels.com/photos/159397/solar-panel-array-power-sun-159397.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Thin Film',       amount: '160,000 BIF',   bonus: '450,000 BIF',   img: 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Off-Grid Lite',   amount: '200,000 BIF',   bonus: '600,000 BIF',   img: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Hybrid Lite',     amount: '240,000 BIF',   bonus: '800,000 BIF',   img: 'https://images.pexels.com/photos/1036936/pexels-photo-1036936.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Grid-Tied Lite',  amount: '280,000 BIF',   bonus: '1,000,000 BIF', img: 'https://images.pexels.com/photos/9875452/pexels-photo-9875452.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Storage',   amount: '320,000 BIF',   bonus: '1,300,000 BIF', img: 'https://images.pexels.com/photos/3826311/pexels-photo-3826311.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Smart Solar',     amount: '360,000 BIF',   bonus: '1,700,000 BIF', img: 'https://images.pexels.com/photos/9875394/pexels-photo-9875394.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Entry',        amount: '400,000 BIF',   bonus: '2,100,000 BIF', img: 'https://images.pexels.com/photos/8853499/pexels-photo-8853499.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Basic',        amount: '440,000 BIF',   bonus: '2,500,000 BIF', img: 'https://images.pexels.com/photos/9875480/pexels-photo-9875480.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Standard',     amount: '480,000 BIF',   bonus: '3,000,000 BIF', img: 'https://images.pexels.com/photos/9799777/pexels-photo-9799777.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Plus',         amount: '520,000 BIF',   bonus: '3,600,000 BIF', img: 'https://images.pexels.com/photos/7511753/pexels-photo-7511753.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Pro',          amount: '560,000 BIF',   bonus: '4,200,000 BIF', img: 'https://images.pexels.com/photos/5965726/pexels-photo-5965726.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Max',          amount: '600,000 BIF',   bonus: '4,800,000 BIF', img: 'https://images.pexels.com/photos/13591394/pexels-photo-13591394.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Off-Grid Pro',    amount: '640,000 BIF',   bonus: '5,200,000 BIF', img: 'https://images.pexels.com/photos/9875479/pexels-photo-9875479.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Hybrid Pro',      amount: '680,000 BIF',   bonus: '5,600,000 BIF', img: 'https://images.pexels.com/photos/2800832/pexels-photo-2800832.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Grid-Tied Pro',   amount: '720,000 BIF',   bonus: '6,000,000 BIF', img: 'https://images.pexels.com/photos/4218546/pexels-photo-4218546.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Battery',   amount: '760,000 BIF',   bonus: '6,400,000 BIF', img: 'https://images.pexels.com/photos/2480807/pexels-photo-2480807.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Storage Plus',    amount: '800,000 BIF',   bonus: '6,800,000 BIF', img: 'https://images.pexels.com/photos/7034786/pexels-photo-7034786.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Smart Hybrid',    amount: '840,000 BIF',   bonus: '7,100,000 BIF', img: 'https://images.pexels.com/photos/6469811/pexels-photo-6469811.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Ultra',        amount: '880,000 BIF',   bonus: '7,400,000 BIF', img: 'https://images.pexels.com/photos/5981838/pexels-photo-5981838.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Array',     amount: '920,000 BIF',   bonus: '7,600,000 BIF', img: 'https://images.pexels.com/photos/5699665/pexels-photo-5699665.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Plant',     amount: '960,000 BIF',   bonus: '7,800,000 BIF', img: 'https://images.pexels.com/photos/9875450/pexels-photo-9875450.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Commercial Solar', amount: '1,000,000 BIF', bonus: '8,000,000 BIF', img: 'https://images.pexels.com/photos/8853527/pexels-photo-8853527.jpeg?auto=compress&cs=tinysrgb&w=400' }
    ];

    const finalData = (data && data.length > 0) ? data : mockPkgs;

    // Helper: cycle through 14 unique images by index
    const getImg = (p, i) => p.img || `assets/img/packages/pkg_${(i % 14) + 1}.jpg`;

    list.innerHTML = finalData.map((p, i) => `
      <div class="pkg-item-row" onclick="window.app.showInvestModal('${p.id || i}','${p.name}','${p.amount}','${p.bonus}','${getImg(p, i)}')">
        <div style="position:relative;">
          <img src="${getImg(p, i)}" 
               onerror="this.src='assets/img/packages/pkg_1.jpg'; this.onerror=null;" 
               class="pkg-item-img" alt="${p.name}" loading="lazy">
          ${p.popular ? '<div style="position:absolute; top:-5px; right:-5px; background:#22c55e; color:white; font-size:8px; font-weight:800; padding:2px 6px; border-radius:4px; transform:rotate(15deg);">POPULAR</div>' : ''}
        </div>
        <div class="pkg-item-info">
          <h4>${p.name}</h4>
          <p>${this.formatCurrency(p.amount)}</p>
        </div>
        <div class="pkg-item-bonus">
          <span>Bonus</span>
          <strong>${this.formatCurrency(p.bonus)}</strong>
        </div>
      </div>
    `).join('');
  }

  // --- TASK HYDRATION ---

  async hydrateTask() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    // Fetch tasks from backend (falls back to defaults server-side)
    const res = await this.fetchAPI('tasks');
    const tasks = (Array.isArray(res) ? res : res) || [];

    if (!tasks.length) {
      taskList.innerHTML = `<p style="text-align:center;color:#64748b;padding:40px;">No tasks available yet.</p>`;
      return;
    }

    taskList.innerHTML = tasks.map((t, i) => {
      const isDone = this.state.completedTasks?.includes(t.id);
      const videoSrc = t.video_url || t.videoUrl || '';
      
      // Professional Icon mapping based on index or title
      const icons = [
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>',
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2.5"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><path d="M22 11v2"/></svg>'
      ];
      const iconHTML = icons[i % icons.length];

      return `
        <div class="task-card" style="display: flex; align-items: center; justify-content: space-between; padding: 18px; background: white; border-radius: 20px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); opacity: ${isDone ? '0.6' : '1'}; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="width: 52px; height: 52px; background: #f8fafc; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
              ${iconHTML}
            </div>
            <div>
              <strong style="display: block; font-size: 14px; color: #1e293b; margin-bottom: 4px;">${t.title}</strong>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 11px; background: #eff6ff; color: #3b82f6; padding: 2px 8px; border-radius: 100px; font-weight: 700;">${t.duration}s</span>
                <span style="font-size: 13px; color: #16a34a; font-weight: 800;">+${(this.state.user?.country?.toLowerCase() === 'rwanda' || this.state.user?.country?.toLowerCase() === 'international') ? '$2.00' : this.formatCurrency(t.reward)}</span>
              </div>
            </div>
          </div>
          <button onclick="window.app.playTaskVideo('${videoSrc}', ${t.duration}, '${t.reward}', this, ${t.id})" 
                  ${isDone ? 'disabled' : ''} 
                  style="background: ${isDone ? '#e2e8f0' : 'linear-gradient(135deg,#16a34a,#22c55e)'}; color: ${isDone ? '#94a3b8' : 'white'}; border: none; width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; cursor: ${isDone ? 'default' : 'pointer'}; transition: all 0.2s;">
            ${isDone ? '✓' : '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'}
          </button>
        </div>`;
    }).join('');
  }

  playTaskVideo(url, duration, reward, btn, taskId) {
    if (btn.disabled) return;
    
    const container = document.getElementById('task-video-container');
    const video = document.getElementById('task-video');
    const overlay = document.getElementById('task-video-overlay');
    const playBtn = document.getElementById('task-play-btn');
    const timerEl = document.getElementById('task-timer');

    container.style.display = 'block';
    video.src = url;
    video.load();
    // No fallback, let the real URL play

    overlay.style.display = 'flex';
    timerEl.style.display = 'none';
    timerEl.style.background = 'rgba(0,0,0,0.7)';

    playBtn.onclick = () => {
      overlay.style.display = 'none';
      timerEl.style.display = 'block';
      timerEl.textContent = `00:${duration < 10 ? '0'+duration : duration}`;
      
      // Play with sound
      video.muted = false;
      video.play().catch(e => {
        console.warn('Playback error:', e);
        // Do not force mute, allow user to click play again or notify them
        this.showToast('Please interact with the page to allow sound.', 'info');
      });
      
      let timeLeft = duration;
      
      // Prevent user from skipping
      video.onseeking = () => {
         // Optionally prevent seeking if needed
      };

      const interval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(interval);
          video.pause();
          timerEl.textContent = 'Completed!';
          timerEl.style.background = '#16a34a';
          btn.textContent = 'Done';
          btn.style.background = '#94a3b8';
          btn.disabled = true;
          this.showToast(`Task completed! ${reward} credited to your wallet.`, 'success');
          
          // Persist to backend and wait for confirmation
          this.fetchAPI('tasks/complete', {
            method: 'POST',
            body: JSON.stringify({ reward, taskId })
          }).then(res => {
            if (res) {
                // Increment wallet visually ONLY after backend confirms
                const walletEl = document.getElementById('wallet-balance');
                if (walletEl && walletEl.textContent) {
                    const currentVal = parseInt(walletEl.textContent.replace(/[^0-9]/g, ''));
                    const rewardVal = parseInt(reward.replace(/[^0-9]/g, ''));
                    if (!isNaN(currentVal) && !isNaN(rewardVal)) {
                        walletEl.textContent = this.formatCurrency(currentVal + rewardVal);
                    }
                }
                this.showToast(`Success! ${this.formatCurrency(reward)} accredited to your wallet.`, 'success');
            } else {
                this.showToast(`Error: Reward could not be accredited. Please try again.`, 'error');
            }
          });
          
          setTimeout(() => { container.style.display = 'none'; }, 2000);
        } else {
          timerEl.textContent = `00:${timeLeft < 10 ? '0'+timeLeft : timeLeft}`;
        }
      }, 1000);
    };
  }

  // --- TEAM HYDRATION ---

  async hydrateTeam() {
    const list = document.getElementById('team-list');
    const linkEl = document.getElementById('ref-link-display');
    if (!list) return;

    if (linkEl) {
      const username = this.state.user?.name || 'user';
      const shortLink = `...register.html?ref=${username}`;
      linkEl.textContent = shortLink;
    }

    const res = await this.fetchAPI('team');
    const data = res?.data || res || [];

    if (data.length === 0) {
      list.innerHTML = `
        <div style="padding: 60px 20px; text-align: center; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 20px;">
          <div style="font-size: 40px; margin-bottom: 16px;">🤝</div>
          <h4 style="font-size: 16px; font-weight: 800; color: #1e293b; margin-bottom: 8px;">Build Your Team</h4>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">Invite your friends to join Solar Africa and earn commissions on their investments.</p>
          <button onclick="window.app.copyRefLink()" class="btn btn-blue" style="font-size: 13px; padding: 10px 20px;">Copy Your Invite Link</button>
        </div>
      `;
      return;
    }

    const page = this.state.pagination.userTeam;
    const paginatedData = this.getPaginatedData(data, page);

    list.innerHTML = `
      <div style="overflow-x: auto; border-radius: 16px; border: 1px solid #e2e8f0; background: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04);">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: linear-gradient(135deg, #0b6cff 0%, #00b0ff 100%);">
              <th style="padding: 14px 12px; text-align: center; color: white; font-weight: 800; font-size: 12px; letter-spacing: 0.5px; width: 40px;">#</th>
              <th style="padding: 14px 12px; text-align: left; color: white; font-weight: 800; font-size: 12px; letter-spacing: 0.5px;">USERNAME</th>
              <th style="padding: 14px 12px; text-align: left; color: white; font-weight: 800; font-size: 12px; letter-spacing: 0.5px;">PHONE</th>
              <th style="padding: 14px 12px; text-align: left; color: white; font-weight: 800; font-size: 12px; letter-spacing: 0.5px;">JOINED</th>
            </tr>
          </thead>
          <tbody>
            ${paginatedData.map((m, i) => `
              <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.15s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='white'">
                <td style="padding: 14px 12px; text-align: center; font-weight: 800; color: #94a3b8; font-size: 12px;">${((page-1)*10) + i + 1}</td>
                <td style="padding: 14px 12px; font-weight: 700; color: #1e293b;">${m.name}</td>
                <td style="padding: 14px 12px; color: #334155; font-weight: 600;">
                  ${m.phone && m.phone !== 'N/A' ? m.phone : '<span style="color:#cbd5e1;">—</span>'}
                </td>
                <td style="padding: 14px 12px; color: #64748b; font-size: 12px; white-space: nowrap;">${m.joined}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="padding: 12px 16px; background: #f8fafc; border-top: 1px solid #f1f5f9; text-align: right; font-size: 12px; color: #94a3b8; font-weight: 600; border-radius: 0 0 16px 16px;">
          Total: <strong style="color: #1e293b;">${data.length}</strong> member${data.length !== 1 ? 's' : ''}
        </div>
      </div>
    `;

    const controls = this.renderPaginationControls(data, page, 10, 'userTeam');
    if (controls) {
      const div = document.createElement('div');
      div.innerHTML = controls;
      list.appendChild(div);
    }
  }

  copyRefLink() {
    const username = this.state.user?.name || 'user';
    const refLink = `${window.location.origin}/register.html?ref=${username}`;
    navigator.clipboard.writeText(refLink);
    this.showToast('Referral link copied!', 'success');
  }

  showSupportCenter() {
    const settings = this.state.settings || {
      whatsapp_group: 'https://chat.whatsapp.com/default',
      telegram_channel: 'https://t.me/solarafrica',
      support_email: 'support@solarafrica.com'
    };

    const modal = document.createElement('div');
    modal.id = 'support-modal';
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 400px; padding: 24px; border-radius: 28px; text-align: center; background: white; border: 1px solid #f1f5f9; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        <div style="width: 70px; height: 70px; background: #eff6ff; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: #0b6cff;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
        <h3 style="font-size: 22px; font-weight: 900; color: #1e293b; margin-bottom: 8px; font-family: 'Outfit', sans-serif;">Support Center</h3>
        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 24px;">Need help? Connect with our team through any of these channels.</p>
        
        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;">
          <a href="${this.formatSupportLink(settings.whatsapp_group, 'whatsapp')}" target="_blank" style="display: flex; align-items: center; gap: 14px; background: #f0fdf4; padding: 16px; border-radius: 18px; text-decoration: none; border: 1px solid #dcfce7; transition: transform 0.2s;">
            <div style="width: 40px; height: 40px; background: #22c55e; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.284l-.582 2.166 2.234-.58c1.012.545 1.987.848 3.104.848 3.183 0 5.771-2.588 5.771-5.766 0-3.18-2.586-5.768-5.768-5.768zm3.393 8.24c-.15.429-.86.813-1.189.865-.29.047-.665.074-1.077-.058-.253-.082-.572-.187-1.01-.377-1.864-.81-3.057-2.727-3.15-2.85-.093-.124-.757-.993-.757-1.906 0-.913.473-1.36.643-1.545.17-.185.37-.231.493-.231.124 0 .248 0 .354.004.113.004.263-.042.412.316.15.358.513 1.25.558 1.342.045.092.075.2.015.32-.06.12-.09.195-.181.301-.091.106-.188.236-.268.327-.091.106-.188.219-.083.403.105.185.474.78.917 1.173.57.507 1.05.664 1.2 1.233.15.569.24.403.39-.185.15-.588.614-.15.864.06.25.21 1.574.772 1.635.854.06.082.06.124-.045.289z"/></svg>
            </div>
            <div style="text-align: left;">
              <strong style="display: block; font-size: 15px; color: #166534;">WhatsApp Group</strong>
              <span style="font-size: 12px; color: #22c55e; font-weight: 600;">Join our community</span>
            </div>
          </a>
          
          <a href="${this.formatSupportLink(settings.telegram_channel, 'telegram')}" target="_blank" style="display: flex; align-items: center; gap: 14px; background: #eff6ff; padding: 16px; border-radius: 18px; text-decoration: none; border: 1px solid #dbeafe; transition: transform 0.2s;">
            <div style="width: 40px; height: 40px; background: #3b82f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.13-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/></svg>
            </div>
            <div style="text-align: left;">
              <strong style="display: block; font-size: 15px; color: #1e40af;">Telegram</strong>
              <span style="font-size: 12px; color: #3b82f6; font-weight: 600;">Official Updates</span>
            </div>
          </a>

          <a href="mailto:${settings.support_email}" style="display: flex; align-items: center; gap: 14px; background: #f8fafc; padding: 16px; border-radius: 18px; text-decoration: none; border: 1px solid #e2e8f0; transition: transform 0.2s;">
            <div style="width: 40px; height: 40px; background: #64748b; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <div style="text-align: left;">
              <strong style="display: block; font-size: 15px; color: #334155;">Email Support</strong>
              <span style="font-size: 12px; color: #64748b; font-weight: 600;">Contact us via email</span>
            </div>
          </a>
        </div>

        <button onclick="document.getElementById('support-modal').remove()" class="btn btn-full" style="background: #f1f5f9; color: #475569; font-weight: 800; padding: 14px; border-radius: 16px; border: none; cursor: pointer; width: 100%;">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // --- PROFILE HYDRATION ---

  async hydrateProfile() {
    if (this.state.user) {
      this.updateElement('profile-name', this.state.user.name);
      this.updateElement('profile-phone', this.state.user.phone || '+257 000 000 00');
      
      const country = this.state.user.country || 'Burundi';
      this.updateElement('profile-country-name', country);
      
      const flagMap = {
        'Burundi': 'bi', 'Kenya': 'ke', 'Uganda': 'ug', 'Rwanda': 'rw', 'Tanzania': 'tz'
      };
      const flagCode = flagMap[country] || 'bi';
      const flagImg = document.getElementById('profile-flag');
      if (flagImg) flagImg.src = `https://flagcdn.com/w20/${flagCode}.png`;

      const initialsEl = document.getElementById('profile-avatar-initials');
      if (initialsEl) initialsEl.textContent = this.state.user.name.substring(0, 2).toUpperCase();
    }
  }

  showDepositHistory() {
    this.showToast('Deposit History is coming soon in the next update!', 'info');
  }

  showRealWithdrawForm() {
    const walletBalance = document.getElementById('wallet-balance')?.textContent || '0 FBu';
    const bonusBalance = document.getElementById('welcome-bonus')?.textContent || '0 FBu';
    
    const html = `
      <div style="padding: 20px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="width:60px; height:60px; background:#f0fdf4; border-radius:20px; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; color:#22c55e;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 1v22m10-18H2m15 13H7"/></svg>
          </div>
          <h3 style="font-size:18px; font-weight:800; color:#1e293b;">Request Withdrawal</h3>
          <p style="font-size:13px; color:#64748b;">Enter details to transfer your earnings.</p>
        </div>

        <div class="modern-form-group">
          <label class="modern-form-label">Withdraw From</label>
          <select id="withdraw-type" class="modern-form-control">
            <option value="wallet">Main Wallet (${walletBalance})</option>
            <option value="bonus">Welcome Bonus (${bonusBalance})</option>
          </select>
        </div>

        <div class="modern-form-group">
          <label class="modern-form-label">Amount to Withdraw</label>
          <input type="text" id="withdraw-amount" class="modern-form-control" placeholder="Enter amount (e.g. 50,000)">
        </div>

        <div class="modern-form-group">
          <label class="modern-form-label">Payment Method / Phone Number</label>
          <input type="text" id="withdraw-method" class="modern-form-control" placeholder="e.g. MTN +257...">
        </div>

        <button id="submit-withdraw-btn" class="btn btn-green btn-full" style="padding:16px; font-weight:800; border-radius:14px; margin-top:10px;">Submit Request</button>
      </div>
    `;

    this.showModal('Withdrawal Request', html);

    document.getElementById('submit-withdraw-btn').onclick = async () => {
      const btn = document.getElementById('submit-withdraw-btn');
      const amount = document.getElementById('withdraw-amount').value;
      const type = document.getElementById('withdraw-type').value;
      const method = document.getElementById('withdraw-method').value;

      if (!amount || !method) {
        this.showToast('Please fill all fields', 'error');
        return;
      }

      btn.disabled = true; btn.textContent = 'Processing...';
      
      const res = await this.fetchAPI('withdrawals', {
        method: 'POST',
        body: JSON.stringify({ amount, type, method })
      });

      if (res) {
        const successHtml = `
          <div style="padding: 40px 24px; text-align: center; background: white;">
            <div style="width:80px; height:80px; background:#f0fdf4; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; color:#16a34a; box-shadow: 0 10px 20px rgba(22, 163, 74, 0.1);">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
            <h3 style="font-size:24px; font-weight:900; color:#0f172a; margin-bottom:12px;">Request Successful!</h3>
            <p style="font-size:15px; color:#334155; line-height:1.6; margin-bottom:32px; font-weight:500;">
              Your withdrawal request for <strong style="color:#16a34a; font-size:18px;">${amount}</strong> has been submitted. 
              <br><br>
              Our financial team will verify and process it within <strong>30 minutes to 1 hour</strong>.
            </p>
            <button onclick="document.getElementById('app-modal').remove();" class="btn btn-blue btn-full" style="padding:18px; border-radius:16px; font-size:16px; font-weight:800; width:100%; border:none; cursor:pointer; box-shadow: 0 4px 12px rgba(11, 108, 255, 0.2);">
              Great, Thanks!
            </button>
          </div>
        `;
        const modalBody = document.querySelector('#app-modal .modal-body');
        if (modalBody) {
          modalBody.innerHTML = successHtml;
          // Also hide the header to make it look like a clean success card
          const modalHeader = modalBody.previousElementSibling;
          if (modalHeader) modalHeader.style.display = 'none';
          modalBody.parentElement.style.borderRadius = '32px';
        }
        this.hydrateDashboard();
      } else {
        btn.disabled = false; btn.textContent = 'Submit Request';
      }
    };
  }

  async showWithdrawModal() {
    const activePkg = document.getElementById('active-package')?.textContent || 'None';
    
    // EXEMPTION LOGIC: Linkon, Burundi, Kenya, Tanzania, Uganda, SOLAR, Akilimali
    const currentName = (this.state.user?.name || '').trim().toLowerCase();
    const exemplaryUsers = ['linkon', 'burundi', 'kenya', 'tanzania', 'uganda', 'solar', 'akilimali', 'rashid', 'admin'];
    
    if (exemplaryUsers.includes(currentName)) {
      this.showRealWithdrawForm();
      return;
    }

    if (activePkg === 'None' || activePkg === '...' || activePkg === 'No Active Package') {
      this.showToast('Security Alert: You must activate an investment package before you can withdraw your earnings.', 'error');
      return;
    }

    // 1. Calculate Fee (50% of package value)
    // We try to find the package amount from the packages list or fallback to a sensible default if not found
    let pkgValue = 80000; // Default fallback
    try {
      const pkgsRes = await this.fetchAPI('packages');
      const pkgs = pkgsRes?.data || [];
      const myPkg = pkgs.find(p => p.name === activePkg);
      if (myPkg) {
        pkgValue = parseInt(myPkg.amount.replace(/[^0-9]/g, ''));
      }
    } catch(e) { console.warn('Failed to fetch package value for fee calculation'); }

    const feeAmount = Math.floor(pkgValue / 2);
    const feeFormatted = this.formatCurrency(feeAmount);

    // 2. Fetch Payment Instructions
    const userCountry = this.state.user?.country || 'Burundi';
    let rawInstructions = '';
    let customHeader = '📋 Fee Payment Instructions';
    try {
      const pmData = await fetch(`/api/payment-methods?country=${encodeURIComponent(userCountry)}`).then(r => r.json());
      if (pmData?.data?.length > 0) {
        rawInstructions = (pmData.data[0].provider || '').replace(/\\n/g, '\n');
        customHeader = pmData.data[0].account_name || 'Fee Payment Instructions';
      }
    } catch(e) { console.warn('Payment method fetch failed'); }

    // 3. Smart Extraction for Fee
    const phoneMatches = rawInstructions.match(/(?:\+?\d{8,13})/g) || [];
    const uniquePhones = [...new Set(phoneMatches)];
    const dialMatches = rawInstructions.match(/\*\d+[\*\d]*#/g) || [];
    const uniqueDials = [...new Set(dialMatches)];
    const copySvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

    let extraDetailsHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:13px; font-weight:600; color:#991b1b;">Tax/Traffic Fee:</span>
        <span style="display:inline-flex;align-items:center;gap:6px;"><strong style="color:#dc2626;font-size:16px;">${feeAmount}</strong><button onclick="navigator.clipboard.writeText('${feeAmount}');window.app?.showToast('Fee amount copied!','success');" style="background:none;border:none;color:#dc2626;cursor:pointer;padding:2px;">${copySvg}</button></span>
      </div>`;

    uniquePhones.forEach((phone, idx) => {
      extraDetailsHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:13px; font-weight:600; color:#334155;">${idx === 0 ? 'Payment Number:' : 'Alt Number:'}</span>
          <span style="display:inline-flex;align-items:center;gap:6px;"><strong style="color:#334155;font-size:15px;">${phone}</strong><button onclick="navigator.clipboard.writeText('${phone}');window.app?.showToast('Number copied!','success');" style="background:none;border:none;color:#64748b;cursor:pointer;padding:2px;">${copySvg}</button></span>
        </div>`;
    });

    const html = `
      <div style="padding: 20px; text-align: center;">
        <div style="width:70px; height:70px; background:#fef2f2; border-radius:24px; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:#ef4444;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h3 style="font-size:20px; font-weight:800; color:#1e293b; margin-bottom:12px;">Withdrawal Security Check</h3>
        <p style="font-size:14px; color:#64748b; line-height:1.6; margin-bottom:24px;">
          To complete your withdrawal request, the system requires a <strong>Traffic & Tax Verification Fee</strong>. 
          This fee is calculated as 50% of your active <strong>${activePkg}</strong> package value.
        </p>

        <div style="background:#fdf2f2; border:1px solid #fecaca; border-radius:16px; padding:20px; text-align:left; margin-bottom:24px;">
          <h4 style="font-size:12px; font-weight:800; color:#991b1b; text-transform:uppercase; margin-bottom:12px; border-bottom:1px solid #fecaca; padding-bottom:8px;">Verification Required</h4>
          <div style="font-size:13px; color:#7f1d1d; margin-bottom:16px; white-space:pre-wrap;">${rawInstructions || 'Please pay the fee to our official account to unlock your withdrawal.'}</div>
          <div style="background:white; padding:12px; border-radius:10px; border:1px dashed #f87171; display:flex; flex-direction:column; gap:8px;">
            ${extraDetailsHTML}
          </div>
        </div>

        <button id="fee-paid-btn" class="btn btn-blue btn-full" style="padding:16px; font-weight:800; border-radius:14px; margin-bottom:12px;">I Have Paid the Fee</button>
        <p style="font-size:12px; color:#94a3b8;">After payment, your withdrawal will be processed within 30 minutes to 1 hour.</p>
      </div>
    `;

    this.showModal('Withdrawal Verification', html);

    document.getElementById('fee-paid-btn').onclick = async () => {
      const btn = document.getElementById('fee-paid-btn');
      btn.disabled = true; btn.textContent = 'Verifying Payment...';
      
      const res = await this.fetchAPI('deposits', {
        method: 'POST',
        body: JSON.stringify({ package_name: `Tax Fee (${activePkg})`, amount: feeFormatted })
      });

      if (res) {
        this.showToast('Verification request submitted! Our team will process your withdrawal once the fee is confirmed.', 'success');
        document.getElementById('app-modal').remove();
      } else {
        btn.disabled = false; btn.textContent = 'I Have Paid the Fee';
      }
    };
  }

  editProfile() {
    const u = this.state.user || {};
    const html = `
      <div style="padding: 20px;">
        <div class="modern-form-group">
          <label class="modern-form-label">Full Name</label>
          <input type="text" id="edit-name" class="modern-form-control" value="${u.name || ''}">
        </div>
        <div class="modern-form-group">
          <label class="modern-form-label">Phone Number</label>
          <input type="text" id="edit-phone" class="modern-form-control" value="${u.phone || ''}">
        </div>
        <div class="modern-form-group">
          <label class="modern-form-label">Country</label>
          <select id="edit-country" class="modern-form-control">
            <option value="Burundi" ${u.country==='Burundi'?'selected':''}>Burundi</option>
            <option value="Rwanda" ${u.country==='Rwanda'?'selected':''}>Rwanda</option>
            <option value="Kenya" ${u.country==='Kenya'?'selected':''}>Kenya</option>
          </select>
        </div>
        <button id="save-profile-btn" class="btn btn-blue btn-full" style="padding:16px; margin-top:10px;">Update Information</button>
      </div>
    `;
    this.showModal('Edit Profile', html);
    
    document.getElementById('save-profile-btn').onclick = async () => {
      const name = document.getElementById('edit-name').value;
      const phone = document.getElementById('edit-phone').value;
      const country = document.getElementById('edit-country').value;
      
      const btn = document.getElementById('save-profile-btn');
      btn.disabled = true; btn.textContent = 'Saving...';
      
      const res = await this.fetchAPI('profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone, country })
      });
      
      if (res) {
        this.state.user = { ...this.state.user, name, phone, country };
        localStorage.setItem('solar_user', JSON.stringify(this.state.user));
        this.showToast('Profile updated!', 'success');
        document.getElementById('app-modal').remove();
        this.handleRoute(); // Refresh template
      } else {
        btn.disabled = false; btn.textContent = 'Update Information';
      }
    };
  }

  async showDepositHistory() {
    const res = await this.fetchAPI('deposits');
    const data = res?.data || res || [];
    const html = `
      <div style="padding: 10px;">
        ${data.length > 0 ? data.map(d => `
          <div style="padding: 16px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="display: block; font-size: 14px;">${d.package_name || 'Generic Deposit'}</strong>
              <span style="font-size: 11px; color: #64748b;">${new Date(d.created_at).toLocaleDateString()}</span>
            </div>
            <div style="text-align: right;">
              <strong style="display: block; color: #16a34a;">${d.amount}</strong>
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${d.status==='approved'?'#16a34a':d.status==='pending'?'#f59e0b':'#dc2626'}">${d.status}</span>
            </div>
          </div>
        `).join('') : '<p style="text-align:center; padding: 40px; color:#64748b;">No deposits found.</p>'}
      </div>
    `;
    this.showModal('Deposit History', html);
  }

  async showWithdrawalHistory() {
    const res = await this.fetchAPI('withdrawals');
    const data = res?.data || res || [];
    const html = `
      <div style="padding: 10px;">
        ${data.length > 0 ? data.map(w => `
          <div style="padding: 16px; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="display: block; font-size: 14px;">Withdrawal Request</strong>
              <span style="font-size: 11px; color: #64748b;">${new Date(w.created_at).toLocaleDateString()}</span>
            </div>
            <div style="text-align: right;">
              <strong style="display: block; color: #dc2626;">-${w.amount}</strong>
              <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: ${w.status==='approved'?'#16a34a':w.status==='pending'?'#f59e0b':'#dc2626'}">${w.status}</span>
            </div>
          </div>
        `).join('') : `
          <div style="padding: 40px; text-align: center;">
            <p style="color:#64748b; margin-bottom: 20px;">No withdrawal history found.</p>
            <button onclick="document.getElementById('app-modal').remove(); window.app.showWithdrawModal()" class="btn btn-green" style="padding: 10px 20px; font-size: 13px;">Request Withdrawal</button>
          </div>
        `}
      </div>
    `;
    this.showModal('Withdrawal History', html);
  }

  showChangePassword() {
    const html = `
      <div style="padding: 20px;">
        <div class="modern-form-group">
          <label class="modern-form-label">Current Password</label>
          <input type="password" id="old-pass" class="modern-form-control" placeholder="••••••••">
        </div>
        <div class="modern-form-group">
          <label class="modern-form-label">New Password</label>
          <input type="password" id="new-pass" class="modern-form-control" placeholder="••••••••">
        </div>
        <button id="change-pass-btn" class="btn btn-green btn-full" style="padding:16px; margin-top:10px;">Change Password</button>
      </div>
    `;
    this.showModal('Change Password', html);
    document.getElementById('change-pass-btn').onclick = () => {
      this.showToast('Feature coming soon in full release!', 'info');
    };
  }

  // showNotifications is defined above (line ~772) — no duplicate needed

  async markAsRead(id, el) {
    const notif = this.state.notifications.find(n => n.id == id);
    if (!notif || notif.read) return;

    // Optimistic UI update
    notif.read = true;
    if (el) {
      el.style.background = 'transparent';
      const dot = el.querySelector('div[style*="background: #0b6cff"]');
      if (dot) dot.style.background = 'transparent';
    }
    this.updateNotificationBadge();

    // Persist to server
    await this.fetchAPI(`notifications/${id}/read`, { method: 'PUT' });
  }

  // hydrateAdmin is defined above (line ~331) — duplicate stubs removed

  initNotificationAdmin() {
    const form = document.getElementById('push-notif-form');
    if (!form || form.dataset.init) return;
    form.dataset.init = 'true';

    form.onsubmit = async (e) => {
      e.preventDefault();
      const title = document.getElementById('notif-title').value;
      const message = document.getElementById('notif-message').value;
      const type = document.getElementById('notif-type').value;

      const btn = form.querySelector('button[type="submit"]');
      const originalBtnText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Pushing...';

      const res = await this.fetchAPI('admin/notifications', {
        method: 'POST',
        body: JSON.stringify({ title, message, type })
      });

      btn.disabled = false;
      btn.textContent = originalBtnText;

      if (res) {
        this.showToast('Notification pushed to all users!', 'success');
        form.reset();
      }
    };
  }

  // Admin Management Views
  initTransactionLedger() {
    const tbody = document.getElementById('full-transaction-ledger');
    if (!tbody || !this.adminData?.deposits) return;
    tbody.innerHTML = this.adminData.deposits.map(d => `
      <tr>
        <td>#${d.id}</td>
        <td>Deposit</td>
        <td>${d.user_name}</td>
        <td>${d.amount}</td>
        <td>${d.created_at ? new Date(d.created_at).toLocaleDateString() : '—'}</td>
        <td>
          <span style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:${d.status==='approved'||d.status==='Approved'?'#dcfce7;color:#16a34a':d.status==='pending'||d.status==='Pending'?'#fef9c3;color:#b45309':'#fee2e2;color:#dc2626'}">${d.status}</span>
          ${(d.status==='pending'||d.status==='Pending')?`
          <button onclick="window.app.approveDeposit('${d.id}')" style="margin-left:6px;padding:3px 8px;background:#16a34a;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;">✓ Approve</button>
          <button onclick="window.app.rejectDeposit('${d.id}')" style="padding:3px 8px;background:#dc2626;color:white;border:none;border-radius:6px;cursor:pointer;font-size:11px;">✗ Reject</button>`:''}
        </td>
      </tr>`).join('');
  }

  initUserManagement() {
    const tbody = document.getElementById('full-user-list');
    if (!tbody || !this.adminData?.users) return;
    tbody.innerHTML = this.adminData.users.map(u => `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email||'—'}</td>
        <td>${u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
        <td>${u.balance||'—'}</td>
        <td><span style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:${u.status==='active'?'#dcfce7;color:#16a34a':'#fee2e2;color:#dc2626'}">${u.status}</span></td>
        <td><button onclick="window.app.toggleUser('${u.id}','${u.status}')" style="padding:4px 10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:12px;">${u.status==='active'?'Suspend':'Activate'}</button></td>
      </tr>`).join('');
  }

  initPackageManagement() {
    const tbody = document.getElementById('admin-package-mgmt');
    if (!tbody || !this.adminData?.packages) return;
    tbody.innerHTML = this.adminData.packages.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${p.amount}</td>
        <td>${p.bonus}</td>
        <td>${p.active??'—'}</td>
        <td><span style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;background:#dcfce7;color:#16a34a">Active</span></td>
        <td><button onclick="window.app.deletePackage('${p.id}')" style="padding:4px 10px;background:#fee2e2;color:#dc2626;border:none;border-radius:6px;cursor:pointer;font-size:12px;">Delete</button></td>
      </tr>`).join('');
  }

  async approveDeposit(id) {
    const r = await this.fetchAPI(`admin/deposits/${id}`,{method:'PUT',body:JSON.stringify({status:'approved'})});
    if (r) { this.showToast('Deposit approved!','success'); await this.hydrateAdmin(); }
  }
  async rejectDeposit(id) {
    const r = await this.fetchAPI(`admin/deposits/${id}`,{method:'PUT',body:JSON.stringify({status:'rejected'})});
    if (r) { this.showToast('Deposit rejected.','error'); await this.hydrateAdmin(); }
  }
  async toggleUser(id, status) {
    const ns = status==='active'?'suspended':'active';
    const r = await this.fetchAPI(`admin/users/${id}`,{method:'PUT',body:JSON.stringify({status:ns})});
    if (r) { this.showToast(`User ${ns}.`,'success'); await this.hydrateAdmin(); }
  }
  async deletePackage(id) {
    if (!confirm('Delete this package?')) return;
    const r = await this.fetchAPI(`admin/packages/${id}`,{method:'DELETE'});
    if (r) { this.showToast('Package deleted.','success'); await this.hydrateAdmin(); }
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

  switchPaymentTab(type) {
    const momoSection = document.getElementById('momo-payment-section');
    const cryptoSection = document.getElementById('crypto-payment-section');
    const tabMomo = document.getElementById('tab-momo');
    const tabCrypto = document.getElementById('tab-crypto');

    if (type === 'momo') {
      if (momoSection) momoSection.style.display = 'block';
      if (cryptoSection) cryptoSection.style.display = 'none';
      if (tabMomo) {
        tabMomo.style.background = 'white';
        tabMomo.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        tabMomo.style.color = '#1e293b';
      }
      if (tabCrypto) {
        tabCrypto.style.background = 'none';
        tabCrypto.style.boxShadow = 'none';
        tabCrypto.style.color = '#64748b';
      }
    } else {
      if (momoSection) momoSection.style.display = 'none';
      if (cryptoSection) cryptoSection.style.display = 'block';
      if (tabCrypto) {
        tabCrypto.style.background = 'white';
        tabCrypto.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
        tabCrypto.style.color = '#1e293b';
      }
      if (tabMomo) {
        tabMomo.style.background = 'none';
        tabMomo.style.boxShadow = 'none';
        tabMomo.style.color = '#64748b';
      }
    }
  }

  // --- UTILITIES ---

  setLoading(isLoading) {
    this.state.loading = isLoading;
    if (isLoading && !document.querySelector('.loading-overlay')) {
      const loader = document.createElement('div');
      loader.className = 'loading-overlay';
      loader.innerHTML = '<div class="spinner"></div>';
      document.body.appendChild(loader);
    }
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

  async hydrateLandingPackages() {
    const data = await this.fetchAPI('packages');
    const list = document.querySelector('.pkg-list');
    if (!list) return;

    const mockPkgs = [
      { name: 'Mono Starter', amount: '80,000 BIF', bonus: '210,000 BIF', img: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Poly Basic', amount: '120,000 BIF', bonus: '320,000 BIF', img: 'https://images.pexels.com/photos/885350/pexels-photo-885350.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Thin Film', amount: '160,000 BIF', bonus: '450,000 BIF', img: 'https://images.pexels.com/photos/433333/pexels-photo-433333.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Off-Grid Lite', amount: '200,000 BIF', bonus: '600,000 BIF', img: 'https://images.pexels.com/photos/9875679/pexels-photo-9875679.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Hybrid Lite', amount: '240,000 BIF', bonus: '800,000 BIF', img: 'https://images.pexels.com/photos/2800839/pexels-photo-2800839.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Grid-Tied Lite', amount: '280,000 BIF', bonus: '1,000,000 BIF', img: 'https://images.pexels.com/photos/357440/pexels-photo-357440.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Storage', amount: '320,000 BIF', bonus: '1,300,000 BIF', img: 'https://images.pexels.com/photos/159397/pexels-photo-159397.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Smart Solar', amount: '360,000 BIF', bonus: '1,700,000 BIF', img: 'https://images.pexels.com/photos/2592537/pexels-photo-2592537.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Entry', amount: '400,000 BIF', bonus: '2,100,000 BIF', img: 'https://images.pexels.com/photos/4254898/pexels-photo-4254898.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Basic', amount: '440,000 BIF', bonus: '2,500,000 BIF', img: 'https://images.pexels.com/photos/6301389/pexels-photo-6301389.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Standard', amount: '480,000 BIF', bonus: '3,000,000 BIF', img: 'https://images.pexels.com/photos/159394/pexels-photo-159394.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Plus', amount: '520,000 BIF', bonus: '3,600,000 BIF', img: 'https://images.pexels.com/photos/3181033/pexels-photo-3181033.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Pro', amount: '560,000 BIF', bonus: '4,200,000 BIF', img: 'https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Max', amount: '600,000 BIF', bonus: '4,800,000 BIF', img: 'https://images.pexels.com/photos/10050865/pexels-photo-10050865.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Off-Grid Pro', amount: '640,000 BIF', bonus: '5,200,000 BIF', img: 'https://images.pexels.com/photos/2990644/pexels-photo-2990644.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Hybrid Pro', amount: '680,000 BIF', bonus: '5,600,000 BIF', img: 'https://images.pexels.com/photos/3608055/pexels-photo-3608055.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Grid-Tied Pro', amount: '720,000 BIF', bonus: '6,000,000 BIF', img: 'https://images.pexels.com/photos/37728/pexels-photo-37728.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Battery', amount: '760,000 BIF', bonus: '6,400,000 BIF', img: 'https://images.pexels.com/photos/414837/pexels-photo-414837.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Storage Plus', amount: '800,000 BIF', bonus: '6,800,000 BIF', img: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Smart Hybrid', amount: '840,000 BIF', bonus: '7,100,000 BIF', img: 'https://images.pexels.com/photos/4323223/pexels-photo-4323223.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Ultra', amount: '880,000 BIF', bonus: '7,400,000 BIF', img: 'https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Array', amount: '920,000 BIF', bonus: '7,600,000 BIF', img: 'https://images.pexels.com/photos/1353938/pexels-photo-1353938.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Plant', amount: '960,000 BIF', bonus: '7,800,000 BIF', img: 'https://images.pexels.com/photos/159375/pexels-photo-159375.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Commercial Solar', amount: '1,000,000 BIF', bonus: '8,000,000 BIF', img: 'https://images.pexels.com/photos/6301391/pexels-photo-6301391.jpeg?auto=compress&cs=tinysrgb&w=400' }
    ];

    const finalData = data && data.length >= 24 ? data : mockPkgs;

    list.innerHTML = finalData.map((p, i) => `
      <div class="landing-pkg-card">
        ${p.name.includes('Pro') || p.name.includes('Commercial') ? '<div class="popular-ribbon">POPULAR</div>' : ''}
        <img src="${p.img || 'assets/img/packages/pkg_1.jpg'}" 
             onerror="this.src='assets/img/packages/pkg_1.jpg'; this.onerror=null;" 
             class="landing-pkg-img" alt="${p.name}">
        <div class="landing-pkg-content">
          <h3>${p.name}</h3>
          <div class="landing-pkg-price">${p.amount}</div>
          <span class="landing-pkg-bonus-label">Welcome Bonus</span>
          <strong class="landing-pkg-bonus">${p.bonus}</strong>
          <a href="register.html" class="btn btn-green btn-choose" style="margin-top:auto;">Choose Package</a>
        </div>
      </div>`).join('');
  }

  showInvestModal(id, name, amount, bonus, img) {
    const existing = document.getElementById('invest-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'invest-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:var(--bg-main);z-index:9999;display:flex;flex-direction:column;overflow-y:auto;animation: slideUp 0.3s ease-out;';
    
    // Create base layout which is more compact
    modal.innerHTML = `
      <div style="padding: 12px 16px; position: absolute; top: 0; left: 0; z-index: 10;">
        <div onclick="document.getElementById('invest-modal').remove()" style="width:36px; height:36px; background:rgba(255,255,255,0.9); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.15); cursor:pointer; backdrop-filter:blur(4px);">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
      </div>

      <img src="${img || 'assets/img/packages/pkg_1.jpg'}" class="pkg-detail-hero" alt="${name}" style="width:100%; height:200px; object-fit:cover;">
      
      <div class="pkg-detail-card" style="margin-top:-24px; background:white; border-radius:24px 24px 0 0; padding:24px 20px; flex:1; position:relative; box-shadow:0 -10px 30px rgba(0,0,0,0.05);">
        <div style="text-align:center;">
          <div style="display:inline-block; position:relative; margin-bottom:12px;">
            <div style="width:60px; height:60px; background:#fff; border-radius:50%; box-shadow:0 10px 25px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center;">
              <img src="https://cdn-icons-png.flaticon.com/512/6941/6941697.png" style="width:30px;" alt="Crown">
            </div>
          </div>
          <h3 style="font-size:16px; font-weight:800; color:#374151; margin-bottom:4px;">${name}</h3>
          <div style="font-size:28px; font-weight:900; color:#111827; margin-bottom:16px;">${this.formatCurrency(amount)}</div>
          
          <div style="background:#f8fafc; border-radius:16px; padding:16px; margin-bottom:24px;">
            <span style="display:block; font-size:12px; color:#64748b; font-weight:700; margin-bottom:2px;">Welcome Bonus</span>
            <strong style="font-size:20px; font-weight:900; color:#16a34a;">${this.formatCurrency(bonus)}</strong>
          </div>

          <div style="text-align:left; margin-bottom:24px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; font-size:13px; font-weight:600; color:#4b5563;">
              <div style="width:20px; height:20px; background:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span>Instant welcome bonus upon approval</span>
            </div>
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px; font-size:13px; font-weight:600; color:#4b5563;">
              <div style="width:20px; height:20px; background:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span>Secure & trusted payments</span>
            </div>
            <div style="display:flex; align-items:center; gap:12px; font-size:13px; font-weight:600; color:#4b5563;">
              <div style="width:20px; height:20px; background:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span>24/7 priority user support</span>
            </div>
          </div>

          <button id="activate-now-btn" class="btn btn-green btn-full" style="padding:16px; font-size:15px; font-weight:800; border-radius:14px; width:100%; border:none; cursor:pointer;">
            Activate Now
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#activate-now-btn').onclick = async () => {
      const card = modal.querySelector('.pkg-detail-card');
      card.innerHTML = `<div style="text-align:center;padding:40px;"><div class="spinner" style="margin:0 auto 12px;"></div><p style="color:#64748b;">Loading payment info...</p></div>`;

      // 0. Ensure settings are loaded
      if (!this.state.settings || Object.keys(this.state.settings).length === 0) {
        try {
          const res = await this.fetchAPI('settings');
          if (res?.data) this.state.settings = res.data;
        } catch (e) { console.warn('Failed to fetch settings in modal'); }
      }

      // Fetch dynamic payment info for user's country
      const userCountry = this.state.user?.country || 'Burundi';
      
      let rawInstructions = '';
      let customHeader = '📋 Payment Instructions';
      try {
        const pmData = await fetch(`/api/payment-methods?country=${encodeURIComponent(userCountry)}`).then(r => r.json());
        if (pmData?.data?.length > 0) {
          rawInstructions = (pmData.data[0].provider || '').replace(/\\n/g, '\n');
          customHeader = pmData.data[0].account_name || 'Payment Instructions';
        }
      } catch(e) { console.warn('Payment method fetch failed'); }

      const userCountryClean = (userCountry || 'Burundi').trim().toLowerCase();
      const isRwanda = userCountryClean === 'rwanda';
      const isBurundi = userCountryClean === 'burundi';
      
      const rwfRate = 1450; // Updated rate: 1$ = 1450 RWF
      const localizedAmount = this.formatCurrency(amount);
      const amountRaw = amount.toString().replace(/[^0-9]/g, '');
      const amountRWF = (parseFloat(amountRaw) * rwfRate).toLocaleString() + ' RWF';
      
      const phoneMatches = rawInstructions.match(/(?:\+?\d{8,13})/g) || [];
      const uniquePhones = [...new Set(phoneMatches)];
      const dialMatches = rawInstructions.match(/\*\d+[\*\d]*#/g) || [];
      const uniqueDials = [...new Set(dialMatches)];

      const copySvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;

      let extraDetailsHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:13px; font-weight:600; color:#166534;">Amount to pay:</span>
          <span style="display:inline-flex;align-items:center;gap:6px;"><strong style="color:#16a34a;font-size:16px;">${isRwanda ? amountRWF : localizedAmount}</strong><button onclick="navigator.clipboard.writeText('${isRwanda ? (parseFloat(amountRaw) * rwfRate) : amountRaw}');window.app?.showToast('Amount copied!','success');" style="background:none;border:none;color:#16a34a;cursor:pointer;padding:2px;">${copySvg}</button></span>
        </div>`;

      if (isRwanda) {
        extraDetailsHTML += `
          <div style="font-size:11px; color:#166534; font-weight:500; margin-top:4px; text-align:right;">
            * Rate: 1$ = ${rwfRate.toLocaleString()} RWF
          </div>
        `;
      }

      // Phone Numbers
      uniquePhones.forEach((phone, idx) => {
        extraDetailsHTML += `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; font-weight:600; color:#166534;">${idx === 0 ? 'Payment Number:' : 'Alternative Number:'}</span>
            <span style="display:inline-flex;align-items:center;gap:6px;"><strong style="color:#16a34a;font-size:16px;">${phone}</strong><button onclick="navigator.clipboard.writeText('${phone}');window.app?.showToast('Number copied!','success');" style="background:none;border:none;color:#16a34a;cursor:pointer;padding:2px;">${copySvg}</button></span>
          </div>`;
      });

      // Dial Codes
      uniqueDials.forEach((dial) => {
        extraDetailsHTML += `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:13px; font-weight:600; color:#166534;">USSD Code:</span>
            <span style="display:inline-flex;align-items:center;gap:6px;"><strong style="color:#16a34a;font-size:16px;">${dial}</strong><button onclick="navigator.clipboard.writeText('${dial}');window.app?.showToast('Code copied!','success');" style="background:none;border:none;color:#16a34a;cursor:pointer;padding:2px;">${copySvg}</button></span>
          </div>`;
      });

      // 2. Fetch fresh settings specifically for this modal to avoid any state desync
      const settingsRes = await fetch('/api/settings').then(r => r.json()).catch(() => ({data:{}}));
      const activeSettings = settingsRes?.data || this.state.settings || {};
      
      let cryptoHTML = '';
      const cryptoAddr = activeSettings.crypto_address;
      const cryptoCountriesRaw = activeSettings.crypto_countries || '';
      const cryptoCountries = cryptoCountriesRaw.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
      const isInternational = userCountryClean === 'international';
      
      // Robust check: includes country name, 'all', or is international
      const isCryptoEnabledForUser = cryptoCountries.some(c => c === userCountryClean || c === 'all') || 
                                     cryptoCountriesRaw.toLowerCase().includes(userCountryClean) ||
                                     isInternational;

      console.log('[CryptoDebug] MODAL_FETCH', { 
        userCountryClean, 
        cryptoCountriesRaw, 
        cryptoCountries, 
        isCryptoEnabledForUser,
        hasAddress: !!cryptoAddr,
        addrLen: cryptoAddr?.length || 0
      });

      if (cryptoAddr && cryptoAddr.length > 10 && isCryptoEnabledForUser) {
        cryptoHTML = `
          <div id="crypto-payment-content" style="background: linear-gradient(135deg, #0f172a, #1e293b); padding: 20px; border-radius: 20px; color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
              <div style="width: 40px; height: 40px; background: #f7931a; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(247, 147, 26, 0.3);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
              </div>
              <div>
                <h4 style="margin:0; font-size:15px; font-weight:800; letter-spacing:0.5px;">USDT TRC-20</h4>
                <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.6); font-weight:600;">Secure Blockchain Payment</p>
              </div>
              <div style="margin-left: auto; text-align: right;">
                <div style="font-size: 18px; font-weight: 900; color: #f7931a;">${localizedAmount}</div>
                <div style="font-size: 10px; opacity: 0.7; font-weight: 700; text-transform: uppercase;">Amount in USD</div>
              </div>
            </div>

            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 16px; margin-bottom: 20px;">
              <label style="display:block; font-size:11px; color:rgba(255,255,255,0.5); text-transform:uppercase; font-weight:800; margin-bottom:8px; letter-spacing:1px;">Destination Address</label>
              <div style="display:flex; align-items:center; gap:10px;">
                <code style="background:rgba(255,255,255,0.1); padding:10px 14px; border-radius:10px; font-size:12px; color:#f7931a; flex:1; overflow:hidden; text-overflow:ellipsis; border:1px solid rgba(247,147,26,0.2); font-family:monospace;">${cryptoAddr}</code>
                <button onclick="navigator.clipboard.writeText('${cryptoAddr}');window.app?.showToast('Address copied!','success');" style="width:40px; height:40px; border-radius:10px; background:#f7931a; border:none; color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                  ${copySvg}
                </button>
              </div>
            </div>

            <div style="display: flex; align-items: flex-start; gap: 10px; background: rgba(234, 179, 8, 0.1); padding: 12px; border-radius: 12px; border-left: 4px solid #eab308;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" stroke-width="2.5" style="margin-top:2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p style="margin:0; font-size:11px; line-height:1.5; color:#fde047; font-weight:500;">Please only send <strong>USDT</strong> using the <strong>TRC-20 (TRON)</strong> network. Sending other assets or using different networks will result in permanent loss.</p>
            </div>
          </div>
        `;
      }

      const paymentTabsHTML = cryptoHTML ? `
        <div style="display: flex; background: #f1f5f9; padding: 4px; border-radius: 14px; margin-bottom: 24px;">
          <button id="tab-momo" onclick="window.app.switchPaymentTab('momo')" style="flex:1; padding:10px; border-radius:10px; border:none; background:${isInternational ? 'none' : 'white'}; font-size:13px; font-weight:800; color:${isInternational ? '#64748b' : '#1e293b'}; cursor:pointer; box-shadow:${isInternational ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'}; transition:all 0.2s;">🏦 Mobile Money</button>
          <button id="tab-crypto" onclick="window.app.switchPaymentTab('crypto')" style="flex:1; padding:10px; border-radius:10px; border:none; background:${isInternational ? 'white' : 'none'}; font-size:13px; font-weight:800; color:${isInternational ? '#1e293b' : '#64748b'}; cursor:pointer; box-shadow:${isInternational ? '0 2px 8px rgba(0,0,0,0.05)' : 'none'}; transition:all 0.2s;">₿ Crypto (USDT)</button>
        </div>
      ` : '';

      const paymentStepsHTML = `
        <div id="momo-payment-section" style="${isInternational ? 'display:none' : 'display:block'}">
          <h4 style="font-size:12px;font-weight:800;color:#0f172a;margin-bottom:12px;border-bottom:1px solid #e2e8f0;padding-bottom:10px;text-transform:uppercase;letter-spacing:0.5px;">${customHeader.replace(/</g, '&lt;')}</h4>
          <div style="white-space: pre-wrap; font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">${rawInstructions || 'Please contact support for instructions.'}</div>
          <div style="background:#f0fdf4; padding:12px; border-radius:12px; display:flex; flex-direction:column; gap:8px; border:1px dashed #22c55e;">
            ${extraDetailsHTML}
          </div>
        </div>
        <div id="crypto-payment-section" style="${isInternational ? 'display:block' : 'display:none'}; animation: fadeIn 0.3s ease-out;">
          ${cryptoHTML || '<p style="color:#64748b; font-size:13px; text-align:center; padding:20px;">Crypto payment is not yet configured for this region.</p>'}
        </div>`;

      card.innerHTML = `
        <div style="text-align:center;">
          <h3 style="font-size:18px;font-weight:900;color:#1e293b;margin-bottom:8px;">Payment Details</h3>
          <p style="font-size:13px;color:#64748b;margin-bottom:24px;">Choose your preferred method for <strong>${name}</strong>.</p>
          
          ${paymentTabsHTML}

          <div style="text-align:left; margin-bottom:32px;">
            ${paymentStepsHTML}
          </div>

          <button id="confirm-payment-btn" class="btn btn-green btn-full" style="padding:16px;font-size:15px;font-weight:900;border-radius:16px;width:100%;border:none;cursor:pointer;margin-bottom:12px;box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);">I Have Completed Payment</button>
          <button id="cancel-payment-btn" style="background:none;border:none;color:#94a3b8;font-size:13px;font-weight:700;cursor:pointer;padding:8px; transition:color 0.2s;" onmouseover="this.style.color='#64748b'" onmouseout="this.style.color='#94a3b8'">Cancel &amp; Go Back</button>
        </div>
      `;

      modal.querySelector('#cancel-payment-btn').onclick = () => {
        modal.remove(); 
      };

      modal.querySelector('#confirm-payment-btn').onclick = async () => {
        const btn = modal.querySelector('#confirm-payment-btn');
        btn.disabled = true; btn.textContent = 'Submitting...';

        const method = this.state.activePaymentTab || 'momo';
        const displayAmount = method === 'crypto' ? this.formatCurrency(amount) : (this.state.user?.country?.toLowerCase() === 'rwanda' ? ((parseFloat(amount.toString().replace(/[^0-9]/g, '')) * 1450).toLocaleString() + ' RWF') : this.formatCurrency(amount));
        const finalAmount = `${displayAmount} (${method.toUpperCase()})`;

        const res = await this.fetchAPI('deposits',{method:'POST',body:JSON.stringify({
          package_name: name,
          amount: finalAmount
        })});
        if (res) {
          // Success view
          card.innerHTML = `
            <div style="text-align:center; padding: 20px 0;">
              <div style="width:80px; height:80px; background:#dcfce7; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; box-shadow: 0 10px 20px rgba(22, 163, 74, 0.15);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h3 style="font-size:22px; font-weight:800; color:#111827; margin-bottom:12px;">Payment Successful!</h3>
              <p style="font-size:14px; color:#4b5563; line-height:1.6; margin-bottom:24px; padding:0 10px;">
                Your deposit for the <strong>${name}</strong> package has been received and is currently under review. 
                <br><br>
                Please wait while our team verifies your payment. Once approved, your <strong>${bonus} Welcome Bonus</strong> will be instantly accredited to your balance and will be available for withdrawal!
              </p>
              <button onclick="document.getElementById('invest-modal').remove()" class="btn btn-blue btn-full" style="padding:16px; font-size:15px; font-weight:800; border-radius:14px; width:100%; border:none; cursor:pointer;">
                Return to Dashboard
              </button>
            </div>
          `;
        } else {
          btn.disabled = false; btn.textContent = 'I Have Paid';
        }
      };
    };
  }

  async updateWithdrawal(id, status) {
    const res = await this.fetchAPI(`admin/withdrawals/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
    if (res) {
      this.showToast(`Withdrawal ${status} successfully`, 'success');
      this.hydrateAdmin();
    }
  }

  async approveWithdrawal(id) {
    await this.updateWithdrawal(id, 'approved');
  }

  async rejectWithdrawal(id) {
    await this.updateWithdrawal(id, 'rejected');
  }

  async approveDeposit(id) {
    const res = await this.fetchAPI(`admin/deposits/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'approved' })
    });
    if (res) {
      this.showToast('Deposit approved successfully', 'success');
      this.hydrateAdmin();
    }
  }

  async rejectDeposit(id) {
    const res = await this.fetchAPI(`admin/deposits/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'rejected' })
    });
    if (res) {
      this.showToast('Deposit rejected', 'warning');
      this.hydrateAdmin();
    }
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
