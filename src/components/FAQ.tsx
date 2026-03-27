import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useInView } from "@/hooks/use-in-view";
import { TypewriterText } from "./TypewriterText";
import { AnimatedSection } from "./AnimatedSection";
import { Share2, TrendingUp, BookOpen, Globe, Sparkles, Megaphone, Film, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { t } = useLanguage();

  const services = [
    { icon: Share2, key: "faq.service1" },
    { icon: Sparkles, key: "faq.service2" },
    { icon: Film, key: "faq.service3" },
    { icon: Globe, key: "faq.service4" },
    { icon: Megaphone, key: "faq.service5" },
    { icon: BookOpen, key: "faq.service6" },
    { icon: TrendingUp, key: "faq.service7" },
    { icon: Package, key: "faq.service8" },
  ];

  const faqs = [
    {
      questionKey: "faq.q1",
      answer: (
        <div>
          <p className="mb-6">{t("faq.a1_intro")}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {services.map((service, index) => (
              <div key={index} className="flex flex-col items-center gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <service.icon className="w-8 h-8 text-primary" />
                <span className="text-sm font-medium text-center">{t(service.key)}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    { questionKey: "faq.q2", answerKey: "faq.a2" },
    { questionKey: "faq.q3", answerKey: "faq.a3" },
    { questionKey: "faq.q4", answerKey: "faq.a4" },
    { questionKey: "faq.q5", answerKey: "faq.a5" },
    { questionKey: "faq.q6", answerKey: "faq.a6" },
  ];

  return (
    <section id="faq" className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div ref={ref} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 min-h-[3rem]">
            <TypewriterText text={t("faq.title")} isInView={isInView} speed={60} />
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index}>
                <AccordionItem value={`item-${index}`} className="bg-card rounded-lg px-6 border-0 shadow-sm">
                  <AccordionTrigger className="text-left hover:no-underline py-6">
                    <span className="font-semibold text-lg">{t(faq.questionKey)}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                    {faq.answer || t(faq.answerKey!)}
                  </AccordionContent>
                </AccordionItem>
              </AnimatedSection>
            ))}
          </Accordion>
          
          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("faq.footer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default FAQ;
