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
      fab.onclick = () => window.open('https://wa.me/25760000000', '_blank');
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
            <h3 style="font-size: 15px; font-weight: 800; color: #1e293b;">Team Management</h3>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px;">
              <div style="flex: 1; background: linear-gradient(135deg, #0b6cff 0%, #00b0ff 100%); border: 1px solid rgba(255,255,255,0.1); padding: 12px 14px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);">
                <span style="font-size: 12px; color: rgba(255,255,255,0.9); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; font-family: monospace;">...register.html?ref=${this.state.user?.name || 'user'}</span>
                <button onclick="window.app.copyRefLink()" style="background: white; border: none; color: #0b6cff; font-weight: 800; font-size: 10px; cursor: pointer; padding: 6px 12px; border-radius: 8px; margin-left: 8px; letter-spacing: 0.5px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">COPY</button>
              </div>
            </div>
            <button onclick="window.location.hash = '#team'" class="btn" style="width: 100%; justify-content: center; background: linear-gradient(135deg, #0b6cff 0%, #00b0ff 100%); color: white; border: none; border-radius: 14px; font-weight: 800; font-size: 14px; padding: 14px; display: flex; align-items: center; gap: 10px; transition: transform 0.2s; box-shadow: 0 8px 16px rgba(11, 108, 255, 0.25);">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
               View My Team
            </button>
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
            <video id="task-video" style="width: 100%; aspect-ratio: 16/9; display: block;" playsinline></video>
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
        <div class="page-header-plain" style="padding: 20px 16px; display: flex; align-items: center; gap: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="window.location.hash='#dashboard'"><path d="M15 18l-6-6 6-6"/></svg>
          <h2 style="font-size: 20px; font-weight: 800;">My Profile</h2>
        </div>
        <div class="profile-hero">
          <div id="profile-avatar-initials" style="width: 80px; height: 80px; background: #0b6cff; border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: 800; color: white; box-shadow: 0 10px 20px rgba(11, 108, 255, 0.2);">
            ${this.state.user?.name?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <h2 id="profile-name" class="profile-name">${this.state.user?.name || 'Member User'}</h2>
          <p id="profile-phone" class="profile-phone">${this.state.user?.phone || '+257 000 000 00'}</p>
          <div class="profile-country">
            <img id="profile-flag" src="https://flagcdn.com/w20/${(this.state.user?.country || 'Burundi').toLowerCase().substring(0,2) === 'bu' ? 'bi' : 'rw'}.png" alt="Country" style="width:20px;height:14px;border-radius:2px;">
            <span id="profile-country-name">${this.state.user?.country || 'Burundi'}</span>
          </div>
        </div>
        <div class="profile-menu">
          <div class="profile-menu-item" onclick="window.app.editProfile()">
            <span>Profile Information</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div class="profile-menu-item" onclick="window.app.showDepositHistory()">
            <span>Deposit History</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div class="profile-menu-item" onclick="window.app.showWithdrawalHistory()">
            <span>Withdrawals</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div class="profile-menu-item" onclick="window.app.showChangePassword()">
            <span>Change Password</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
          <div class="profile-menu-item" onclick="window.app.showSupportCenter()">
            <span>Support Center</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </div>
        </div>
        <div style="padding: 20px 16px;">
          <button class="logout-btn-red" id="logout-btn" onclick="window.app.logout()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform: rotate(180deg);"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
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
    const { metrics, deposits, packages, users } = data;
    if (metrics) {
      const e = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
      e('admin-total-users', (metrics.users||0).toLocaleString());
      e('admin-total-deposits', (metrics.deposits||0).toLocaleString());
      e('admin-total-bonuses', metrics.total_payouts || '0 BIF');
      e('admin-total-withdrawals', (metrics.withdrawals||0).toLocaleString());
      // dummy profit calculation
      e('admin-total-profit', ((metrics.deposits * 1000) || 0).toLocaleString() + ' BIF');
    }

    // 4. Populate Users Table (with Balance + Edit)
    const userTable = document.getElementById('full-user-list');
    if (userTable && users) {
      userTable.innerHTML = users.map(u => `
        <tr>
          <td><div style="display:flex;align-items:center;gap:12px;">
            <img src="https://ui-avatars.com/api/?name=${u.name}&background=eff6ff&color=0b6cff" style="width:36px;height:36px;border-radius:10px;">
            <strong style="color:#0f172a;">${u.name}</strong>
          </div></td>
          <td style="color:#64748b;font-size:13px;">${u.email||'N/A'}</td>
          <td style="color:#64748b;font-size:13px;">${new Date(u.created_at).toLocaleDateString()}</td>
          <td style="color:#10b981;font-weight:700;">${u.wallet_balance||'0 BIF'}</td>
          <td><span style="background:${u.status==='active'?'#dcfce7':'#fee2e2'};color:${u.status==='active'?'#16a34a':'#dc2626'};padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;">${(u.status||'active').toUpperCase()}</span></td>
          <td style="display:flex;gap:6px;flex-wrap:wrap;">
            <button onclick="window.app.openBalanceModal('${u.user_id}', '${u.name}', '${u.wallet_balance||'0 BIF'}', '${u.welcome_bonus||'0 BIF'}', '${u.total_earnings||'0 BIF'}')" class="btn-admin btn-admin-primary" style="padding:6px 12px;font-size:11px;">Edit Balance</button>
            <button onclick="window.app.toggleUserStatus(${u.id}, '${u.status==='active'?'suspended':'active'}')" class="btn-admin ${u.status==='active'?'btn-admin-outline':'btn-admin-primary'}" style="padding:6px 12px;font-size:11px;">${u.status==='active'?'Suspend':'Activate'}</button>
          </td>
        </tr>
      `).join('');
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
      transTable.innerHTML = deposits.map(d => `
        <tr>
          <td style="color:#64748b;font-family:monospace;font-size:12px;">#DEP-${d.id}</td>
          <td><span style="background:#eff6ff;color:#0b6cff;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:800;">DEPOSIT</span></td>
          <td><strong>${d.user_name}</strong></td>
          <td style="color:#10b981;font-weight:700;">${d.amount}</td>
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

    // 10. Bind Balance Edit Form
    const balanceForm = document.getElementById('balance-edit-form');
    if (balanceForm && !balanceForm.dataset.bound) {
      balanceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-save');
        btn.disabled = true; btn.textContent = 'Saving...';
        const userId = document.getElementById('balance-user-id').value;
        const wallet_balance = document.getElementById('edit-wallet-balance').value;
        const welcome_bonus = document.getElementById('edit-welcome-bonus').value;
        const total_earnings = document.getElementById('edit-total-earnings').value;
        const res = await this.fetchAPI(`admin/users/${userId}/balance`, {
          method: 'PUT',
          body: JSON.stringify({ wallet_balance, welcome_bonus, total_earnings })
        });
        if (res) {
          this.showToast('User balance updated successfully!', 'success');
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
    if (paymentTable && pmRes?.data) {
      this.paymentMethodsData = pmRes.data; // Store in memory
      const flags = { Burundi:'🇧🇮', Uganda:'🇺🇬', Kenya:'🇰🇪', Rwanda:'🇷🇼', Tanzania:'🇹🇿', Congo:'🇨🇩' };
      paymentTable.innerHTML = pmRes.data.map(p => `
        <tr>
          <td><strong>${flags[p.country]||'🌍'} ${p.country}</strong></td>
          <td colspan="4"><div style="max-width:300px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-family:monospace; font-size:12px; color:#64748b; background:#f8fafc; padding:4px 8px; border-radius:6px;">${(p.provider || '').replace(/</g, '&lt;')}</div></td>
          <td style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;">
            <button onclick="window.app.openEditPaymentModal(${p.id})" class="btn-admin btn-admin-primary" style="padding:6px 12px;font-size:11px;">Edit</button>
            <button onclick="window.app.deletePaymentMethod(${p.id})" class="btn-admin" style="background:#fee2e2;color:#dc2626;border:none;padding:6px 12px;font-size:11px;cursor:pointer;">Delete</button>
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
        const id = document.getElementById('pm-id').value;
        const payload = {
          country: document.getElementById('pm-country').value,
          provider: document.getElementById('pm-instructions').value, // We store HTML instructions in provider
          dial_code: ' ',
          phone: ' ',
          account_name: ' '
        };
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
  }

  // Admin Actions
  openBalanceModal(userId, name, walletBalance, welcomeBonus, totalEarnings) {
    document.getElementById('balance-user-id').value = userId;
    document.getElementById('balance-modal-user').textContent = `Editing balances for: ${name}`;
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
    const pm = this.paymentMethodsData?.find(p => p.id === id);
    if (!pm) return;
    
    document.getElementById('pm-id').value = pm.id;
    document.getElementById('payment-modal-title').textContent = 'Edit Payment Method';
    document.getElementById('pm-country').value = pm.country;
    document.getElementById('pm-instructions').value = pm.provider || '';
    document.getElementById('payment-modal-overlay').style.display = 'flex';
  }
  async deletePaymentMethod(id) {
    if (!confirm('Delete this payment method?')) return;
    const res = await this.fetchAPI(`admin/payment-methods/${id}`, { method: 'DELETE' });
    if (res) { this.showToast('Payment method deleted!', 'success'); this.hydrateAdmin(); }
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
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, country, password, referred_by: ref })
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
        <div style="max-height:70vh; overflow-y:auto;">
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
    
    // Use Mockup Data if API fails or for initial match
    this.updateElement('wallet-balance', data?.wallet_balance || '1,250,000 BIF');
    this.updateElement('welcome-bonus', data?.welcome_bonus || '2,350,000 BIF');
    this.updateElement('total-earnings', data?.total_earnings || '3,600,000 BIF');
    this.updateElement('active-package', data?.active_package || 'Mono Starter');

    this.hydrateActivity(data?.activities || [
      { title: 'Welcome Bonus Received', type: 'bonus', date: 'Today, 10:30 AM', value: '+210,000 BIF' },
      { title: 'Package Activated', type: 'package', date: 'Today, 10:20 AM', value: 'Mono Starter' },
      { title: 'Deposit Submitted', type: 'deposit', date: 'Today, 10:20 AM', value: '80,000 BIF' }
    ]);
  }

  hydrateActivity(activities) {
    const list = document.getElementById('activity-list');
    if (!list) return;

    list.innerHTML = activities.map(act => {
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
          <div class="act-value ${act.value?.includes('+') ? 'green' : ''}">${act.value}</div>
        </div>
      `;
    }).join('');
  }

  // --- PACKAGES HYDRATION ---

  async hydratePackages() {
    const data = await this.fetchAPI('packages');
    const list = document.getElementById('pkg-list-vertical');
    if (!list) return;

    const mockPkgs = [
      { name: 'Mono Starter', amount: '80,000 BIF', bonus: '210,000 BIF', img: 'assets/img/packages/pkg_1.jpg' },
      { name: 'Poly Basic', amount: '120,000 BIF', bonus: '320,000 BIF', img: 'assets/img/packages/pkg_2.jpg' },
      { name: 'Thin Film', amount: '160,000 BIF', bonus: '450,000 BIF', img: 'assets/img/packages/pkg_3.jpg' },
      { name: 'Off-Grid Lite', amount: '200,000 BIF', bonus: '600,000 BIF', img: 'assets/img/packages/pkg_4.jpg' },
      { name: 'Hybrid Lite', amount: '240,000 BIF', bonus: '800,000 BIF', img: 'assets/img/packages/pkg_5.jpg' },
      { name: 'Grid-Tied Lite', amount: '280,000 BIF', bonus: '1,000,000 BIF', img: 'assets/img/packages/pkg_6.jpg' },
      { name: 'Solar Storage', amount: '320,000 BIF', bonus: '1,300,000 BIF', img: 'assets/img/packages/pkg_7.jpg' },
      { name: 'Smart Solar', amount: '360,000 BIF', bonus: '1,700,000 BIF', img: 'assets/img/packages/pkg_8.jpg' },
      { name: 'PV Entry', amount: '400,000 BIF', bonus: '2,100,000 BIF', img: 'assets/img/packages/pkg_9.jpg' },
      { name: 'PV Basic', amount: '440,000 BIF', bonus: '2,500,000 BIF', img: 'assets/img/packages/pkg_10.jpg' },
      { name: 'PV Standard', amount: '480,000 BIF', bonus: '3,000,000 BIF', img: 'assets/img/packages/pkg_11.jpg' },
      { name: 'PV Plus', amount: '520,000 BIF', bonus: '3,600,000 BIF', img: 'assets/img/packages/pkg_12.jpg' },
      { name: 'PV Pro', amount: '560,000 BIF', bonus: '4,200,000 BIF', img: 'assets/img/packages/pkg_13.jpg' },
      { name: 'PV Max', amount: '600,000 BIF', bonus: '4,800,000 BIF', img: 'assets/img/packages/pkg_14.jpg' },
      { name: 'Off-Grid Pro', amount: '640,000 BIF', bonus: '5,200,000 BIF', img: 'assets/img/packages/pkg_1.jpg' },
      { name: 'Hybrid Pro', amount: '680,000 BIF', bonus: '5,600,000 BIF', img: 'assets/img/packages/pkg_2.jpg' },
      { name: 'Grid-Tied Pro', amount: '720,000 BIF', bonus: '6,000,000 BIF', img: 'assets/img/packages/pkg_3.jpg' },
      { name: 'Solar Battery', amount: '760,000 BIF', bonus: '6,400,000 BIF', img: 'assets/img/packages/pkg_4.jpg' },
      { name: 'Storage Plus', amount: '800,000 BIF', bonus: '6,800,000 BIF', img: 'assets/img/packages/pkg_5.jpg' },
      { name: 'Smart Hybrid', amount: '840,000 BIF', bonus: '7,100,000 BIF', img: 'assets/img/packages/pkg_6.jpg' },
      { name: 'PV Ultra', amount: '880,000 BIF', bonus: '7,400,000 BIF', img: 'assets/img/packages/pkg_7.jpg' },
      { name: 'Solar Array', amount: '920,000 BIF', bonus: '7,600,000 BIF', img: 'assets/img/packages/pkg_8.jpg' },
      { name: 'Solar Plant', amount: '960,000 BIF', bonus: '7,800,000 BIF', img: 'assets/img/packages/pkg_9.jpg' },
      { name: 'Commercial Solar', amount: '1,000,000 BIF', bonus: '8,000,000 BIF', img: 'assets/img/packages/pkg_10.jpg' }
    ];

    const finalData = data && data.length >= 24 ? data : mockPkgs;

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
          <p>${p.amount}</p>
        </div>
        <div class="pkg-item-bonus">
          <span>Bonus</span>
          <strong>${p.bonus}</strong>
        </div>
      </div>
    `).join('');
  }

  // --- TASK HYDRATION ---

  async hydrateTask() {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    // Mock video tasks
    const tasks = [
      { id: 1, title: 'Solar Africa Intro', reward: '500 BIF', duration: 15, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 2, title: 'Clean Energy Ads', reward: '800 BIF', duration: 20, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 3, title: 'Partner Spotlight', reward: '400 BIF', duration: 10, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
      { id: 4, title: 'Power Grid Expansion', reward: '600 BIF', duration: 18, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' }
    ];

    taskList.innerHTML = tasks.map((t, i) => `
      <div class="task-card" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <div style="width: 48px; height: 48px; background: #e0f2fe; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #0284c7;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
          </div>
          <div>
            <strong style="display: block; font-size: 15px; color: #1e293b; margin-bottom: 2px;">${t.title}</strong>
            <span style="font-size: 12px; color: #64748b; font-weight: 600;">${t.duration}s • ${t.reward}</span>
          </div>
        </div>
        <button onclick="window.app.playTaskVideo('${t.videoUrl}', ${t.duration}, '${t.reward}', this)" style="background: #16a34a; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; transition: all 0.2s;">Watch</button>
      </div>
    `).join('');
  }

  playTaskVideo(url, duration, reward, btn) {
    if (btn.disabled) return;
    
    const container = document.getElementById('task-video-container');
    const video = document.getElementById('task-video');
    const overlay = document.getElementById('task-video-overlay');
    const playBtn = document.getElementById('task-play-btn');
    const timerEl = document.getElementById('task-timer');

    container.style.display = 'block';
    video.src = url;
    video.load();
    
    overlay.style.display = 'flex';
    timerEl.style.display = 'none';
    timerEl.style.background = 'rgba(0,0,0,0.7)';

    playBtn.onclick = () => {
      overlay.style.display = 'none';
      timerEl.style.display = 'block';
      timerEl.textContent = `00:${duration < 10 ? '0'+duration : duration}`;
      video.play();
      
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
          
          // Increment wallet visually
          const walletEl = document.getElementById('wallet-balance');
          if (walletEl && walletEl.textContent) {
              const currentVal = parseInt(walletEl.textContent.replace(/[^0-9]/g, ''));
              const rewardVal = parseInt(reward.replace(/[^0-9]/g, ''));
              if (!isNaN(currentVal) && !isNaN(rewardVal)) {
                  walletEl.textContent = (currentVal + rewardVal).toLocaleString() + ' BIF';
              }
          }
          
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

    list.innerHTML = data.map(m => `
      <div class="team-item" style="background: white; border: 1px solid #f1f5f9; padding: 16px; border-radius: 16px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 40px; height: 40px; background: #eff6ff; color: #3b82f6; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px;">
            ${m.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <strong style="display: block; font-size: 15px; color: #1e293b;">${m.name}</strong>
            <span style="font-size: 12px; color: #64748b;">Joined ${m.joined}</span>
          </div>
        </div>
        <div style="text-align: right;">
          <span style="display: block; font-size: 11px; font-weight: 800; color: #16a34a; text-transform: uppercase;">${m.status}</span>
          <span style="font-size: 13px; font-weight: 700; color: #1e293b;">${m.contribution}</span>
        </div>
      </div>
    `).join('');
  }

  copyRefLink() {
    const username = this.state.user?.name || 'user';
    const refLink = `${window.location.origin}/register.html?ref=${username}`;
    navigator.clipboard.writeText(refLink);
    this.showToast('Referral link copied!', 'success');
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

  showSupportCenter() {
    const html = `
      <div style="padding: 24px; text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">🎧</div>
        <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 12px;">How can we help?</h3>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 24px; line-height: 1.6;">Our support team is available 24/7 to assist you with your investments and account issues.</p>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a href="https://wa.me/25760000000" target="_blank" class="btn" style="background:#25D366; color:white; font-weight:800; gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.44 1.28 4.91L2 22l5.24-1.37c1.41.77 3.01 1.21 4.7 1.21 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.92-9.99z"/></svg> 
            Chat on WhatsApp
          </a>
          <a href="https://t.me/solarafrica" target="_blank" class="btn" style="background:#0088cc; color:white; font-weight:800; gap:8px;">
            Telegram Channel
          </a>
        </div>
      </div>
    `;
    this.showModal('Support Center', html);
  }

  showWithdrawModal() {
    const html = `
      <div style="padding: 20px;">
        <div style="background:#f0fdf4; border:1px solid #dcfce7; padding:16px; border-radius:12px; margin-bottom:20px;">
          <span style="display:block; font-size:11px; color:#16a34a; font-weight:800; text-transform:uppercase; margin-bottom:4px;">Withdrawable Balance</span>
          <strong style="font-size:20px; color:#111827;">${this.state.dashboard?.wallet_balance || '1,250,000 BIF'}</strong>
        </div>
        <div class="modern-form-group">
          <label class="modern-form-label">Withdrawal Amount (BIF)</label>
          <input type="number" id="withdraw-amount" class="modern-form-control" placeholder="Min. 5,000 BIF">
        </div>
        <button id="submit-withdraw-btn" class="btn btn-green btn-full" style="padding:16px;">Request Withdrawal</button>
      </div>
    `;
    this.showModal('Withdraw Funds', html);
    document.getElementById('submit-withdraw-btn').onclick = async () => {
      const amount = document.getElementById('withdraw-amount').value;
      if (!amount || amount < 5000) return this.showToast('Minimum withdrawal is 5,000 BIF', 'warning');
      
      const btn = document.getElementById('submit-withdraw-btn');
      btn.disabled = true; btn.textContent = 'Processing...';
      
      const res = await this.fetchAPI('withdrawals', {
        method: 'POST',
        body: JSON.stringify({ amount: amount + ' BIF' })
      });
      
      if (res) {
        this.showToast('Withdrawal request submitted!', 'success');
        document.getElementById('app-modal').remove();
      } else {
        btn.disabled = false; btn.textContent = 'Request Withdrawal';
      }
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
        <img src="${p.img || 'assets/img/packages/pkg-1.jpg'}" 
             onerror="this.src='assets/img/packages/pkg-1.jpg'; this.onerror=null;" 
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
          <div style="font-size:28px; font-weight:900; color:#111827; margin-bottom:16px;">${amount}</div>
          
          <div style="background:#f8fafc; border-radius:16px; padding:16px; margin-bottom:24px;">
            <span style="display:block; font-size:12px; color:#64748b; font-weight:700; margin-bottom:2px;">Welcome Bonus</span>
            <strong style="font-size:20px; font-weight:900; color:#16a34a;">${bonus}</strong>
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

      // Fetch dynamic payment info for user's country
      const userCountry = this.state.user?.country || 'Burundi';
      
      // Fetch custom HTML payment instructions for the user's country
      let paymentStepsHTML = '';
      try {
        const pmData = await fetch(`/api/payment-methods?country=${encodeURIComponent(userCountry)}`).then(r => r.json());
        if (pmData?.data?.length > 0) {
          const pm = pmData.data[0];
          paymentStepsHTML = pm.provider || ''; // We stored the HTML instructions in the provider column
        }
      } catch(e) { console.warn('Payment method fetch failed'); }

      // Fallback if no custom instructions are configured
      if (!paymentStepsHTML.trim()) {
        if (userCountry === 'Burundi') {
          paymentStepsHTML = `1. Pfonda *163#\n2. Hitamo Kurungika\n3. Inimero: 67270398\n4. Amazina: RUKUNDO LOAUNGE\n5. Hama Wemeze`;
        } else {
          paymentStepsHTML = `Please contact support for payment instructions for ${userCountry}.`;
        }
      }

      // We use white-space: pre-wrap to automatically format their plain text just like they typed it
      const amountRaw = amount.replace(/[^0-9]/g, '');
      const formattedAmount = parseInt(amountRaw).toLocaleString() + (amount.includes('BIF') ? ' BIF' : '');

      card.innerHTML = `
        <div style="text-align:center;">
          <div style="width: 56px; height: 56px; background: #e0f2fe; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <h3 style="font-size:20px;font-weight:800;color:#0f172a;margin-bottom:8px;">Complete Payment</h3>
          <p style="font-size:13.5px;color:#64748b;margin-bottom:24px;">To activate your <strong>${name}</strong> plan</p>

          <div style="background: #f0fdf4; border: 2px dashed #4ade80; border-radius: 16px; padding: 18px; margin-bottom: 24px; position: relative;">
            <p style="font-size: 11px; color: #16a34a; font-weight: 800; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Amount Due</p>
            <p style="font-size: 32px; font-weight: 900; color: #15803d; margin: 0; letter-spacing: -0.5px;">${formattedAmount}</p>
          </div>

          <div style="text-align: left; margin-bottom: 24px;">
            <h4 style="font-size: 14px; font-weight: 800; color: #1e293b; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              Transfer Instructions
            </h4>
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:18px; white-space:pre-wrap; font-size:14.5px; line-height:1.7; color:#334155; font-weight:500;">${paymentStepsHTML}</div>
          </div>

          <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; text-align: left; border-radius: 6px; margin-bottom: 24px;">
            <p style="font-size: 12.5px; color: #92400e; margin: 0; line-height: 1.5;"><strong>Note:</strong> After completing the transfer via the instructions above, click the button below so our team can verify your payment.</p>
          </div>

          <button id="confirm-payment-btn" class="btn btn-green btn-full" style="padding:16px;font-size:16px;font-weight:800;border-radius:14px;width:100%;border:none;cursor:pointer;margin-bottom:12px; box-shadow: 0 6px 16px rgba(34, 197, 94, 0.25); transition: transform 0.2s;">I Have Sent the Money</button>
          <button id="cancel-payment-btn" style="background:none;border:none;color:#64748b;font-size:14px;font-weight:700;cursor:pointer;padding:12px; width: 100%;">Cancel & Go Back</button>
        </div>
      `;

      modal.querySelector('#cancel-payment-btn').onclick = () => {
        modal.remove(); 
      };

      modal.querySelector('#confirm-payment-btn').onclick = async () => {
        const btn = modal.querySelector('#confirm-payment-btn');
        btn.disabled = true; btn.textContent = 'Submitting...';
        const res = await this.fetchAPI('deposits',{method:'POST',body:JSON.stringify({package_name:name,amount})});
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

  setupIntersections() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.premium-card, .package-card').forEach(el => observer.observe(el));
  }
}

// Start Platform
document.addEventListener('DOMContentLoaded', () => { window.app = new SolarApp(); });
