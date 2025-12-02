-- Add hide_banner column to projects table
ALTER TABLE public.projects
ADD COLUMN hide_banner boolean DEFAULT false;

COMMENT ON COLUMN public.projects.hide_banner IS 'If true, the banner image will not be displayed in the project detail modal';