-- =====================================================
-- SOLAR AFRICA - DIAGNOSTIC QUERY
-- Run this in Supabase SQL Editor to see the current state
-- =====================================================

-- Check counts across all relevant tables
SELECT 'auth.users (Supabase Auth)'  AS source, COUNT(*) AS total FROM auth.users
UNION ALL
SELECT 'profiles table',             COUNT(*) FROM profiles
UNION ALL
SELECT 'users table',                COUNT(*) FROM users;

-- Show what columns exist in profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show what columns exist in users
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show all profiles (these are guaranteed registered users)
SELECT user_id, name, created_at FROM profiles ORDER BY created_at DESC;
