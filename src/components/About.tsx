import { Palette, Sparkles, Target } from "lucide-react";

const About = () => {
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
  ];

  return (
    <section id="about" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Sobre Mim</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sou um designer apaixonado por criar experiências visuais memoráveis. 
            Com foco em minimalismo e funcionalidade, trabalho para transformar 
            ideias complexas em designs simples e elegantes que comunicam de forma eficaz.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {skills.map((skill, index) => (
            <div
              key={skill.title}
              className="text-center p-8 rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <skill.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{skill.title}</h3>
              <p className="text-muted-foreground">{skill.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
