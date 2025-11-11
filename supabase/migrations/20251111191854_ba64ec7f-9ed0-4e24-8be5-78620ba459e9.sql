-- Drop old planning_items table and create new kanban structure
DROP TABLE IF EXISTS planning_items CASCADE;

-- Create kanban_cards table
CREATE TABLE public.kanban_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  color TEXT DEFAULT '#6366f1',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'todo',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create kanban_checklist_items table
CREATE TABLE public.kanban_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create kanban_attachments table
CREATE TABLE public.kanban_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id UUID NOT NULL REFERENCES kanban_cards(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kanban_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for kanban_cards
CREATE POLICY "Admins can manage all kanban cards"
ON public.kanban_cards FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage their own kanban cards"
ON public.kanban_cards FOR ALL
USING (auth.uid() = user_id);

-- RLS Policies for kanban_checklist_items
CREATE POLICY "Admins can manage all checklist items"
ON public.kanban_checklist_items FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage checklist items of their cards"
ON public.kanban_checklist_items FOR ALL
USING (EXISTS (
  SELECT 1 FROM kanban_cards
  WHERE kanban_cards.id = kanban_checklist_items.card_id
  AND kanban_cards.user_id = auth.uid()
));

-- RLS Policies for kanban_attachments
CREATE POLICY "Admins can manage all attachments"
ON public.kanban_attachments FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can manage attachments of their cards"
ON public.kanban_attachments FOR ALL
USING (EXISTS (
  SELECT 1 FROM kanban_cards
  WHERE kanban_cards.id = kanban_attachments.card_id
  AND kanban_cards.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_kanban_cards_updated_at
BEFORE UPDATE ON public.kanban_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_kanban_cards_user_id ON kanban_cards(user_id);
CREATE INDEX idx_kanban_cards_status ON kanban_cards(status);
CREATE INDEX idx_kanban_cards_due_date ON kanban_cards(due_date);
CREATE INDEX idx_kanban_checklist_card_id ON kanban_checklist_items(card_id);
CREATE INDEX idx_kanban_attachments_card_id ON kanban_attachments(card_id);