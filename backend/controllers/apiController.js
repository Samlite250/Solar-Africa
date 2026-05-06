const { client, adminClient, isConfigured } = require('../config/supabase');
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
      let country = 'Burundi'; // Default
      
      // If user is logged in (via optional protection or token check)
      if (req.user && req.user.id) {
        const { data: profile } = await adminClient
          .from('profiles')
          .select('country')
          .eq('user_id', req.user.id)
          .single();
        
        if (profile && profile.country) {
          country = profile.country;
        }
      } else if (req.query.country) {
        // Allow passing country via query for public pages
        country = req.query.country;
      }

      console.log(`[Packages] Fetching for country: ${country}`);

      const { data, error } = await adminClient
        .from('packages')
        .select('*')
        .eq('country', country)
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        return res.json({ data });
      }
      
      // Fallback: If no packages for this country, show Burundi (or Uganda/Kenya if applicable)
      if (country === 'Uganda') {
        return res.json({ data: mockData.ugandaPackages });
      }
      if (country === 'Kenya') {
        return res.json({ data: mockData.kenyaPackages });
      }
      if (country === 'Tanzania') {
        return res.json({ data: mockData.tanzaniaPackages });
      }
      if (country === 'Rwanda') {
        return res.json({ data: mockData.rwandaPackages });
      }

      // International Fallback for non-listed countries
      const localCountries = ['Burundi', 'Kenya', 'Uganda', 'Rwanda', 'Tanzania', 'Congo RDC'];
      if (!localCountries.includes(country)) {
        return res.json({ data: mockData.internationalPackages });
      }
      
      if (country !== 'Burundi') {
        const { data: fallback } = await adminClient
          .from('packages')
          .select('*')
          .eq('country', 'Burundi')
          .order('id', { ascending: true });
        if (fallback && fallback.length > 0) return res.json({ data: fallback });
      }
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  
  // Final Mock Fallback
  if (req.query.country === 'Uganda' || (req.user && req.user.country === 'Uganda')) {
    return res.json({ data: mockData.ugandaPackages });
  }
  if (req.query.country === 'Kenya' || (req.user && req.user.country === 'Kenya')) {
    return res.json({ data: mockData.kenyaPackages });
  }
  if (req.query.country === 'Tanzania' || (req.user && req.user.country === 'Tanzania')) {
    return res.json({ data: mockData.tanzaniaPackages });
  }
  if (req.query.country === 'Rwanda' || (req.user && req.user.country === 'Rwanda')) {
    return res.json({ data: mockData.rwandaPackages });
  }

  // Global International Mock Fallback
  const localCountries = ['Burundi', 'Kenya', 'Uganda', 'Rwanda', 'Tanzania', 'Congo RDC'];
  const userCountry = req.query.country || (req.user ? req.user.country : null);
  if (userCountry && !localCountries.includes(userCountry)) {
    return res.json({ data: mockData.internationalPackages });
  }
  
  res.json({ data: mockData.packages });
};

exports.getDashboard = async (req, res) => {
  if (isConfigured) {
    try {
      // 1. Get Dashboard data
      const { data: dash, error: dashError } = await adminClient
        .from('dashboard')
        .select('*')
        .eq('user_id', req.user.id)
        .single();
      
      if (dash || !dashError || dashError.code === 'PGRST116') {
        let currentDash = dash;
        
        // Self-healing: Create dashboard if missing
        if (!dash) {
          const { data: newDash } = await adminClient.from('dashboard').insert([
            { 
              user_id: req.user.id, 
              wallet_balance: '0 FBu', 
              welcome_bonus: '0 FBu', 
              total_earnings: '0 FBu',
              active_package: 'None'
            }
          ]).select().single();
          currentDash = newDash;
        }

        // 2. Fetch completed tasks (TODAY ONLY)
        let completedIds = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: completed } = await client
          .from('completed_tasks')
          .select('task_id')
          .eq('user_id', req.user.id)
          .gte('created_at', today.toISOString());
          
        if (completed) completedIds = completed.map(c => c.task_id);

        // 3. Fetch REAL activities
        const { data: activities } = await client
          .from('activity')
          .select('*')
          .eq('user_id', req.user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // 4. Check for approved package purchase
        const { data: approvedDeposit } = await adminClient
          .from('deposits')
          .select('id')
          .eq('user_id', req.user.id)
          .eq('status', 'approved')
          .limit(1);

        // Enforce 0 welcome bonus if no approved package
        if (!approvedDeposit || approvedDeposit.length === 0) {
          currentDash.welcome_bonus = '0 FBu';
        }

        return res.json({ 
          data: { 
            ...currentDash, 
            completedTasks: completedIds,
            activities: activities || []
          } 
        });
      }
    } catch (err) {
      console.warn('Dashboard fetch error:', err.message);
    }
  }
  res.json({ data: { wallet_balance: '0 FBu', welcome_bonus: '0 FBu', active_package: 'None', total_earnings: '0 FBu', activities: [] } });
};

