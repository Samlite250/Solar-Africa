const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

const isConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
const client = isConfigured ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

module.exports = { client, isConfigured };
