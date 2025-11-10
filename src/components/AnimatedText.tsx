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
    const duration = 800; // duração total da animação em ms
    const scrambleSpeed = 30; // velocidade do scramble em ms
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime - delay;
      
      if (elapsed < 0) return;
      
      const progress = Math.min(elapsed / duration, 1);

      setDisplayText(
        text.split("").map((char, index) => {
          // Espaços não são animados
          if (char === " ") return " ";
          
          // Calcula quando este caractere deve estar completo
          const charProgress = (progress * text.length - index) / 2;
          
          if (charProgress >= 1) {
            return char;
          } else if (charProgress > 0) {
            // Ainda embaralhando
            return characters[Math.floor(Math.random() * characters.length)];
          } else {
            return "";
          }
        })
      );

      if (progress >= 1) {
        clearInterval(interval);
        setDisplayText(text.split(""));
        setIsAnimating(false);
      }
    }, scrambleSpeed);

    return () => clearInterval(interval);
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
