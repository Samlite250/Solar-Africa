const { client, isConfigured } = require('../config/supabase');
const mockData = require('../mockData');

exports.getStatus = (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Solar Africa MVP',
    timestamp: new Date().toISOString(),
    supabase: isConfigured ? 'connected' : 'disabled',
  });
};

exports.getPackages = async (req, res) => {
  if (isConfigured) {
    try {
      const { data, error } = await client.from('packages').select('*');
      if (!error && data) return res.json({ data });
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: mockData.packages });
};

exports.getDashboard = async (req, res) => {
  if (isConfigured) {
    try {
      const { data, error } = await client.from('dashboard').select('*').limit(1).single();
      if (!error && data) return res.json({ data });
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: mockData.dashboard });
};

exports.getTeam = async (req, res) => {
  if (isConfigured) {
    try {
      const { data, error } = await client.from('referrals').select('*');
      if (!error && data) return res.json({ data });
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: mockData.team });
};

exports.getProfile = async (req, res) => {
  if (isConfigured) {
    try {
      const { data, error } = await client.from('profiles').select('*').limit(1).single();
      if (!error && data) return res.json({ data });
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: mockData.profile });
};

exports.getAdminStats = async (req, res) => {
  if (isConfigured) {
    try {
      const [stats, deposits, packages, users] = await Promise.all([
        client.from('stats').select('*').limit(1).single(),
        client.from('deposits').select('*').order('created_at', { ascending: false }).limit(10),
        client.from('packages').select('*'),
        client.from('users').select('*').limit(10)
      ]);

      return res.json({
        stats: stats.data || mockData.stats,
        deposits: deposits.data || mockData.deposits,
        packages: packages.data || mockData.packages,
        users: users.data || mockData.users
      });
    } catch (err) {
      console.warn('Supabase admin fetch error:', err.message);
    }
  }
  
  res.json({
    stats: mockData.stats,
    deposits: mockData.deposits,
    packages: mockData.packages,
    users: mockData.users,
    analytics: mockData.analytics
  });
};
