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

const notifications = [
  { id: 1, title: 'Welcome to Solar Africa', message: 'Thank you for joining the clean energy revolution! Explore our packages to start earning.', type: 'info', read: false, created_at: '2026-04-26T10:00:00Z' },
  { id: 2, title: 'Identity Verified', message: 'Your account has been successfully verified. You can now activate any solar package.', type: 'success', read: false, created_at: '2026-04-25T12:00:00Z' },
  { id: 3, title: 'Maintenance Update', message: 'We will be performing a brief system maintenance tonight at 2 AM. Your investments will not be affected.', type: 'warning', read: false, created_at: '2026-04-26T15:30:00Z' },
];

const ugandaPackages = [
  { id: 101, name: 'Mono Starter', amount: '100,000 UGX', bonus: '250,000 UGX', description: 'Entry-level solar investment with instant rewards.', active: 144, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 102, name: 'Poly Basic', amount: '150,000 UGX', bonus: '375,000 UGX', description: 'Standard solar plan for consistent growth.', active: 102, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 103, name: 'Thin Film', amount: '200,000 UGX', bonus: '500,000 UGX', description: 'Flexible solar technology investment.', active: 94, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 104, name: 'Off-Grid Lite', amount: '250,000 UGX', bonus: '650,000 UGX', description: 'Small scale off-grid solar solution.', active: 88, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 105, name: 'Hybrid Lite', amount: '300,000 UGX', bonus: '780,000 UGX', description: 'Combined energy source lite investment.', active: 76, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 106, name: 'Grid-Tied Lite', amount: '350,000 UGX', bonus: '910,000 UGX', description: 'Connected grid lite solar plan.', active: 65, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 107, name: 'Solar Storage', amount: '400,000 UGX', bonus: '1,050,000 UGX', description: 'Advanced battery storage solar investment.', active: 58, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 108, name: 'Smart Solar', amount: '450,000 UGX', bonus: '1,200,000 UGX', description: 'Intelligent energy management plan.', active: 52, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 109, name: 'PV Entry', amount: '500,000 UGX', bonus: '1,350,000 UGX', description: 'Entry level Photovoltaic investment.', active: 48, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 110, name: 'PV Basic', amount: '550,000 UGX', bonus: '1,500,000 UGX', description: 'Fundamental PV solar system plan.', active: 44, img: 'assets/img/packages/pkg_10.jpg' },
  { id: 111, name: 'PV Standard', amount: '600,000 UGX', bonus: '1,700,000 UGX', description: 'Standard PV performance investment.', active: 40, img: 'assets/img/packages/pkg_11.jpg' },
  { id: 112, name: 'PV Plus', amount: '650,000 UGX', bonus: '1,900,000 UGX', description: 'Enhanced PV solar returns plan.', active: 38, img: 'assets/img/packages/pkg_12.jpg' },
  { id: 113, name: 'PV Pro', amount: '700,000 UGX', bonus: '2,100,000 UGX', description: 'Professional grade PV investment.', active: 35, img: 'assets/img/packages/pkg_13.jpg' },
  { id: 114, name: 'PV Max', amount: '750,000 UGX', bonus: '2,300,000 UGX', description: 'Maximum capacity PV solar plan.', active: 32, img: 'assets/img/packages/pkg_14.jpg' },
  { id: 115, name: 'Off-Grid Pro', amount: '800,000 UGX', bonus: '2,500,000 UGX', description: 'Professional off-grid solar systems.', active: 28, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 116, name: 'Hybrid Pro', amount: '850,000 UGX', bonus: '2,700,000 UGX', description: 'High-end hybrid solar solution.', active: 25, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 117, name: 'Grid-Tied Pro', amount: '900,000 UGX', bonus: '2,900,000 UGX', description: 'Full grid-tied professional system.', active: 22, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 118, name: 'Solar Battery', amount: '950,000 UGX', bonus: '3,100,000 UGX', description: 'Dedicated high-capacity battery plan.', active: 20, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 119, name: 'Storage Plus', amount: '1,000,000 UGX', bonus: '3,300,000 UGX', description: 'Ultimate storage and energy backup.', active: 18, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 120, name: 'Smart Hybrid', amount: '1,100,000 UGX', bonus: '3,700,000 UGX', description: 'Intelligent hybrid energy investment.', active: 15, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 121, name: 'PV Ultra', amount: '1,200,000 UGX', bonus: '4,100,000 UGX', description: 'Ultra-performance solar technology.', active: 12, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 122, name: 'Solar Array', amount: '1,400,000 UGX', bonus: '4,800,000 UGX', description: 'Large scale solar array investment.', active: 10, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 123, name: 'Solar Plant', amount: '1,800,000 UGX', bonus: '6,200,000 UGX', description: 'Industrial solar plant ownership.', active: 8, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 124, name: 'Commercial Solar', amount: '2,500,000 UGX', bonus: '8,500,000 UGX', description: 'Top-tier commercial solar partnership.', active: 5, img: 'assets/img/packages/pkg_10.jpg' },
];

