export function SoccerBallIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {/* Center pentagon */}
      <polygon
        points="12,8 14.4,9.7 13.5,12.4 10.5,12.4 9.6,9.7"
        fill="currentColor"
      />
      {/* Top pentagon */}
      <polygon
        points="12,2.5 13.8,4.8 12,5.8 10.2,4.8"
        fill="currentColor"
      />
      {/* Bottom pentagon */}
      <polygon
        points="12,21.5 10.2,19.2 12,18.2 13.8,19.2"
        fill="currentColor"
      />
      {/* Left pentagon */}
      <polygon
        points="3.2,9 5.5,8.2 6.2,10.4 4.6,11.8"
        fill="currentColor"
      />
      {/* Right pentagon */}
      <polygon
        points="20.8,9 18.5,8.2 17.8,10.4 19.4,11.8"
        fill="currentColor"
      />
      {/* Bottom-left pentagon */}
      <polygon
        points="5.5,18 6,15.6 8.2,15.6 7.6,17.6"
        fill="currentColor"
      />
      {/* Bottom-right pentagon */}
      <polygon
        points="18.5,18 18,15.6 15.8,15.6 16.4,17.6"
        fill="currentColor"
      />
      {/* Connecting lines */}
      <line x1="12" y1="8" x2="12" y2="5.8" stroke="currentColor" strokeWidth="0.8" />
      <line x1="9.6" y1="9.7" x2="6.2" y2="10.4" stroke="currentColor" strokeWidth="0.8" />
      <line x1="14.4" y1="9.7" x2="17.8" y2="10.4" stroke="currentColor" strokeWidth="0.8" />
      <line x1="10.5" y1="12.4" x2="8.2" y2="15.6" stroke="currentColor" strokeWidth="0.8" />
      <line x1="13.5" y1="12.4" x2="15.8" y2="15.6" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}
