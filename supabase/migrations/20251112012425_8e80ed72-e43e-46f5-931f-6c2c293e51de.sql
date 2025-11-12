-- Create weekly schedule cards table
CREATE TABLE public.weekly_schedule_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time TIME,
  color TEXT DEFAULT '#6366f1',
  tags TEXT[] DEFAULT '{}',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.weekly_schedule_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all weekly schedule cards"
ON public.weekly_schedule_cards
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Users can manage their own weekly schedule cards"
ON public.weekly_schedule_cards
FOR ALL
USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_weekly_schedule_cards_user_id ON public.weekly_schedule_cards(user_id);
CREATE INDEX idx_weekly_schedule_cards_day ON public.weekly_schedule_cards(day_of_week);

-- Create updated_at trigger
CREATE TRIGGER update_weekly_schedule_cards_updated_at
BEFORE UPDATE ON public.weekly_schedule_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();