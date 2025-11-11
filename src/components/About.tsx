import { Palette, Sparkles, Target, Zap } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { TypewriterText } from "./TypewriterText";
import { AnimatedSection } from "./AnimatedSection";
import profilePhoto from "@/assets/profile-photo.png";

const About = () => {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  const skills = [
    {
      icon: Palette,
      title: "Design Criativo",
      description: "Criação de identidades visuais únicas que contam histórias",
    },
    {
      icon: Sparkles,
      title: "UI/UX Design",
      description: "Interfaces intuitivas focadas na experiência do usuário",
    },
    {
      icon: Target,
      title: "Estratégia Visual",
      description: "Soluções de design alinhadas aos objetivos do negócio",
    },
    {
      icon: Zap,
      title: "Branding",
      description: "Desenvolvimento completo de marcas com propósito e personalidade",
    },
  ];

  return (
    <section id="about" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div ref={ref} className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 min-h-[3rem]">
            <TypewriterText text="Sobre Mim" isInView={isInView} speed={80} />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Espaço para foto */}
          <AnimatedSection>
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <img 
                src={profilePhoto} 
                alt="Léo - Designer" 
                className="w-full h-full object-cover"
              />
            </div>
          </AnimatedSection>

          {/* Grid 2x2 de skills */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {skills.map((skill, index) => (
              <AnimatedSection key={skill.title}>
                <div className="text-center p-4 md:p-6 rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <skill.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">{skill.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{skill.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center mt-16">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sou um designer apaixonado por criar experiências visuais memoráveis. 
            Com foco em minimalismo e funcionalidade, trabalho para transformar 
            ideias complexas em designs simples e elegantes que comunicam de forma eficaz.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
