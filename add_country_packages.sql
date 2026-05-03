-- Add country column to packages
ALTER TABLE packages ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Burundi';

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial settings
INSERT INTO settings (key, value) VALUES 
  ('whatsapp_group', 'https://chat.whatsapp.com/default'),
  ('telegram_channel', 'https://t.me/default'),
  ('support_email', 'support@solarafrica.com'),
  ('crypto_address', 'TTRC20ADDRESSPLACEHOLDER')
ON CONFLICT (key) DO NOTHING;

-- Update existing packages to be Burundi
UPDATE packages SET country = 'Burundi' WHERE country IS NULL;

-- Insert Uganda packages
INSERT INTO packages (name, amount, bonus, description, active, country) VALUES
  ('Mono Starter', '100,000 UGX', '250,000 UGX', 'Entry-level solar investment with instant rewards.', 144, 'Uganda'),
  ('Poly Basic', '150,000 UGX', '375,000 UGX', 'Standard solar plan for consistent growth.', 102, 'Uganda'),
  ('Thin Film', '200,000 UGX', '500,000 UGX', 'Flexible solar technology investment.', 94, 'Uganda'),
  ('Off-Grid Lite', '250,000 UGX', '650,000 UGX', 'Small scale off-grid solar solution.', 88, 'Uganda'),
  ('Hybrid Lite', '300,000 UGX', '780,000 UGX', 'Combined energy source lite investment.', 76, 'Uganda'),
  ('Grid-Tied Lite', '350,000 UGX', '910,000 UGX', 'Connected grid lite solar plan.', 65, 'Uganda'),
  ('Solar Storage', '400,000 UGX', '1,050,000 UGX', 'Advanced battery storage solar investment.', 58, 'Uganda'),
  ('Smart Solar', '450,000 UGX', '1,200,000 UGX', 'Intelligent energy management plan.', 52, 'Uganda'),
  ('PV Entry', '500,000 UGX', '1,350,000 UGX', 'Entry level Photovoltaic investment.', 48, 'Uganda'),
  ('PV Basic', '550,000 UGX', '1,500,000 UGX', 'Fundamental PV solar system plan.', 44, 'Uganda'),
  ('PV Standard', '600,000 UGX', '1,700,000 UGX', 'Standard PV performance investment.', 40, 'Uganda'),
  ('PV Plus', '650,000 UGX', '1,900,000 UGX', 'Enhanced PV solar returns plan.', 38, 'Uganda'),
  ('PV Pro', '700,000 UGX', '2,100,000 UGX', 'Professional grade PV investment.', 35, 'Uganda'),
  ('PV Max', '750,000 UGX', '2,300,000 UGX', 'Maximum capacity PV solar plan.', 32, 'Uganda'),
  ('Off-Grid Pro', '800,000 UGX', '2,500,000 UGX', 'Professional off-grid solar systems.', 28, 'Uganda'),
  ('Hybrid Pro', '850,000 UGX', '2,700,000 UGX', 'High-end hybrid solar solution.', 25, 'Uganda'),
  ('Grid-Tied Pro', '900,000 UGX', '2,900,000 UGX', 'Full grid-tied professional system.', 22, 'Uganda'),
  ('Solar Battery', '950,000 UGX', '3,100,000 UGX', 'Dedicated high-capacity battery plan.', 20, 'Uganda'),
  ('Storage Plus', '1,000,000 UGX', '3,300,000 UGX', 'Ultimate storage and energy backup.', 18, 'Uganda'),
  ('Smart Hybrid', '1,100,000 UGX', '3,700,000 UGX', 'Intelligent hybrid energy investment.', 15, 'Uganda'),
  ('PV Ultra', '1,200,000 UGX', '4,100,000 UGX', 'Ultra-performance solar technology.', 12, 'Uganda'),
  ('Solar Array', '1,400,000 UGX', '4,800,000 UGX', 'Large scale solar array investment.', 10, 'Uganda'),
  ('Solar Plant', '1,800,000 UGX', '6,200,000 UGX', 'Industrial solar plant ownership.', 8, 'Uganda'),
  ('Commercial Solar', '2,500,000 UGX', '8,500,000 UGX', 'Top-tier commercial solar partnership.', 5, 'Uganda');

