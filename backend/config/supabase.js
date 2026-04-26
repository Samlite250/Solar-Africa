const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from one level up (backend root)
dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
const client = isConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

if (!isConfigured) {
  console.warn('⚠️ Supabase not configured. Using mock data fallback.');
}

module.exports = { client, isConfigured };
