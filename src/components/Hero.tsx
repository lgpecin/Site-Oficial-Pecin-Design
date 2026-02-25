import { Button } from "./ui/button";
import { ArrowDown } from "lucide-react";
import heroBg from "@/assets/hero-bg-new.png";
import logo from "@/assets/logo.png";
import whatsappLogo from "@/assets/whatsapp-logo.png";
import { useEffect, useRef, useState } from "react";
import { AlternatingTypewriter } from "./AlternatingTypewriter";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Particles from "./Particles";

const Hero = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const { settings } = useSiteSettings();

  useEffect(() => {
    let rafId: number | null = null;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        rafId = window.requestAnimationFrame(() => {
          const offset = window.scrollY;
          setScrollOffset(offset);
          
          if (parallaxRef.current) {
            parallaxRef.current.style.transform = `translateY(${offset * 0.5}px)`;
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const scrollToProjects = () => {
    const element = document.getElementById("projects");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.40,
        }}
        aria-hidden="true"
      />

      {/* Particles Layer */}
      <div className="absolute inset-0 z-[1]">
        <Particles />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <div className="mb-4 sm:mb-6">
            <img
              src={logo}
              alt="Pecin Design - Logo"
              className="w-auto h-auto max-w-[245px] sm:max-w-[350px] mx-auto mb-4 sm:mb-6 [filter:drop-shadow(0_0_30px_hsl(var(--primary)/0.3))]"
              loading="eager"
              fetchPriority="high"
              width="350"
              height="161"
              decoding="sync"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2 [text-shadow:0_0_40px_hsl(var(--primary)/0.15)]">
            Bora tornar seu projeto
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              em algo{" "}
              <AlternatingTypewriter
                words={["único?", "transformador?", "poderoso?", "animal?"]}
                className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                typingSpeed={100}
                deletingSpeed={50}
                pauseTime={2000}
              />
            </span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-12 max-w-2xl mx-auto px-4">
            Aqui é simples: eu gosto de canalizar todo o caos criativo em visuais lindos e
            estratégicos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Button
              onClick={() =>
                window.open(
                  `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
                    settings.whatsapp_message
                  )}`,
                  "_blank"
                )
              }
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-14 text-base sm:text-lg"
            >
              <img
                src={whatsappLogo}
                alt="WhatsApp"
                className="mr-2 sm:mr-3 w-7 h-7 sm:w-8 sm:h-8 object-contain"
                width="32"
                height="32"
                loading="lazy"
                decoding="async"
              />
              Vamos conversar!
            </Button>
            <Button
              onClick={scrollToProjects}
              size="lg"
              className="group w-full sm:w-auto h-14 text-base sm:text-lg"
            >
              Se liga no meu trampo
              <ArrowDown className="ml-2 h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-y-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <div className="relative">
          <ArrowDown
            className="w-8 h-8 text-primary drop-shadow-lg"
            strokeWidth={2.5}
          />
          <div className="absolute inset-0 w-8 h-8 bg-primary/20 rounded-full blur-md animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
