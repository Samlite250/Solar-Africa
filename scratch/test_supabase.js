const path = require('path');
const { client, isConfigured } = require(path.join(__dirname, '../backend/config/supabase'));

async function testConnection() {
  console.log('Testing Supabase Connection...');
  console.log('Is Configured:', isConfigured);
  
  if (!isConfigured) {
    console.error('❌ Supabase URL or Key missing in .env');
    return;
  }

  const tables = ['packages', 'profiles', 'dashboard', 'activity', 'referrals', 'users'];
  
  for (const table of tables) {
    try {
      const { data, error } = await client.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Table "${table}" error:`, error.message);
      } else {
        console.log(`✅ Table "${table}" is accessible.`);
      }
    } catch (e) {
      console.error(`❌ Unexpected error for table "${table}":`, e.message);
    }
  }
}

testConnection();
