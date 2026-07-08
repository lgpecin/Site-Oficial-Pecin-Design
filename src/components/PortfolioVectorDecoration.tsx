import { useEffect, useRef } from "react";

/**
 * SVG decoration inspired by vector/bezier-curve design tools.
 * Renders flowing bezier paths with anchor points and a dashed
 * selection box — referencing the illustrator/pen-tool aesthetic
 * from the user's reference image.
 */
const PortfolioVectorDecoration = () => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          path.style.transition = "stroke-dashoffset 2s cubic-bezier(0.4, 0, 0.2, 1)";
          path.style.strokeDashoffset = "0";
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    const parent = path.closest("svg");
    if (parent) observer.observe(parent);

    return () => observer.disconnect();
  }, []);

  // Anchor point component
  const Anchor = ({ cx, cy, size = 6 }: { cx: number; cy: number; size?: number }) => (
    <rect
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      fill="hsl(var(--primary))"
      stroke="hsl(var(--foreground))"
      strokeWidth="1.5"
      className="portfolio-anchor"
    />
  );

  // Control-handle line + circle
  const Handle = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
    <g className="portfolio-handle">
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="hsl(var(--primary))"
        strokeWidth="1"
        opacity="0.6"
      />
      <circle cx={x2} cy={y2} r="3" fill="hsl(var(--primary))" opacity="0.8" />
    </g>
  );

  return (
    <div className="portfolio-vector-wrapper" aria-hidden="true">
      <svg
        viewBox="0 0 900 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="portfolio-vector-svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Main flowing bezier curve */}
        <path
          ref={pathRef}
          d="M 30 140 C 120 20, 200 160, 320 80 S 500 10, 580 90 S 720 170, 870 50"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Second decorative curve (thinner, offset) */}
        <path
          d="M 60 150 C 150 60, 250 140, 350 100 S 520 30, 600 70"
          stroke="hsl(var(--primary))"
          strokeWidth="1"
          strokeLinecap="round"
          fill="none"
          opacity="0.3"
          strokeDasharray="6 4"
        />

        {/* Anchor points along main curve */}
        <Anchor cx={30} cy={140} />
        <Anchor cx={320} cy={80} />
        <Anchor cx={580} cy={90} />
        <Anchor cx={870} cy={50} />

        {/* Control handles */}
        <Handle x1={30} y1={140} x2={120} y2={20} />
        <Handle x1={320} y1={80} x2={200} y2={160} />
        <Handle x1={320} y1={80} x2={440} y2={10} />
        <Handle x1={580} y1={90} x2={500} y2={10} />
        <Handle x1={580} y1={90} x2={660} y2={170} />
        <Handle x1={870} y1={50} x2={780} y2={170} />


        {/* Pen tool icon (small, near the right end) */}
        <g transform="translate(860, 55) scale(0.7)" opacity="0.8">
          <path
            d="M8 2 L14 14 L8 20 L2 14 Z"
            fill="none"
            stroke="hsl(var(--foreground))"
            strokeWidth="1.5"
          />
          <circle cx="8" cy="14" r="2" fill="hsl(var(--primary))" />
        </g>
      </svg>
    </div>
  );
};

export default PortfolioVectorDecoration;
