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
      const { data, error } = await client
        .from('dashboard')
        .select('*')
        .eq('user_id', req.user.id)
        .single();
      
      if (!error && data) return res.json({ data });
      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase fetch error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: mockData.dashboard });
};

exports.getTeam = async (req, res) => {
  if (isConfigured) {
    try {
      const { data, error } = await client
        .from('referrals')
        .select('*')
        .eq('user_id', req.user.id);
      
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
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('user_id', req.user.id)
        .single();
      
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
        metrics: stats.data || mockData.stats,
        deposits: deposits.data || mockData.deposits,
        packages: packages.data || mockData.packages,
        users: users.data || mockData.users,
        analytics: mockData.analytics
      });
    } catch (err) {
      console.warn('Supabase admin fetch error:', err.message);
    }
  }
  
  res.json({
    metrics: mockData.stats,
    deposits: mockData.deposits,
    packages: mockData.packages,
    users: mockData.users,
    analytics: mockData.analytics
  });

};
exports.updateProfile = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });
  
  try {
    const { name, phone, country } = req.body;
    const { data, error } = await client
      .from('profiles')
      .update({ name, phone, country, updated_at: new Date() })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Profile updated successfully', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActivity = async (req, res) => {
  if (isConfigured) {
    try {
      const { data, error } = await client
        .from('activity')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) return res.json({ data });
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: mockData.dashboard.recentActivity });
};

exports.createDeposit = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });

  try {
    const { amount, package_name } = req.body;
    const { data, error } = await client
      .from('deposits')
      .insert([
        { 
          user_id: req.user.id, 
          user_name: req.user.user_metadata?.full_name || 'User',
          amount, 
          package_name, 
          status: 'pending' 
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 2. Log Activity
    await client.from('activity').insert([
      {
        user_id: req.user.id,
        title: 'New Investment',
        value: `-${amount}`,
        description: `Invested in ${package_name}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    ]);

    res.status(201).json({ message: 'Deposit request submitted', data });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin CRUD operations
exports.adminUpdateDeposit = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });

  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await client
      .from('deposits')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Deposit status updated', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminCreatePackage = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });

  try {
    const { name, amount, bonus, description, active } = req.body;
    const { data, error } = await client
      .from('packages')
      .insert([{ name, amount, bonus, description, active }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Package created', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminDeletePackage = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });

  try {
    const { id } = req.params;
    const { error } = await client.from('packages').delete().eq('id', id);

    if (error) throw error;
    res.json({ message: 'Package deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.adminUpdateUser = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });

  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await client
      .from('users')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: `User status updated to ${status}`, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

