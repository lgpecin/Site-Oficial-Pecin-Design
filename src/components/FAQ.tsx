import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useInView } from "@/hooks/use-in-view";
import { TypewriterText } from "./TypewriterText";
import { AnimatedSection } from "./AnimatedSection";
import { 
  Share2, 
  TrendingUp, 
  BookOpen, 
  Globe, 
  Sparkles, 
  Megaphone, 
  Film, 
  Package 
} from "lucide-react";

const FAQ = () => {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  
  const services = [
    { icon: Share2, title: "Social Media" },
    { icon: Sparkles, title: "Branding" },
    { icon: Film, title: "Motion Design" },
    { icon: Globe, title: "Webdesign" },
    { icon: Megaphone, title: "Ativação de Marca" },
    { icon: BookOpen, title: "Criação de Ebooks" },
    { icon: TrendingUp, title: "Planejamento Estratégico" },
    { icon: Package, title: "Design de Produtos e Embalagens" }
  ];

  const faqs = [
    {
      question: "Quais serviços de design podemos desenvolver?",
      answer: (
        <div>
          <p className="mb-6">
            Trabalho com bastante coisa mesmo! A gente sempre pode conversar sobre projetos mais diferentes, mas geralmente, o que costumo desenvolver são:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <div 
                key={index}
                className="flex flex-col items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <service.icon className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-center">{service.title}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      question: "Qual é o prazo médio de entrega dos projetos?",
      answer: "O prazo varia de acordo com a complexidade e escopo do projeto. Em média, projetos de identidade visual levam de 2 a 4 semanas, enquanto designs de apps e websites podem levar de 4 a 8 semanas. Sempre discuto os prazos no início do projeto para garantir alinhamento com suas expectativas."
    },
    {
      question: "Você oferece revisões no projeto?",
      answer: "Sim! Cada projeto inclui rodadas de revisão para garantir sua total satisfação. O número de revisões varia de acordo com o pacote escolhido, mas geralmente incluo de 2 a 3 rodadas de ajustes. Revisões adicionais podem ser solicitadas conforme necessário."
    },
    {
      question: "Quais formatos de arquivo são entregues?",
      answer: "Entrego todos os arquivos necessários para uso imediato e futuro. Para identidade visual, você recebe arquivos editáveis (AI, PSD) e formatos finais (PNG, JPG, SVG, PDF). Para projetos web/app, entrego protótipos navegáveis e arquivos de design completos no Figma ou Adobe XD."
    },
    {
      question: "Você trabalha com clientes remotos?",
      answer: "Absolutamente! Trabalho com clientes de todo o Brasil e do mundo através de videochamadas e ferramentas de colaboração online. A comunicação remota permite flexibilidade e eficiência, mantendo a qualidade do trabalho em todos os projetos."
    },
    {
      question: "Podemos marcar uma reunião para conversar sobre algum projeto?",
      answer: "É claro! Só me mandar uma mensagem e a gente encaixa a melhor data para ambos, para conversamos sobre ideias e projetos e também para me conhecer melhor. Se for de Maringá, dá até pra gente ir tomar um café enquanto conversamos sobre!"
    }
  ];

  return (
    <section id="faq" className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 min-h-[3rem]">
            <TypewriterText text="Ficou com alguma dúvida?" isInView={isInView} speed={60} />
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index}>
                <AccordionItem 
                  value={`item-${index}`}
                  className="bg-card rounded-lg px-6 border-0 shadow-sm"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold text-lg">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {typeof faq.answer === 'string' ? faq.answer : faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </AnimatedSection>
            ))}
          </Accordion>
          
          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Caso tenha ficado com alguma outra dúvida, pode sempre me dar um alô pra gente conversar sobre!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
