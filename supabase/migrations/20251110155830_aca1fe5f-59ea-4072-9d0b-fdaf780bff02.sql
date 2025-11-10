-- Primeira migration: apenas adicionar os novos valores ao enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'visitor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sheet_user';