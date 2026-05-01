const packages = [
  { id: 1, name: 'Mono Starter', amount: '80,000 BIF', bonus: '210,000 BIF', description: 'Entry-level solar investment with instant rewards.', active: 144, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 2, name: 'Poly Basic', amount: '120,000 BIF', bonus: '320,000 BIF', description: 'Standard solar plan for consistent growth.', active: 102, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 3, name: 'Thin Film', amount: '160,000 BIF', bonus: '450,000 BIF', description: 'Flexible solar technology investment.', active: 94, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 4, name: 'Off-Grid Lite', amount: '200,000 BIF', bonus: '600,000 BIF', description: 'Small scale off-grid solar solution.', active: 88, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 5, name: 'Hybrid Lite', amount: '240,000 BIF', bonus: '800,000 BIF', description: 'Combined energy source lite investment.', active: 76, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 6, name: 'Grid-Tied Lite', amount: '280,000 BIF', bonus: '1,000,000 BIF', description: 'Connected grid lite solar plan.', active: 65, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 7, name: 'Solar Storage', amount: '320,000 BIF', bonus: '1,300,000 BIF', description: 'Advanced battery storage solar investment.', active: 58, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 8, name: 'Smart Solar', amount: '360,000 BIF', bonus: '1,700,000 BIF', description: 'Intelligent energy management plan.', active: 52, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 9, name: 'PV Entry', amount: '400,000 BIF', bonus: '2,100,000 BIF', description: 'Entry level Photovoltaic investment.', active: 48, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 10, name: 'PV Basic', amount: '440,000 BIF', bonus: '2,500,000 BIF', description: 'Fundamental PV solar system plan.', active: 44, img: 'assets/img/packages/pkg_10.jpg' },
  { id: 11, name: 'PV Standard', amount: '480,000 BIF', bonus: '3,000,000 BIF', description: 'Standard PV performance investment.', active: 40, img: 'assets/img/packages/pkg_11.jpg' },
  { id: 12, name: 'PV Plus', amount: '520,000 BIF', bonus: '3,600,000 BIF', description: 'Enhanced PV solar returns plan.', active: 38, img: 'assets/img/packages/pkg_12.jpg' },
  { id: 13, name: 'PV Pro', amount: '560,000 BIF', bonus: '4,200,000 BIF', description: 'Professional grade PV investment.', active: 35, img: 'assets/img/packages/pkg_13.jpg' },
  { id: 14, name: 'PV Max', amount: '600,000 BIF', bonus: '4,800,000 BIF', description: 'Maximum capacity PV solar plan.', active: 32, img: 'assets/img/packages/pkg_14.jpg' },
  { id: 15, name: 'Off-Grid Pro', amount: '640,000 BIF', bonus: '5,200,000 BIF', description: 'Professional off-grid solar systems.', active: 28, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 16, name: 'Hybrid Pro', amount: '680,000 BIF', bonus: '5,600,000 BIF', description: 'High-end hybrid solar solution.', active: 25, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 17, name: 'Grid-Tied Pro', amount: '720,000 BIF', bonus: '6,000,000 BIF', description: 'Full grid-tied professional system.', active: 22, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 18, name: 'Solar Battery', amount: '760,000 BIF', bonus: '6,400,000 BIF', description: 'Dedicated high-capacity battery plan.', active: 20, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 19, name: 'Storage Plus', amount: '800,000 BIF', bonus: '6,800,000 BIF', description: 'Ultimate storage and energy backup.', active: 18, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 20, name: 'Smart Hybrid', amount: '840,000 BIF', bonus: '7,100,000 BIF', description: 'Intelligent hybrid energy investment.', active: 15, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 21, name: 'PV Ultra', amount: '880,000 BIF', bonus: '7,400,000 BIF', description: 'Ultra-performance solar technology.', active: 12, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 22, name: 'Solar Array', amount: '920,000 BIF', bonus: '7,600,000 BIF', description: 'Large scale solar array investment.', active: 10, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 23, name: 'Solar Plant', amount: '960,000 BIF', bonus: '7,800,000 BIF', description: 'Industrial solar plant ownership.', active: 8, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 24, name: 'Commercial Solar', amount: '1,000,000 BIF', bonus: '8,000,000 BIF', description: 'Top-tier commercial solar partnership.', active: 5, img: 'assets/img/packages/pkg_10.jpg' },
];

