-- =====================================================
-- SOLAR AFRICA - ADMIN PANEL FIX SCRIPT
-- Run this ONCE in your Supabase SQL Editor
-- =====================================================

-- 1. Add missing 'type' column to withdrawals table (if not exists)
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'wallet';

-- 2. Backfill the 'users' table from 'profiles' for any user 
--    whose registration silently failed to insert into users.
INSERT INTO users (user_id, name, email, country, status, created_at)
SELECT 
  p.user_id,
  p.name,
  p.email,
  p.country,
  'active',
  p.created_at
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.user_id = p.user_id
);

-- 3. Allow the admin service role to SELECT all users (RLS fix)
--    Drop old restrictive policy and add a permissive one
DROP POLICY IF EXISTS "Users are viewable by authenticated users" ON users;
CREATE POLICY "Users are viewable by authenticated users" ON users
  FOR SELECT USING (true);

-- 4. Allow UPDATE on users table (for suspend/activate)
DROP POLICY IF EXISTS "Allow user update" ON users;
CREATE POLICY "Allow user update" ON users
  FOR UPDATE USING (true);

-- 5. Allow admin to SELECT all profiles (for enriching user list)
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (true);

-- 6. Allow admin to SELECT all dashboard rows
DROP POLICY IF EXISTS "Admin can view all dashboards" ON dashboard;
CREATE POLICY "Admin can view all dashboards" ON dashboard
  FOR SELECT USING (true);

-- 7. Allow admin to SELECT all deposits
DROP POLICY IF EXISTS "Admin can view all deposits" ON deposits;
CREATE POLICY "Admin can view all deposits" ON deposits
  FOR SELECT USING (true);

-- 8. Allow admin to SELECT all withdrawals
DROP POLICY IF EXISTS "Admin can view all withdrawals" ON withdrawals;
CREATE POLICY "Admin can view all withdrawals" ON withdrawals
  FOR SELECT USING (true);

-- 9. Tasks: allow public read
DROP POLICY IF EXISTS "Tasks are publicly readable" ON tasks;
CREATE POLICY "Tasks are publicly readable" ON tasks
  FOR SELECT USING (true);

-- 10. Completed tasks: allow service role to insert on behalf of any user
DROP POLICY IF EXISTS "Allow completed tasks insertion" ON completed_tasks;
CREATE POLICY "Allow completed tasks insertion" ON completed_tasks
  FOR INSERT WITH CHECK (true);

-- Confirm how many users were backfilled
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_profiles FROM profiles;
