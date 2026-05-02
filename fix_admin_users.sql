-- =====================================================
-- SOLAR AFRICA - RECOVER MISSING USERS (v4)
-- Run this in Supabase SQL Editor
-- =====================================================

-- STEP 1: See how many users exist in Supabase Auth vs profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users)    AS auth_users_total,
  (SELECT COUNT(*) FROM profiles)      AS profiles_total,
  (SELECT COUNT(*) FROM users)         AS users_table_total;

-- STEP 2: Show all auth users who are MISSING from profiles
-- (These are users who registered but profile creation silently failed)
SELECT 
  au.id           AS user_id,
  au.email,
  au.raw_user_meta_data->>'full_name' AS name,
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.user_id = au.id
);

-- STEP 3: Create missing profiles for all orphaned auth users
INSERT INTO profiles (user_id, name, created_at)
SELECT 
  au.id,
  COALESCE(
    NULLIF(au.raw_user_meta_data->>'full_name', ''),
    SPLIT_PART(au.email, '@', 1)   -- fallback: use part before @ in email
  ),
  au.created_at
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.user_id = au.id
);

-- STEP 4: Also backfill users table from profiles (for admin view)
INSERT INTO users (user_id, name, status, created_at)
SELECT 
  p.user_id,
  p.name,
  'active',
  p.created_at
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.user_id = p.user_id
);

-- STEP 5: Confirm final counts
SELECT 
  (SELECT COUNT(*) FROM auth.users)    AS auth_users_total,
  (SELECT COUNT(*) FROM profiles)      AS profiles_total,
  (SELECT COUNT(*) FROM users)         AS users_table_total;

-- STEP 6: Show all profiles now (should match auth.users count)
SELECT user_id, name, created_at FROM profiles ORDER BY created_at DESC;
