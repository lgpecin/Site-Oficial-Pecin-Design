
CREATE TABLE public.client_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.budget_clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  start_date DATE,
  discount_type TEXT NOT NULL DEFAULT 'none',
  discount_value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_budgets TO authenticated;
GRANT ALL ON public.client_budgets TO service_role;
ALTER TABLE public.client_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their budgets" ON public.client_budgets
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_client_budgets_updated_at BEFORE UPDATE ON public.client_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES public.client_budgets(id) ON DELETE CASCADE,
  client_service_id UUID REFERENCES public.client_services(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  delivery_days INTEGER NOT NULL DEFAULT 1,
  quantity INTEGER NOT NULL DEFAULT 1,
  group_label TEXT,
  group_color TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_items TO authenticated;
GRANT ALL ON public.budget_items TO service_role;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their budget items" ON public.budget_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.client_budgets b WHERE b.id = budget_items.budget_id AND b.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.client_budgets b WHERE b.id = budget_items.budget_id AND b.user_id = auth.uid())
  );

CREATE INDEX idx_client_budgets_client ON public.client_budgets(client_id);
CREATE INDEX idx_budget_items_budget ON public.budget_items(budget_id);
