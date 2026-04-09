import { Palette, Sparkles, Target, Zap } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { TypewriterText } from "./TypewriterText";
import { AnimatedSection } from "./AnimatedSection";
import { useLanguage } from "@/contexts/LanguageContext";


const About = () => {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { t } = useLanguage();

  const skills = [
    { icon: Palette, titleKey: "about.skill1_title", descKey: "about.skill1_desc" },
    { icon: Sparkles, titleKey: "about.skill2_title", descKey: "about.skill2_desc" },
    { icon: Target, titleKey: "about.skill3_title", descKey: "about.skill3_desc" },
    { icon: Zap, titleKey: "about.skill4_title", descKey: "about.skill4_desc" },
  ];

  return (
    <section id="about" className="py-12 sm:py-16 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div ref={ref} className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 min-h-[3rem]">
            <TypewriterText text={t("about.title")} isInView={isInView} speed={80} />
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="relative aspect-square rounded-2xl overflow-hidden">
              <img alt="Léo - Designer" className="w-full h-full object-cover" width="500" height="500" loading="lazy" decoding="async" src="/lovable-uploads/4fe5d4dc-16c5-44e5-b939-02a046d020cc.png" />
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {skills.map((skill) => (
              <AnimatedSection key={skill.titleKey}>
                <div className="text-center p-4 md:p-6 rounded-2xl bg-background shadow-sm hover:shadow-md transition-shadow h-full flex flex-col justify-center">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3">
                    <skill.icon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">{t(skill.titleKey)}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{t(skill.descKey)}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>

        <div className="max-w-3xl mx-auto text-center mt-16">
          <AnimatedSection>
            <p className="text-lg text-muted-foreground leading-relaxed">{t("about.bio")}</p>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};
export default About;
