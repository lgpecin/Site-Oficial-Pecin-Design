-- Criar tabela para links compartilháveis de clientes
CREATE TABLE IF NOT EXISTS public.client_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  recipient_name TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar índice para busca rápida por token
CREATE INDEX IF NOT EXISTS idx_client_share_links_token ON public.client_share_links(share_token);
CREATE INDEX IF NOT EXISTS idx_client_share_links_client_id ON public.client_share_links(client_id);

-- Habilitar RLS
ALTER TABLE public.client_share_links ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Admins can manage client share links"
  ON public.client_share_links
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active client share links by token"
  ON public.client_share_links
  FOR SELECT
  TO public
  USING (is_active = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_client_share_links_updated_at
  BEFORE UPDATE ON public.client_share_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();