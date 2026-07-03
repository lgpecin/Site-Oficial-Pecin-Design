import { useEffect, useRef, useState } from "react";

interface AnimatedTextProps {
  text: string;
  isInView: boolean;
  className?: string;
  delay?: number;
}

const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

export const AnimatedText = ({ text, isInView, className = "", delay = 0 }: AnimatedTextProps) => {
  const [displayText, setDisplayText] = useState<string[]>(() => text.split("").map(() => ""));
  const doneRef = useRef(false);

  useEffect(() => {
    if (!isInView || doneRef.current) return;

    // Reduced motion: skip scramble, show text instantly
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setDisplayText(text.split(""));
      doneRef.current = true;
      return;
    }

    const duration = 800;
    const scrambleInterval = 50;
    const startTime = performance.now() + delay;
    let rafId = 0;
    let lastTick = 0;
    let cancelled = false;

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - startTime;
      if (elapsed < 0) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (now - lastTick >= scrambleInterval) {
        lastTick = now;
        const progress = Math.min(elapsed / duration, 1);
        setDisplayText(
          text.split("").map((char, index) => {
            if (char === " ") return " ";
            const charProgress = (progress * text.length - index) / 2;
            if (charProgress >= 1) return char;
            if (charProgress > 0) return characters[Math.floor(Math.random() * characters.length)];
            return "";
          })
        );
        if (progress >= 1) {
          setDisplayText(text.split(""));
          doneRef.current = true;
          return; // stop the rAF loop — no more work needed
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isInView, text, delay]);

  return (
    <span
      className={`inline-block transition-opacity duration-300 ease-out ${
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
