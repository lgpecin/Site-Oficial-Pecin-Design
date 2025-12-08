-- Add notes/observations field to projects table
ALTER TABLE public.projects 
ADD COLUMN notes text DEFAULT NULL;