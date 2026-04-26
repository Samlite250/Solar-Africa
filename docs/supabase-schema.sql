-- Solar Africa Supabase Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable Row Level Security (RLS) for all tables
-- This ensures data security and proper access control

-- Packages table
CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  amount TEXT NOT NULL,
  bonus TEXT NOT NULL,
  description TEXT,
  active INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE profiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  member_since TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard data table (per user)
CREATE TABLE dashboard (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_balance TEXT NOT NULL,
  welcome_bonus TEXT NOT NULL,
  active_package TEXT,
  total_earnings TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recent activity table
CREATE TABLE activity (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  date TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referrals table
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_link TEXT NOT NULL,
  referrals INTEGER DEFAULT 0,
  active_investors INTEGER DEFAULT 0,
  referral_bonus TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Top referrals table
CREATE TABLE top_referrals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin stats table
CREATE TABLE stats (
  id SERIAL PRIMARY KEY,
  users INTEGER DEFAULT 0,
  packages INTEGER DEFAULT 0,
  deposits INTEGER DEFAULT 0,
  withdrawals INTEGER DEFAULT 0,
  total_payouts TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Deposits table
CREATE TABLE deposits (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  package_name TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (for admin view)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  country TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE top_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
-- Packages: readable by all authenticated users
CREATE POLICY "Packages are viewable by authenticated users" ON packages
  FOR SELECT USING (auth.role() = 'authenticated');

-- Profiles: users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Dashboard: users can only see their own dashboard
CREATE POLICY "Users can view own dashboard" ON dashboard
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own dashboard" ON dashboard
  FOR UPDATE USING (auth.uid() = user_id);

-- Activity: users can only see their own activity
CREATE POLICY "Users can view own activity" ON activity
  FOR SELECT USING (auth.uid() = user_id);

-- Referrals: users can only see their own referrals
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own referrals" ON referrals
  FOR UPDATE USING (auth.uid() = user_id);

-- Top referrals: users can only see their own top referrals
CREATE POLICY "Users can view own top referrals" ON top_referrals
  FOR SELECT USING (auth.uid() = user_id);

-- Stats: only readable by authenticated users (for admin panel)
CREATE POLICY "Stats are viewable by authenticated users" ON stats
  FOR SELECT USING (auth.role() = 'authenticated');

-- Deposits: users can only see their own deposits
CREATE POLICY "Users can view own deposits" ON deposits
  FOR SELECT USING (auth.uid() = user_id);

-- Users: only readable by authenticated users (for admin panel)
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO packages (name, amount, bonus, description, active) VALUES
  ('Starter Solar', '50,000 BIF', '120,000 BIF', 'A smooth entry package with strong welcome bonus.', 144),
  ('Growth Solar', '100,000 BIF', '261,000 BIF', 'A popular plan for growing your solar portfolio.', 102),
  ('Silver Solar', '200,000 BIF', '560,000 BIF', 'High value returns and faster bonus activation.', 94),
  ('Gold Solar', '300,000 BIF', '900,000 BIF', 'Premium package with proven performance.', 78),
  ('VIP Solar', '1,000,000 BIF', '8,600,000 BIF', 'Best returns and highest VIP rewards.', 22);

INSERT INTO stats (users, packages, deposits, withdrawals, total_payouts) VALUES
  (4320, 5, 1060, 420, '128,430,000 BIF');

-- Note: For a real application, you would insert user-specific data
-- based on the authenticated user's ID. The mock data in the backend
-- serves as a fallback when Supabase is not configured.
