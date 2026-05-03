require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSQL() {
  const sql = fs.readFileSync('add_uganda_packages.sql', 'utf8');
  
  // Supabase JS client doesn't support raw SQL easily unless you use a function or RPC.
  // We'll use a simpler approach: run the commands via the client's methods.
  
  console.log("Adding country column (if missing)...");
  // We can't easily run ALTER TABLE via JS client without an RPC. 
  // Let's assume the user can run the SQL in their dashboard or I'll try to find an alternative.
  // Wait, I can use the `adminClient` to insert data. 
  
  // Actually, I'll try to run it via an RPC if available, or just insert the data.
  // If the column is missing, insert will fail. 
  
  // Better way: I'll use a Node script that uses the `pg` library if possible, but I don't have it.
  // I'll just use the `supabase.rpc` if they have a 'exec_sql' function, but they probably don't.
  
  // Let's just try to insert the data. If it fails due to missing column, I'll know.
  const ugandaPackages = [
    { name: 'Mono Starter', amount: '100,000 UGX', bonus: '250,000 UGX', description: 'Entry-level solar investment with instant rewards.', active: 144, country: 'Uganda' },
    { name: 'Poly Basic', amount: '150,000 UGX', bonus: '375,000 UGX', description: 'Standard solar plan for consistent growth.', active: 102, country: 'Uganda' },
    { name: 'Thin Film', amount: '200,000 UGX', bonus: '500,000 UGX', description: 'Flexible solar technology investment.', active: 94, country: 'Uganda' },
    { name: 'Off-Grid Lite', amount: '250,000 UGX', bonus: '650,000 UGX', description: 'Small scale off-grid solar solution.', active: 88, country: 'Uganda' },
    { name: 'Hybrid Lite', amount: '300,000 UGX', bonus: '780,000 UGX', description: 'Combined energy source lite investment.', active: 76, country: 'Uganda' },
    { name: 'Grid-Tied Lite', amount: '350,000 UGX', bonus: '910,000 UGX', description: 'Connected grid lite solar plan.', active: 65, country: 'Uganda' },
    { name: 'Solar Storage', amount: '400,000 UGX', bonus: '1,050,000 UGX', description: 'Advanced battery storage solar investment.', active: 58, country: 'Uganda' },
    { name: 'Smart Solar', amount: '450,000 UGX', bonus: '1,200,000 UGX', description: 'Intelligent energy management plan.', active: 52, country: 'Uganda' },
    { name: 'PV Entry', amount: '500,000 UGX', bonus: '1,350,000 UGX', description: 'Entry level Photovoltaic investment.', active: 48, country: 'Uganda' },
    { name: 'PV Basic', amount: '550,000 UGX', bonus: '1,500,000 UGX', description: 'Fundamental PV solar system plan.', active: 44, country: 'Uganda' },
    { name: 'PV Standard', amount: '600,000 UGX', bonus: '1,700,000 UGX', description: 'Standard PV performance investment.', active: 40, country: 'Uganda' },
    { name: 'PV Plus', amount: '650,000 UGX', bonus: '1,900,000 UGX', description: 'Enhanced PV solar returns plan.', active: 38, country: 'Uganda' },
    { name: 'PV Pro', amount: '700,000 UGX', bonus: '2,100,000 UGX', description: 'Professional grade PV investment.', active: 35, country: 'Uganda' },
    { name: 'PV Max', amount: '750,000 UGX', bonus: '2,300,000 UGX', description: 'Maximum capacity PV solar plan.', active: 32, country: 'Uganda' },
    { name: 'Off-Grid Pro', amount: '800,000 UGX', bonus: '2,500,000 UGX', description: 'Professional off-grid solar systems.', active: 28, country: 'Uganda' },
    { name: 'Hybrid Pro', amount: '850,000 UGX', bonus: '2,700,000 UGX', description: 'High-end hybrid solar solution.', active: 25, country: 'Uganda' },
    { name: 'Grid-Tied Pro', amount: '900,000 UGX', bonus: '2,900,000 UGX', description: 'Full grid-tied professional system.', active: 22, country: 'Uganda' },
    { name: 'Solar Battery', 'amount': '950,000 UGX', bonus: '3,100,000 UGX', description: 'Dedicated high-capacity battery plan.', active: 20, country: 'Uganda' },
    { name: 'Storage Plus', amount: '1,000,000 UGX', bonus: '3,300,000 UGX', description: 'Ultimate storage and energy backup.', active: 18, country: 'Uganda' },
    { name: 'Smart Hybrid', amount: '1,100,000 UGX', bonus: '3,700,000 UGX', description: 'Intelligent hybrid energy investment.', active: 15, country: 'Uganda' },
    { name: 'PV Ultra', amount: '1,200,000 UGX', bonus: '4,100,000 UGX', description: 'Ultra-performance solar technology.', active: 12, country: 'Uganda' },
    { name: 'Solar Array', amount: '1,400,000 UGX', bonus: '4,800,000 UGX', description: 'Large scale solar array investment.', active: 10, country: 'Uganda' },
    { name: 'Solar Plant', amount: '1,800,000 UGX', bonus: '6,200,000 UGX', description: 'Industrial solar plant ownership.', active: 8, country: 'Uganda' },
    { name: 'Commercial Solar', amount: '2,500,000 UGX', bonus: '8,500,000 UGX', description: 'Top-tier commercial solar partnership.', active: 5, country: 'Uganda' }
  ];

  console.log("Attempting to insert Uganda packages...");
  const { error } = await supabase.from('packages').insert(ugandaPackages);

  if (error) {
    if (error.message.includes('column "country" of relation "packages" does not exist')) {
      console.log("Column 'country' is missing. You MUST run the SQL in add_uganda_packages.sql in your Supabase SQL Editor.");
    } else {
      console.error("Error inserting packages:", error);
    }
  } else {
    console.log("Successfully inserted Uganda packages!");
  }
}

runSQL();
