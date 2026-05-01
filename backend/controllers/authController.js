const { client, isConfigured } = require('../config/supabase');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'solar-africa-super-secret-key-2026';

exports.register = async (req, res) => {
  try {
    const { name, email, phone, country, password } = req.body;

    if (!name || !email || !password || !phone || !country) {
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

    if (authError) return res.status(400).json({ error: authError.message });

    const userId = authData.user.id;

    // 2. Initialize Profile (Now including email for username lookup)
    const { error: profileError } = await client.from('profiles').insert([
      { 
        user_id: userId, 
        name, // This is the Username
        email,
        phone,
        country,
        member_since: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
      }
    ]);
    if (profileError) {
      console.warn('⚠️ Profile creation skipped (likely RLS policy missing):', profileError.message);
      // We do NOT return a 400 error here. We allow registration to succeed.
    }

    // 3. Initialize Dashboard
    const { error: dashError } = await client.from('dashboard').insert([
      { 
        user_id: userId, 
        wallet_balance: '0 BIF', 
        welcome_bonus: '10,000 BIF', 
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
        country, 
        status: 'active'
      }
    ]);
    if (userTableError) {
      console.warn('⚠️ User table insertion skipped (likely RLS policy missing):', userTableError.message);
    }

    res.status(201).json({
      message: authData.session 
        ? 'Registration successful!' 
        : 'Registration successful! Please check your email to verify your account before logging in.',
      token: authData.session ? authData.session.access_token : null,
      user: { id: userId, name, email }
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

    if (!isConfigured) {
      return res.status(503).json({ error: 'Supabase is not configured' });
    }

    let loginEmail = identifier;

    // If identifier is not an email, lookup in profiles table
    if (!identifier.includes('@')) {
      const { data: profile, error: lookupError } = await client
        .from('profiles')
        .select('email')
        .eq('name', identifier)
        .single();
      
      if (lookupError || !profile) {
        return res.status(401).json({ error: 'Username not found' });
      }
      loginEmail = profile.email;
    }

    const { data, error } = await client.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (error) return res.status(401).json({ error: error.message });

    res.status(200).json({
      message: 'Login successful',
      token: data.session.access_token,
      user: { 
        id: data.user.id, 
        email: data.user.email, 
        name: data.user.user_metadata.full_name 
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

