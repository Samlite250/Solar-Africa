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
    const protectedPages = ['dashboard', 'profile', 'team'];
    if (protectedPages.includes(page) && !this.state.token) {
      window.location.href = 'login.html';
      return;
    }

    if (page === 'dashboard') await this.hydrateDashboard();
    if (page === 'packages') await this.hydratePackages();
    if (page === 'team') await this.hydrateTeam();
    if (page === 'profile') await this.hydrateProfile();
    if (page === 'admin') await this.hydrateAdmin();
    
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

    const metrics = document.querySelectorAll('.metric-card strong');
    if (metrics.length >= 4 && data.stats) {
      metrics[0].textContent = data.stats.users;
      metrics[1].textContent = data.stats.packages;
      metrics[2].textContent = data.stats.deposits;
      metrics[3].textContent = data.stats.withdrawals;
    }

    // Populate tables with professional rows
    const tables = document.querySelectorAll('.admin-panel-card table tbody');
    if (tables[0] && data.deposits) {
      tables[0].innerHTML = data.deposits.map(d => `
        <tr>
          <td>${d.user_name}</td>
          <td>${d.amount}</td>
          <td>${d.package_name || 'N/A'}</td>
          <td><span class="status-badge ${d.status.toLowerCase()}">${d.status.toLowerCase()}</span></td>
          <td>
            ${d.status.toLowerCase() === 'pending' ? `
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-green btn-admin-action" data-id="${d.id}" data-action="approve" style="padding: 4px 8px; font-size: 11px;">Approve</button>
                <button class="btn btn-outline btn-admin-action" data-id="${d.id}" data-action="reject" style="padding: 4px 8px; font-size: 11px; color: #dc2626; border-color: #fecaca;">Reject</button>
              </div>
            ` : '<span style="font-size: 11px; color: var(--text-muted);">No actions</span>'}
          </td>
        </tr>
      `).join('');

      // Add Action Listeners
      tables[0].querySelectorAll('.btn-admin-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const { id, action } = btn.dataset;
          this.showToast(`Deposit ${id} ${action}d successfully (Mock)`);
          // In a real app, this would call an API then re-hydrate
          btn.closest('tr').querySelector('.status-badge').className = `status-badge ${action === 'approve' ? 'approved' : 'rejected'}`;
          btn.closest('tr').querySelector('.status-badge').textContent = action === 'approve' ? 'approved' : 'rejected';
          btn.parentElement.innerHTML = '<span style="font-size: 11px; color: var(--text-muted);">Completed</span>';
        });
      });
    }

    if (tables[1] && data.users) {
      tables[1].innerHTML = data.users.map(u => `
        <tr>
          <td>${u.name}</td>
          <td>${u.country}</td>
          <td>Apr 2026</td>
          <td><span class="status-badge approved">${u.status}</span></td>
        </tr>
      `).join('');
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
