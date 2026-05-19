"use client";

import { Flame } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useTrainingLog } from "@/hooks/use-training-log";
import { computeStreak } from "@/lib/streak";

export function StreakBanner() {
  const { user } = useAuth();
  const { entries } = useTrainingLog();

  if (!user) return null;
  const streak = computeStreak(entries);
  if (streak <= 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-4">
      <Link
        href="/training-log"
        className="glass mx-auto flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm hover:shadow-md transition-shadow"
      >
        <Flame className="h-4 w-4 text-orange-500" />
        <span className="font-medium tabular-nums">{streak}-day streak</span>
        <span className="text-muted-foreground">— keep it going</span>
      </Link>
    </div>
  );
}