exports.getTeam = async (req, res) => {
  if (isConfigured) {
    try {
      // 1. Get current user's profile name (use adminClient to bypass RLS)
      const { data: profile, error: profileErr } = await adminClient
        .from('profiles')
        .select('name')
        .eq('user_id', req.user.id)
        .single();

      console.log(`[Team] User ${req.user.id} → profile name: "${profile?.name}" | error: ${profileErr?.message}`);

      if (profile) {
        // 2. Find everyone who was referred by this username (case-insensitive)
        const { data: teamMembers, error } = await adminClient
          .from('profiles')
          .select('name, phone, country, created_at, member_since')
          .ilike('referred_by', profile.name);
        
        console.log(`[Team] Searching referred_by="${profile.name}" → found ${teamMembers?.length || 0} members | error: ${error?.message}`);
        
        if (!error && teamMembers) {
          return res.json({ 
            data: teamMembers.map(m => ({
              id: m.id,
              name: m.name,
              phone: m.phone || 'N/A',
              status: 'Active',
              joined: m.member_since || new Date(m.created_at).toLocaleDateString(),
              contribution: '—'
            }))
          });
        }
      }
    } catch (err) {
      console.warn('[Team] Error:', err.message);
    }
  }
  res.json({ data: [] });
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
  res.json({ data: {} });
};


