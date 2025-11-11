-- Add image_spacing column to projects table
ALTER TABLE public.projects 
ADD COLUMN image_spacing integer DEFAULT 16;