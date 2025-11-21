-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value text,
  setting_type text DEFAULT 'text',
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Insert default settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type, description) VALUES
  ('whatsapp_number', '5511999999999', 'text', 'Número do WhatsApp (com código do país)'),
  ('whatsapp_message', 'Olá! Vim através do seu portfólio.', 'textarea', 'Mensagem padrão do WhatsApp'),
  ('instagram_url', 'https://instagram.com', 'url', 'Link do Instagram'),
  ('linkedin_url', 'https://linkedin.com', 'url', 'Link do LinkedIn'),
  ('behance_url', 'https://behance.net', 'url', 'Link do Behance'),
  ('site_email', 'contato@exemplo.com', 'email', 'Email de contato'),
  ('site_phone', '(11) 99999-9999', 'text', 'Telefone de contato'),
  ('site_title', 'Meu Portfólio', 'text', 'Título do site'),
  ('site_description', 'Portfólio de projetos e serviços', 'textarea', 'Descrição do site')
ON CONFLICT (setting_key) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();