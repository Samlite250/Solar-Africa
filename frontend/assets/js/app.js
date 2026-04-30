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

        <div class="section-block">
          <div class="section-block-header">
            <h3>Recent Activity</h3>
            <a href="#" class="view-all-link">View all</a>
          </div>
          <div class="activity-list" id="activity-list"></div>
        </div>
      `,
      packages: `
        <div class="page-header-plain" style="padding: 20px 16px; text-align: center;">
          <h2 style="font-size: 22px; font-weight: 800;">Packages</h2>
        </div>
        <div class="pkg-list-vertical" id="pkg-list-vertical"></div>
      `,
      team: `
        <div class="page-header-plain" style="padding: 20px 16px; display: flex; align-items: center; gap: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="window.location.hash='#dashboard'"><path d="M15 18l-6-6 6-6"/></svg>
          <h2 style="font-size: 20px; font-weight: 800;">Team / Referral</h2>
        </div>
        <div class="section-block">
          <div class="ref-card-modern">
            <p style="font-size: 14px; font-weight: 700; margin-bottom: 12px; color: #374151;">My Referral Link</p>
            <div class="ref-link-display">
              <span id="ref-link-text">https://solarafrica.com/ref/USER</span>
              <button class="btn-copy-small" onclick="window.app.copyRef()">Copy</button>
              <input type="hidden" id="ref-link" value="" />
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 32px;">
            <div class="dash-sub-item" style="text-align: center;">
              <span style="font-size: 11px;">Referrals</span>
              <strong id="ref-count" style="font-size: 18px;">0</strong>
            </div>
            <div class="dash-sub-item" style="text-align: center;">
              <span style="font-size: 11px;">Active</span>
              <strong id="ref-active" style="font-size: 18px;">0</strong>
            </div>
            <div class="dash-sub-item" style="text-align: center; border-color: #16a34a;">
              <span style="font-size: 11px; color: #16a34a;">Earnings</span>
              <strong id="ref-bonus" style="font-size: 14px; color: #16a34a;">0 BIF</strong>
            </div>
          </div>

          <p style="font-size: 15px; font-weight: 800; margin-bottom: 4px;">Invite Your Friends</p>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Share your link and start earning together.</p>
          
          <div style="display: flex; gap: 10px; margin-bottom: 40px;">
            <button class="invite-btn whatsapp" onclick="window.app.shareWhatsApp()" style="flex: 1; background: #16a34a; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;">
               <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
               WhatsApp
            </button>
            <button class="invite-btn telegram" onclick="window.app.shareTelegram()" style="flex: 1; background: #3b82f6; color: white; border: none; padding: 12px; border-radius: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px;">
               <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
               Telegram
            </button>
            <button class="invite-btn more" onclick="window.app.shareMore()" style="background: #f1f5f9; color: #475569; border: none; padding: 12px; border-radius: 12px; font-weight: 700;">
               More
            </button>
          </div>

          <p style="font-size: 15px; font-weight: 800; margin-bottom: 16px;">Top Referrals</p>
          <div id="top-referrals-list" class="top-referrals-list"></div>
        </div>
      `,
      profile: `
        <div class="page-header-plain" style="padding: 20px 16px; display: flex; align-items: center; gap: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" onclick="window.location.hash='#dashboard'"><path d="M15 18l-6-6 6-6"/></svg>
          <h2 style="font-size: 20px; font-weight: 800;">My Profile</h2>
        </div>
        <div class="profile-hero">
          <img id="profile-avatar" src="https://ui-avatars.com/api/?name=User&size=200&background=0b6cff&color=fff" alt="Avatar" class="profile-avatar-img">
          <h2 id="profile-name" class="profile-name">Member User</h2>
          <p id="profile-phone" class="profile-phone">+257 60 000 000</p>
          <div class="profile-country">
            <img id="profile-flag" src="https://flagcdn.com/w20/bi.png" alt="Burundi" style="width:20px;height:14px;border-radius:2px;">
            <span id="profile-country-name">Burundi</span>
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
      case 'home':      this.animateLandingStats(); this.hydrateLandingPackages(); break;
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
        const phone = document.getElementById('phone').value.trim();
        const country = document.getElementById('country').value;
        const password = document.getElementById('password').value;
        if (btn) { btn.disabled = true; btn.textContent = 'Creating account...'; }
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, country, password })
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
      { name: 'Mono Starter', amount: '80,000 BIF', bonus: '210,000 BIF', img: 'https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Poly Basic', amount: '120,000 BIF', bonus: '320,000 BIF', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80' },
      { name: 'Thin Film', amount: '160,000 BIF', bonus: '450,000 BIF', img: 'https://images.pexels.com/photos/433333/pexels-photo-433333.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Off-Grid Lite', amount: '200,000 BIF', bonus: '600,000 BIF', img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&q=80' },
      { name: 'Hybrid Lite', amount: '240,000 BIF', bonus: '800,000 BIF', img: 'https://images.pexels.com/photos/2800839/pexels-photo-2800839.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Grid-Tied Lite', amount: '280,000 BIF', bonus: '1,000,000 BIF', img: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=400&q=80' },
      { name: 'Solar Storage', amount: '320,000 BIF', bonus: '1,300,000 BIF', img: 'https://images.pexels.com/photos/159397/pexels-photo-159397.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Smart Solar', amount: '360,000 BIF', bonus: '1,700,000 BIF', img: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&q=80' },
      { name: 'PV Entry', amount: '400,000 BIF', bonus: '2,100,000 BIF', img: 'https://images.pexels.com/photos/4254898/pexels-photo-4254898.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Basic', amount: '440,000 BIF', bonus: '2,500,000 BIF', img: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&q=80' },
      { name: 'PV Standard', amount: '480,000 BIF', bonus: '3,000,000 BIF', img: 'https://images.pexels.com/photos/159394/pexels-photo-159394.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Plus', amount: '520,000 BIF', bonus: '3,600,000 BIF', img: 'https://images.unsplash.com/photo-1592833159155-c62df1b65634?w=400&q=80' },
      { name: 'PV Pro', amount: '560,000 BIF', bonus: '4,200,000 BIF', img: 'https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Max', amount: '600,000 BIF', bonus: '4,800,000 BIF', img: 'https://images.unsplash.com/photo-1559302995-f0a1bc19e51f?w=400&q=80' },
      { name: 'Off-Grid Pro', amount: '640,000 BIF', bonus: '5,200,000 BIF', img: 'https://images.pexels.com/photos/2990644/pexels-photo-2990644.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Hybrid Pro', amount: '680,000 BIF', bonus: '5,600,000 BIF', img: 'https://images.unsplash.com/photo-1611365892117-00ac5efdf03f?w=400&q=80' },
      { name: 'Grid-Tied Pro', amount: '720,000 BIF', bonus: '6,000,000 BIF', img: 'https://images.pexels.com/photos/37728/pexels-photo-37728.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Battery', amount: '760,000 BIF', bonus: '6,400,000 BIF', img: 'https://images.unsplash.com/photo-1516937622594-c8c7f769d7a7?w=400&q=80' },
      { name: 'Storage Plus', amount: '800,000 BIF', bonus: '6,800,000 BIF', img: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Smart Hybrid', amount: '840,000 BIF', bonus: '7,100,000 BIF', img: 'https://images.unsplash.com/photo-1501183007981-d4a019f5c93c?w=400&q=80' },
      { name: 'PV Ultra', amount: '880,000 BIF', bonus: '7,400,000 BIF', img: 'https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Array', amount: '920,000 BIF', bonus: '7,600,000 BIF', img: 'https://images.unsplash.com/photo-1473341304179-c14f39e3b981?w=400&q=80' },
      { name: 'Solar Plant', amount: '960,000 BIF', bonus: '7,800,000 BIF', img: 'https://images.pexels.com/photos/159375/pexels-photo-159375.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Commercial Solar', amount: '1,000,000 BIF', bonus: '8,000,000 BIF', img: 'https://images.unsplash.com/photo-1581094851215-630978918174?w=400&q=80' }
    ];

    const finalData = data && data.length >= 24 ? data : mockPkgs;

    list.innerHTML = finalData.map((p, i) => `
      <div class="pkg-item-row" onclick="window.app.showInvestModal('${p.id || i}','${p.name}','${p.amount}','${p.bonus}','${p.img}')">
        <div style="position:relative;">
          <img src="${p.img || 'assets/img/packages/pkg-1.jpg'}" 
               onerror="this.src='assets/img/packages/pkg-1.jpg'; this.onerror=null;" 
               class="pkg-item-img" alt="${p.name}">
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

  // --- TEAM HYDRATION ---

  async hydrateTeam() {
    const data = await this.fetchAPI('team');
    const team = data && !Array.isArray(data) ? data : null;
    const userId = this.state.user?.id || 'SAMDEV';
    const baseUrl = 'https://solarafrica.com';

    const refLinkInput = document.getElementById('ref-link');
    const refLinkText = document.getElementById('ref-link-text');
    const fullLink = `${baseUrl}/ref/${userId}`;
    if (refLinkInput) refLinkInput.value = fullLink;
    if (refLinkText) refLinkText.textContent = fullLink;

    this.updateElement('ref-count', team?.referrals ?? '128');
    this.updateElement('ref-active', team?.activeInvestors ?? '96');
    this.updateElement('ref-bonus', team?.referralBonus ?? '1,450,000 BIF');

    const topList = document.getElementById('top-referrals-list');
    if (topList) {
      const mockTops = [
        { name: 'Jean N.', amount: '2,350,000 BIF' },
        { name: 'Divine M.', amount: '1,890,000 BIF' },
        { name: 'Samuel K.', amount: '1,250,000 BIF' }
      ];
      const tops = team?.topReferrals || mockTops;
      topList.innerHTML = tops.map((t, i) => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px; background:#f8fafc; border-radius:12px; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-weight:800; color:#64748b; width:20px;">${i+1}.</span>
            <span style="font-weight:700; color:#1e293b;">${t.name}</span>
          </div>
          <span style="font-weight:800; color:#1e293b;">${t.amount}</span>
        </div>`).join('');
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
      
      const country = this.state.user.country || 'Burundi';
      this.updateElement('profile-country-name', country);
      
      const flagMap = {
        'Burundi': 'bi', 'Kenya': 'ke', 'Uganda': 'ug', 'Rwanda': 'rw', 'Tanzania': 'tz'
      };
      const flagCode = flagMap[country] || 'bi';
      const flagImg = document.getElementById('profile-flag');
      if (flagImg) flagImg.src = `https://flagcdn.com/w20/${flagCode}.jpg`;
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
      { name: 'Poly Basic', amount: '120,000 BIF', bonus: '320,000 BIF', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80' },
      { name: 'Thin Film', amount: '160,000 BIF', bonus: '450,000 BIF', img: 'https://images.pexels.com/photos/433333/pexels-photo-433333.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Off-Grid Lite', amount: '200,000 BIF', bonus: '600,000 BIF', img: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=400&q=80' },
      { name: 'Hybrid Lite', amount: '240,000 BIF', bonus: '800,000 BIF', img: 'https://images.pexels.com/photos/2800839/pexels-photo-2800839.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Grid-Tied Lite', amount: '280,000 BIF', bonus: '1,000,000 BIF', img: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=400&q=80' },
      { name: 'Solar Storage', amount: '320,000 BIF', bonus: '1,300,000 BIF', img: 'https://images.pexels.com/photos/159397/pexels-photo-159397.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Smart Solar', amount: '360,000 BIF', bonus: '1,700,000 BIF', img: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?w=400&q=80' },
      { name: 'PV Entry', amount: '400,000 BIF', bonus: '2,100,000 BIF', img: 'https://images.pexels.com/photos/4254898/pexels-photo-4254898.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Basic', amount: '440,000 BIF', bonus: '2,500,000 BIF', img: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&q=80' },
      { name: 'PV Standard', amount: '480,000 BIF', bonus: '3,000,000 BIF', img: 'https://images.pexels.com/photos/159394/pexels-photo-159394.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Plus', amount: '520,000 BIF', bonus: '3,600,000 BIF', img: 'https://images.unsplash.com/photo-1592833159155-c62df1b65634?w=400&q=80' },
      { name: 'PV Pro', amount: '560,000 BIF', bonus: '4,200,000 BIF', img: 'https://images.pexels.com/photos/2850347/pexels-photo-2850347.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'PV Max', amount: '600,000 BIF', bonus: '4,800,000 BIF', img: 'https://images.unsplash.com/photo-1559302995-f0a1bc19e51f?w=400&q=80' },
      { name: 'Off-Grid Pro', amount: '640,000 BIF', bonus: '5,200,000 BIF', img: 'https://images.pexels.com/photos/2990644/pexels-photo-2990644.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Hybrid Pro', amount: '680,000 BIF', bonus: '5,600,000 BIF', img: 'https://images.unsplash.com/photo-1611365892117-00ac5efdf03f?w=400&q=80' },
      { name: 'Grid-Tied Pro', amount: '720,000 BIF', bonus: '6,000,000 BIF', img: 'https://images.pexels.com/photos/37728/pexels-photo-37728.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Battery', amount: '760,000 BIF', bonus: '6,400,000 BIF', img: 'https://images.unsplash.com/photo-1516937622594-c8c7f769d7a7?w=400&q=80' },
      { name: 'Storage Plus', amount: '800,000 BIF', bonus: '6,800,000 BIF', img: 'https://images.pexels.com/photos/1108101/pexels-photo-1108101.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Smart Hybrid', amount: '840,000 BIF', bonus: '7,100,000 BIF', img: 'https://images.unsplash.com/photo-1501183007981-d4a019f5c93c?w=400&q=80' },
      { name: 'PV Ultra', amount: '880,000 BIF', bonus: '7,400,000 BIF', img: 'https://images.pexels.com/photos/2422265/pexels-photo-2422265.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Solar Array', amount: '920,000 BIF', bonus: '7,600,000 BIF', img: 'https://images.unsplash.com/photo-1473341304179-c14f39e3b981?w=400&q=80' },
      { name: 'Solar Plant', amount: '960,000 BIF', bonus: '7,800,000 BIF', img: 'https://images.pexels.com/photos/159375/pexels-photo-159375.jpeg?auto=compress&cs=tinysrgb&w=400' },
      { name: 'Commercial Solar', amount: '1,000,000 BIF', bonus: '8,000,000 BIF', img: 'https://images.unsplash.com/photo-1581094851215-630978918174?w=400&q=80' }
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

  showInvestModal(id, name, amount, bonus) {
    const existing = document.getElementById('invest-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'invest-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:white;z-index:9999;display:flex;flex-direction:column;overflow-y:auto;animation: slideUp 0.3s ease-out;';
    
    modal.innerHTML = `
      <div style="padding: 20px 16px; position: absolute; top: 0; left: 0; z-index: 10;">
        <div onclick="document.getElementById('invest-modal').remove()" style="width:40px; height:40px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.1); cursor:pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </div>
      </div>

      <img src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80" class="pkg-detail-hero" alt="${name}" style="width:100%; height:300px; object-fit:cover;">
      
      <div class="pkg-detail-card" style="margin-top:-40px; background:white; border-radius:32px 32px 0 0; padding:32px 24px; flex:1; position:relative; box-shadow:0 -10px 30px rgba(0,0,0,0.05);">
        <div style="text-align:center;">
          <div style="display:inline-block; position:relative; margin-bottom:16px;">
            <div style="width:80px; height:80px; background:#fff; border-radius:50%; box-shadow:0 10px 25px rgba(0,0,0,0.1); display:flex; align-items:center; justify-content:center;">
              <img src="https://cdn-icons-png.flaticon.com/512/6941/6941697.png" style="width:40px;" alt="Crown">
            </div>
          </div>
          <h3 style="font-size:18px; font-weight:800; color:#374151; margin-bottom:8px;">${name}</h3>
          <div style="font-size:32px; font-weight:900; color:#111827; margin-bottom:24px;">${amount}</div>
          
          <div style="background:#f8fafc; border-radius:20px; padding:20px; margin-bottom:32px;">
            <span style="display:block; font-size:13px; color:#64748b; font-weight:700; margin-bottom:4px;">Welcome Bonus</span>
            <strong style="font-size:24px; font-weight:900; color:#16a34a;">${bonus}</strong>
          </div>

          <div style="text-align:left; margin-bottom:40px;">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; font-size:14px; font-weight:600; color:#4b5563;">
              <div style="width:22px; height:22px; background:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span>Instant welcome bonus</span>
            </div>
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; font-size:14px; font-weight:600; color:#4b5563;">
              <div style="width:22px; height:22px; background:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span>Secure & trusted platform</span>
            </div>
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px; font-size:14px; font-weight:600; color:#4b5563;">
              <div style="width:22px; height:22px; background:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span>Fast approval</span>
            </div>
            <div style="display:flex; align-items:center; gap:12px; font-size:14px; font-weight:600; color:#4b5563;">
              <div style="width:22px; height:22px; background:#16a34a; border-radius:50%; display:flex; align-items:center; justify-content:center;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <span>24/7 support</span>
            </div>
          </div>

          <button id="activate-now-btn" class="btn btn-green btn-full" style="padding:18px; font-size:16px; font-weight:800; border-radius:16px; width:100%; border:none; cursor:pointer;">
            Activate Now
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#activate-now-btn').onclick = async () => {
      const btn = modal.querySelector('#activate-now-btn');
      btn.disabled = true; btn.textContent = 'Processing...';
      const res = await this.fetchAPI('deposits',{method:'POST',body:JSON.stringify({package_name:name,amount})});
      if (res) {
        this.showToast(`${name} Activated! Awaiting approval.`,'success');
        setTimeout(()=>modal.remove(), 1000);
      } else {
        btn.disabled = false; btn.textContent = 'Activate Now';
      }
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
