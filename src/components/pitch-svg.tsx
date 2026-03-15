export function PitchSvg() {
  return (
    <g>
      {/* Pitch background */}
      <rect width="100" height="100" fill="#2d8c3c" rx="1" />
      {/* Pitch stripes */}
      {[0, 20, 40, 60, 80].map((y) => (
        <rect key={y} x="0" y={y} width="100" height="10" fill="#269935" opacity="0.3" />
      ))}
      {/* Outline */}
      <rect x="5" y="5" width="90" height="90" fill="none" stroke="white" strokeWidth="0.5" />
      {/* Halfway line */}
      <line x1="5" y1="50" x2="95" y2="50" stroke="white" strokeWidth="0.5" />
      {/* Center circle */}
      <circle cx="50" cy="50" r="12" fill="none" stroke="white" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="0.8" fill="white" />
      {/* Top penalty area */}
      <rect x="25" y="5" width="50" height="20" fill="none" stroke="white" strokeWidth="0.5" />
      {/* Top goal area */}
      <rect x="35" y="5" width="30" height="8" fill="none" stroke="white" strokeWidth="0.5" />
      {/* Top penalty arc */}
      <path d="M 38 25 Q 50 32 62 25" fill="none" stroke="white" strokeWidth="0.5" />
      {/* Top penalty spot */}
      <circle cx="50" cy="17" r="0.6" fill="white" />
      {/* Bottom penalty area */}
      <rect x="25" y="75" width="50" height="20" fill="none" stroke="white" strokeWidth="0.5" />
      {/* Bottom goal area */}
      <rect x="35" y="87" width="30" height="8" fill="none" stroke="white" strokeWidth="0.5" />
      {/* Bottom penalty arc */}
      <path d="M 38 75 Q 50 68 62 75" fill="none" stroke="white" strokeWidth="0.5" />
      {/* Bottom penalty spot */}
      <circle cx="50" cy="83" r="0.6" fill="white" />
      {/* Corner arcs */}
      <path d="M 5 7 Q 7 5 7 5" fill="none" stroke="white" strokeWidth="0.5" />
      <path d="M 93 5 Q 95 7 95 5" fill="none" stroke="white" strokeWidth="0.5" />
      <path d="M 5 93 Q 7 95 5 95" fill="none" stroke="white" strokeWidth="0.5" />
      <path d="M 95 93 Q 93 95 95 95" fill="none" stroke="white" strokeWidth="0.5" />
    </g>
  );
}
