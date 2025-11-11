-- Add icon and color columns to clients table
ALTER TABLE public.clients
ADD COLUMN icon text,
ADD COLUMN color text DEFAULT '#6366f1';