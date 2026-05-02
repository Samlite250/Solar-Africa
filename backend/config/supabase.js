const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from one level up (backend root)
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Explicitly check for service key

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

if (isConfigured && !SUPABASE_SERVICE_KEY) {
  console.warn('⚠️ SUPABASE_SERVICE_KEY is missing. Admin operations (uploads, balance updates) will run using the Anon key and may be blocked by RLS.');
}

// Read client — uses anon key, subject to RLS
const client = isConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Admin/Write client — bypasses RLS entirely for server-side writes
// If SERVICE_KEY is missing, it falls back to SUPABASE_KEY (anon)
const adminClient = isConfigured ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
}) : null;

if (!isConfigured) {
  console.warn('⚠️ Supabase not configured. Using mock data fallback.');
}

module.exports = { client, adminClient, isConfigured };
