-- Solar Africa Database Schema
-- This script will reset the database and set up all tables and policies.

-- Clean up existing tables (Warning: This will delete existing data in these tables)
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS dashboard CASCADE;
DROP TABLE IF EXISTS activity CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS top_referrals CASCADE;
DROP TABLE IF EXISTS stats CASCADE;
DROP TABLE IF EXISTS deposits CASCADE;
DROP TABLE IF EXISTS users CASCADE;

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
  name TEXT NOT NULL, -- This is the Username
  email TEXT,
  phone TEXT,
  country TEXT,
  referred_by TEXT DEFAULT 'Solar Africa',
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

-- Withdrawals table
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
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

CREATE POLICY "Allow profile creation" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Dashboard: users can only see their own dashboard
CREATE POLICY "Users can view own dashboard" ON dashboard
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow dashboard creation" ON dashboard
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own dashboard" ON dashboard
  FOR UPDATE USING (auth.uid() = user_id);

-- Activity: users can only see their own activity
CREATE POLICY "Users can view own activity" ON activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow activity insertion" ON activity
  FOR INSERT WITH CHECK (true);

-- Referrals: users can only see their own referrals
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow referrals creation" ON referrals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own referrals" ON referrals
  FOR UPDATE USING (auth.uid() = user_id);

-- Top referrals: users can only see their own top referrals
CREATE POLICY "Users can view own top referrals" ON top_referrals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow top referrals creation" ON top_referrals
  FOR INSERT WITH CHECK (true);

-- Stats: only readable by authenticated users (for admin panel)
CREATE POLICY "Stats are viewable by authenticated users" ON stats
  FOR SELECT USING (auth.role() = 'authenticated');

-- Deposits: users can only see their own deposits
CREATE POLICY "Users can view own deposits" ON deposits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow deposits creation" ON deposits
  FOR INSERT WITH CHECK (true);

-- Users: only readable by authenticated users (for admin panel)
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow user record creation" ON users
  FOR INSERT WITH CHECK (true);

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" ON withdrawals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow withdrawals creation" ON withdrawals
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Withdrawals are viewable by authenticated users" ON withdrawals
  FOR SELECT USING (auth.role() = 'authenticated');



-- Insert sample data
-- Insert 24 premium solar packages
INSERT INTO packages (name, amount, bonus, description, active) VALUES
  ('Mono Starter', '80,000 BIF', '210,000 BIF', 'Entry-level solar investment with instant rewards.', 144),
  ('Poly Basic', '120,000 BIF', '320,000 BIF', 'Standard solar plan for consistent growth.', 102),
  ('Thin Film', '160,000 BIF', '450,000 BIF', 'Flexible solar technology investment.', 94),
  ('Off-Grid Lite', '200,000 BIF', '600,000 BIF', 'Small scale off-grid solar solution.', 88),
  ('Hybrid Lite', '240,000 BIF', '800,000 BIF', 'Combined energy source lite investment.', 76),
  ('Grid-Tied Lite', '280,000 BIF', '1,000,000 BIF', 'Connected grid lite solar plan.', 65),
  ('Solar Storage', '320,000 BIF', '1,300,000 BIF', 'Advanced battery storage solar investment.', 58),
  ('Smart Solar', '360,000 BIF', '1,700,000 BIF', 'Intelligent energy management plan.', 52),
  ('PV Entry', '400,000 BIF', '2,100,000 BIF', 'Entry level Photovoltaic investment.', 48),
  ('PV Basic', '440,000 BIF', '2,500,000 BIF', 'Fundamental PV solar system plan.', 44),
  ('PV Standard', '480,000 BIF', '3,000,000 BIF', 'Standard PV performance investment.', 40),
  ('PV Plus', '520,000 BIF', '3,600,000 BIF', 'Enhanced PV solar returns plan.', 38),
  ('PV Pro', '560,000 BIF', '4,200,000 BIF', 'Professional grade PV investment.', 35),
  ('PV Max', '600,000 BIF', '4,800,000 BIF', 'Maximum capacity PV solar plan.', 32),
  ('Off-Grid Pro', '640,000 BIF', '5,200,000 BIF', 'Professional off-grid solar systems.', 28),
  ('Hybrid Pro', '680,000 BIF', '5,600,000 BIF', 'High-end hybrid solar solution.', 25),
  ('Grid-Tied Pro', '720,000 BIF', '6,000,000 BIF', 'Full grid-tied professional system.', 22),
  ('Solar Battery', '760,000 BIF', '6,400,000 BIF', 'Dedicated high-capacity battery plan.', 20),
  ('Storage Plus', '800,000 BIF', '6,800,000 BIF', 'Ultimate storage and energy backup.', 18),
  ('Smart Hybrid', '840,000 BIF', '7,100,000 BIF', 'Intelligent hybrid energy investment.', 15),
  ('PV Ultra', '880,000 BIF', '7,400,000 BIF', 'Ultra-performance solar technology.', 12),
  ('Solar Array', '920,000 BIF', '7,600,000 BIF', 'Large scale solar array investment.', 10),
  ('Solar Plant', '960,000 BIF', '7,800,000 BIF', 'Industrial solar plant ownership.', 8),
  ('Commercial Solar', '1,000,000 BIF', '8,000,000 BIF', 'Top-tier commercial solar partnership.', 5);

INSERT INTO stats (users, packages, deposits, withdrawals, total_payouts) VALUES
  (4320, 5, 1060, 420, '128,430,000 BIF');

-- Note: For a real application, you would insert user-specific data
-- based on the authenticated user's ID. The mock data in the backend
-- serves as a fallback when Supabase is not configured.