import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSEO = () => {
  useEffect(() => {
    const loadAndApplySEO = async () => {
      try {
        const { data: settings } = await supabase
          .from("site_settings")
          .select("setting_key, setting_value")
          .in("setting_key", [
            "seo_meta_title",
            "seo_meta_description",
            "seo_meta_keywords",
            "seo_meta_author",
            "seo_og_title",
            "seo_og_description",
            "seo_og_image",
            "seo_favicon_url",
            "site_title",
            "site_description",
          ]);

        if (!settings) return;

        const seoData: Record<string, string> = {};
        settings.forEach((setting) => {
          if (setting.setting_value) {
            seoData[setting.setting_key] = setting.setting_value;
          }
        });

        // Get fallback values
        const siteTitle = seoData.site_title || "Meu Portfólio";
        const siteDescription = seoData.site_description || "Portfólio de projetos e serviços";

        // Update document title
        const metaTitle = seoData.seo_meta_title || siteTitle;
        document.title = metaTitle;

        // Update or create meta tags
        const updateMetaTag = (selector: string, content: string) => {
          let element = document.querySelector(selector);
          if (element) {
            element.setAttribute("content", content);
          } else {
            const meta = document.createElement("meta");
            if (selector.includes('property="')) {
              const property = selector.match(/property="([^"]+)"/)?.[1];
              if (property) meta.setAttribute("property", property);
            } else if (selector.includes('name="')) {
              const name = selector.match(/name="([^"]+)"/)?.[1];
              if (name) meta.setAttribute("name", name);
            }
            meta.setAttribute("content", content);
            document.head.appendChild(meta);
          }
        };

        // Update basic meta tags
        if (seoData.seo_meta_description || siteDescription) {
          updateMetaTag('meta[name="description"]', seoData.seo_meta_description || siteDescription);
        }
        
        if (seoData.seo_meta_keywords) {
          updateMetaTag('meta[name="keywords"]', seoData.seo_meta_keywords);
        }
        
        if (seoData.seo_meta_author) {
          updateMetaTag('meta[name="author"]', seoData.seo_meta_author);
        }

        // Update Open Graph tags
        const ogTitle = seoData.seo_og_title || metaTitle;
        const ogDescription = seoData.seo_og_description || seoData.seo_meta_description || siteDescription;
        
        updateMetaTag('meta[property="og:title"]', ogTitle);
        updateMetaTag('meta[property="og:description"]', ogDescription);
        
        if (seoData.seo_og_image) {
          updateMetaTag('meta[property="og:image"]', seoData.seo_og_image);
          // Also update Twitter card image
          updateMetaTag('meta[name="twitter:image"]', seoData.seo_og_image);
        }

        // Update Twitter Card
        updateMetaTag('meta[name="twitter:title"]', ogTitle);
        updateMetaTag('meta[name="twitter:description"]', ogDescription);

        // Update favicon if custom one is set
        if (seoData.seo_favicon_url) {
          let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = seoData.seo_favicon_url;
        }
      } catch (error) {
        console.error("Error loading SEO settings:", error);
      }
    };

    loadAndApplySEO();
  }, []);
};
