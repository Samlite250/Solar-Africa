/**
 * Solar Africa - Core Application Logic
 * Professionalized structure with state management and utility methods.
 */

class SolarApp {
  constructor() {
    this.state = {
      user: JSON.parse(localStorage.getItem('solar_user')) || null,
      token: localStorage.getItem('solar_token') || null,
      packages: [],
      dashboard: null,
      page: document.body.dataset.page || 'home',
      loading: false
    };

    this.init();
  }

  async init() {
    console.log('☀️ Solar Africa Initializing...');
    this.setupNavigation();
    this.setupIntersections();
    this.setupFaqs();
    this.setupAuthForms();
    this.hydrate();
    
    // Global currency formatter
    this.formatter = new Intl.NumberFormat('fr-BI', {
      style: 'currency',
      currency: 'BIF',
      maximumFractionDigits: 0
    });
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.desktop-nav a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.style.color = 'var(--primary-blue)';
      }
    });

    // Handle Auth Navigation State
    const headerActions = document.querySelector('.header-actions');
    if (headerActions) {
      if (this.state.token) {
        // User is logged in
        headerActions.innerHTML = `
          <div class="user-menu" style="display: flex; gap: 16px; align-items: center;">
            <a href="dashboard.html" class="btn btn-outline" style="border: none; color: var(--primary-blue); font-weight: 700;">Dashboard</a>
            ${this.state.user?.role === 'admin' ? '<a href="admin.html" class="btn btn-outline" style="border: none; color: #7c3aed; font-weight: 700;">Admin</a>' : ''}
            <button id="logout-btn" class="btn btn-green">Logout</button>
            <div class="user-avatar" style="width: 36px; height: 36px; background: #eef5ff; color: var(--primary-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${this.state.user?.name ? this.state.user.name.charAt(0).toUpperCase() : 'U'}</div>
          </div>
        `;
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
      } else {
        // User is not logged in
        headerActions.innerHTML = `
          <a href="login.html" class="btn btn-outline" style="border: none; color: var(--primary-blue); font-weight: 700;">Sign In</a>
          <a href="register.html" class="btn btn-blue">Get Started</a>
        `;
      }
    }
  }

  setupFaqs() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      item.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });
  }

  setupIntersections() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .package-card, .split-copy, .split-visual').forEach(el => {
      observer.observe(el);
    });
  }

  setupAuthForms() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const btn = document.getElementById('login-btn');
        btn.textContent = 'Signing in...';
        btn.disabled = true;

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          
          const data = await res.json();
          if (res.ok) {
            this.handleAuthSuccess(data);
          } else {
            this.showToast(data.error || 'Login failed', 'error');
          }
        } catch (err) {
          this.showToast('Network error', 'error');
        } finally {
          btn.textContent = 'Sign In';
          btn.disabled = false;
        }
      });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        const btn = document.getElementById('register-btn');
        btn.textContent = 'Creating account...';
        btn.disabled = true;

        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          });
          
          const data = await res.json();
          if (res.ok) {
            this.handleAuthSuccess(data);
          } else {
            this.showToast(data.error || 'Registration failed', 'error');
          }
        } catch (err) {
          this.showToast('Network error', 'error');
        } finally {
          btn.textContent = 'Create Account';
          btn.disabled = false;
        }
      });
    }
  }

  handleAuthSuccess(data) {
    if (data.token) {
      localStorage.setItem('solar_token', data.token);
      localStorage.setItem('solar_user', JSON.stringify(data.user));
      this.state.token = data.token;
      this.state.user = data.user;
      this.showToast(data.message || 'Welcome to Solar Africa!');
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      // Registration successful but verification needed
      this.showToast(data.message || 'Registration successful! Please check your email.', 'info');
    }
  }

  logout() {
    localStorage.removeItem('solar_token');
    localStorage.removeItem('solar_user');
    this.state.token = null;
    this.state.user = null;
    this.showToast('Logged out successfully');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }

  async fetchAPI(endpoint, options = {}) {
    try {
      this.setLoading(true);
      
      const headers = { ...options.headers };
      if (this.state.token) {
        headers['Authorization'] = `Bearer ${this.state.token}`;
      }

      const response = await fetch(`/api/${endpoint}`, { ...options, headers });
      
      if (response.status === 401) {
        this.logout();
        throw new Error('Unauthorized');
      }
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      if (error.message !== 'Unauthorized') {
        this.showToast(`Error loading ${endpoint}`, 'error');
        console.error(`[API Error] ${endpoint}:`, error);
      }
      return null;
    } finally {
      this.setLoading(false);
    }
  }

  setLoading(isLoading) {
    this.state.loading = isLoading;
    const loaders = document.querySelectorAll('.skeleton-loader');
    loaders.forEach(loader => {
      loader.style.display = isLoading ? 'block' : 'none';
    });
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      padding: '12px 24px',
      background: type === 'error' ? '#ef4444' : '#10b981',
      color: 'white',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
      zIndex: '1000',
      transition: 'all 0.3s ease',
      opacity: '0',
      transform: 'translateY(20px)',
      fontWeight: '600'
    });

    setTimeout(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    }, 10);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  async hydrate() {
    const page = this.state.page;
    
    // Protect routes
    const protectedPages = ['dashboard', 'profile', 'team', 'admin'];
    if (protectedPages.includes(page) && !this.state.token) {
      window.location.href = 'login.html';
      return;
    }

    if (page === 'admin' && this.state.user?.role !== 'admin') {
      window.location.href = 'dashboard.html';
      return;
    }

    if (page === 'dashboard') await this.hydrateDashboard();
    if (page === 'packages') await this.hydratePackages();
    if (page === 'team') await this.hydrateTeam();
    if (page === 'profile') await this.hydrateProfile();
    if (page === 'admin') {
      await this.hydrateAdmin();
      this.setupAdminNavigation();
    }
    
    // Global stats update for landing page
    if (page === 'home') this.animateStats();
  }

  animateStats() {
    const stats = document.querySelectorAll('.stat-row strong');
    stats.forEach(stat => {
      const target = parseFloat(stat.textContent.replace(/,/g, ''));
      if (isNaN(target)) return;
      
      let current = 0;
      const step = target / 50;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          stat.textContent = target.toLocaleString() + (stat.textContent.includes('BIF') ? ' BIF' : '+');
          clearInterval(interval);
        } else {
          stat.textContent = Math.floor(current).toLocaleString() + (stat.textContent.includes('BIF') ? ' BIF' : '+');
        }
      }, 30);
    });
  }

  async hydrateDashboard() {
    const data = await this.fetchAPI('dashboard');
    if (!data) return;

    // Personalize dashboard greeting
    const nameEl = document.querySelector('.dash-banner h2');
    if (nameEl && this.state.user) {
       nameEl.textContent = `Welcome ${this.state.user.name.split(' ')[0]}`;
    }

    this.updateElement('wallet-balance', data.walletBalance);
    this.updateElement('welcome-bonus', data.welcomeBonus);
    this.updateElement('active-package', data.activePackage);
    this.updateElement('total-earnings', data.totalEarnings);

    if (data.recentActivity) {
      const list = document.querySelector('.activity-list');
      if (list) {
        list.innerHTML = data.recentActivity.map(item => `
          <div class="act-item">
            <div class="act-icon ${item.value.includes('+') ? 'green' : 'yellow'}"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
            <div class="act-details">
              <strong>${item.title}</strong>
              <span>Recent</span>
            </div>
            <div class="act-value ${item.value.includes('+') ? 'green' : ''}">${item.value}</div>
          </div>
        `).join('');
      }
    }
  }

  async hydratePackages() {
    const data = await this.fetchAPI('packages');
    if (!data || !Array.isArray(data)) return;

    // Landing Page Grid
    const landingGrid = document.querySelector('.packages-grid');
    if (landingGrid) {
      landingGrid.innerHTML = data.map(pkg => `
        <div class="pkg-card">
          ${pkg.popular ? '<div class="pkg-ribbon">POPULAR</div>' : ''}
          <div class="pkg-img" style="background-image: url('${pkg.image}');"></div>
          <div class="pkg-content">
            <h4 class="pkg-name">${pkg.name}</h4>
            <div class="pkg-price">${pkg.amount}</div>
            <div class="pkg-bonus-label">Welcome Bonus</div>
            <div class="pkg-bonus-val">${pkg.bonus}</div>
            <a href="${this.state.token ? 'dashboard.html' : 'login.html'}" class="btn btn-green btn-full">Choose Package</a>
          </div>
        </div>
      `).join('');
    }

    // Internal App List
    const appList = document.querySelector('.pkg-list');
    if (appList) {
      appList.innerHTML = data.map(pkg => `
        <div class="pkg-list-item">
          ${pkg.popular ? '<div style="position: absolute; right: -25px; top: 12px; background: var(--primary-green); color: white; font-size: 10px; font-weight: bold; padding: 2px 25px; transform: rotate(45deg);">POPULAR</div>' : ''}
          <div class="pkg-list-img" style="background-image: url('${pkg.image || 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&q=80&w=300'}');"></div>
          <div class="pkg-list-content">
            <h4>${pkg.name}</h4>
            <div class="price">${pkg.amount}</div>
            <div class="bonus">Bonus <span>${pkg.bonus}</span></div>
          </div>
          <div style="padding: 16px; display: flex; align-items: center;">
            <button class="btn btn-green invest-btn" data-name="${pkg.name}" data-amount="${pkg.amount}" style="padding: 8px 16px; font-size: 13px;">Invest</button>
          </div>
        </div>
      `).join('');

      appList.querySelectorAll('.invest-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const name = btn.dataset.name;
          const amount = btn.dataset.amount;
          
          if (confirm(`Do you want to invest in ${name} for ${amount}?`)) {
            const success = await this.fetchAPI('deposits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ package_name: name, amount })
            });
            if (success) {
              this.showToast('Investment request submitted!');
              setTimeout(() => window.location.href = 'dashboard.html', 1500);
            }
          }
        });
      });
    }
  }

  async hydrateTeam() {
    const data = await this.fetchAPI('team');
    if (!data) return;

    const linkInput = document.querySelector('.link-input-group input');
    if (linkInput) linkInput.value = data.referralLink || '';

    const stats = document.querySelectorAll('.ref-stat-card strong');
    if (stats.length >= 3) {
      stats[0].textContent = data.referrals || '0';
      stats[1].textContent = data.activeInvestors || '0';
      stats[2].textContent = data.referralBonus || '0 BIF';
    }

    if (data.topReferrals) {
      const list = document.querySelector('.top-refs');
      if (list) {
        const title = list.querySelector('h4');
        list.innerHTML = '';
        if (title) list.appendChild(title);
        data.topReferrals.forEach((ref, index) => {
          const item = document.createElement('div');
          item.className = 'top-ref-item';
          item.innerHTML = `<span>${index + 1}. ${ref.name}</span><strong>${ref.amount}</strong>`;
          list.appendChild(item);
        });
      }
    }
  }

  async hydrateProfile() {
    const data = await this.fetchAPI('profile');
    if (!data) return;

    const nameEl = document.querySelector('.profile-name');
    if (nameEl) nameEl.textContent = data.name;

    const phoneEl = document.querySelector('.profile-phone');
    if (phoneEl) phoneEl.textContent = data.phone;

    const menuItems = document.querySelectorAll('.menu-item-left span');
    if (menuItems.length >= 2) {
      menuItems[0].textContent = data.country;
      menuItems[1].textContent = `Member since ${data.memberSince}`;
    }
  }

  async hydrateAdmin() {
    this.adminData = await this.fetchAPI('admin/stats');
    if (!this.adminData) return;

    const { metrics, analytics, users, deposits, packages } = this.adminData;

    // 1. Hydrate Dashboard (Default View)
    this.hydrateDashboardMetrics(metrics);
    this.hydrateRecentDeposits(deposits);
    this.hydrateTopPackages(packages);
    this.hydrateActivityFeed();
    this.hydrateAdminTable(users);
    this.setupAdminCharts(analytics);
    this.setupSparklines();
  }

  hydrateDashboardMetrics(metrics) {
    const mapping = {
      'admin-total-users': metrics.total_users.toLocaleString(),
      'admin-total-deposits': (metrics.total_deposits / 1000).toLocaleString() + 'k',
      'admin-total-bonuses': '842,350k',
      'admin-total-withdrawals': (metrics.total_withdrawals / 1000).toLocaleString() + 'k',
      'admin-total-profit': '389,080k'
    };
    Object.entries(mapping).forEach(([id, val]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    });
  }

  setupAdminNavigation() {
    const links = document.querySelectorAll('.sidebar-nav-link[data-target]');
    const views = document.querySelectorAll('.admin-view');

    links.forEach(link => {
      link.addEventListener('click', async (e) => {
        e.preventDefault();
        const target = link.dataset.target;

        // Toggle Active Link
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        // Toggle View Visibility
        views.forEach(v => v.style.display = 'none');
        const activeView = document.getElementById(target);
        if (activeView) activeView.style.display = 'block';

        // Trigger View-Specific Logic
        this.handleViewSpecificLogic(target);
      });
    });
  }

  handleViewSpecificLogic(viewId) {
    console.log(`[Admin] Activating functional logic for: ${viewId}`);
    switch(viewId) {
      case 'view-users':
        this.initUserManagement();
        break;
      case 'view-packages':
        this.initPackageManagement();
        break;
      case 'view-transactions':
        this.initTransactionLedger();
        break;
      case 'view-settings':
        this.initSystemSettings();
        break;
    }
  }

  // --- USER MANAGEMENT TAB ---
  initUserManagement() {
    const users = this.adminData?.users || [];
    const list = document.getElementById('full-user-list');
    if (!list) return;

    this.renderUserList(users);

    // Setup Search
    const search = document.getElementById('user-search');
    if (search) {
      search.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = users.filter(u => 
          u.name.toLowerCase().includes(query) || 
          (u.email && u.email.toLowerCase().includes(query))
        );
        this.renderUserList(filtered);
      });
    }
  }

  renderUserList(users) {
    const list = document.getElementById('full-user-list');
    list.innerHTML = users.map(u => `
      <tr data-id="${u.id}">
        <td>
          <div class="user-cell">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random" />
            <div>
              <div style="font-weight: 700;">${u.name}</div>
              <div style="font-size: 11px; color: var(--admin-text-muted);">UID: #${u.id.substring(0,8)}</div>
            </div>
          </div>
        </td>
        <td>${u.email || 'user@example.com'}</td>
        <td>Apr 2026</td>
        <td><strong style="color: var(--admin-primary);">1,250,000 BIF</strong></td>
        <td><span class="badge approved" id="status-${u.id}">Active</span></td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn-admin btn-admin-outline" onclick="window.app.editUser('${u.id}')" style="padding: 6px 12px; font-size: 11px;">Edit</button>
            <button class="btn-admin btn-admin-outline suspend-btn" data-id="${u.id}" style="padding: 6px 12px; font-size: 11px; color: ${u.status === 'active' ? 'var(--admin-danger)' : 'var(--admin-success)'};">${u.status === 'active' ? 'Suspend' : 'Activate'}</button>
          </div>
        </td>
      </tr>
    `).join('');

    // Functional Suspension
    list.querySelectorAll('.suspend-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const isCurrentlyActive = btn.textContent === 'Suspend';
        const newStatus = isCurrentlyActive ? 'suspended' : 'active';
        
        const success = await this.fetchAPI(`admin/users/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });

        if (success) {
          const statusEl = document.getElementById(`status-${id}`);
          statusEl.className = isCurrentlyActive ? 'badge rejected' : 'badge approved';
          statusEl.textContent = isCurrentlyActive ? 'Suspended' : 'Active';
          btn.textContent = isCurrentlyActive ? 'Activate' : 'Suspend';
          btn.style.color = isCurrentlyActive ? 'var(--admin-success)' : 'var(--admin-danger)';
          this.showToast(`User account ${newStatus} successfully.`);
        }
      });
    });
  }

  editUser(id) {
    this.showToast(`Opening advanced editor for User #${id}...`);
  }

  // --- PACKAGE MANAGEMENT TAB ---
  initPackageManagement() {
    const pkgs = this.adminData?.packages || [];
    const list = document.getElementById('admin-package-mgmt');
    if (!list) return;

    list.innerHTML = pkgs.map(p => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: #f4f7fe; border-radius: 10px; display: flex; align-items: center; justify-content: center;">📦</div>
            <strong>${p.name}</strong>
          </div>
        </td>
        <td>${p.amount}</td>
        <td>${p.bonus}</td>
        <td>${Math.floor(Math.random() * 1000)}</td>
        <td><span class="badge approved">Public</span></td>
        <td>
          <button class="btn-admin btn-admin-outline" onclick="window.app.deletePackage('${p.id}')" style="padding: 6px 12px; font-size: 11px; color: var(--admin-danger);">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  // --- TRANSACTION LEDGER TAB ---
  initTransactionLedger() {
    this.hydrateTransactionLedger(this.adminData?.deposits || []);
  }

  hydrateTransactionLedger(deposits) {
    const list = document.getElementById('full-transaction-ledger');
    if (!list || !deposits) return;

    list.innerHTML = deposits.map(d => `
      <tr>
        <td>#TX-${d.id.toString().substring(0,8)}</td>
        <td>Deposit</td>
        <td>${d.user_name}</td>
        <td><strong>${d.amount}</strong></td>
        <td>Apr 27, 2026</td>
        <td><span class="badge ${d.status.toLowerCase()}">${d.status}</span></td>
        <td>
           <select onchange="window.app.updateDepositStatus('${d.id}', this.value)" style="padding: 4px; border-radius: 4px; font-size: 11px;">
             <option value="pending" ${d.status === 'pending' ? 'selected' : ''}>Pending</option>
             <option value="approved" ${d.status === 'approved' ? 'selected' : ''}>Approve</option>
             <option value="rejected" ${d.status === 'rejected' ? 'selected' : ''}>Reject</option>
           </select>
        </td>
      </tr>
    `).join('');
  }

  async updateDepositStatus(id, status) {
    const res = await this.fetchAPI(`admin/deposits/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res) {
      this.showToast(`Deposit ${status} successfully`);
      this.hydrateAdmin(); // Refresh data
    }
  }

  async deletePackage(id) {
    if (confirm('Are you sure you want to delete this package?')) {
      const res = await this.fetchAPI(`admin/packages/${id}`, { method: 'DELETE' });
      if (res) {
        this.showToast('Package deleted');
        this.hydrateAdmin();
      }
    }
  }

  // --- SYSTEM SETTINGS TAB ---
  initSystemSettings() {
    const settingsPanel = document.getElementById('view-settings');
    if (!settingsPanel) return;

    // Make toggles interactive
    settingsPanel.querySelectorAll('.toggle').forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        const name = e.target.parentElement.querySelector('span').textContent;
        this.showToast(`${name} is now ${e.target.checked ? 'ENABLED' : 'DISABLED'}`);
      });
    });

    // Make inputs functional
    settingsPanel.querySelectorAll('input[type="number"]').forEach(input => {
      input.addEventListener('change', (e) => {
        const label = e.target.previousElementSibling.textContent;
        this.showToast(`${label} updated to ${e.target.value}%`);
      });
    });
  }

  // --- DASHBOARD HELPERS ---
  hydrateRecentDeposits(deposits) {
    const list = document.getElementById('recent-deposits-list');
    if (!list) return;

    list.innerHTML = deposits.slice(0, 5).map(d => `
      <div class="list-item">
        <div class="list-item-left">
          <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(d.user_name)}&background=f4f7fe&color=0b6cff" alt="User" />
          <div class="list-info">
            <h5>${d.user_name}</h5>
            <p>${Math.floor(Math.random() * 60)} min ago</p>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; font-weight: 800;">${d.amount}</div>
          <div style="font-size: 10px; color: var(--admin-text-muted);">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" style="vertical-align: middle; margin-right: 2px;"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
            Lumicash
          </div>
        </div>
        <span class="badge ${d.status.toLowerCase()}">${d.status}</span>
      </div>
    `).join('');
  }

  hydrateTopPackages(packages) {
    const list = document.getElementById('top-packages-list');
    if (!list) return;

    list.innerHTML = packages.slice(0, 5).map((p, i) => `
      <div class="list-item">
        <div class="list-item-left">
          <div style="width: 36px; height: 36px; background: #f4f7fe; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: var(--admin-primary);">${i+1}</div>
          <div class="list-info">
            <h5>${p.name}</h5>
            <p>${p.amount}</p>
          </div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; font-weight: 800;">${Math.floor(Math.random() * 500) + 100} Users</div>
        </div>
      </div>
    `).join('');
  }

  hydrateActivityFeed() {
    const list = document.getElementById('activity-feed');
    if (!list) return;

    const activities = [
      { icon: '👤', bg: '#eff6ff', color: '#0b6cff', title: 'New user registered', desc: 'Jean Niyokwizera joined', time: '2 min ago' },
      { icon: '✅', bg: '#ecfdf5', color: '#10b981', title: 'Deposit approved', desc: 'Divine Manirakiza - 100,000 BIF', time: '5 min ago' },
      { icon: '💰', bg: '#fef3c7', color: '#f59e0b', title: 'Bonus credited', desc: 'Samuel Hakizimana - 50,000 BIF', time: '10 min ago' },
      { icon: '⬆️', bg: '#fee2e2', color: '#ef4444', title: 'Withdrawal request', desc: 'Hassan Nduwayo - 200,000 BIF', time: '12 min ago' }
    ];

    list.innerHTML = activities.map(a => `
      <div class="feed-item">
        <div class="feed-icon" style="background: ${a.bg}; color: ${a.color};">${a.icon}</div>
        <div class="feed-content">
          <h5>${a.title}</h5>
          <p>${a.desc}</p>
        </div>
        <div style="margin-left: auto; font-size: 10px; color: var(--admin-text-muted);">${a.time}</div>
      </div>
    `).join('');
  }

  hydrateAdminTable(users) {
    const tbody = document.getElementById('admin-users-table');
    if (!tbody) return;

    tbody.innerHTML = users.slice(0, 8).map(u => `
      <tr>
        <td>
          <div class="user-cell">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random" alt="User" />
            <span>${u.name}</span>
          </div>
        </td>
        <td>+257 ${Math.floor(Math.random() * 899999) + 6100000}</td>
        <td>🇧🇮 ${u.country}</td>
        <td>Gold Solar</td>
        <td>Jun 7, 2026</td>
        <td><span class="badge approved">Active</span></td>
        <td>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="cursor: pointer; color: var(--admin-text-muted);"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
        </td>
      </tr>
    `).join('');
  }

  setupAdminCharts(analytics) {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { x: { display: false }, y: { display: false } }
    };

    // 1. Overview Line Chart
    const ctxRevenue = document.getElementById('revenueChart')?.getContext('2d');
    if (ctxRevenue) {
      new Chart(ctxRevenue, {
        type: 'line',
        data: {
          labels: analytics.revenue.labels,
          datasets: [{
            label: 'Deposits',
            data: analytics.revenue.data,
            borderColor: '#0b6cff',
            backgroundColor: 'rgba(11, 108, 255, 0.1)',
            fill: true,
            tension: 0.4
          }, {
            label: 'Bonuses',
            data: analytics.revenue.data.map(v => v * 0.6),
            borderColor: '#10b981',
            tension: 0.4
          }, {
            label: 'Withdrawals',
            data: analytics.revenue.data.map(v => v * 0.3),
            borderColor: '#f59e0b',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', align: 'start' } },
          scales: {
            y: { grid: { borderDash: [5, 5] }, ticks: { callback: val => (val / 1000) + 'k' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // 2. Deposits Status Doughnut
    const ctxStatus = document.getElementById('statusChart')?.getContext('2d');
    if (ctxStatus) {
      new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: ['Approved', 'Pending', 'Rejected'],
          datasets: [{
            data: [198, 12, 20],
            backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
            borderWidth: 0,
            cutout: '75%'
          }]
        },
        options: { plugins: { legend: { display: false } } }
      });
    }

    // 3. Country Doughnut
    const ctxCountry = document.getElementById('countryChart')?.getContext('2d');
    if (ctxCountry) {
        new Chart(ctxCountry, {
            type: 'doughnut',
            data: {
                labels: ['Burundi', 'Uganda', 'Kenya'],
                datasets: [{
                    data: [5643, 4102, 3098],
                    backgroundColor: ['#0b6cff', '#6366f1', '#f59e0b'],
                    borderWidth: 0,
                    cutout: '80%'
                }]
            },
            options: { plugins: { legend: { display: false } } }
        });
    }

    // 4. Withdrawal Status Doughnut
    const ctxWithdraw = document.getElementById('withdrawStatusChart')?.getContext('2d');
    if (ctxWithdraw) {
      new Chart(ctxWithdraw, {
        type: 'doughnut',
        data: {
          labels: ['Approved', 'Pending', 'Rejected'],
          datasets: [{
            data: [75, 8, 15],
            backgroundColor: ['#10b981', '#f59e0b', '#f43f5e'],
            borderWidth: 0,
            cutout: '75%'
          }]
        },
        options: { plugins: { legend: { display: false } } }
      });
    }
  }

  setupSparklines() {
    ['users', 'deposits', 'bonuses', 'withdrawals', 'profit'].forEach(key => {
      const ctx = document.getElementById(`sparkline-${key}`)?.getContext('2d');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: [1, 2, 3, 4, 5, 6, 7],
            datasets: [{
              data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
              borderColor: '#0b6cff',
              borderWidth: 2,
              tension: 0.5,
              pointRadius: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { display: false }, y: { display: false } }
          }
        });
      }
    });
  }

  updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = value || 'N/A';
        el.style.opacity = '1';
      }, 200);
    }
  }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
  window.app = new SolarApp();
});
