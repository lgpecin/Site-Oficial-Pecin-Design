-- Create bookmark folders table
CREATE TABLE public.bookmark_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  parent_id UUID REFERENCES public.bookmark_folders(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.bookmark_folders(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'link',
  color TEXT DEFAULT '#6366f1',
  preview_image TEXT,
  is_active BOOLEAN DEFAULT true,
  last_checked TIMESTAMP WITH TIME ZONE,
  tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bookmark_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bookmark_folders
CREATE POLICY "Users can manage their own folders"
  ON public.bookmark_folders
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all folders"
  ON public.bookmark_folders
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for bookmarks
CREATE POLICY "Users can manage their own bookmarks"
  ON public.bookmarks
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookmarks"
  ON public.bookmarks
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better performance
CREATE INDEX idx_bookmark_folders_user_id ON public.bookmark_folders(user_id);
CREATE INDEX idx_bookmark_folders_parent_id ON public.bookmark_folders(parent_id);
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_folder_id ON public.bookmarks(folder_id);
CREATE INDEX idx_bookmarks_tags ON public.bookmarks USING GIN(tags);

-- Create trigger for updated_at
CREATE TRIGGER update_bookmark_folders_updated_at
  BEFORE UPDATE ON public.bookmark_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookmarks_updated_at
  BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();