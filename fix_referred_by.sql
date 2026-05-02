-- ============================================================
-- STEP 1: View all users (sorted by date - use this to match your records)
-- ============================================================
SELECT 
  p.name,
  p.referred_by,
  p.email,
  p.created_at::DATE AS joined_date
FROM profiles p
ORDER BY p.created_at ASC;


-- ============================================================
-- STEP 2: Bulk-update downlines for each inviter
-- Edit the names below to match your actual referral records
-- You can run each UPDATE block separately
-- ============================================================

-- Example (replace with real names before running):
-- UPDATE profiles 
-- SET referred_by = 'KALISA' 
-- WHERE name IN (
--   'leandre',
--   'Oscarnduwimana',
--   'Samuel123',
--   'Nsengimanaerinest',
--   'Richard ngabirane'
-- );

-- Add more blocks for other inviters:
-- UPDATE profiles SET referred_by = 'OtherInviter' WHERE name IN ('UserA', 'UserB');


-- ============================================================
-- STEP 3: Verify the fix worked
-- ============================================================
SELECT name, referred_by FROM profiles ORDER BY referred_by, name;
