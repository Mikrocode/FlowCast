export function AnimatedBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="bg-mesh-ambient absolute inset-0" />
      <div className="bg-grid-overlay absolute inset-0" />
      <svg
        className="absolute inset-0 h-full w-full opacity-40"
        viewBox="0 0 1600 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className="bg-contour-drift">
          <path
            d="M-100 610C142 498 273 512 494 610C724 712 904 702 1135 598C1369 492 1522 507 1718 604"
            stroke="url(#lineA)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M-120 700C123 591 307 603 509 700C708 793 923 781 1138 691C1358 600 1560 618 1720 714"
            stroke="url(#lineB)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <path
            d="M-80 516C140 414 302 437 506 521C713 606 903 598 1120 517C1339 436 1536 445 1715 533"
            stroke="url(#lineC)"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
        </g>
        <defs>
          <linearGradient id="lineA" x1="-100" y1="610" x2="1718" y2="604" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366f1" stopOpacity="0" />
            <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.24" />
            <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineB" x1="-120" y1="700" x2="1720" y2="714" gradientUnits="userSpaceOnUse">
            <stop stopColor="#64748b" stopOpacity="0" />
            <stop offset="0.5" stopColor="#64748b" stopOpacity="0.2" />
            <stop offset="1" stopColor="#64748b" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineC" x1="-80" y1="516" x2="1715" y2="533" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" stopOpacity="0" />
            <stop offset="0.5" stopColor="#8b5cf6" stopOpacity="0.22" />
            <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