const stats = {
  users: 4320,
  packages: 5,
  deposits: 1060,
  withdrawals: 420,
  totalPayouts: '128,430,000 BIF',
};

const dashboard = {
  walletBalance: '1,250,000 BIF',
  welcomeBonus: '2,350,000 BIF',
  activePackage: 'Gold Solar',
  totalEarnings: '3,600,000 BIF',
  recentActivity: [
    { title: 'Welcome Bonus Received', value: '+900,000 BIF', description: 'Gold Solar payout', date: 'Apr 26, 2026' },
    { title: 'Package Activated', value: 'Gold Solar', description: 'Premium plan started', date: 'Apr 24, 2026' },
    { title: 'Deposit Submitted', value: '300,000 BIF', description: 'Funds added to wallet', date: 'Apr 22, 2026' },
  ],
};

const profile = {
  name: 'Sam Dev',
  phone: '+257 6 1234 5678',
  country: 'Burundi',
  memberSince: '2026',
  activity: [
    { label: 'Gold Solar activation', amount: '300,000 BIF', date: 'Apr 24, 2026' },
    { label: 'Welcome bonus received', amount: '900,000 BIF', date: 'Apr 26, 2026' },
    { label: 'Referral bonus payout', amount: '120,000 BIF', date: 'Apr 22, 2026' },
  ],
};

const team = {
  referralLink: 'https://solarafrica.com/ref/SAMDEV',
  referrals: 128,
  activeInvestors: 96,
  referralBonus: '1,450,000 BIF',
  topReferrals: [
    { name: 'Jean N.', amount: '2,350,000 BIF' },
    { name: 'Divine M.', amount: '1,890,000 BIF' },
    { name: 'Samuel K.', amount: '1,250,000 BIF' },
  ],
};

const deposits = [
  {
    id: 1,
    user_name: 'Jean N.',
    amount: '120,000 BIF',
    package_name: 'Silver Solar',
    status: 'Approved',
    created_at: '2026-04-24T10:00:00Z'
  },
  {
    id: 2,
    user_name: 'Divine M.',
    amount: '300,000 BIF',
    package_name: 'Gold Solar',
    status: 'Pending',
    created_at: '2026-04-25T14:30:00Z'
  },
  {
    id: 3,
    user_name: 'Samuel K.',
    amount: '1,000,000 BIF',
    package_name: 'VIP Solar',
    status: 'Approved',
    created_at: '2026-04-26T09:15:00Z'
  }
];

const users = [
  {
    id: 1,
    name: 'Jean N.',
    country: 'Burundi',
    status: 'active'
  },
  {
    id: 2,
    name: 'Divine M.',
    country: 'Burundi',
    status: 'active'
  },
  {
    id: 3,
    name: 'Samuel K.',
    country: 'Burundi',
    status: 'active'
  }
];

const analytics = {
  revenueGrowth: [
    { month: 'Jan', value: 1200000 },
    { month: 'Feb', value: 2500000 },
    { month: 'Mar', value: 4800000 },
    { month: 'Apr', value: 8500000 },
    { month: 'May', value: 12000000 },
    { month: 'Jun', value: 18500000 },
  ],
  userGrowth: [
    { month: 'Jan', value: 150 },
    { month: 'Feb', value: 450 },
    { month: 'Mar', value: 1200 },
    { month: 'Apr', value: 2800 },
    { month: 'May', value: 4320 },
    { month: 'Jun', value: 6500 },
  ],
  packageDistribution: [
    { name: 'Starter', count: 450 },
    { name: 'Basic', count: 380 },
    { name: 'Bronze', count: 290 },
    { name: 'Silver', count: 210 },
    { name: 'Gold', count: 150 },
    { name: 'Others', count: 85 },
  ]
};

module.exports = { packages, stats, dashboard, profile, team, deposits, users, analytics };