const kenyaPackages = [
  { id: 201, name: 'Mono Starter', amount: '4,000 KSh', bonus: '10,500 KSh', description: 'Entry-level solar investment with instant rewards.', active: 144, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 202, name: 'Poly Basic', amount: '6,000 KSh', bonus: '16,000 KSh', description: 'Standard solar plan for consistent growth.', active: 102, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 203, name: 'Thin Film', amount: '8,000 KSh', bonus: '22,000 KSh', description: 'Flexible solar technology investment.', active: 94, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 204, name: 'Off-Grid Lite', amount: '10,000 KSh', bonus: '30,000 KSh', description: 'Small scale off-grid solar solution.', active: 88, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 205, name: 'Hybrid Lite', amount: '12,000 KSh', bonus: '40,000 KSh', description: 'Combined energy source lite investment.', active: 76, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 206, name: 'Grid-Tied Lite', amount: '14,000 KSh', bonus: '50,000 KSh', description: 'Connected grid lite solar plan.', active: 65, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 207, name: 'Solar Storage', amount: '16,000 KSh', bonus: '65,000 KSh', description: 'Advanced battery storage solar investment.', active: 58, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 208, name: 'Smart Solar', amount: '18,000 KSh', bonus: '85,000 KSh', description: 'Intelligent energy management plan.', active: 52, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 209, name: 'PV Entry', amount: '20,000 KSh', bonus: '105,000 KSh', description: 'Entry level Photovoltaic investment.', active: 48, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 210, name: 'PV Basic', amount: '22,000 KSh', bonus: '125,000 KSh', description: 'Fundamental PV solar system plan.', active: 44, img: 'assets/img/packages/pkg_10.jpg' },
  { id: 211, name: 'PV Standard', amount: '24,000 KSh', bonus: '150,000 KSh', description: 'Standard PV performance investment.', active: 40, img: 'assets/img/packages/pkg_11.jpg' },
  { id: 212, name: 'PV Plus', amount: '26,000 KSh', bonus: '180,000 KSh', description: 'Enhanced PV solar returns plan.', active: 38, img: 'assets/img/packages/pkg_12.jpg' },
  { id: 213, name: 'PV Pro', amount: '28,000 KSh', bonus: '210,000 KSh', description: 'Professional grade PV investment.', active: 35, img: 'assets/img/packages/pkg_13.jpg' },
  { id: 214, name: 'PV Max', amount: '30,000 KSh', bonus: '240,000 KSh', description: 'Maximum capacity PV solar plan.', active: 32, img: 'assets/img/packages/pkg_14.jpg' },
  { id: 215, name: 'Off-Grid Pro', amount: '32,000 KSh', bonus: '270,000 KSh', description: 'Professional off-grid solar systems.', active: 28, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 216, name: 'Hybrid Pro', amount: '34,000 KSh', bonus: '300,000 KSh', description: 'High-end hybrid solar solution.', active: 25, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 217, name: 'Grid-Tied Pro', amount: '36,000 KSh', bonus: '330,000 KSh', description: 'Full grid-tied professional system.', active: 22, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 218, name: 'Solar Battery', amount: '38,000 KSh', bonus: '360,000 KSh', description: 'Dedicated high-capacity battery plan.', active: 20, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 219, name: 'Storage Plus', amount: '40,000 KSh', bonus: '400,000 KSh', description: 'Ultimate storage and energy backup.', active: 18, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 220, name: 'Smart Hybrid', amount: '45,000 KSh', bonus: '450,000 KSh', description: 'Intelligent hybrid energy investment.', active: 15, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 221, name: 'PV Ultra', amount: '50,000 KSh', bonus: '520,000 KSh', description: 'Ultra-performance solar technology.', active: 12, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 222, name: 'Solar Array', amount: '60,000 KSh', bonus: '650,000 KSh', description: 'Large scale solar array investment.', active: 10, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 223, name: 'Solar Plant', amount: '80,000 KSh', bonus: '850,000 KSh', description: 'Industrial solar plant ownership.', active: 8, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 224, name: 'Commercial Solar', amount: '100,000 KSh', bonus: '1,100,000 KSh', description: 'Top-tier commercial solar partnership.', active: 5, img: 'assets/img/packages/pkg_10.jpg' },
];

