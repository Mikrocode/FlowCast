"use client";

import { useEffect, useMemo, useState } from "react";

type AnimatedDiceLogoProps = {
  className?: string;
};

type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

type Dot = {
  cx: number;
  cy: number;
};

const FACE_DOTS: Record<DieFace, Dot[]> = {
  1: [{ cx: 50, cy: 50 }],
  2: [
    { cx: 30, cy: 30 },
    { cx: 70, cy: 70 },
  ],
  3: [
    { cx: 30, cy: 30 },
    { cx: 50, cy: 50 },
    { cx: 70, cy: 70 },
  ],
  4: [
    { cx: 30, cy: 30 },
    { cx: 70, cy: 30 },
    { cx: 30, cy: 70 },
    { cx: 70, cy: 70 },
  ],
  5: [
    { cx: 30, cy: 30 },
    { cx: 70, cy: 30 },
    { cx: 50, cy: 50 },
    { cx: 30, cy: 70 },
    { cx: 70, cy: 70 },
  ],
  6: [
    { cx: 30, cy: 28 },
    { cx: 70, cy: 28 },
    { cx: 30, cy: 50 },
    { cx: 70, cy: 50 },
    { cx: 30, cy: 72 },
    { cx: 70, cy: 72 },
  ],
};

function randomFace(): DieFace {
  return (Math.floor(Math.random() * 6) + 1) as DieFace;
}

const INITIAL_LEFT_FACE: DieFace = 3;
const INITIAL_RIGHT_FACE: DieFace = 5;

function Die({
  x,
  y,
  face,
  rotation,
  rolling,
  fill,
}: {
  x: number;
  y: number;
  face: DieFace;
  rotation: number;
  rolling: boolean;
  fill: string;
}) {
  const dots = useMemo(() => FACE_DOTS[face], [face]);

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotation} 50 50)`}
      style={{
        transition: "transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="18"
        fill={fill}
        className="drop-shadow-md"
      />
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="18"
        fill="none"
        stroke="rgba(99,102,241,0.4)"
        strokeWidth="3"
      />
      {dots.map((dot, idx) => (
        <circle
          key={idx}
          cx={dot.cx}
          cy={dot.cy}
          r="6.5"
          fill="#334155"
          style={{
            opacity: rolling ? 0.55 : 1,
            transition: "opacity 180ms ease",
          }}
        />
      ))}
    </g>
  );
}

export function AnimatedDiceLogo({ className }: AnimatedDiceLogoProps) {
  const [leftFace, setLeftFace] = useState<DieFace>(INITIAL_LEFT_FACE);
  const [rightFace, setRightFace] = useState<DieFace>(INITIAL_RIGHT_FACE);
  const [rollStep, setRollStep] = useState(0);

  useEffect(() => {
    let step = 0;
    const tick = () => {
      step += 1;
      setRollStep(step);
      setLeftFace(randomFace());
      setRightFace(randomFace());
      if (step >= 2) {
        window.clearInterval(intervalId);
      }
    };

    const intervalId = window.setInterval(tick, 450);
    tick();

    return () => window.clearInterval(intervalId);
  }, []);

  const rolling = rollStep < 2;

  return (
    <svg
      viewBox="0 0 220 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Animated rolling dice logo"
    >
      <defs>
        <linearGradient id="diceHalo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      <ellipse cx="110" cy="120" rx="88" ry="16" fill="url(#diceHalo)" />
      <Die
        x={32}
        y={16}
        face={leftFace}
        rotation={rolling ? -14 + rollStep * 19 : 3}
        rolling={rolling}
        fill="#ffffff"
      />
      <Die
        x={102}
        y={24}
        face={rightFace}
        rotation={rolling ? 18 - rollStep * 24 : -5}
        rolling={rolling}
        fill="#f8faff"
      />
    </svg>
  );
}
