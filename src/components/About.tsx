import { Palette, Sparkles, Target, Zap } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { TypewriterText } from "./TypewriterText";
import { AnimatedSection } from "./AnimatedSection";

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

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Espaço para foto */}
          <AnimatedSection>
            <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-sm">Sua foto aqui</p>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Grid 2x2 de skills */}
          <div className="grid grid-cols-2 gap-4">
            {skills.map((skill, index) => (
              <AnimatedSection key={skill.title}>
                <div className="text-center p-6 rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <skill.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{skill.title}</h3>
                  <p className="text-sm text-muted-foreground">{skill.description}</p>
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
