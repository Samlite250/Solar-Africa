-- Solar Africa: Fix for Username Login 
-- Run this in your Supabase SQL Editor to bypass the RLS block during login

-- This function executes with admin privileges (SECURITY DEFINER)
-- to allow the login system to safely check a username and return the email
-- without exposing your profiles table to the public.

CREATE OR REPLACE FUNCTION get_email_by_username(p_name text)
RETURNS text AS $$
DECLARE
  v_email text;
BEGIN
  SELECT email INTO v_email FROM profiles WHERE name = p_name;
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
