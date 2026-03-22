"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  ArrowLeft,
  Coffee,
  FastForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTimer } from "@/hooks/use-timer";
import { useSession } from "@/hooks/use-session";
import { useAllDrills } from "@/hooks/use-all-drills";
import { useDrillHistory } from "@/hooks/use-drill-history";
import { CATEGORY_META } from "@/lib/constants";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function ProgressRing({
  progress,
  isResting,
  size = 280,
  strokeWidth = 8,
}: {
  progress: number;
  isResting?: boolean;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - progress * circumference;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-muted/30"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={cn(
          "transition-all duration-1000 ease-linear",
          isResting ? "text-amber-500" : "text-primary"
        )}
      />
    </svg>
  );
}

export default function TimerPage() {
  const { session } = useSession();
  const { getDrillById } = useAllDrills();
  const { recordUsage } = useDrillHistory();
  const {
    currentIndex,
    currentDrill,
    secondsLeft,
    isRunning,
    isComplete,
    isResting,
    progress,
    totalDrills,
    toggle,
    next,
    prev,
    reset,
    skipRest,
  } = useTimer(session.drills);

  const drill = currentDrill ? getDrillById(currentDrill.drillId) : null;
  const catMeta = drill ? CATEGORY_META[drill.category] : null;

  // Track completed drills for history
  const recordedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Record usage when moving past a drill (either to rest or next drill)
    if (currentIndex > 0 && !recordedRef.current.has(currentIndex - 1)) {
      const prevDrill = session.drills[currentIndex - 1];
      if (prevDrill) {
        recordUsage(prevDrill.drillId);
        recordedRef.current.add(currentIndex - 1);
      }
    }
    // Record last drill when complete
    if (isComplete && !recordedRef.current.has(currentIndex)) {
      const lastDrill = session.drills[currentIndex];
      if (lastDrill) {
        recordUsage(lastDrill.drillId);
        recordedRef.current.add(currentIndex);
      }
    }
  }, [currentIndex, isComplete, session.drills, recordUsage]);

  // Reset recorded drills when timer resets
  useEffect(() => {
    if (currentIndex === 0 && !isRunning && !isComplete) {
      recordedRef.current = new Set();
    }
  }, [currentIndex, isRunning, isComplete]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        toggle();
      } else if (e.code === "ArrowRight") {
        if (isResting) {
          skipRest();
        } else {
          next();
        }
      } else if (e.code === "ArrowLeft") {
        prev();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [toggle, next, prev, skipRest, isResting]);

  if (session.drills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <p className="text-lg font-medium text-muted-foreground">
          No session to run
        </p>
        <p className="text-sm text-muted-foreground">
          Build a session first, then come back to start the timer.
        </p>
        <Link href="/session-builder">
          <Button>Go to Session Builder</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] px-4 py-8 gap-8">
      <Link href="/session-builder" className="self-start">
        <Button variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Builder
        </Button>
      </Link>

      {/* Drill info */}
      {drill && catMeta && (
        <div className="text-center space-y-2">
          {isResting ? (
            <>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 gap-1">
                <Coffee className="h-3 w-3" />
                Rest
              </Badge>
              <h2 className="text-2xl font-bold text-muted-foreground">Rest Period</h2>
              <p className="text-sm text-muted-foreground">
                Next: {getDrillById(session.drills[currentIndex + 1]?.drillId)?.title || "Done"}
              </p>
            </>
          ) : (
            <>
              <Badge
                variant="secondary"
                style={{ backgroundColor: catMeta.color + "20", color: catMeta.color }}
              >
                {catMeta.label}
              </Badge>
              <h2 className="text-2xl font-bold">{drill.title}</h2>
              <p className="text-sm text-muted-foreground">
                Drill {currentIndex + 1} of {totalDrills}
              </p>
            </>
          )}
        </div>
      )}

      {/* Timer display */}
      <div className="relative flex items-center justify-center glass rounded-full p-8">
        <ProgressRing progress={progress} isResting={isResting} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "text-5xl sm:text-6xl font-mono font-bold tabular-nums",
              isComplete && "text-primary",
              isResting && "text-amber-500"
            )}
          >
            {isComplete ? "Done!" : formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12"
          onClick={prev}
          disabled={currentIndex === 0 || isResting}
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          className={cn(
            "h-16 w-16 rounded-full",
            isResting && "bg-amber-500 hover:bg-amber-600"
          )}
          onClick={toggle}
          disabled={isComplete}
        >
          {isRunning ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7 ml-1" />
          )}
        </Button>

        {isResting ? (
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12"
            onClick={skipRest}
          >
            <FastForward className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12"
            onClick={next}
            disabled={currentIndex >= totalDrills - 1}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        )}
      </div>

      <Button variant="ghost" size="sm" className="gap-1" onClick={reset}>
        <RotateCcw className="h-4 w-4" />
        Reset
      </Button>

      {/* Drill list */}
      <div className="w-full max-w-md glass rounded-xl p-3 space-y-1">
        {session.drills.map((sd, i) => {
          const d = getDrillById(sd.drillId);
          if (!d) return null;
          const isCurrent = i === currentIndex && !isResting;
          const isCurrentRest = i === currentIndex && isResting;
          const isPast = i < currentIndex;
          return (
            <div key={sd.drillId}>
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                  isCurrent && "bg-primary/10 font-medium",
                  isPast && "text-muted-foreground line-through",
                  !isCurrent && !isPast && "text-muted-foreground"
                )}
              >
                <span className="truncate">
                  {i + 1}. {d.title}
                </span>
                <span className="text-xs shrink-0 ml-2">{sd.duration} min</span>
              </div>
              {isCurrentRest && (
                <div className="flex items-center gap-2 px-3 py-1 text-xs text-amber-600 dark:text-amber-400">
                  <Coffee className="h-3 w-3" />
                  Resting...
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Space to play/pause &middot; Arrow keys to navigate
      </p>
    </div>
  );
}
