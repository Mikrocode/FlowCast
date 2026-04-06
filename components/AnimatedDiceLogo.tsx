type AnimatedDiceLogoProps = {
  className?: string;
};

export function AnimatedDiceLogo({ className }: AnimatedDiceLogoProps) {
  return (
    <svg
      viewBox="0 0 150 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Flow Cast rolling dice logo"
    >
      <defs>
        <linearGradient id="flowRing" x1="16" y1="64" x2="134" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#818cf8" stopOpacity="0" />
          <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.7" />
          <stop offset="1" stopColor="#818cf8" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="dieStroke" x1="36" y1="22" x2="116" y2="103" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <filter id="softGlow" x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur stdDeviation="5" result="blurred" />
          <feMerge>
            <feMergeNode in="blurred" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <ellipse cx="75" cy="66" rx="58" ry="24" fill="none" stroke="url(#flowRing)" strokeWidth="1.5" opacity="0.9">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 75 66"
          to="360 75 66"
          dur="18s"
          repeatCount="indefinite"
        />
      </ellipse>

      <path
        d="M12 86C35 70 61 66 75 66C90 66 115 70 138 86"
        fill="none"
        stroke="#6366f1"
        strokeOpacity="0.22"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      <g filter="url(#softGlow)">
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-10,0; 4,-8; -10,0"
            dur="5.6s"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            additive="sum"
            type="rotate"
            values="-8 58 56; 10 58 56; -8 58 56"
            dur="5.6s"
            repeatCount="indefinite"
          />
          <rect x="42" y="40" width="32" height="32" rx="9" fill="white" stroke="url(#dieStroke)" strokeWidth="2.4" />
          <circle cx="53" cy="51" r="2.6" fill="#4f46e5" />
          <circle cx="63" cy="61" r="2.6" fill="#4f46e5" />
        </g>

        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="10,4; -5,-7; 10,4"
            dur="6.2s"
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            additive="sum"
            type="rotate"
            values="12 92 68; -10 92 68; 12 92 68"
            dur="6.2s"
            repeatCount="indefinite"
          />
          <rect x="76" y="52" width="32" height="32" rx="9" fill="white" stroke="url(#dieStroke)" strokeWidth="2.4" />
          <circle cx="87" cy="63" r="2.4" fill="#4f46e5" />
          <circle cx="98" cy="63" r="2.4" fill="#4f46e5" />
          <circle cx="87" cy="74" r="2.4" fill="#4f46e5" />
          <circle cx="98" cy="74" r="2.4" fill="#4f46e5" />
        </g>
      </g>
    </svg>
  );
}
