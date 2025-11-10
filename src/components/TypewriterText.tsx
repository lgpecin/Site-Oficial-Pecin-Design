import { useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  isInView: boolean;
  className?: string;
  delay?: number;
  speed?: number;
}

export const TypewriterText = ({ 
  text, 
  isInView, 
  className = "", 
  delay = 0,
  speed = 50 
}: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    
    setDisplayText("");
    setIsTyping(true);
    let currentIndex = 0;
    let interval: NodeJS.Timeout;

    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [isInView, text, delay, speed]);

  return (
    <span className={className}>
      {displayText}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  );
};
