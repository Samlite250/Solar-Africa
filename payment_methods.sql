-- Payment Methods Table
-- Run this in Supabase SQL Editor to create the payment_methods table

CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  country TEXT NOT NULL,
  provider TEXT NOT NULL,
  dial_code TEXT NOT NULL,
  phone TEXT NOT NULL,
  account_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS on this table so the backend can manage it freely
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Allow public read access (users need to see payment info when investing)
CREATE POLICY "Allow public read" ON payment_methods
  FOR SELECT USING (true);

-- Allow service_role full access (backend uses service key)
CREATE POLICY "Allow service write" ON payment_methods
  FOR ALL USING (true) WITH CHECK (true);

-- Seed default Burundi payment method
INSERT INTO payment_methods (country, provider, dial_code, phone, account_name)
VALUES ('Burundi', 'Lumicash', '*163#', '67270398', 'RUKUNDO LOAUNGE');
