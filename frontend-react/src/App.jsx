import { useState, useEffect } from 'react'
import './App.css'

function Dashboard() {
  return (
    <div style={{animation: 'slideUp 0.3s ease forwards'}}>
      <div className="dash-banner glass-panel" style={{margin: '20px 5%'}}>
        <div className="banner-content">
          <h2>Welcome back</h2>
          <p>Your solar investments are growing 🚀</p>
        </div>
      </div>
      <div className="metrics-grid" style={{padding: '0 5%'}}>
        <div className="m-card blue"><span>Wallet Balance</span><strong>250,000 BIF</strong></div>
        <div className="m-card green"><span>Welcome Bonus</span><strong>15,000 BIF</strong></div>
        <div className="m-card white"><span>Total Earnings</span><strong>450,000 BIF</strong></div>
        <div className="m-card white"><span>Active Package</span><strong className="text-yellow">Pro Plan</strong></div>
      </div>
    </div>
  )
}

function Packages() {
  return (
    <div style={{animation: 'slideUp 0.3s ease forwards', padding: '24px 5% 0'}}>
      <h2 style={{fontSize: '24px', fontWeight: 800, marginBottom: '4px'}}>Solar Plans</h2>
      <p style={{color: 'var(--text-muted)', fontSize: '14px'}}>Choose the best solar plan that fits your needs.</p>
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(window.location.hash.replace('#', '') || 'dashboard')

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash.replace('#', '') || 'dashboard')
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <>
      <header className="app-header">
        <div className="logo-container">
          <img src="/assets/img/logo1.png" alt="Logo" style={{height: '32px', borderRadius: '6px'}} />
          <strong style={{fontSize: '18px'}}><span className="logo-text-blue">SOLAR</span><span className="logo-text-green">AFRICA</span></strong>
        </div>
        <div className="header-meta">
          <div className="country-selector">
            <img src="https://flagcdn.com/w20/bi.png" alt="Burundi" />
            <span>Burundi (BIF)</span>
          </div>
          <img src="https://ui-avatars.com/api/?name=User&background=random" style={{width: '36px', height: '36px', borderRadius: '50%'}} />
        </div>
      </header>

      <main className="main-content">
        {route === 'dashboard' && <Dashboard />}
        {route === 'packages' && <Packages />}
        {route === 'team' && <div style={{padding: '24px'}}>Team Page Coming Soon</div>}
        {route === 'profile' && <div style={{padding: '24px'}}>Profile Page Coming Soon</div>}
      </main>

      <nav className="bottom-nav">
        <a href="#dashboard" className={`nav-item ${route === 'dashboard' ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          Dashboard
        </a>
        <a href="#packages" className={`nav-item ${route === 'packages' ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/></svg>
          Plans
        </a>
        <a href="#team" className={`nav-item ${route === 'team' ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>
          Referrals
        </a>
        <a href="#profile" className={`nav-item ${route === 'profile' ? 'active' : ''}`}>
          <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Me
        </a>
      </nav>
    </>
  )
}

export default App
