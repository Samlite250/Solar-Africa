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
      const { data, error } = await client.from('packages').select('*');
      if (!error && data) return res.json({ data });
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
    }
  }
  res.json({ data: [] }); // Enforce real data
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

        // 2. Fetch completed tasks
        let completedIds = [];
        const { data: completed } = await client
          .from('completed_tasks')
          .select('task_id')
          .eq('user_id', req.user.id);
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
      // 1. Get current user's profile to get their username (name)
      const { data: profile } = await client
        .from('profiles')
        .select('name')
        .eq('user_id', req.user.id)
        .single();

      if (profile) {
        // 2. Find everyone who was referred by this username
        const { data: teamMembers, error } = await client
          .from('profiles')
          .select('name, country, created_at, member_since')
          .eq('referred_by', profile.name);
        
        if (!error && teamMembers) {
          return res.json({ 
            data: teamMembers.map(m => ({
              id: m.id,
              name: m.name,
              status: 'Active',
              joined: m.member_since || new Date(m.created_at).toLocaleDateString(),
              contribution: '—'
            }))
          });
        }
      }
    } catch (err) {
      console.warn('Supabase fetch error:', err.message);
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
      const [stats, deposits, packages, usersResult] = await Promise.all([
        client.from('stats').select('*').limit(1).single(),
        client.from('deposits').select('*').order('created_at', { ascending: false }).limit(20),
        client.from('packages').select('*'),
        client.from('users').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      // Join dashboard balances and profile info (upline) onto users
      let enrichedUsers = usersResult.data || [];
      if (enrichedUsers.length > 0) {
        const userIds = enrichedUsers.map(u => u.user_id).filter(Boolean);
        if (userIds.length > 0) {
          const [dashboardsRes, profilesRes] = await Promise.all([
            client.from('dashboard').select('user_id, wallet_balance, welcome_bonus, total_earnings').in('user_id', userIds),
            client.from('profiles').select('user_id, referred_by, email, phone').in('user_id', userIds)
          ]);

          const dashMap = {};
          (dashboardsRes.data || []).forEach(d => { dashMap[d.user_id] = d; });
          
          const profMap = {};
          (profilesRes.data || []).forEach(p => { profMap[p.user_id] = p; });

          enrichedUsers = enrichedUsers.map(u => ({
            ...u,
            email: profMap[u.user_id]?.email || u.email,
            phone: profMap[u.user_id]?.phone || u.phone,
            upline: profMap[u.user_id]?.referred_by || 'Solar Africa',
            wallet_balance: dashMap[u.user_id]?.wallet_balance || '0 FBu',
            welcome_bonus: dashMap[u.user_id]?.welcome_bonus || '0 FBu',
            total_earnings: dashMap[u.user_id]?.total_earnings || '0 FBu'
          }));
        }
      }

      return res.json({
        metrics: stats.data || { users: enrichedUsers.length, packages: (packages.data||[]).length, deposits: 0, withdrawals: 0, total_payouts: '0 BIF' },
        deposits: deposits.data || [],
        packages: packages.data || [],
        users: enrichedUsers,
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

exports.completeTask = async (req, res) => {
  if (!isConfigured) return res.status(200).json({ message: 'Task completed (Mock)' });

  try {
    const { reward, taskId } = req.body;
    if (!taskId) return res.status(400).json({ error: 'Task ID required' });

    // 1. Check if already completed (use adminClient to bypass RLS)
    const { data: existing } = await adminClient
      .from('completed_tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('task_id', taskId)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'You have already completed this task today.' });
    }

    // 2. Parse reward correctly (remove commas)
    const rewardVal = parseFloat(reward.replace(/,/g, '').replace(/[^0-9.]/g, ''));

    // 3. Fetch current dashboard
    const { data: dash } = await adminClient.from('dashboard').select('*').eq('user_id', req.user.id).single();
    
    if (dash) {
      const currentWallet = parseFloat(dash.wallet_balance.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;
      const newWallet = currentWallet + rewardVal;
      const currentEarnings = parseFloat(dash.total_earnings.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;
      const newEarnings = currentEarnings + rewardVal;

      await adminClient.from('dashboard').update({
        wallet_balance: newWallet.toLocaleString() + ' FBu',
        total_earnings: newEarnings.toLocaleString() + ' FBu',
        updated_at: new Date()
      }).eq('user_id', req.user.id);

      // 4. Log activity
      await adminClient.from('activity').insert([{
        user_id: req.user.id,
        title: 'Task Earned',
        value: `+${reward}`,
        description: `Earned ${reward} from watching an advert.`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }]);

      // 5. Mark as completed
      await adminClient.from('completed_tasks').insert([{
        user_id: req.user.id,
        task_id: taskId
      }]);
    }

    res.json({ message: 'Task reward credited' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
    await adminClient.from('profiles').update({
      name, email, phone, country, referred_by, updated_at: new Date()
    }).eq('user_id', id);

    // 2. Update Dashboard table
    const { error: dashErr } = await adminClient.from('dashboard').update({
      wallet_balance: wallet_balance || '0 FBu',
      welcome_bonus: welcome_bonus || '0 FBu',
      total_earnings: total_earnings || '0 FBu',
      updated_at: new Date()
    }).eq('user_id', id);

    if (dashErr && dashErr.code === 'PGRST116') {
      // Create if missing
      await adminClient.from('dashboard').insert([{
        user_id: id,
        wallet_balance: wallet_balance || '0 FBu',
        welcome_bonus: welcome_bonus || '0 FBu',
        total_earnings: total_earnings || '0 FBu'
      }]);
    }

    // 3. Update Users table (admin metadata)
    await adminClient.from('users').update({
      name, email, country, status, updated_at: new Date()
    }).eq('user_id', id);
    
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

exports.createWithdrawal = async (req, res) => {
  if (!isConfigured) {
    return res.status(201).json({ message: 'Withdrawal request submitted (Mock Mode)', data: { status: 'pending', amount: req.body.amount } });
  }

  try {
    const { amount } = req.body;
    
    // 1. Create Withdrawal Record
    const { data, error } = await client
      .from('withdrawals')
      .insert([
        {
          user_id: req.user.id,
          user_name: req.user.user_metadata?.full_name || 'User',
          amount,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // 2. Also Log in Activity
    await client.from('activity').insert([{
      user_id: req.user.id,
      title: 'Withdrawal Requested',
      value: `-${amount}`,
      description: `Your withdrawal of ${amount} is pending.`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }]);

    res.status(201).json({ message: 'Withdrawal request submitted', data });

  } catch (err) {
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
  { id: 1, icon: '☀️', title: '☀️ Solar Farm Aerial View',    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-field-with-solar-panels-34560-large.mp4', duration: 15, reward: '3,500 FBu' },
  { id: 2, icon: '⚡', title: '⚡ Solar Panel Installation',   video_url: 'https://assets.mixkit.co/videos/preview/mixkit-technician-installing-solar-panels-on-a-roof-34553-large.mp4', duration: 20, reward: '3,500 FBu' },
  { id: 3, icon: '🌍', title: '🌍 Clean Energy Future',        video_url: 'https://assets.mixkit.co/videos/preview/mixkit-solar-panels-on-a-sunny-day-2394-large.mp4', duration: 15, reward: '3,500 FBu' },
  { id: 4, icon: '🔋', title: '🔋 Solar Charging Solutions',  video_url: 'https://assets.mixkit.co/videos/preview/mixkit-residential-solar-roof-panels-in-daytime-34554-large.mp4', duration: 18, reward: '3,500 FBu' }
];

// GET: Public — list all active tasks (with default fallback)
exports.getTasks = async (req, res) => {
  if (!isConfigured) return res.json({ data: DEFAULT_TASKS });
  try {
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (!error && data && data.length > 0) return res.json({ data });
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



// POST: User completes a task and earns a reward
exports.completeTask = async (req, res) => {
  if (!isConfigured) return res.json({ message: 'Mock Reward credited' });
  
  try {
    const { taskId, reward } = req.body;
    const userId = req.user.id;

    // 2. Fetch current dashboard stats (Removed investment requirement as per user request)
    const { data: dash, error: dashErr } = await adminClient
      .from('dashboard')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (dashErr && dashErr.code !== 'PGRST116') throw dashErr;

    const rewardValueNum = parseInt(reward.replace(/[^0-9]/g, '')) || 0;
    
    let currentBalanceNum = 0;
    let currentEarningsNum = 0;
    
    if (dash) {
      currentBalanceNum = parseInt((dash.wallet_balance || '0').replace(/[^0-9]/g, '')) || 0;
      currentEarningsNum = parseInt((dash.total_earnings || '0').replace(/[^0-9]/g, '')) || 0;
    }

    // 3. Calculate new totals
    const newBalance = `${(currentBalanceNum + rewardValueNum).toLocaleString()} FBu`;
    const newEarnings = `${(currentEarningsNum + rewardValueNum).toLocaleString()} FBu`;

    // 4. Update Dashboard (Using update/insert for better reliability without unique constraint assumptions)
    if (dash) {
      const { error: updateErr } = await adminClient
        .from('dashboard')
        .update({
          wallet_balance: newBalance,
          total_earnings: newEarnings,
          updated_at: new Date()
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
          active_package: 'None'
        }]);
      if (insertErr) throw insertErr;
    }

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
    console.error('[TaskComplete] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
