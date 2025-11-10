-- Segunda migration: criar tabelas e policies

-- Criar tabela de clientes
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de produtos dos clientes
CREATE TABLE public.client_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de fichas de RPG
CREATE TABLE public.rpg_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  character_class TEXT,
  level INTEGER DEFAULT 1,
  race TEXT,
  background TEXT,
  alignment TEXT,
  
  -- Atributos
  strength INTEGER DEFAULT 10,
  dexterity INTEGER DEFAULT 10,
  constitution INTEGER DEFAULT 10,
  intelligence INTEGER DEFAULT 10,
  wisdom INTEGER DEFAULT 10,
  charisma INTEGER DEFAULT 10,
  
  -- Stats
  max_hp INTEGER DEFAULT 10,
  current_hp INTEGER DEFAULT 10,
  armor_class INTEGER DEFAULT 10,
  initiative INTEGER DEFAULT 0,
  speed INTEGER DEFAULT 30,
  
  -- Extras
  skills JSONB DEFAULT '[]',
  equipment JSONB DEFAULT '[]',
  spells JSONB DEFAULT '[]',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpg_sheets ENABLE ROW LEVEL SECURITY;

-- Policies para clients (apenas admins)
CREATE POLICY "Admins can manage clients"
  ON public.clients
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies para client_products (apenas admins)
CREATE POLICY "Admins can manage client products"
  ON public.client_products
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Policies para rpg_sheets
CREATE POLICY "Admins can view all sheets"
  ON public.rpg_sheets
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all sheets"
  ON public.rpg_sheets
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sheet users can view their own sheets"
  ON public.rpg_sheets
  FOR SELECT
  USING (
    auth.uid() = user_id AND 
    (public.has_role(auth.uid(), 'sheet_user') OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Sheet users can manage their own sheets"
  ON public.rpg_sheets
  FOR ALL
  USING (
    auth.uid() = user_id AND 
    (public.has_role(auth.uid(), 'sheet_user') OR public.has_role(auth.uid(), 'admin'))
  );

-- Triggers para updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_client_products_updated_at
  BEFORE UPDATE ON public.client_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rpg_sheets_updated_at
  BEFORE UPDATE ON public.rpg_sheets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();