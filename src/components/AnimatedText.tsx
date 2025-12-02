import { useEffect, useState } from "react";

interface AnimatedTextProps {
  text: string;
  isInView: boolean;
  className?: string;
  delay?: number;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

export const AnimatedText = ({ text, isInView, className = "", delay = 0 }: AnimatedTextProps) => {
  const [displayText, setDisplayText] = useState(text.split("").map(() => ""));
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!isInView || isAnimating) return;

    setIsAnimating(true);
    const duration = 800;
    const scrambleSpeed = 50; // Increased from 30ms to 50ms
    const startTime = Date.now();
    let rafId: number;

    const animate = () => {
      const elapsed = Date.now() - startTime - delay;
      
      if (elapsed < 0) {
        rafId = requestAnimationFrame(animate);
        return;
      }
      
      const progress = Math.min(elapsed / duration, 1);

      setDisplayText(
        text.split("").map((char, index) => {
          if (char === " ") return " ";
          
          const charProgress = (progress * text.length - index) / 2;
          
          if (charProgress >= 1) {
            return char;
          } else if (charProgress > 0) {
            return characters[Math.floor(Math.random() * characters.length)];
          } else {
            return "";
          }
        })
      );

      if (progress < 1) {
        setTimeout(() => {
          rafId = requestAnimationFrame(animate);
        }, scrambleSpeed);
      } else {
        setDisplayText(text.split(""));
        setIsAnimating(false);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [isInView, text, delay, isAnimating]);

  return (
    <span 
      className={`inline-block transition-opacity duration-700 ${
        isInView ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      {displayText.map((char, index) => (
        <span key={index} className="inline-block">
          {char || "\u00A0"}
        </span>
      ))}
    </span>
  );
};
