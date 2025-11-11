-- Add expires_at column to service_share_links
ALTER TABLE public.service_share_links
ADD COLUMN expires_at timestamp with time zone;