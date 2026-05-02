const { client, isConfigured } = require('../config/supabase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'solar-africa-super-secret-key-2026';

exports.register = async (req, res) => {
  try {
    const { name, email, phone, country, password, referred_by } = req.body;

    console.log(`[Register] Attempting signup for email: ${email}`);

    if (!name || !email || !password || !phone || !country) {
      console.warn('[Register] Missing fields in payload:', req.body);
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isConfigured) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    });

    if (authError) {
      console.warn('⚠️ Supabase Auth Error:', authError.message);
      return res.status(400).json({ error: authError.message });
    }

    if (!authData || !authData.user) {
      return res.status(400).json({ error: 'Registration failed. The email might already be registered.' });
    }

    const userId = authData.user.id;

    // 2. Initialize Profile (Now including email for username lookup and referral tracking)
    const { error: profileError } = await client.from('profiles').insert([
      { 
        user_id: userId, 
        name, // This is the Username
        email,
        phone,
        country,
        referred_by: referred_by || 'Solar Africa',
        member_since: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
      }
    ]);
    if (profileError) {
      console.warn('⚠️ Profile creation error:', profileError.message);
      // Fallback: If profile creation fails, we still let the user login, but warn them
      // We no longer abort registration entirely because their Auth account was already created
      // return res.status(400).json({ error: `Profile creation failed: ${profileError.message}` });
    }

    // 3. Initialize Dashboard
    const { error: dashError } = await client.from('dashboard').insert([
      { 
        user_id: userId, 
        wallet_balance: '0 BIF', 
        welcome_bonus: '0 BIF', 
        total_earnings: '0 BIF' 
      }
    ]);
    if (dashError) {
      console.warn('⚠️ Dashboard creation skipped (likely RLS policy missing):', dashError.message);
      // We do NOT return a 400 error here. We allow registration to succeed.
    }

    // 4. Initialize User (for admin view)
    const { error: userTableError } = await client.from('users').insert([
      { 
        user_id: userId, 
        name, 
        email,
        country, 
        status: 'active'
      }
    ]);
    if (userTableError) {
      console.warn('⚠️ User table insertion skipped:', userTableError.message);
    }

    const hasSession = Boolean(authData.session);
    res.status(201).json({
      message: hasSession
        ? 'Registration successful! Welcome to Solar Africa.'
        : 'Registration successful! Please check your email to verify your account, then log in.',
      token: hasSession ? authData.session.access_token : null,
      user: { id: userId, name, email, country, phone },
      requiresEmailVerification: !hasSession
    });



  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email: identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password required' });
    }

    // --- HARDCODED MASTER ADMIN BYPASS ---
    if (identifier.toLowerCase() === 'supportsolarafrica@gmail.com' && password === '@Samlite250') {
      return res.status(200).json({
        message: 'Master Admin Access Granted',
        token: 'solar-master-admin-token',
        user: { 
          id: 'master-admin', 
          email: 'supportsolarafrica@gmail.com', 
          name: 'Admin',
          role: 'admin',
          country: 'Global',
          phone: '+25700000000'
        }
      });
    }
    // -------------------------------------

    if (!isConfigured) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    let loginEmail = identifier;

    // If identifier is not an email, lookup in profiles table
    if (!identifier.includes('@')) {
      let emailFound = null;
      
      // Try RPC first (which bypasses RLS safely if the SQL function was created)
      const { data: rpcData, error: rpcError } = await client.rpc('get_email_by_username', { p_name: identifier });
      
      if (!rpcError && rpcData) {
        emailFound = rpcData;
      } else {
        // Fallback to normal query which might be blocked by RLS
        const { data: profile, error: lookupError } = await client
          .from('profiles')
          .select('email')
          .eq('name', identifier)
          .single();
        
        if (profile) emailFound = profile.email;
      }
      
      if (!emailFound) {
        return res.status(401).json({ error: 'Username not found. Please log in with Email, or run fix_auth.sql in Supabase.' });
      }
      loginEmail = emailFound;
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) return res.status(401).json({ error: `Authentication failed: ${error.message}` });

    // Fetch extended profile data
    const { data: profile } = await client
      .from('profiles')
      .select('name, country, phone')
      .eq('user_id', data.user.id)
      .single();

    // Grant Admin Role to specific Master Accounts
    const isMasterAdmin = (
      profile?.name === 'soral1' || 
      profile?.name?.toLowerCase() === 'admin' ||
      data.user.email.toLowerCase().includes('admin') || 
      data.user.email.toLowerCase() === 'supportsolarafrica@gmail.com'
    );

    res.status(200).json({
      message: 'Login successful',
      token: data.session.access_token,
      user: { 
        id: data.user.id, 
        email: data.user.email, 
        name: profile?.name || data.user.user_metadata.full_name,
        country: profile?.country || 'Burundi',
        phone: profile?.phone || '',
        role: isMasterAdmin ? 'admin' : 'user'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// Middleware to protect routes using Supabase Session
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized to access this route' });
  }

  // --- HARDCODED MASTER ADMIN BYPASS ---
  if (token === 'solar-master-admin-token') {
    req.user = { id: 'master-admin', role: 'admin', email: 'supportsolarafrica@gmail.com' };
    return next();
  }
  // -------------------------------------

  try {
    const { data: { user }, error } = await client.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Not authorized, token failed' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

