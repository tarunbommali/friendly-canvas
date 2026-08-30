import { useId } from 'react'

export default function CarouselLogoBadge({ size = 36, className = '' }) {
  const gradId = useId()
  const glowId = useId()

  return (
    <div
      className={`flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-105 ${className}`}
      style={{ width: size, height: size }}
      title="Carousel Studio"
    >
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" floodColor="#06b6d4" />
          </filter>
        </defs>

        {/* Outer squircle base */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="24"
          fill="#141721"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2"
        />

        {/* Carousel slide layer 1 (back) */}
        <rect
          x="20"
          y="28"
          width="36"
          height="46"
          rx="6"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1.5"
          transform="rotate(-12 38 51)"
        />

        {/* Carousel slide layer 2 (middle) */}
        <rect
          x="44"
          y="28"
          width="36"
          height="46"
          rx="6"
          fill="rgba(6,182,212,0.15)"
          stroke="rgba(6,182,212,0.4)"
          strokeWidth="1.5"
          transform="rotate(12 62 51)"
        />

        {/* Carousel slide layer 3 (front/center) */}
        <rect
          x="32"
          y="22"
          width="36"
          height="54"
          rx="7"
          fill={`url(#${gradId})`}
          filter={`url(#${glowId})`}
        />

        {/* Inner slide detail line */}
        <rect
          x="38"
          y="32"
          width="24"
          height="4"
          rx="2"
          fill="#ffffff"
          opacity="0.9"
        />
        <rect
          x="38"
          y="40"
          width="16"
          height="3"
          rx="1.5"
          fill="#ffffff"
          opacity="0.6"
        />
      </svg>
    </div>
  )
}
