export function AsteriskAccent({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={`deco-asterisk ${className}`} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="9" strokeLinecap="round">
        <line x1="32" y1="6" x2="32" y2="58" />
        <line x1="8" y1="18" x2="56" y2="46" />
        <line x1="8" y1="46" x2="56" y2="18" />
      </g>
    </svg>
  )
}

export function CloverAccent({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" className={`deco-clover ${className}`} aria-hidden="true">
      <g fill="currentColor">
        <circle cx="12" cy="11" r="7" />
        <circle cx="20" cy="11" r="7" />
        <circle cx="12" cy="19" r="7" />
        <circle cx="20" cy="19" r="7" />
      </g>
    </svg>
  )
}

export function DashedTrail({ className = '' }) {
  return (
    <svg viewBox="0 0 160 70" className={`deco-trail ${className}`} aria-hidden="true">
      <path
        d="M4 60 C 40 60, 40 10, 80 10 S 130 55, 156 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="1 9"
        strokeLinecap="round"
      />
      <g fill="currentColor" opacity="0.9">
        <circle cx="128" cy="6" r="6" />
        <circle cx="138" cy="4" r="9" />
        <circle cx="150" cy="8" r="5" />
      </g>
    </svg>
  )
}

/** Vertical "TECH STACK" + barcode strip that runs along the card's edge. */
export function TechStackStrip({ className = '' }) {
  return (
    <div className={`tech-strip ${className}`} aria-hidden="true">
      <CloverAccent className="tech-strip__clover" />
      <span className="tech-strip__label"></span>
      <span className="tech-strip__barcode" />
    </div>
  )
}

/** Palm trees + wave line illustration that runs along the bottom of the card. */
export function BeachFooter({ className = '' }) {
  return (
    <svg viewBox="0 0 600 90" className={`deco-beach ${className}`} preserveAspectRatio="none" aria-hidden="true">
      <path
        d="M0 60 Q 30 45 60 60 T 120 60 T 180 60 T 240 60 T 300 60 T 360 60 T 420 60 T 480 60 T 540 60 T 600 60 V90 H0 Z"
        fill="currentColor"
        opacity="0.9"
      />
      {[60, 520].map((x) => (
        <g key={x} transform={`translate(${x}, 0)`} stroke="currentColor" fill="none" strokeWidth="3">
          <line x1="0" y1="70" x2="0" y2="18" strokeLinecap="round" />
          <path d="M0 22 C -18 10, -30 14, -34 0" strokeLinecap="round" />
          <path d="M0 20 C 16 6, 30 10, 36 -2" strokeLinecap="round" />
          <path d="M0 16 C -10 2, -6 -8, -14 -16" strokeLinecap="round" />
          <path d="M0 14 C 10 0, 6 -10, 14 -18" strokeLinecap="round" />
        </g>
      ))}
      <circle cx="300" cy="14" r="10" fill="currentColor" opacity="0.9" />
    </svg>
  )
}
