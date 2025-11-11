-- Add user expiration and remove RPG sheets
-- First, delete all sheet_user roles and drop RPG sheets table
DELETE FROM public.user_roles WHERE role = 'sheet_user';
DROP TABLE IF EXISTS public.rpg_sheets CASCADE;

-- Add expiration field to profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT NULL;

-- Add index for checking expired users  
CREATE INDEX IF NOT EXISTS idx_profiles_expires_at ON public.profiles(expires_at) WHERE expires_at IS NOT NULL;

-- Add comment to document the field
COMMENT ON COLUMN public.profiles.expires_at IS 'When set, user access expires at this timestamp. NULL means permanent access.';