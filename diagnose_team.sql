-- Check the 5 most recent registrations to see if referred_by was saved
SELECT name, referred_by, created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;
