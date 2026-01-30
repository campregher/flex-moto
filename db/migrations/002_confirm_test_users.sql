-- Migration: helper to confirm test users
-- Use in SQL Editor to confirm individual test users or a group.

-- Function: confirm a user by email
CREATE OR REPLACE FUNCTION public.confirm_user_by_email(target_email text)
RETURNS void AS $$
BEGIN
  UPDATE auth.users SET email_confirmed_at = now() WHERE email = target_email;
END; $$ LANGUAGE plpgsql;

-- Usage examples:
-- SELECT public.confirm_user_by_email('test@example.com');
-- or confirm all emails matching a pattern (careful):
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email LIKE 'test_%';

-- Note: Run these from the Supabase SQL Editor (admin role). Do NOT expose this to the public frontend.
