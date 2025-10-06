import { useEffect, useState, useRef } from "react";
import { Users, FileText, FileSignature, Presentation, CheckCircle, Package } from "lucide-react";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  duration: string;
}

const ServiceSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const steps: Step[] = [
    {
      icon: <Users className="w-12 h-12" />,
      title: "Reunião",
      description: "Conversamos sobre suas necessidades, objetivos e visão para o projeto. É o momento de alinhar expectativas e entender o que você precisa.",
      duration: "30-60 min"
    },
    {
      icon: <FileText className="w-12 h-12" />,
      title: "Briefing",
      description: "Recebo todas as informações detalhadas do projeto: público-alvo, referências visuais, materiais existentes e requisitos específicos.",
      duration: "1-2 dias"
    },
    {
      icon: <FileSignature className="w-12 h-12" />,
      title: "Contrato",
      description: "Formalizamos nossa parceria com um contrato claro, definindo prazos, valores, entregas e termos de trabalho.",
      duration: "1 dia"
    },
    {
      icon: <Presentation className="w-12 h-12" />,
      title: "Apresentação",
      description: "Apresento as primeiras propostas criativas. Você terá a oportunidade de avaliar as direções visuais e dar seu feedback.",
      duration: "5-7 dias"
    },
    {
      icon: <CheckCircle className="w-12 h-12" />,
      title: "Validação",
      description: "Refinamos o projeto com base no seu feedback. Fazemos os ajustes necessários até que tudo esteja perfeito.",
      duration: "3-5 dias"
    },
    {
      icon: <Package className="w-12 h-12" />,
      title: "Entrega Final",
      description: "Você recebe todos os arquivos finais nos formatos adequados, prontos para uso. Inclui manual de aplicação quando necessário.",
      duration: "1-2 dias"
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Calcula a posição do scroll dentro da seção
      const scrollProgress = -rect.top / (sectionHeight - viewportHeight);
      
      // Determina qual step deve ser mostrado baseado no progresso do scroll
      const stepIndex = Math.floor(scrollProgress * steps.length);
      const clampedIndex = Math.max(0, Math.min(steps.length - 1, stepIndex));
      
      setCurrentStep(clampedIndex);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [steps.length]);

  return (
    <section 
      ref={sectionRef}
      className="relative py-32"
      style={{ minHeight: `${steps.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-20">
            Como Funciona Meus Serviços
          </h2>

          <div className="max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`absolute inset-x-0 transition-all duration-700 ${
                  currentStep === index
                    ? "opacity-100 translate-y-0"
                    : currentStep > index
                    ? "opacity-0 -translate-y-20"
                    : "opacity-0 translate-y-20"
                }`}
              >
                <div className="bg-card border border-border rounded-2xl p-8 md:p-12 shadow-lg">
                  <div className="flex flex-col items-center text-center gap-6">
                    <div className="text-primary">
                      {step.icon}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-2">
                        {step.duration}
                      </div>
                      <h3 className="text-3xl font-bold">
                        {step.title}
                      </h3>
                    </div>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-2 mt-8">
                    {steps.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          idx === currentStep
                            ? "w-8 bg-primary"
                            : "w-2 bg-border"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSteps;
