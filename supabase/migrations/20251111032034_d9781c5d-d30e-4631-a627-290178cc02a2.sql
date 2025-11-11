-- Add file_type column to project_images table
ALTER TABLE project_images ADD COLUMN file_type TEXT NOT NULL DEFAULT 'image';

-- Add file_size column to store file dimensions metadata
ALTER TABLE project_images ADD COLUMN metadata JSONB;