-- Add display_order column to projects table
ALTER TABLE public.projects 
ADD COLUMN display_order integer DEFAULT 0;

-- Create index for better query performance
CREATE INDEX idx_projects_display_order ON public.projects(display_order);

-- Update existing projects with sequential order based on created_at
UPDATE public.projects 
SET display_order = subquery.row_num 
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num 
  FROM public.projects
) AS subquery 
WHERE projects.id = subquery.id;