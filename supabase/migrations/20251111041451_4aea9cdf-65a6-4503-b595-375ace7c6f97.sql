-- Create enum for service categories
CREATE TYPE service_category AS ENUM (
  'arte_estatica',
  'carrossel',
  'reels',
  'branding',
  'marca',
  'ebook',
  'outros'
);

-- Create services table
CREATE TABLE public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  category service_category NOT NULL,
  price numeric NOT NULL,
  delivery_days integer NOT NULL,
  icon text,
  color text DEFAULT '#6366f1',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- RLS Policies for services
CREATE POLICY "Anyone can view active services"
  ON public.services
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage services"
  ON public.services
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create service share links table
CREATE TABLE public.service_share_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  share_token text NOT NULL UNIQUE,
  recipient_name text,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_share_links ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share links
CREATE POLICY "Anyone can view active share links by token"
  ON public.service_share_links
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage share links"
  ON public.service_share_links
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create junction table for services in share links
CREATE TABLE public.service_link_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id uuid NOT NULL REFERENCES public.service_share_links(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(link_id, service_id)
);

-- Enable RLS
ALTER TABLE public.service_link_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for service link items
CREATE POLICY "Anyone can view service link items"
  ON public.service_link_items
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage service link items"
  ON public.service_link_items
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger for services
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for service_share_links
CREATE TRIGGER update_service_share_links_updated_at
  BEFORE UPDATE ON public.service_share_links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default services
INSERT INTO public.services (name, description, category, price, delivery_days, icon, color, display_order) VALUES
('Arte Estática Única', 'Arte estática para feed do Instagram', 'arte_estatica', 60, 3, 'Image', '#6366f1', 1),
('Pacote 8 Artes Estáticas', 'Pacote com 8 artes estáticas para feed', 'arte_estatica', 400, 7, 'Images', '#8b5cf6', 2),
('Carrossel Instagram', 'Carrossel com até 10 slides para Instagram', 'carrossel', 120, 5, 'LayoutGrid', '#ec4899', 3),
('Reels Simples', 'Edição simples de reels (até 30s)', 'reels', 80, 2, 'Video', '#f59e0b', 4),
('Reels Complexo', 'Edição complexa de reels com efeitos (até 60s)', 'reels', 150, 4, 'Clapperboard', '#ef4444', 5),
('Branding Básico', 'Identidade visual básica', 'branding', 800, 15, 'Palette', '#10b981', 6),
('Projeto de Marca', 'Projeto completo de marca', 'marca', 1500, 30, 'Star', '#3b82f6', 7),
('Manual de Marca', 'Manual completo da identidade visual', 'marca', 500, 10, 'BookOpen', '#14b8a6', 8),
('Ebook (por página)', 'Design de ebook - valor por página', 'ebook', 25, 1, 'FileText', '#a855f7', 9);