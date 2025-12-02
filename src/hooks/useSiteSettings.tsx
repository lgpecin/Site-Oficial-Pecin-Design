import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  whatsapp_number: string;
  whatsapp_message: string;
  instagram_url: string;
  linkedin_url: string;
  behance_url: string;
  site_email: string;
  site_phone: string;
  site_title: string;
  site_description: string;
}

const defaultSettings: SiteSettings = {
  whatsapp_number: "5511999999999",
  whatsapp_message: "Olá! Vim através do seu portfólio.",
  instagram_url: "https://instagram.com",
  linkedin_url: "https://linkedin.com",
  behance_url: "https://behance.net",
  site_email: "contato@exemplo.com",
  site_phone: "(11) 99999-9999",
  site_title: "Meu Portfólio",
  site_description: "Portfólio de projetos e serviços",
};

export const useSiteSettings = () => {
  const { data: settings = defaultSettings, isLoading: loading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_key, setting_value");

      if (error) throw error;

      if (data) {
        const settingsObj = data.reduce((acc, item) => {
          acc[item.setting_key as keyof SiteSettings] = item.setting_value || "";
          return acc;
        }, {} as SiteSettings);

        return { ...defaultSettings, ...settingsObj };
      }

      return defaultSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return { settings, loading };
};
