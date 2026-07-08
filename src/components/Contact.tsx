import { Button } from "./ui/button";
import { MessageSquare } from "lucide-react";
import whatsappLogo from "@/assets/whatsapp-logo.png";
import { useInView } from "@/hooks/use-in-view";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useLanguage } from "@/contexts/LanguageContext";

const Contact = () => {
  const { ref } = useInView({ threshold: 0.1, triggerOnce: true });
  const { settings } = useSiteSettings();
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-12 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[110px] animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div ref={ref} className="text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="inline-block transition-transform duration-200 ease-out hover:scale-105">
                {t("contact.title")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">{t("contact.subtitle")}</p>
          </div>

          <div className="flex items-center justify-center">
            <Button
              size="lg"
              onClick={() => window.open(`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(settings.whatsapp_message)}`, '_blank')}
              className="h-20 md:h-24 text-xl md:text-2xl px-10 md:px-14 rounded-2xl shadow-xl transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.98]"
            >
              <img src={whatsappLogo} alt="WhatsApp" className="mr-4 w-12 h-12 md:w-14 md:h-14 object-contain" width="56" height="56" loading="lazy" decoding="async" />
              {t("contact.cta_whatsapp")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Contact;
