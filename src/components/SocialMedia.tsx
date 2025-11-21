import { Instagram, Linkedin, Palette } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const SocialMedia = () => {
  const { settings } = useSiteSettings();

  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: settings.instagram_url,
      color: "hover:text-pink-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: settings.linkedin_url,
      color: "hover:text-blue-600",
    },
    {
      name: "Behance",
      icon: Palette,
      url: settings.behance_url,
      color: "hover:text-blue-500",
    },
  ];

  return (
    <section className="py-12 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="text-center mb-10 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Me acompanhe pelas redes sociais
          </h2>
          <p className="text-muted-foreground">
            Fique por dentro dos meus projetos e novidades
          </p>
        </div>

        <div className="flex justify-center items-center gap-6 md:gap-8 animate-fade-up">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group transition-all duration-300 ${social.color}`}
              aria-label={social.name}
            >
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-background border-2 border-border flex items-center justify-center group-hover:scale-110 group-hover:border-current transition-all duration-300 shadow-sm hover:shadow-lg">
                <social.icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialMedia;