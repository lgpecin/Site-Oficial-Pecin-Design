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
    if (!isInView || isTyping) return;

    setIsTyping(true);
    let currentIndex = 0;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, text, delay, speed, isTyping]);

  return (
    <span className={className}>
      {displayText}
      {isTyping && <span className="animate-pulse">|</span>}
    </span>
  );
};
