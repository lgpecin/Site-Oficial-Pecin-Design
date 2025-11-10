import { useEffect, useState, useRef } from "react";
import { Users, FileText, FileSignature, Presentation, CheckCircle, Package, AlertCircle } from "lucide-react";

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  duration: string;
}

const ServiceSteps = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isInView, setIsInView] = useState(false);
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
      
      // Verifica se a seção está visível
      const isVisible = rect.top < viewportHeight && rect.bottom > 0;
      setIsInView(isVisible);
      
      // Calcula a posição do scroll dentro da seção (0 a 1)
      const rawProgress = -rect.top / (sectionHeight - viewportHeight);
      const clampedProgress = Math.max(0, Math.min(1, rawProgress));
      setScrollProgress(clampedProgress);
      
      // Determina qual step deve ser mostrado baseado no progresso do scroll
      const stepIndex = Math.floor(clampedProgress * steps.length);
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
      className="relative py-16 md:py-20 bg-background"
      style={{ minHeight: `${steps.length * 60}vh` }}
    >
      <div className="sticky top-0 h-screen flex items-center justify-center py-8">
        {/* Barra lateral de progresso fluida */}
        <div 
          className={`hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-300 ${
            isInView ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs text-muted-foreground mb-2">
              {Math.round(scrollProgress * 100)}%
            </span>
            
            {/* Barra de progresso vertical */}
            <div className="relative w-1 h-64 bg-border rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 w-full bg-primary transition-all duration-100 ease-out rounded-full"
                style={{ height: `${scrollProgress * 100}%` }}
              />
            </div>
            
            <span className="text-xs text-muted-foreground mt-2">
              Etapa {currentStep + 1}/{steps.length}
            </span>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-12 md:mb-20 text-foreground">
            Como Funciona Meus Serviços
          </h2>

          <div className="max-w-3xl mx-auto relative">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`transition-all duration-700 ${
                  currentStep === index
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-95 absolute inset-0 pointer-events-none"
                }`}
              >
                <div className="bg-card border border-border rounded-2xl p-6 md:p-8 lg:p-12 shadow-lg mx-4 md:mx-0">
                  <div className="flex flex-col items-center text-center gap-4 md:gap-6">
                    <div className="text-primary">
                      {step.icon}
                    </div>
                    
                    <div className="space-y-2 md:space-y-3">
                      <div className="inline-block px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs md:text-sm font-medium">
                        {step.duration}
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-card-foreground">
                        {step.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm md:text-base lg:text-lg text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-1.5 md:gap-2 mt-6 md:mt-8">
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

          {/* Disclaimer */}
          <div className="mt-8 md:mt-12 px-4 md:px-0">
            <div className="max-w-3xl mx-auto">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 md:p-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">Observação:</span> O cronograma de trabalho e entrega pode variar e é definido com precisão conforme o escopo do projeto durante a fase de briefing e contrato.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceSteps;
