
-- Budget clients
CREATE TABLE public.budget_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_clients TO authenticated;
GRANT ALL ON public.budget_clients TO service_role;

ALTER TABLE public.budget_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage their budget clients"
  ON public.budget_clients FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_budget_clients_updated_at
  BEFORE UPDATE ON public.budget_clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Client services (per-client priced services)
CREATE TABLE public.client_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.budget_clients(id) ON DELETE CASCADE,
  template_service_id uuid REFERENCES public.services(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'outros',
  price numeric NOT NULL DEFAULT 0,
  delivery_days integer NOT NULL DEFAULT 1,
  icon text,
  color text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_services TO authenticated;
GRANT ALL ON public.client_services TO service_role;

ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage services of their clients"
  ON public.client_services FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.budget_clients c
    WHERE c.id = client_services.client_id AND c.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.budget_clients c
    WHERE c.id = client_services.client_id AND c.user_id = auth.uid()
  ));

CREATE TRIGGER update_client_services_updated_at
  BEFORE UPDATE ON public.client_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_client_services_client_id ON public.client_services(client_id);
CREATE INDEX idx_budget_clients_user_id ON public.budget_clients(user_id);
