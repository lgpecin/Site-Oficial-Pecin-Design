import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Quais serviços de design você oferece?",
      answer: "Ofereço uma ampla gama de serviços incluindo UI/UX Design para aplicativos mobile e web, criação de identidade visual completa (branding), design de websites e e-commerce, ilustrações 3D e motion design. Cada projeto é personalizado de acordo com as necessidades específicas do cliente."
    },
    {
      question: "Qual é o prazo médio de entrega dos projetos?",
      answer: "O prazo varia de acordo com a complexidade e escopo do projeto. Em média, projetos de identidade visual levam de 2 a 4 semanas, enquanto designs de apps e websites podem levar de 4 a 8 semanas. Sempre discuto os prazos no início do projeto para garantir alinhamento com suas expectativas."
    },
    {
      question: "Como funciona o processo de trabalho?",
      answer: "Meu processo começa com uma reunião para entender suas necessidades e objetivos. Em seguida, faço pesquisa e apresento propostas conceituais. Após aprovação, desenvolvo o projeto completo com revisões incluídas. Mantenho comunicação constante durante todo o processo para garantir que o resultado final esteja alinhado com sua visão."
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
    }
  ];

  return (
    <section id="faq" className="py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Perguntas Frequentes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Respostas para as dúvidas mais comuns sobre meus serviços e processo de trabalho.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-lg px-6 border-0 shadow-sm"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-semibold text-lg">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