exports.getAdminStats = async (req, res) => {
  if (isConfigured) {
    try {
      // ✅ Use adminClient (service-role key) for ALL queries — bypasses RLS entirely.
      const [stats, deposits, packages, usersResult, withdrawals] = await Promise.all([
        adminClient.from('stats').select('*').limit(1).single(),
        adminClient.from('deposits').select('*').order('created_at', { ascending: false }).limit(100),
        adminClient.from('packages').select('*'),
        adminClient.from('users').select('*').order('created_at', { ascending: false }).limit(500),
        adminClient.from('withdrawals').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      // ✅ 3-TIER USER LOADING STRATEGY:
      // Tier 1: users table (custom table)
      // Tier 2: profiles table (always created at registration)
      // Tier 3: Supabase auth.admin.listUsers() — the ground truth, always accurate
      let rawUsers = usersResult.data || [];
      
      if (rawUsers.length === 0) {
        console.log('[Admin] users table empty — trying profiles table');
        // Only select guaranteed columns (name, user_id, email, created_at)
        const { data: profilesData } = await adminClient
          .from('profiles')
          .select('user_id, name, email, created_at, country, phone, referred_by')
          .order('created_at', { ascending: false })
          .limit(500);
        
        if (profilesData && profilesData.length > 0) {
          rawUsers = profilesData.map(p => ({
            user_id: p.user_id,
            name: p.name,
            email: p.email,
            status: 'active',
            created_at: p.created_at
          }));
          console.log(`[Admin] Loaded ${rawUsers.length} users from profiles table`);
        }
      }

      // Tier 3: If still empty, fall back to Supabase Auth users list (always accurate)
      if (rawUsers.length === 0) {
        console.log('[Admin] profiles empty — falling back to auth.admin.listUsers()');
        const { data: authData } = await adminClient.auth.admin.listUsers({ perPage: 500 });
        rawUsers = (authData?.users || []).map(u => ({
          user_id: u.id,
          name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'Unknown',
          email: u.email,
          status: u.banned ? 'suspended' : 'active',
          created_at: u.created_at
        }));
        console.log(`[Admin] Loaded ${rawUsers.length} users from Supabase Auth`);
      }

      // ✅ Enrich users with dashboard balances + profile info
      let enrichedUsers = rawUsers;
      let depositList = deposits.data || [];
      let withdrawalList = withdrawals.data || [];
      let dashboardsRes = { data: [] };
      let profilesRes = { data: [] };

      if (enrichedUsers.length > 0) {
        const userIds = enrichedUsers.map(u => u.user_id).filter(Boolean);
        if (userIds.length > 0) {
          const [dRes, pRes] = await Promise.all([
            adminClient.from('dashboard').select('user_id, wallet_balance, welcome_bonus, total_earnings').in('user_id', userIds),
            adminClient.from('profiles').select('user_id, name, email, referred_by, country, phone').in('user_id', userIds)
          ]);
          dashboardsRes = dRes;
          profilesRes = pRes;

          const dashMap = {};
          (dashboardsRes.data || []).forEach(d => { dashMap[d.user_id] = d; });
          
          const profMap = {};
          (profilesRes.data || []).forEach(p => { profMap[p.user_id] = p; });

          enrichedUsers = enrichedUsers.map(u => ({
            ...u,
            // Use profile name as priority (it's what the user registered with)
            name: profMap[u.user_id]?.name || u.name,
            email: profMap[u.user_id]?.email || u.email || '',
            country: profMap[u.user_id]?.country || 'Burundi',
            phone: profMap[u.user_id]?.phone || 'N/A',
            upline: profMap[u.user_id]?.referred_by || 'SOLAR',
            wallet_balance: dashMap[u.user_id]?.wallet_balance || '0',
            welcome_bonus: dashMap[u.user_id]?.welcome_bonus || '0',
            total_earnings: dashMap[u.user_id]?.total_earnings || '0'
          }));

          // Enrich deposits and withdrawals with user country
          depositList = (deposits.data || []).map(d => ({
            ...d,
            country: profMap[d.user_id]?.country || 'Burundi'
          }));

          withdrawalList = (withdrawals.data || []).map(w => ({
            ...w,
            country: profMap[w.user_id]?.country || 'Burundi'
          }));
        }
      }

      // ✅ Calculate Real-Time Stats
      let totalBonuses = 0;
      let totalInvestments = (deposits.data || []).filter(d => d.status === 'approved').reduce((acc, d) => acc + (parseInt((d.amount || '0').toString().replace(/[^0-9]/g, '')) || 0), 0);

      if (typeof dashboardsRes !== 'undefined' && dashboardsRes.data) {
        totalBonuses = dashboardsRes.data.reduce((acc, d) => acc + (parseInt((d.welcome_bonus || '0').toString().replace(/[^0-9]/g, '')) || 0), 0);
      }

      const liveMetrics = {
        users: enrichedUsers.length,
        packages: (packages.data || []).length,
        deposits: (deposits.data || []).length,
        withdrawals: (withdrawals.data || []).length,
        total_payouts: totalBonuses.toLocaleString() + ' BIF',
        total_profit: (totalInvestments * 0.15).toLocaleString() + ' BIF' // Example 15% platform profit
      };

      console.log(`[Admin] Returning real-time stats and ${enrichedUsers.length} users`);

      return res.json({
        metrics: liveMetrics,
        deposits: depositList,
        packages: packages.data || [],
        users: enrichedUsers,
        withdrawals: withdrawalList,
        analytics: []
      });
    } catch (err) {
      console.warn('Supabase admin fetch error:', err.message);
    }
  }
  
  res.json({
    metrics: { users: 0, packages: 0, deposits: 0, withdrawals: 0, total_payouts: '0' },
    deposits: [],
    packages: [],
    users: [],
    analytics: []
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
  res.json({ data: [] });
};


exports.createDeposit = async (req, res) => {
  if (!isConfigured) {
    return res.status(201).json({ 
      message: 'Deposit request submitted (Mock Mode)', 
      data: { id: Date.now(), status: 'pending', amount: req.body.amount, package_name: req.body.package_name } 
    });
  }

  try {
    const { amount, package_name } = req.body;

    // Fetch real username from profiles table
    let userName = req.user.user_metadata?.full_name || 'User';
    try {
      const { data: profileData } = await client
        .from('profiles')
        .select('name')
        .eq('user_id', req.user.id)
        .single();
      if (profileData?.name) userName = profileData.name;
    } catch(e) { /* use fallback */ }

    const { data, error } = await adminClient
      .from('deposits')
      .insert([{ 
        user_id: req.user.id, 
        user_name: userName,
        amount, 
        package_name, 
        status: 'pending' 
      }])
      .select()
      .single();

    if (error) {
      console.warn('⚠️ Supabase Deposit Error:', error.message);
      return res.status(201).json({ 
        message: 'Deposit request submitted (Fallback)', 
        data: { status: 'pending', amount, package_name } 
      });
    }

    // 2. Log Activity
    await adminClient.from('activity').insert([
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
    console.error('Server error on deposit:', err);
    res.status(201).json({ message: 'Deposit request submitted (Fallback)', data: { status: 'pending' } });
  }
};

// Admin CRUD operations
exports.adminUpdateDeposit = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });

  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await adminClient
      .from('deposits')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, update user's dashboard welcome_bonus and active package
    if (status === 'approved') {
      const { amount, package_name, user_id } = data;
      
      // 1. Fetch package details to get the correct bonus amount
      const { data: pkg } = await adminClient
        .from('packages')
        .select('bonus')
        .eq('name', package_name)
        .single();

      const bonusStr = pkg ? pkg.bonus : amount; // Fallback to investment amount if package lookup fails
      const cleanBonusToAdd = parseFloat(bonusStr.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;
      
      // 2. Get current dashboard
      const { data: dash } = await adminClient.from('dashboard').select('*').eq('user_id', user_id).single();
      
      if (dash) {
        const currentBonusStr = dash.welcome_bonus || '0';
        const currentBonusVal = parseFloat(currentBonusStr.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;
        const newBonusTotal = currentBonusVal + cleanBonusToAdd;
        
        await adminClient.from('dashboard').update({
          welcome_bonus: newBonusTotal.toLocaleString() + ' FBu',
          active_package: package_name,
          updated_at: new Date()
        }).eq('user_id', user_id);
      } else {
        // Create dashboard if it doesn't exist
        await adminClient.from('dashboard').insert([{
          user_id,
          wallet_balance: '0 FBu',
          welcome_bonus: cleanBonusToAdd.toLocaleString() + ' FBu',
          active_package: package_name,
          total_earnings: '0 FBu'
        }]);
      }

      // 3. Log success activity
      await adminClient.from('activity').insert([{
        user_id,
        title: 'Investment Confirmed',
        value: `+${bonusStr}`,
        description: `Your investment in ${package_name} was approved. Welcome bonus credited!`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }]);
    }

    res.json({ message: 'Deposit status updated', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin: Update user details (Balance, Email, Upline, etc)
exports.adminUpdateUser = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });
  
  try {
    const { id } = req.params; // This is the user_id
    const { 
      name, email, phone, country, referred_by, 
      wallet_balance, welcome_bonus, total_earnings, status 
    } = req.body;
    
    // 1. Update Profiles table
    const profileUpdates = { updated_at: new Date() };
    if (name !== undefined) profileUpdates.name = name;
    if (email !== undefined) profileUpdates.email = email;
    if (phone !== undefined) profileUpdates.phone = phone;
    if (country !== undefined) profileUpdates.country = country;
    if (referred_by !== undefined) profileUpdates.referred_by = referred_by;

    if (Object.keys(profileUpdates).length > 1) {
      await adminClient.from('profiles').update(profileUpdates).eq('user_id', id);
    }

    // 2. Update Dashboard table
    const dashUpdates = { updated_at: new Date() };
    if (wallet_balance !== undefined) dashUpdates.wallet_balance = wallet_balance;
    if (welcome_bonus !== undefined) dashUpdates.welcome_bonus = welcome_bonus;
    if (total_earnings !== undefined) dashUpdates.total_earnings = total_earnings;

    if (Object.keys(dashUpdates).length > 1) {
      const { error: dashErr } = await adminClient.from('dashboard').update(dashUpdates).eq('user_id', id);
      if (dashErr && dashErr.code === 'PGRST116') {
        // Create if missing
        await adminClient.from('dashboard').insert([{
          user_id: id,
          wallet_balance: wallet_balance || '0 FBu',
          welcome_bonus: welcome_bonus || '0 FBu',
          total_earnings: total_earnings || '0 FBu'
        }]);
      }
    }

    // 3. Update Users table (admin metadata)
    const userUpdates = { updated_at: new Date() };
    if (name !== undefined) userUpdates.name = name;
    if (email !== undefined) userUpdates.email = email;
    if (country !== undefined) userUpdates.country = country;
    if (status !== undefined) userUpdates.status = status;

    if (Object.keys(userUpdates).length > 1) {
      await adminClient.from('users').update(userUpdates).eq('user_id', id);
    }
    
    res.json({ message: 'User updated successfully' });
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



exports.createWithdrawal = async (req, res) => {
  if (!isConfigured) {
    return res.status(201).json({ message: 'Withdrawal request submitted (Mock Mode)', data: { status: 'pending', amount: req.body.amount, type: req.body.type || 'wallet' } });
  }

  try {
    const { amount, type, method } = req.body; // type: 'wallet' or 'bonus'
    const userId = req.user.id;
    
    if (!amount || !type) return res.status(400).json({ error: 'Amount and type are required' });

    // 1. Check Balance
    const { data: dash, error: dashErr } = await adminClient
      .from('dashboard')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dashErr) throw dashErr;

    const withdrawAmountNum = parseInt(amount.toString().replace(/[^0-9]/g, '')) || 0;
    const currentWalletNum = parseInt((dash.wallet_balance || '0').toString().replace(/[^0-9]/g, '')) || 0;
    const currentBonusNum = parseInt((dash.welcome_bonus || '0').toString().replace(/[^0-9]/g, '')) || 0;

    if (type === 'wallet' && withdrawAmountNum > currentWalletNum) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }
    if (type === 'bonus' && withdrawAmountNum > currentBonusNum) {
      return res.status(400).json({ error: 'Insufficient welcome bonus balance' });
    }

    // 2. Create Withdrawal Record
    // Note: The 'withdrawals' table currently lacks a 'type' column but requires 'user_name'.
    // We merge the type into the method for tracking.
    const { data, error } = await adminClient
      .from('withdrawals')
      .insert([
        {
          user_id: userId,
          user_name: req.user.user_metadata?.full_name || req.user.email || 'User',
          amount: amount.toString(),
          method: `${method || 'Default'} (${type})`,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 3. Log in Activity
    await adminClient.from('activity').insert([{
      user_id: userId,
      title: `Withdrawal (${type})`,
      value: `-${amount}`,
      description: `Pending approval by admin.`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }]);

    res.status(201).json({ message: 'Withdrawal request submitted for approval', data });

  } catch (err) {
    console.error('[Withdrawal] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.adminUpdateWithdrawal = async (req, res) => {
  if (!isConfigured) return res.json({ message: 'Withdrawal status updated (Mock)' });

  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    // 1. Fetch the withdrawal details
    const { data: withdrawal, error: fetchErr } = await adminClient
      .from('withdrawals')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchErr) throw fetchErr;
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });
    if (withdrawal.status !== 'pending') return res.status(400).json({ error: 'Withdrawal already processed' });

    // 2. If approved, deduct from user's dashboard balance
    if (status === 'approved') {
      const { data: dash, error: dashErr } = await adminClient
        .from('dashboard')
        .select('*')
        .eq('user_id', withdrawal.user_id)
        .single();

      if (dashErr) throw dashErr;

      const withdrawAmountNum = parseInt(withdrawal.amount.toString().replace(/[^0-9]/g, '')) || 0;
      
      // Determine type from method since column is missing
      const isBonus = (withdrawal.method || '').toLowerCase().includes('(bonus)');
      const typeStr = isBonus ? 'bonus' : 'wallet';

      if (isBonus) {
        const currentBonusNum = parseInt((dash.welcome_bonus || '0').toString().replace(/[^0-9]/g, '')) || 0;
        const newBonus = `${(currentBonusNum - withdrawAmountNum).toLocaleString()} FBu`;
        await adminClient.from('dashboard').update({ welcome_bonus: newBonus }).eq('user_id', withdrawal.user_id);
      } else {
        const currentWalletNum = parseInt((dash.wallet_balance || '0').toString().replace(/[^0-9]/g, '')) || 0;
        const newWallet = `${(currentWalletNum - withdrawAmountNum).toLocaleString()} FBu`;
        await adminClient.from('dashboard').update({ wallet_balance: newWallet }).eq('user_id', withdrawal.user_id);
      }
      
      // Update activity
      await adminClient.from('activity').insert([{
        user_id: withdrawal.user_id,
        title: 'Withdrawal Approved',
        value: `-${withdrawal.amount}`,
        description: `Your ${typeStr} withdrawal was successful.`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }]);
    }

    // 3. Update withdrawal status
    const { error: updateErr } = await adminClient
      .from('withdrawals')
      .update({ status })
      .eq('id', id);

    if (updateErr) throw updateErr;

    res.json({ message: `Withdrawal ${status} successfully` });

  } catch (err) {
    console.error('[AdminWithdrawal] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  if (isConfigured) {
    try {
      const { data, error } = await client
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${req.user.id},user_id.is.null`)
        .order('created_at', { ascending: false });
      
      if (!error && data) return res.json({ data });
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: [] });
};

exports.adminPushNotification = async (req, res) => {
  const { title, message, type, user_id } = req.body;
  
  if (isConfigured) {
    try {
      const { data, error } = await client
        .from('notifications')
        .insert([{ title, message, type: type || 'info', user_id: user_id || null }])
        .select()
        .single();
      
      if (error) throw error;
      return res.status(201).json({ message: 'Notification pushed', data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  
  res.status(201).json({ message: 'Notification pushed successfully', data: { title, message, type } });
};

exports.getDeposits = async (req, res) => {
  if (isConfigured) {
    try {
      const { data, error } = await client
        .from('deposits')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) return res.json({ data });
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: [] });
};

exports.getWithdrawals = async (req, res) => {
  if (isConfigured) {
    try {
      const { data, error } = await client
        .from('withdrawals')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) return res.json({ data });
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: [] }); // Default empty if no mock withdrawals
};

exports.markNotificationRead = async (req, res) => {
  const { id } = req.params;
  
  if (isConfigured) {
    try {
      const { data, error } = await client
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', req.user.id) // Security check
        .select()
        .single();
      
      if (error) {
        // If it was a global notification (user_id is null), we handle it differently 
        // usually by a junction table, but for MVP we just allow updating if null
        const { data: globalData, error: globalError } = await client
          .from('notifications')
          .update({ read: true })
          .eq('id', id)
          .is('user_id', null)
          .select()
          .single();
        
        if (globalError) throw globalError;
        return res.json({ message: 'Global notification marked as read', data: globalData });
      }
      
      return res.json({ message: 'Notification marked as read', data });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
  
  res.json({ message: 'Notification marked as read server-side' });
};

// ==================== PAYMENT METHODS CRUD ====================

// GET: Fetch all payment methods (admin) or by country (public)
exports.getPaymentMethods = async (req, res) => {
  if (!isConfigured) return res.json({ data: [] });
  try {
    const { country } = req.query;
    let query = client.from('payment_methods').select('*').order('country');
    if (country) query = query.eq('country', country);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ data: data || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST: Create a new payment method
exports.createPaymentMethod = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });
  try {
    const { country, provider, dial_code, phone, account_name } = req.body;
    const { data, error } = await client.from('payment_methods').insert([{
      country, provider, dial_code, phone, account_name
    }]).select().single();
    if (error) throw error;
    res.status(201).json({ message: 'Payment method created', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT: Update a payment method
exports.updatePaymentMethod = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });
  try {
    const { id } = req.params;
    const { country, provider, dial_code, phone, account_name } = req.body;
    const { data, error } = await client.from('payment_methods').update({
      country, provider, dial_code, phone, account_name
    }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ message: 'Payment method updated', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Remove a payment method
exports.deletePaymentMethod = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });
  try {
    const { id } = req.params;
    const { error } = await client.from('payment_methods').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Payment method deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── VIDEO TASKS CRUD ───────────────────────────────────────────────────────

const DEFAULT_TASKS = [
  { id: 1, icon: '☀️', title: 'Solar Energy: The Renewable Power',    video_url: 'https://cdn.pixabay.com/video/2023/03/28/156444-812591952_large.mp4', duration: 15, reward: '3,500 FBu' },
  { id: 2, icon: '⚡', title: 'Solar Tech: Smart Solutions',   video_url: 'https://cdn.pixabay.com/video/2018/03/02/14609-258212436_large.mp4', duration: 20, reward: '3,500 FBu' },
  { id: 3, icon: '🌍', title: 'Clean Energy: Harvesting Sunlight',     video_url: 'https://cdn.pixabay.com/video/2021/05/02/72837-545276870_large.mp4', duration: 15, reward: '3,500 FBu' },
  { id: 4, icon: '🔋', title: 'Future Tech: Sustainable Power',  video_url: 'https://cdn.pixabay.com/video/2015/10/09/922-141891343_medium.mp4', duration: 18, reward: '3,500 FBu' }
];

// GET: Public — list all active tasks (with default fallback and auto-migration)
exports.getTasks = async (req, res) => {
  if (!isConfigured) return res.json({ data: DEFAULT_TASKS });
  try {
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) {
      // Auto-migrate old mixkit URLs to new high-quality ones if they exist in DB
      const migratedData = data.map(task => {
        if (task.video_url.includes('mixkit.co')) {
          const match = DEFAULT_TASKS.find(dt => dt.id === task.id || dt.title.includes(task.title));
          if (match) task.video_url = match.video_url;
        }
        return task;
      });
      return res.json({ data: migratedData });
    }
    
    // Fall back to hardcoded tasks if table empty or missing
    res.json({ data: DEFAULT_TASKS });
  } catch (err) {
    res.json({ data: DEFAULT_TASKS });
  }
};

// POST: Admin — create a new task
exports.adminCreateTask = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });
  try {
    const { icon, title, video_url, duration, reward } = req.body;
    const { data, error } = await adminClient
      .from('tasks')
      .insert([{ icon, title, video_url, duration: parseInt(duration), reward, active: true }])
      .select()
      .single();
    if (error) throw error;
    res.json({ message: 'Task created', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT: Admin — update an existing task
exports.adminUpdateTask = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });
  try {
    const { id } = req.params;
    const { icon, title, video_url, duration, reward } = req.body;
    const { data, error } = await adminClient
      .from('tasks')
      .update({ icon, title, video_url, duration: parseInt(duration), reward })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({ message: 'Task updated', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE: Admin — remove a task
exports.adminDeleteTask = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });
  try {
    const { id } = req.params;
    const { error } = await adminClient.from('tasks').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST: Admin — upload a video file to Supabase Storage
exports.adminUploadVideo = async (req, res) => {
  if (!isConfigured) return res.status(503).json({ error: 'Supabase not configured' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `tasks/${fileName}`;

    console.log(`[Upload] Received file: ${file.originalname} (${file.size} bytes)`);

    // Upload to Supabase Storage (videos bucket)
    const { data, error } = await adminClient
      .storage
      .from('videos')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
        console.error('[Upload] Supabase error:', error);
        if (error.message === 'Bucket not found') {
            return res.status(400).json({ error: "Storage bucket 'videos' not found. Please create it in Supabase dashboard." });
        }
        throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient
      .storage
      .from('videos')
      .getPublicUrl(filePath);

    console.log(`[Upload] Success! URL: ${publicUrl}`);
    res.json({ message: 'Video uploaded successfully', url: publicUrl });
  } catch (err) {
    console.error('[Upload] Fatal error:', err);
    res.status(500).json({ error: err.message || 'Unknown upload error' });
  }
};



// GET: Public — Proxy video (Disabled/Removed due to Vercel streaming issues)
exports.proxyVideo = async (req, res) => {
  res.status(410).send('Proxy disabled. Use direct CDN links instead.');
};

// POST: User completes a task and earns a reward
exports.completeTask = async (req, res) => {
  if (!isConfigured) return res.json({ message: 'Mock Reward credited' });
  
  try {
    const { taskId, reward } = req.body;
    const userId = req.user.id;

    if (!reward || !taskId) {
        return res.status(400).json({ error: 'Task ID and reward amount are required' });
    }

    // UUID Validation Check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.json({ message: 'Task completed (Mock)', balance: '0 FBu' });
    }

    // 1. Check if already completed TODAY (CRITICAL SECURITY)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: existing, error: checkErr } = await adminClient
      .from('completed_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .gte('created_at', today.toISOString());

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'You have already completed this task today.' });
    }

    // 2. Fetch Dashboard
    const { data: dash, error: dashErr } = await adminClient
      .from('dashboard')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dashErr && dashErr.code !== 'PGRST116') throw dashErr;

    // 2. Fetch User Profile for Country
    const { data: profile } = await adminClient.from('profiles').select('country').eq('user_id', userId).single();
    const userCountry = (profile?.country || 'Burundi').toLowerCase();
    
    // Set Rewards & Suffixes per region
    let rewardValueNum = 0;
    let suffix = ' BIF';
    
    if (userCountry === 'rwanda' || userCountry === 'international') {
      rewardValueNum = 2;
      suffix = '$';
    } else if (userCountry === 'kenya') {
      rewardValueNum = 500;
      suffix = ' KSh';
    } else if (userCountry === 'uganda') {
      rewardValueNum = 5000;
      suffix = ' UGX';
    } else if (userCountry === 'tanzania') {
      rewardValueNum = 4500;
      suffix = ' TZS';
    } else {
      // Default: Burundi
      rewardValueNum = 3500;
      suffix = ' BIF';
    }

    const currentBalanceNum = parseInt((dash?.wallet_balance || '0').replace(/[^0-9]/g, '')) || 0;
    const currentEarningsNum = parseInt((dash?.total_earnings || '0').replace(/[^0-9]/g, '')) || 0;

    const finalBalance = (currentBalanceNum + rewardValueNum).toLocaleString();
    const finalEarnings = (currentEarningsNum + rewardValueNum).toLocaleString();

    const newBalance = suffix === '$' ? `$${finalBalance}` : `${finalBalance}${suffix}`;
    const newEarnings = suffix === '$' ? `$${finalEarnings}` : `${finalEarnings}${suffix}`;

    // 3. Update Dashboard (Safer logic)
    if (dash) {
      const { error: updateErr } = await adminClient
        .from('dashboard')
        .update({
          wallet_balance: newBalance,
          total_earnings: newEarnings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await adminClient
        .from('dashboard')
        .insert([{
          user_id: userId,
          wallet_balance: newBalance,
          welcome_bonus: '0 FBu',
          total_earnings: newEarnings,
          active_package: 'None',
          updated_at: new Date().toISOString()
        }]);
      if (insertErr) throw insertErr;
    }

    // 4. Record Completion (CRITICAL SECURITY)
    await adminClient.from('completed_tasks').insert([{
      user_id: userId,
      task_id: taskId
    }]);

    // 5. Log Activity
    await adminClient.from('activity').insert([{
      user_id: userId,
      title: 'Task Reward',
      value: `+${reward}`,
      description: `Completed video task #${taskId}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }]);

    res.json({ message: 'Task completed successfully', balance: newBalance });
  } catch (err) {
    console.error('[TaskComplete] Fatal Error:', err.message);
    res.status(500).json({ error: `System Error: ${err.message}` });
  }
};
// --- SETTINGS MANAGEMENT ---

// GET: Public settings (Support links, etc.)
exports.getSettings = async (req, res) => {
  if (!isConfigured) return res.json({ data: {} });
  try {
    const { data, error } = await adminClient.from('settings').select('key, value');
    if (error) throw error;
    
    // Transform array of [{key, value}] into a single object {key: value}
    const settingsObj = data.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
    
    res.json({ data: settingsObj });
  } catch (err) {
    console.error('[Settings] Fetch error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// PUT: Admin update settings
exports.updateSettings = async (req, res) => {
  if (!isConfigured) return res.status(400).json({ error: 'Supabase not configured' });
  try {
    const settings = req.body; // Expecting {key: value} pairs
    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: String(value),
      updated_at: new Date().toISOString()
    }));

    // Upsert each setting
    for (const update of updates) {
      const { error } = await adminClient
        .from('settings')
        .upsert(update, { onConflict: 'key' });
      if (error) throw error;
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('[Settings] Update error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
