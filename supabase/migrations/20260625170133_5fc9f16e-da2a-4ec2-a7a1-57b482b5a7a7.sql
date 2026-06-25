ALTER TABLE public.services ADD COLUMN IF NOT EXISTS hours numeric NOT NULL DEFAULT 0;
ALTER TABLE public.client_services ADD COLUMN IF NOT EXISTS hours numeric NOT NULL DEFAULT 0;
ALTER TABLE public.budget_items ADD COLUMN IF NOT EXISTS hours numeric NOT NULL DEFAULT 0;