-- Insert Kenya packages
INSERT INTO packages (name, amount, bonus, description, active, country) VALUES
  ('Mono Starter', '4,000 KSh', '10,500 KSh', 'Entry-level solar investment with instant rewards.', 144, 'Kenya'),
  ('Poly Basic', '6,000 KSh', '16,000 KSh', 'Standard solar plan for consistent growth.', 102, 'Kenya'),
  ('Thin Film', '8,000 KSh', '22,000 KSh', 'Flexible solar technology investment.', 94, 'Kenya'),
  ('Off-Grid Lite', '10,000 KSh', '30,000 KSh', 'Small scale off-grid solar solution.', 88, 'Kenya'),
  ('Hybrid Lite', '12,000 KSh', '40,000 KSh', 'Combined energy source lite investment.', 76, 'Kenya'),
  ('Grid-Tied Lite', '14,000 KSh', '50,000 KSh', 'Connected grid lite solar plan.', 65, 'Kenya'),
  ('Solar Storage', '16,000 KSh', '65,000 KSh', 'Advanced battery storage solar investment.', 58, 'Kenya'),
  ('Smart Solar', '18,000 KSh', '85,000 KSh', 'Intelligent energy management plan.', 52, 'Kenya'),
  ('PV Entry', '20,000 KSh', '105,000 KSh', 'Entry level Photovoltaic investment.', 48, 'Kenya'),
  ('PV Basic', '22,000 KSh', '125,000 KSh', 'Fundamental PV solar system plan.', 44, 'Kenya'),
  ('PV Standard', '24,000 KSh', '150,000 KSh', 'Standard PV performance investment.', 40, 'Kenya'),
  ('PV Plus', '26,000 KSh', '180,000 KSh', 'Enhanced PV solar returns plan.', 38, 'Kenya'),
  ('PV Pro', '28,000 KSh', '210,000 KSh', 'Professional grade PV investment.', 35, 'Kenya'),
  ('PV Max', '30,000 KSh', '240,000 KSh', 'Maximum capacity PV solar plan.', 32, 'Kenya'),
  ('Off-Grid Pro', '32,000 KSh', '270,000 KSh', 'Professional off-grid solar systems.', 28, 'Kenya'),
  ('Hybrid Pro', '34,000 KSh', '300,000 KSh', 'High-end hybrid solar solution.', 25, 'Kenya'),
  ('Grid-Tied Pro', '36,000 KSh', '330,000 KSh', 'Full grid-tied professional system.', 22, 'Kenya'),
  ('Solar Battery', '38,000 KSh', '360,000 KSh', 'Dedicated high-capacity battery plan.', 20, 'Kenya'),
  ('Storage Plus', '40,000 KSh', '400,000 KSh', 'Ultimate storage and energy backup.', 18, 'Kenya'),
  ('Smart Hybrid', '45,000 KSh', '450,000 KSh', 'Intelligent hybrid energy investment.', 15, 'Kenya'),
  ('PV Ultra', '50,000 KSh', '520,000 KSh', 'Ultra-performance solar technology.', 12, 'Kenya'),
  ('Solar Array', '60,000 KSh', '650,000 KSh', 'Large scale solar array investment.', 10, 'Kenya'),
  ('Solar Plant', '80,000 KSh', '850,000 KSh', 'Industrial solar plant ownership.', 8, 'Kenya'),
  ('Commercial Solar', '100,000 KSh', '1,100,000 KSh', 'Top-tier commercial solar partnership.', 5, 'Kenya');

-- Insert Tanzania packages
INSERT INTO packages (name, amount, bonus, description, active, country) VALUES
  ('Mono Starter', '80,000 TSH', '200,000 TSH', 'Entry-level solar investment with instant rewards.', 144, 'Tanzania'),
  ('Poly Basic', '120,000 TSH', '300,000 TSH', 'Standard solar plan for consistent growth.', 102, 'Tanzania'),
  ('Thin Film', '160,000 TSH', '400,000 TSH', 'Flexible solar technology investment.', 94, 'Tanzania'),
  ('Off-Grid Lite', '200,000 TSH', '520,000 TSH', 'Small scale off-grid solar solution.', 88, 'Tanzania'),
  ('Hybrid Lite', '240,000 TSH', '624,000 TSH', 'Combined energy source lite investment.', 76, 'Tanzania'),
  ('Grid-Tied Lite', '280,000 TSH', '728,000 TSH', 'Connected grid lite solar plan.', 65, 'Tanzania'),
  ('Solar Storage', '320,000 TSH', '840,000 TSH', 'Advanced battery storage solar investment.', 58, 'Tanzania'),
  ('Smart Solar', '360,000 TSH', '960,000 TSH', 'Intelligent energy management plan.', 52, 'Tanzania'),
  ('PV Entry', '400,000 TSH', '1,080,000 TSH', 'Entry level Photovoltaic investment.', 48, 'Tanzania'),
  ('PV Basic', '440,000 TSH', '1,200,000 TSH', 'Fundamental PV solar system plan.', 44, 'Tanzania'),
  ('PV Standard', '480,000 TSH', '1,360,000 TSH', 'Standard PV performance investment.', 40, 'Tanzania'),
  ('PV Plus', '520,000 TSH', '1,520,000 TSH', 'Enhanced PV solar returns plan.', 38, 'Tanzania'),
  ('PV Pro', '560,000 TSH', '1,680,000 TSH', 'Professional grade PV investment.', 35, 'Tanzania'),
  ('PV Max', '600,000 TSH', '1,840,000 TSH', 'Maximum capacity PV solar plan.', 32, 'Tanzania'),
  ('Off-Grid Pro', '640,000 TSH', '2,000,000 TSH', 'Professional off-grid solar systems.', 28, 'Tanzania'),
  ('Hybrid Pro', '680,000 TSH', '2,160,000 TSH', 'High-end hybrid solar solution.', 25, 'Tanzania'),
  ('Grid-Tied Pro', '720,000 TSH', '2,320,000 TSH', 'Full grid-tied professional system.', 22, 'Tanzania'),
  ('Solar Battery', '760,000 TSH', '2,480,000 TSH', 'Dedicated high-capacity battery plan.', 20, 'Tanzania'),
  ('Storage Plus', '800,000 TSH', '2,640,000 TSH', 'Ultimate storage and energy backup.', 18, 'Tanzania'),
  ('Smart Hybrid', '880,000 TSH', '2,960,000 TSH', 'Intelligent hybrid energy investment.', 15, 'Tanzania'),
  ('PV Ultra', '960,000 TSH', '3,280,000 TSH', 'Ultra-performance solar technology.', 12, 'Tanzania'),
  ('Solar Array', '1,120,000 TSH', '3,840,000 TSH', 'Large scale solar array investment.', 10, 'Tanzania'),
  ('Solar Plant', '1,440,000 TSH', '4,960,000 TSH', 'Industrial solar plant ownership.', 8, 'Tanzania'),
  ('Commercial Solar', '2,000,000 TSH', '6,800,000 TSH', 'Top-tier commercial solar partnership.', 5, 'Tanzania');

-- Insert International packages (USD)
INSERT INTO packages (name, amount, bonus, description, active, country) VALUES
  ('Mono Starter', '$50', '$125', 'Entry-level solar investment with instant rewards.', 144, 'International'),
  ('Poly Basic', '$75', '$190', 'Standard solar plan for consistent growth.', 102, 'International'),
  ('Thin Film', '$100', '$250', 'Flexible solar technology investment.', 94, 'International'),
  ('Off-Grid Lite', '$150', '$390', 'Small scale off-grid solar solution.', 88, 'International'),
  ('Hybrid Lite', '$200', '$520', 'Combined energy source lite investment.', 76, 'International'),
  ('Grid-Tied Lite', '$250', '$650', 'Connected grid lite solar plan.', 65, 'International'),
  ('Solar Storage', '$300', '$780', 'Advanced battery storage solar investment.', 58, 'International'),
  ('Smart Solar', '$350', '$920', 'Intelligent energy management plan.', 52, 'International'),
  ('PV Entry', '$400', '$1,050', 'Entry level Photovoltaic investment.', 48, 'International'),
  ('PV Basic', '$450', '$1,200', 'Fundamental PV solar system plan.', 44, 'International'),
  ('PV Standard', '$500', '$1,350', 'Standard PV performance investment.', 40, 'International'),
  ('PV Plus', '$550', '$1,550', 'Enhanced PV solar returns plan.', 38, 'International'),
  ('PV Pro', '$600', '$1,750', 'Professional grade PV investment.', 35, 'International'),
  ('PV Max', '$700', '$2,000', 'Maximum capacity PV solar plan.', 32, 'International'),
  ('Off-Grid Pro', '$800', '$2,300', 'Professional off-grid solar systems.', 28, 'International'),
  ('Hybrid Pro', '$900', '$2,600', 'High-end hybrid solar solution.', 25, 'International'),
  ('Grid-Tied Pro', '$1,000', '$2,900', 'Full grid-tied professional system.', 22, 'International'),
  ('Solar Battery', '$1,100', '$3,200', 'Dedicated high-capacity battery plan.', 20, 'International'),
  ('Storage Plus', '$1,250', '$3,600', 'Ultimate storage and energy backup.', 18, 'International'),
  ('Smart Hybrid', '$1,500', '$4,200', 'Intelligent hybrid energy investment.', 15, 'International'),
  ('PV Ultra', '$1,800', '$5,000', 'Ultra-performance solar technology.', 12, 'International'),
  ('Solar Array', '$2,200', '$6,200', 'Large scale solar array investment.', 10, 'International'),
  ('Solar Plant', '$2,800', '$8,000', 'Industrial solar plant ownership.', 8, 'International'),
  ('Commercial Solar', '$3,500', '$10,500', 'Top-tier commercial solar partnership.', 5, 'International');
