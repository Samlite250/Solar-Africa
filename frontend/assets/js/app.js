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
    localStorage.setItem('solar_token', data.token);
    localStorage.setItem('solar_user', JSON.stringify(data.user));
    this.state.token = data.token;
    this.state.user = data.user;
    this.showToast('Welcome to Solar Africa!');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
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
          <div class="pkg-list-img" style="background-image: url('${pkg.image}');"></div>
          <div class="pkg-list-content">
            <h4>${pkg.name}</h4>
            <div class="price">${pkg.amount}</div>
            <div class="bonus">Bonus <span>${pkg.bonus}</span></div>
          </div>
          <div style="padding: 16px; display: flex; align-items: center;">
            <a href="${this.state.token ? 'dashboard.html' : 'login.html'}" class="btn btn-green" style="padding: 8px 16px; font-size: 13px;">Invest</a>
          </div>
        </div>
      `).join('');
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
    const data = await this.fetchAPI('admin/stats');
    if (!data) return;

    this.updateElement('admin-total-users', data.stats.users);
    this.updateElement('admin-active-pkgs', `${data.stats.packages} active`);
    this.updateElement('admin-total-deposits', data.stats.deposits);
    this.updateElement('admin-total-withdrawals', data.stats.withdrawals);
    
    // BI Charts
    if (data.analytics) {
      this.setupAdminCharts(data.analytics);
    }

    // Populate tables with professional rows
    const depositsTable = document.getElementById('admin-deposits-table');
    if (depositsTable && data.deposits) {
      depositsTable.innerHTML = data.deposits.map(d => `
        <tr>
          <td>
            <div style="display: flex; flex-direction: column;">
              <span style="font-weight: 700;">${d.user_name}</span>
              <span style="font-size: 11px; color: var(--admin-text-muted);">ID: #${d.id}</span>
            </div>
          </td>
          <td>${d.amount}</td>
          <td>${d.package_name || 'N/A'}</td>
          <td><span class="status-badge ${d.status.toLowerCase()}">${d.status.toLowerCase()}</span></td>
          <td>
            ${d.status.toLowerCase() === 'pending' ? `
              <div style="display: flex; gap: 8px;">
                <button class="btn-admin btn-admin-primary btn-admin-action" data-id="${d.id}" data-action="approve">Approve</button>
                <button class="btn-admin btn-admin-outline btn-admin-action" data-id="${d.id}" data-action="reject" style="color: var(--admin-danger); border-color: #fee2e2;">Reject</button>
              </div>
            ` : '<span style="font-size: 11px; color: var(--admin-text-muted);">Locked</span>'}
          </td>
        </tr>
      `).join('');

      // Add Action Listeners
      depositsTable.querySelectorAll('.btn-admin-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const { id, action } = btn.dataset;
          this.showToast(`Operation ${id} ${action}d successfully`);
          const badge = btn.closest('tr').querySelector('.status-badge');
          badge.className = `status-badge ${action === 'approve' ? 'approved' : 'rejected'}`;
          badge.textContent = action === 'approve' ? 'approved' : 'rejected';
          btn.parentElement.innerHTML = '<span style="font-size: 11px; color: var(--admin-text-muted);">Completed</span>';
        });
      });
    }

    const usersTable = document.getElementById('admin-users-table');
    if (usersTable && data.users) {
      usersTable.innerHTML = data.users.map(u => `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 32px; height: 32px; background: #eef5ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--admin-primary); font-weight: 700;">${u.name.charAt(0)}</div>
              <span>${u.name}</span>
            </div>
          </td>
          <td>${u.country}</td>
          <td><span class="status-badge approved">${u.status}</span></td>
        </tr>
      `).join('');
    }

    // Full Management Views
    this.hydrateUserManagement(data.users);
    this.hydratePackageManagement(data.packages);
    this.hydrateTransactionLedger(data.deposits);
  }

  setupAdminNavigation() {
    const links = document.querySelectorAll('.sidebar-nav-link[data-target]');
    const views = document.querySelectorAll('.admin-view');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.dataset.target;

        // Update UI
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        views.forEach(v => {
          v.style.display = v.id === target ? 'block' : 'none';
        });
      });
    });
  }

  hydrateUserManagement(users) {
    const list = document.getElementById('full-user-list');
    if (!list || !users) return;

    list.innerHTML = users.map(u => `
      <tr>
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 700;">${u.name}</span>
            <span style="font-size: 11px; color: var(--admin-text-muted);">ID: #${u.id}</span>
          </div>
        </td>
        <td>${u.email || 'N/A'}</td>
        <td>Apr 2026</td>
        <td>1,250,000 BIF</td>
        <td><span class="status-badge approved">Active</span></td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn-admin btn-admin-outline" onclick="window.app.showToast('User edit opened')">Edit</button>
            <button class="btn-admin btn-admin-outline" style="color: var(--admin-danger);" onclick="window.app.showToast('User suspended')">Suspend</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  hydratePackageManagement(packages) {
    const list = document.getElementById('admin-package-mgmt');
    if (!list || !packages) return;

    list.innerHTML = packages.map(p => `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${p.amount}</td>
        <td>${p.bonus}</td>
        <td>${p.active || 0}</td>
        <td><span class="status-badge approved">Active</span></td>
        <td>
          <div style="display: flex; gap: 8px;">
            <button class="btn-admin btn-admin-outline" onclick="window.app.showToast('Package edit opened')">Edit</button>
            <button class="btn-admin btn-admin-outline" style="color: var(--admin-danger);" onclick="window.app.showToast('Package hidden')">Hide</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  hydrateTransactionLedger(deposits) {
    const list = document.getElementById('full-transaction-ledger');
    if (!list || !deposits) return;

    list.innerHTML = deposits.map(d => `
      <tr>
        <td>#TX-${d.id}</td>
        <td>Deposit</td>
        <td>${d.user_name}</td>
        <td>${d.amount}</td>
        <td>Apr 26, 2026</td>
        <td><span class="status-badge ${d.status.toLowerCase()}">${d.status}</span></td>
      </tr>
    `).join('');
  }

  openPackageModal() {
    this.showToast('Package creation modal would open here in full version.');
  }

  setupAdminCharts(analytics) {
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
      new Chart(revenueCtx, {
        type: 'line',
        data: {
          labels: analytics.revenueGrowth.map(d => d.month),
          datasets: [{
            label: 'Monthly Revenue',
            data: analytics.revenueGrowth.map(d => d.value),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#3b82f6',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0,0,0,0.05)' },
              ticks: { font: { size: 10 } }
            },
            x: {
              grid: { display: false },
              ticks: { font: { size: 10 } }
            }
          }
        }
      });
    }

    const packageCtx = document.getElementById('packageChart')?.getContext('2d');
    if (packageCtx) {
      new Chart(packageCtx, {
        type: 'doughnut',
        data: {
          labels: analytics.packageDistribution.map(d => d.name),
          datasets: [{
            data: analytics.packageDistribution.map(d => d.count),
            backgroundColor: [
              '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'
            ],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { boxWidth: 12, font: { size: 11 } }
            }
          },
          cutout: '70%'
        }
      });
    }

    const userCtx = document.getElementById('userChart')?.getContext('2d');
    if (userCtx) {
      new Chart(userCtx, {
        type: 'bar',
        data: {
          labels: analytics.userGrowth.map(d => d.month),
          datasets: [{
            label: 'Total Users',
            data: analytics.userGrowth.map(d => d.value),
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }
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
