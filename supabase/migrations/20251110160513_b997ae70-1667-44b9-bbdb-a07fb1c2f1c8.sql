-- Criar bucket de storage para materiais
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-materials', 'client-materials', false)
ON CONFLICT (id) DO NOTHING;

-- Tabela para vincular usuários a clientes
CREATE TABLE public.client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(client_id, user_id)
);

-- Tabela de materiais
CREATE TABLE public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ESTÁTICO', 'STORIES', 'REELS', 'THUMB', 'ÍCONE', 'CARROSSEL')),
  description TEXT,
  caption TEXT,
  post_date DATE,
  status TEXT NOT NULL DEFAULT 'Ideia' CHECK (status IN ('Pronto', 'Em Processo', 'Ideia', 'Planejamento', 'Cancelado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de arquivos dos materiais
CREATE TABLE public.material_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de aprovações e comentários
CREATE TABLE public.material_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL CHECK (action_type IN ('comment', 'approve', 'reject')),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies para client_users
CREATE POLICY "Admins can manage client users"
  ON public.client_users
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their client associations"
  ON public.client_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies para materials
CREATE POLICY "Admins can manage all materials"
  ON public.materials
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their materials"
  ON public.materials
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.client_users
      WHERE client_users.client_id = materials.client_id
      AND client_users.user_id = auth.uid()
    )
  );

-- RLS Policies para material_files
CREATE POLICY "Admins can manage all files"
  ON public.material_files
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their material files"
  ON public.material_files
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.materials
      JOIN public.client_users ON client_users.client_id = materials.client_id
      WHERE materials.id = material_files.material_id
      AND client_users.user_id = auth.uid()
    )
  );

-- RLS Policies para material_approvals
CREATE POLICY "Admins can view all approvals"
  ON public.material_approvals
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view approvals for their materials"
  ON public.material_approvals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.materials
      JOIN public.client_users ON client_users.client_id = materials.client_id
      WHERE materials.id = material_approvals.material_id
      AND client_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create approvals"
  ON public.material_approvals
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.materials
      JOIN public.client_users ON client_users.client_id = materials.client_id
      WHERE materials.id = material_approvals.material_id
      AND client_users.user_id = auth.uid()
    )
  );

-- Storage policies para client-materials
CREATE POLICY "Admins can manage all client materials"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'client-materials' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients can view their materials"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'client-materials' AND
    EXISTS (
      SELECT 1 FROM public.material_files
      JOIN public.materials ON materials.id = material_files.material_id
      JOIN public.client_users ON client_users.client_id = materials.client_id
      WHERE material_files.file_path = storage.objects.name
      AND client_users.user_id = auth.uid()
    )
  );

-- Triggers
CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON public.materials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();