const tanzaniaPackages = [
  { id: 301, name: 'Mono Starter', amount: '80,000 TSH', bonus: '200,000 TSH', description: 'Entry-level solar investment with instant rewards.', active: 144, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 302, name: 'Poly Basic', amount: '120,000 TSH', bonus: '300,000 TSH', description: 'Standard solar plan for consistent growth.', active: 102, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 303, name: 'Thin Film', amount: '160,000 TSH', bonus: '400,000 TSH', description: 'Flexible solar technology investment.', active: 94, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 304, name: 'Off-Grid Lite', amount: '200,000 TSH', bonus: '520,000 TSH', description: 'Small scale off-grid solar solution.', active: 88, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 305, name: 'Hybrid Lite', amount: '240,000 TSH', bonus: '624,000 TSH', description: 'Combined energy source lite investment.', active: 76, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 306, name: 'Grid-Tied Lite', amount: '280,000 TSH', bonus: '728,000 TSH', description: 'Connected grid lite solar plan.', active: 65, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 307, name: 'Solar Storage', amount: '320,000 TSH', bonus: '840,000 TSH', description: 'Advanced battery storage solar investment.', active: 58, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 308, name: 'Smart Solar', amount: '360,000 TSH', bonus: '960,000 TSH', description: 'Intelligent energy management plan.', active: 52, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 309, name: 'PV Entry', amount: '400,000 TSH', bonus: '1,080,000 TSH', description: 'Entry level Photovoltaic investment.', active: 48, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 310, name: 'PV Basic', amount: '440,000 TSH', bonus: '1,200,000 TSH', description: 'Fundamental PV solar system plan.', active: 44, img: 'assets/img/packages/pkg_10.jpg' },
  { id: 311, name: 'PV Standard', amount: '480,000 TSH', bonus: '1,360,000 TSH', description: 'Standard PV performance investment.', active: 40, img: 'assets/img/packages/pkg_11.jpg' },
  { id: 312, name: 'PV Plus', amount: '520,000 TSH', bonus: '1,520,000 TSH', description: 'Enhanced PV solar returns plan.', active: 38, img: 'assets/img/packages/pkg_12.jpg' },
  { id: 313, name: 'PV Pro', amount: '560,000 TSH', bonus: '1,680,000 TSH', description: 'Professional grade PV investment.', active: 35, img: 'assets/img/packages/pkg_13.jpg' },
  { id: 314, name: 'PV Max', amount: '600,000 TSH', bonus: '1,840,000 TSH', description: 'Maximum capacity PV solar plan.', active: 32, img: 'assets/img/packages/pkg_14.jpg' },
  { id: 315, name: 'Off-Grid Pro', amount: '640,000 TSH', bonus: '2,000,000 TSH', description: 'Professional off-grid solar systems.', active: 28, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 316, name: 'Hybrid Pro', amount: '680,000 TSH', bonus: '2,160,000 TSH', description: 'High-end hybrid solar solution.', active: 25, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 317, name: 'Grid-Tied Pro', amount: '720,000 TSH', bonus: '2,320,000 TSH', description: 'Full grid-tied professional system.', active: 22, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 318, name: 'Solar Battery', amount: '760,000 TSH', bonus: '2,480,000 TSH', description: 'Dedicated high-capacity battery plan.', active: 20, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 319, name: 'Storage Plus', amount: '800,000 TSH', bonus: '2,640,000 TSH', description: 'Ultimate storage and energy backup.', active: 18, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 320, name: 'Smart Hybrid', amount: '880,000 TSH', bonus: '2,960,000 TSH', description: 'Intelligent hybrid energy investment.', active: 15, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 321, name: 'PV Ultra', amount: '960,000 TSH', bonus: '3,280,000 TSH', description: 'Ultra-performance solar technology.', active: 12, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 322, name: 'Solar Array', amount: '1,120,000 TSH', bonus: '3,840,000 TSH', description: 'Large scale solar array investment.', active: 10, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 323, name: 'Solar Plant', amount: '1,440,000 TSH', bonus: '4,960,000 TSH', description: 'Industrial solar plant ownership.', active: 8, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 324, name: 'Commercial Solar', amount: '2,000,000 TSH', bonus: '6,800,000 TSH', description: 'Top-tier commercial solar partnership.', active: 5, img: 'assets/img/packages/pkg_10.jpg' },
];

