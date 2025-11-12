import { Button } from "./ui/button";
// FASE 1: Imports do Lucide (tree-shaken automaticamente pelo Vite)
import { 
  ArrowDown, 
  MessageCircle, 
  Palette, 
  Pen, 
  Layers, 
  Sparkles, 
  Compass, 
  Wand2, 
  Pencil, 
  Brush, 
  PenTool, 
  Layout, 
  Grid3x3, 
  Square, 
  Circle, 
  Triangle, 
  Hexagon, 
  Eye, 
  Lightbulb, 
  Star, 
  Zap 
} from "lucide-react";
// FASE 2: WebP otimizado
import heroBg from "@/assets/hero-halftone.webp";
import heroBgFallback from "@/assets/hero-halftone.jpg";
import logo from "@/assets/logo.webp";
import logoFallback from "@/assets/logo.png";
import { useEffect, useRef, useState } from "react";
import { AlternatingTypewriter } from "./AlternatingTypewriter";

const Hero = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Array de 20 ícones com suas configurações
  const floatingIcons = [
    { Icon: Palette, top: '8%', left: '5%', size: 40, delay: '0s', speed: 0.15, rotation: 0.05 },
    { Icon: Pen, top: '12%', right: '6%', size: 36, delay: '1s', speed: 0.1, rotation: -0.04 },
    { Icon: Brush, top: '18%', left: '8%', size: 38, delay: '0.5s', speed: 0.12, rotation: 0.06 },
    { Icon: PenTool, top: '22%', right: '10%', size: 34, delay: '1.5s', speed: 0.08, rotation: -0.05 },
    { Icon: Pencil, top: '28%', left: '4%', size: 36, delay: '2s', speed: 0.14, rotation: 0.04 },
    { Icon: Layers, top: '35%', left: '6%', size: 42, delay: '0.8s', speed: 0.11, rotation: -0.06 },
    { Icon: Layout, top: '38%', right: '5%', size: 40, delay: '1.2s', speed: 0.09, rotation: 0.05 },
    { Icon: Grid3x3, top: '45%', left: '7%', size: 38, delay: '1.8s', speed: 0.13, rotation: -0.04 },
    { Icon: Sparkles, top: '48%', right: '8%', size: 36, delay: '0.3s', speed: 0.1, rotation: 0.06 },
    { Icon: Compass, top: '55%', left: '5%', size: 40, delay: '1.4s', speed: 0.12, rotation: -0.05 },
    { Icon: Square, top: '58%', right: '6%', size: 34, delay: '0.7s', speed: 0.08, rotation: 0.04 },
    { Icon: Circle, top: '65%', left: '6%', size: 36, delay: '2.2s', speed: 0.14, rotation: -0.06 },
    { Icon: Triangle, top: '68%', right: '7%', size: 38, delay: '0.9s', speed: 0.11, rotation: 0.05 },
    { Icon: Hexagon, top: '75%', left: '8%', size: 40, delay: '1.6s', speed: 0.09, rotation: -0.04 },
    { Icon: Eye, top: '78%', right: '5%', size: 36, delay: '0.4s', speed: 0.13, rotation: 0.06 },
    { Icon: Lightbulb, top: '82%', left: '7%', size: 38, delay: '2.4s', speed: 0.1, rotation: -0.05 },
    { Icon: Star, top: '85%', right: '9%', size: 34, delay: '1.1s', speed: 0.12, rotation: 0.04 },
    { Icon: Zap, top: '88%', left: '6%', size: 36, delay: '1.9s', speed: 0.08, rotation: -0.06 },
    { Icon: Wand2, top: '92%', right: '7%', size: 40, delay: '0.6s', speed: 0.14, rotation: 0.05 },
    { Icon: Palette, top: '95%', left: '9%', size: 38, delay: '2.6s', speed: 0.11, rotation: -0.04 },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
      
      // Update scroll offset for icons
      setScrollOffset(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToProjects = () => {
    const element = document.getElementById("projects");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        ref={parallaxRef}
        className="absolute inset-0 z-0 will-change-transform"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.02,
        }}
        role="presentation"
        aria-hidden="true"
      />
      
      {/* Floating Icons */}
      <div ref={iconsRef} className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        {floatingIcons.map((config, index) => {
          const { Icon, size, delay, speed, rotation, ...position } = config;
          const yOffset = scrollOffset * speed;
          const rotationDeg = scrollOffset * rotation;
          
          return (
            <Icon
              key={index}
              className="absolute text-primary/30 animate-float hidden md:block"
              size={size}
              style={{
                ...position,
                transform: `translateY(${yOffset}px) rotate(${rotationDeg}deg)`,
                animationDelay: delay,
              }}
            />
          );
        })}
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <div className="mb-6">
            <picture>
              <source srcSet={logo} type="image/webp" />
              <img
                src={logoFallback}
                alt="Pecin Design - Logo"
                className="w-auto h-auto max-w-[200px] mx-auto mb-6 [filter:drop-shadow(0_0_30px_hsl(var(--primary)/0.3))]" 
                loading="eager"
                fetchPriority="high"
                width="200"
                height="92"
                decoding="sync"
              />
            </picture>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight px-2 [text-shadow:0_0_40px_hsl(var(--primary)/0.15)] will-change-transform">
            Design que impacta,
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              visão que{" "}
              <AlternatingTypewriter
                words={["transforma", "realiza", "gera resultados", "resignifica", "humaniza"]}
                className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                typingSpeed={100}
                deletingSpeed={50}
                pauseTime={2000}
              />
            </span>
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
            	Transformo a sua visão de marca em estratégias visuais completas e resultados reais. Vamos colocar sua ideia em jogo?
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
            <Button onClick={scrollToProjects} size="lg" className="group w-full sm:w-auto">
              Conheça meu trabalho
              <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
            </Button>
            <Button
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Fale Comigo
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-8 h-8 text-primary/60" />
      </div>
    </section>
  );
};

export default Hero;
