import { Button } from "./ui/button";
import { ArrowDown, MessageCircle, Palette, Pen, Layers, Sparkles, Compass, Wand2 } from "lucide-react";
import heroBg from "@/assets/hero-halftone.jpg";
import { useEffect, useRef, useState } from "react";
import { AlternatingTypewriter } from "./AlternatingTypewriter";

const Hero = () => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);
  const [iconOffsets, setIconOffsets] = useState({ y1: 0, y2: 0, y3: 0, y4: 0, y5: 0, y6: 0 });

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
      
      // Parallax effect for floating icons (slower movement)
      if (iconsRef.current) {
        const scrolled = window.scrollY;
        setIconOffsets({
          y1: scrolled * 0.15,
          y2: scrolled * 0.1,
          y3: scrolled * 0.12,
          y4: scrolled * 0.08,
          y5: scrolled * 0.13,
          y6: scrolled * 0.11,
        });
      }
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
      />
      
      {/* Floating Icons */}
      <div ref={iconsRef} className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        {/* Top Left */}
        <Palette 
          className="absolute top-24 left-12 text-primary/20 animate-float"
          size={40}
          style={{ transform: `translateY(${iconOffsets.y1}px)`, animationDelay: '0s' }}
        />
        
        {/* Top Right */}
        <Pen 
          className="absolute top-32 right-16 text-accent/20 animate-float"
          size={36}
          style={{ transform: `translateY(${iconOffsets.y2}px)`, animationDelay: '1s' }}
        />
        
        {/* Middle Left */}
        <Layers 
          className="absolute top-1/2 left-20 -translate-y-1/2 text-primary/15 animate-float"
          size={44}
          style={{ transform: `translateY(calc(-50% + ${iconOffsets.y3}px))`, animationDelay: '2s' }}
        />
        
        {/* Middle Right */}
        <Sparkles 
          className="absolute top-1/2 right-24 -translate-y-1/2 text-accent/15 animate-float"
          size={38}
          style={{ transform: `translateY(calc(-50% + ${iconOffsets.y4}px))`, animationDelay: '1.5s' }}
        />
        
        {/* Bottom Left */}
        <Compass 
          className="absolute bottom-32 left-16 text-primary/20 animate-float"
          size={42}
          style={{ transform: `translateY(${iconOffsets.y5}px)`, animationDelay: '0.5s' }}
        />
        
        {/* Bottom Right */}
        <Wand2 
          className="absolute bottom-28 right-20 text-accent/20 animate-float"
          size={36}
          style={{ transform: `translateY(${iconOffsets.y6}px)`, animationDelay: '2.5s' }}
        />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium mb-4">
              Design & Direção de Arte
            </span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight px-2 [text-shadow:0_0_40px_hsl(var(--primary)/0.15)]">
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
