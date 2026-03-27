import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Globe } from "lucide-react";
import logo from "@/assets/logo.png";
import { useLanguage } from "@/contexts/LanguageContext";

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-lg shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => scrollToSection("hero")}
            className="hover:opacity-80 transition-opacity"
          >
            <img src={logo} alt="Pecin Design" className="h-8 w-auto" loading="eager" decoding="sync" />
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("projects")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              {t("nav.projects")}
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              {t("nav.about")}
            </button>
            <Button onClick={() => scrollToSection("contact")} size="sm">
              {t("nav.contact")}
            </Button>
            <button
              onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              {language === "pt" ? "EN" : "PT"}
            </button>
          </div>

          {/* Mobile language toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
              className="flex items-center gap-1 text-foreground/80 hover:text-primary transition-colors text-sm font-medium"
              aria-label="Toggle language"
            >
              <Globe className="w-4 h-4" />
              {language === "pt" ? "EN" : "PT"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
