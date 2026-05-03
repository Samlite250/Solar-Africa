-- Add country column to packages
ALTER TABLE packages ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Burundi';

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
