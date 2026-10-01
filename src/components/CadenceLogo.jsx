/**
 * CadenceLogo — inline SVG wordmark + icon mark.
 * Use `size` to control height in px (width scales automatically).
 * Use `variant` to switch between 'full' (icon + text) or 'icon' (mark only).
 */
export default function CadenceLogo({ size = 32, variant = 'full', className = '' }) {
  if (variant === 'icon') {
    // Icon-only mark: the arc wave
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 40 40"
        height={size}
        width={size}
        fill="none"
        aria-label="Cadence"
        className={className}
      >
        <defs>
          <linearGradient id="cad-grad-icon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>
        {/* Outer arc */}
        <path
          d="M8 20 C8 12.27 14.27 6 22 6 C29.73 6 36 12.27 36 20"
          stroke="url(#cad-grad-icon)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Inner arc */}
        <path
          d="M13 20 C13 15.03 17.03 11 22 11 C26.97 11 31 15.03 31 20"
          stroke="url(#cad-grad-icon)"
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Downward tick at end */}
        <line
          x1="36" y1="20" x2="36" y2="27"
          stroke="url(#cad-grad-icon)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  // Full wordmark: icon + text
  const textSize = size * 0.72;
  const iconSize = size;
  const gap = size * 0.32;
  const totalWidth = iconSize + gap + textSize * 4.6; // approx text width

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalWidth} ${size}`}
      height={size}
      width={totalWidth}
      fill="none"
      aria-label="Cadence"
      className={className}
    >
      <defs>
        <linearGradient id="cad-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>

      {/* Icon mark — arc wave */}
      <g transform={`translate(0, ${size * 0.05}) scale(${size / 40})`}>
        {/* Outer arc */}
        <path
          d="M4 20 C4 10.06 12.06 2 22 2 C31.94 2 40 10.06 40 20"
          stroke="url(#cad-grad)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Inner arc */}
        <path
          d="M10 20 C10 13.37 15.37 8 22 8 C28.63 8 34 13.37 34 20"
          stroke="url(#cad-grad)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.5"
        />
        {/* Downward tick */}
        <line
          x1="40" y1="20" x2="40" y2="30"
          stroke="url(#cad-grad)"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </g>

      {/* Wordmark */}
      <text
        x={iconSize + gap}
        y={size * 0.76}
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="700"
        fontSize={textSize}
        letterSpacing="-0.02em"
        fill="white"
      >
        Cadence
      </text>
    </svg>
  );
}
