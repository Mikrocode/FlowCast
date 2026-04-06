type FlowCastLogoProps = {
  className?: string;
};

/** Dice + histogram silhouette — visual nod to Monte Carlo / sampling. */
export function FlowCastLogo({ className }: FlowCastLogoProps) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden
    >
      <path
        d="M10 58 C10 58 22 38 40 32 C58 38 70 58 70 58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.35"
      />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => {
        const cx = 14 + i * 9;
        const h = [12, 20, 28, 34, 28, 20, 12][i];
        return (
          <rect
            key={i}
            x={cx - 2.5}
            y={56 - h}
            width="5"
            height={h}
            rx="1.5"
            fill="currentColor"
            opacity={0.12 + i * 0.02}
          />
        );
      })}
      <g transform="translate(8 10) rotate(-10 14 14)">
        <rect
          x="4"
          y="4"
          width="28"
          height="28"
          rx="4"
          fill="white"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="14" cy="14" r="2.2" fill="currentColor" />
        <circle cx="22" cy="22" r="2.2" fill="currentColor" />
      </g>
      <g transform="translate(36 18) rotate(8 14 14)">
        <rect
          x="4"
          y="4"
          width="28"
          height="28"
          rx="4"
          fill="white"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="14" cy="14" r="2.2" fill="currentColor" />
        <circle cx="22" cy="14" r="2.2" fill="currentColor" />
        <circle cx="14" cy="22" r="2.2" fill="currentColor" />
        <circle cx="22" cy="22" r="2.2" fill="currentColor" />
      </g>
    </svg>
  );
}
