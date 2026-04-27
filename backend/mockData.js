const packages = [
  {
    id: 1,
    name: 'Starter Solar',
    amount: '50,000 BIF',
    bonus: '120,000 BIF',
    description: 'A smooth entry package with strong welcome bonus.',
    image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=400&q=80',
    active: 144,
  },
  {
    id: 2,
    name: 'Basic Solar',
    amount: '75,000 BIF',
    bonus: '180,000 BIF',
    description: 'Perfect for beginners looking to scale up.',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80',
    active: 112,
  },
  {
    id: 3,
    name: 'Bronze Solar',
    amount: '100,000 BIF',
    bonus: '261,000 BIF',
    description: 'A popular plan for growing your solar portfolio.',
    image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=400&q=80',
    active: 102,
  },
  {
    id: 4,
    name: 'Silver Solar',
    amount: '200,000 BIF',
    bonus: '560,000 BIF',
    description: 'High value returns and faster bonus activation.',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80',
    active: 94,
  },
  {
    id: 5,
    name: 'Gold Solar',
    amount: '300,000 BIF',
    bonus: '900,000 BIF',
    description: 'Premium package with proven performance.',
    image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=400&q=80',
    popular: true,
    active: 78,
  },
  {
    id: 6,
    name: 'Diamond Solar',
    amount: '400,000 BIF',
    bonus: '1,100,000 BIF',
    description: 'Elite level returns for serious investors.',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80',
    active: 45,
  },
  {
    id: 7,
    name: 'Elite Solar',
    amount: '500,000 BIF',
    bonus: '1,500,000 BIF',
    description: 'Maximum performance and priority support.',
    image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=400&q=80',
    active: 32,
  },
  {
    id: 8,
    name: 'VIP Solar',
    amount: '1,000,000 BIF',
    bonus: '3,500,000 BIF',
    description: 'Exclusive benefits and high-tier rewards.',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80',
    active: 22,
  },
  {
    id: 9,
    name: 'Platinum Solar',
    amount: '2,500,000 BIF',
    bonus: '9,000,000 BIF',
    description: 'Large scale investment with top-tier payouts.',
    image: 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=400&q=80',
    active: 12,
  },
  {
    id: 10,
    name: 'Sovereign Solar',
    amount: '5,000,000 BIF',
    bonus: '20,000,000 BIF',
    description: 'The ultimate solar investment package.',
    image: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=400&q=80',
    active: 5,
  },
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
