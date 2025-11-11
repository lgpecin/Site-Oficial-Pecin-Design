-- Create moodboard pages table
CREATE TABLE public.moodboard_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create moodboard elements table
CREATE TABLE public.moodboard_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.moodboard_pages(id) ON DELETE CASCADE,
  element_type TEXT NOT NULL, -- 'image', 'text', 'shape', 'arrow', 'drawing'
  element_data JSONB NOT NULL, -- Store fabric.js object data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create saved items table (favorites)
CREATE TABLE public.saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL, -- 'project', 'material', 'service', 'client'
  item_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create planning items table
CREATE TABLE public.planning_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moodboard_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moodboard_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for moodboard_pages
CREATE POLICY "Admins can manage all moodboard pages"
ON public.moodboard_pages
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own moodboard pages"
ON public.moodboard_pages
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for moodboard_elements
CREATE POLICY "Admins can manage all moodboard elements"
ON public.moodboard_elements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage elements of their pages"
ON public.moodboard_elements
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.moodboard_pages
    WHERE moodboard_pages.id = moodboard_elements.page_id
    AND moodboard_pages.user_id = auth.uid()
  )
);

-- RLS Policies for saved_items
CREATE POLICY "Admins can manage all saved items"
ON public.saved_items
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own saved items"
ON public.saved_items
FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for planning_items
CREATE POLICY "Admins can manage all planning items"
ON public.planning_items
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can manage their own planning items"
ON public.planning_items
FOR ALL
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_moodboard_pages_user_id ON public.moodboard_pages(user_id);
CREATE INDEX idx_moodboard_elements_page_id ON public.moodboard_elements(page_id);
CREATE INDEX idx_saved_items_user_id ON public.saved_items(user_id);
CREATE INDEX idx_planning_items_user_id ON public.planning_items(user_id);