const internationalPackages = [
  { id: 401, name: 'Mono Starter', amount: '$50', bonus: '$125', description: 'Entry-level solar investment with instant rewards.', active: 144, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 402, name: 'Poly Basic', amount: '$75', bonus: '$190', description: 'Standard solar plan for consistent growth.', active: 102, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 403, name: 'Thin Film', amount: '$100', bonus: '$250', description: 'Flexible solar technology investment.', active: 94, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 404, name: 'Off-Grid Lite', amount: '$150', bonus: '$390', description: 'Small scale off-grid solar solution.', active: 88, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 405, name: 'Hybrid Lite', amount: '$200', bonus: '$520', description: 'Combined energy source lite investment.', active: 76, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 406, name: 'Grid-Tied Lite', amount: '$250', bonus: '$650', description: 'Connected grid lite solar plan.', active: 65, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 407, name: 'Solar Storage', amount: '$300', bonus: '$780', description: 'Advanced battery storage solar investment.', active: 58, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 408, name: 'Smart Solar', amount: '$350', bonus: '$920', description: 'Intelligent energy management plan.', active: 52, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 409, name: 'PV Entry', amount: '$400', bonus: '$1,050', description: 'Entry level Photovoltaic investment.', active: 48, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 410, name: 'PV Basic', amount: '$450', bonus: '$1,200', description: 'Fundamental PV solar system plan.', active: 44, img: 'assets/img/packages/pkg_10.jpg' },
  { id: 411, name: 'PV Standard', amount: '$500', bonus: '$1,350', description: 'Standard PV performance investment.', active: 40, img: 'assets/img/packages/pkg_11.jpg' },
  { id: 412, name: 'PV Plus', amount: '$550', bonus: '$1,550', description: 'Enhanced PV solar returns plan.', active: 38, img: 'assets/img/packages/pkg_12.jpg' },
  { id: 413, name: 'PV Pro', amount: '$600', bonus: '$1,750', description: 'Professional grade PV investment.', active: 35, img: 'assets/img/packages/pkg_13.jpg' },
  { id: 414, name: 'PV Max', amount: '$700', bonus: '$2,000', description: 'Maximum capacity PV solar plan.', active: 32, img: 'assets/img/packages/pkg_14.jpg' },
  { id: 415, name: 'Off-Grid Pro', amount: '$800', bonus: '$2,300', description: 'Professional off-grid solar systems.', active: 28, img: 'assets/img/packages/pkg_1.jpg' },
  { id: 416, name: 'Hybrid Pro', amount: '$900', bonus: '$2,600', description: 'High-end hybrid solar solution.', active: 25, img: 'assets/img/packages/pkg_2.jpg' },
  { id: 417, name: 'Grid-Tied Pro', amount: '$1,000', bonus: '$2,900', description: 'Full grid-tied professional system.', active: 22, img: 'assets/img/packages/pkg_3.jpg' },
  { id: 418, name: 'Solar Battery', amount: '$1,100', bonus: '$3,200', description: 'Dedicated high-capacity battery plan.', active: 20, img: 'assets/img/packages/pkg_4.jpg' },
  { id: 419, name: 'Storage Plus', amount: '$1,250', bonus: '$3,600', description: 'Ultimate storage and energy backup.', active: 18, img: 'assets/img/packages/pkg_5.jpg' },
  { id: 420, name: 'Smart Hybrid', amount: '$1,500', bonus: '$4,200', description: 'Intelligent hybrid energy investment.', active: 15, img: 'assets/img/packages/pkg_6.jpg' },
  { id: 421, name: 'PV Ultra', amount: '$1,800', bonus: '$5,000', description: 'Ultra-performance solar technology.', active: 12, img: 'assets/img/packages/pkg_7.jpg' },
  { id: 422, name: 'Solar Array', amount: '$2,200', bonus: '$6,200', description: 'Large scale solar array investment.', active: 10, img: 'assets/img/packages/pkg_8.jpg' },
  { id: 423, name: 'Solar Plant', amount: '$2,800', bonus: '$8,000', description: 'Industrial solar plant ownership.', active: 8, img: 'assets/img/packages/pkg_9.jpg' },
  { id: 424, name: 'Commercial Solar', amount: '$3,500', bonus: '$10,500', description: 'Top-tier commercial solar partnership.', active: 5, img: 'assets/img/packages/pkg_10.jpg' },
];

module.exports = { packages, ugandaPackages, kenyaPackages, tanzaniaPackages, internationalPackages, stats, dashboard, profile, team, deposits, users, analytics, notifications };
