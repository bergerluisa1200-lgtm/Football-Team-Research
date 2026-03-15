import Link from "next/link";
import { SoccerBallIcon } from "@/components/soccer-ball-icon";

export function Footer() {
  return (
    <footer className="glass-subtle border-t-0 py-8 no-print">
      <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span role="img" aria-label="soccer ball">⚽</span>
          <span>PitchLab</span>
        </div>
        <nav className="flex gap-4">
          <Link href="/drills" className="hover:text-foreground transition-colors">
            Drills
          </Link>
          <Link href="/session-builder" className="hover:text-foreground transition-colors">
            Session Builder
          </Link>
          <Link href="/training-log" className="hover:text-foreground transition-colors">
            Training Log
          </Link>
          <Link href="/favorites" className="hover:text-foreground transition-colors">
            Favorites
          </Link>
        </nav>
        <p>&copy; {new Date().getFullYear()} PitchLab</p>
      </div>
    </footer>
  );
}
