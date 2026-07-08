import { useEffect, useState, useRef } from "react";
import { Users, FileText, FileSignature, Presentation, CheckCircle, Package, AlertCircle } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { TypewriterText } from "./TypewriterText";
import { useLanguage } from "@/contexts/LanguageContext";

interface Step {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  durationKey: string;
}

const ServiceSteps = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { ref: titleRef, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { t } = useLanguage();

  const steps: Step[] = [
    { icon: <Users className="w-12 h-12" />, titleKey: "steps.step1_title", descKey: "steps.step1_desc", durationKey: "steps.step1_duration" },
    { icon: <FileText className="w-12 h-12" />, titleKey: "steps.step2_title", descKey: "steps.step2_desc", durationKey: "steps.step2_duration" },
    { icon: <FileSignature className="w-12 h-12" />, titleKey: "steps.step3_title", descKey: "steps.step3_desc", durationKey: "steps.step3_duration" },
    { icon: <Presentation className="w-12 h-12" />, titleKey: "steps.step4_title", descKey: "steps.step4_desc", durationKey: "steps.step4_duration" },
    { icon: <CheckCircle className="w-12 h-12" />, titleKey: "steps.step5_title", descKey: "steps.step5_desc", durationKey: "steps.step5_duration" },
    { icon: <Package className="w-12 h-12" />, titleKey: "steps.step6_title", descKey: "steps.step6_desc", durationKey: "steps.step6_duration" },
  ];

  useEffect(() => {
    let rafId: number;
    const handleScroll = () => {
      if (!sectionRef.current) return;
      rafId = requestAnimationFrame(() => {
        if (!sectionRef.current) return;
        const section = sectionRef.current;
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight;
        const isVisible = rect.top < viewportHeight && rect.bottom > 0;
        setIsSectionVisible(isVisible);
        const rawProgress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (sectionHeight + viewportHeight * 0.3)));
        setScrollProgress(rawProgress);
        const stepsToShow = Math.min(steps.length, Math.floor(rawProgress * (steps.length + 2)));
        setVisibleSteps(stepsToShow);
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [steps.length]);

  return (
    <section ref={sectionRef} className="relative py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div ref={titleRef} className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            <span className="inline-block transition-transform duration-200 ease-out hover:scale-105">
              {t("steps.title")}
            </span>
          </h2>
        </div>
        
        <p className="text-center text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 md:mb-12 leading-relaxed">
          {t("steps.subtitle")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} style={{ transitionDelay: index < visibleSteps ? `${Math.min(index, 4) * 40}ms` : "0ms" }} className={`transition-[opacity,transform] duration-[400ms] ease-out ${index < visibleSteps ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <div className="bg-card border border-border rounded-2xl p-4 md:p-5 shadow-lg h-full transition-transform duration-200 ease-out md:hover:scale-[1.03]">
                <div className="flex flex-col items-center text-center gap-2 md:gap-3">
                  <div className="text-primary">
                    <div className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center">
                      {step.icon}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="inline-block px-2 py-0.5 md:px-2.5 md:py-1 bg-primary/10 text-primary rounded-full text-[10px] md:text-xs font-medium">
                      {t(step.durationKey)}
                    </div>
                    <h3 className="text-sm md:text-base font-bold text-card-foreground leading-tight">
                      {t(step.titleKey)}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground leading-snug">
                    {t(step.descKey)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 md:mt-16 px-4 md:px-0">
          <div className="max-w-3xl mx-auto">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 md:p-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{t("steps.disclaimer_label")}</span> {t("steps.disclaimer")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ServiceSteps;
