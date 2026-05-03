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
