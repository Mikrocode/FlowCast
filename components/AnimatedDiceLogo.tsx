type AnimatedDiceLogoProps = {
  className?: string;
};

export function AnimatedDiceLogo({ className }: AnimatedDiceLogoProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Flow Cast logo"
    >
      <g className="logo-float">
        <circle cx="60" cy="60" r="38" className="logo-ring-pulse" />
        <path
          d="M21 60C29 43 42 34 60 34C78 34 92 42 100 58"
          stroke="url(#logoPath)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M21 72C31 57 44 49 60 49C76 49 90 56 101 70"
          stroke="url(#logoPathSoft)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.5"
        />
      </g>

      <g className="logo-float logo-spin-soft" transform="translate(32 28)">
        <rect
          x="12"
          y="10"
          width="38"
          height="38"
          rx="9"
          className="fill-white/95 stroke-indigo-400/80"
          strokeWidth="1.8"
        />
        <circle cx="25" cy="23" r="2.6" className="fill-indigo-600" />
        <circle cx="37" cy="36" r="2.6" className="fill-indigo-600" />
      </g>

      <g className="logo-float-reverse logo-spin-soft-reverse" transform="translate(48 42)">
        <rect
          x="10"
          y="9"
          width="38"
          height="38"
          rx="9"
          className="fill-white stroke-indigo-500/90"
          strokeWidth="1.8"
        />
        <circle cx="22.5" cy="21.5" r="2.5" className="fill-indigo-600" />
        <circle cx="35.5" cy="21.5" r="2.5" className="fill-indigo-600" />
        <circle cx="22.5" cy="34.5" r="2.5" className="fill-indigo-600" />
        <circle cx="35.5" cy="34.5" r="2.5" className="fill-indigo-600" />
      </g>

      <defs>
        <linearGradient id="logoPath" x1="21" y1="34" x2="100" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" stopOpacity="0" />
          <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.55" />
          <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="logoPathSoft" x1="21" y1="49" x2="101" y2="70" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b5cf6" stopOpacity="0" />
          <stop offset="0.5" stopColor="#8b5cf6" stopOpacity="0.45" />
          <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
