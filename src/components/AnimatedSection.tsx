import { useInView } from "@/hooks/use-in-view";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Optional stagger index — items appear one after another */
  index?: number;
}

export const AnimatedSection = ({ children, className = "", index = 0 }: AnimatedSectionProps) => {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  // Cap stagger so late items don't feel slow
  const delay = Math.min(index, 8) * 50;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: isInView ? `${delay}ms` : "0ms" }}
      className={`transition-[opacity,transform] duration-[400ms] ease-out will-change-[opacity,transform] ${
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${className}`}
    >
      {children}
    </div>
  );
};
