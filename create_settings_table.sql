-- =====================================================
-- SOLAR AFRICA - SETTINGS TABLE
-- Run this in Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS public.settings (
    id BIGSERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default support settings if they don't exist
INSERT INTO public.settings (key, value) VALUES
('whatsapp_group', 'https://wa.me/25760000000'),
('telegram_channel', 'https://t.me/solarafrica'),
('support_email', 'support@solarafrica.com'),
('platform_name', 'Solar Africa')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read settings
CREATE POLICY "Public read access for settings"
ON public.settings FOR SELECT
TO public
USING (true);

-- Policy: Only admin can update settings
-- Note: Admin uses service-role key which bypasses RLS anyway,
-- but this is good practice for the adminClient logic.
CREATE POLICY "Admin full access for settings"
ON public.settings FOR ALL
TO authenticated
USING (auth.jwt()->>'email' = 'admin@solarafrica.com'); -- adjust as needed
