"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SessionDrill } from "@/types/drill";

function playBeep(frequency: number = 880) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.value = 0.3;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.stop(ctx.currentTime + 0.5);
  } catch {}
}

export function useTimer(drills: SessionDrill[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(
    drills.length > 0 ? drills[0].duration * 60 : 0
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedDrillsRef = useRef<Set<string>>(new Set());

  const currentDrill = drills[currentIndex] || null;
  const totalSeconds = isResting
    ? (currentDrill?.restAfter || 0)
    : (currentDrill ? currentDrill.duration * 60 : 0);
  const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      clearTimer();
      if (index >= 0 && index < drills.length) {
        setCurrentIndex(index);
        setSecondsLeft(drills[index].duration * 60);
        setIsRunning(false);
        setIsComplete(false);
        setIsResting(false);
      }
    },
    [drills, clearTimer]
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const start = useCallback(() => {
    if (drills.length === 0 || isComplete) return;
    setIsRunning(true);
  }, [drills.length, isComplete]);

  const next = useCallback(() => {
    if (currentIndex < drills.length - 1) {
      goToIndex(currentIndex + 1);
    }
  }, [currentIndex, drills.length, goToIndex]);

  const prev = useCallback(() => {
    if (currentIndex > 0) {
      goToIndex(currentIndex - 1);
    }
  }, [currentIndex, goToIndex]);

  const reset = useCallback(() => {
    completedDrillsRef.current = new Set();
    goToIndex(0);
  }, [goToIndex]);

  const skipRest = useCallback(() => {
    if (!isResting) return;
    clearTimer();
    setIsResting(false);
    // Advance to next drill
    if (currentIndex < drills.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSecondsLeft(drills[nextIdx].duration * 60);
    } else {
      setIsRunning(false);
      setIsComplete(true);
      setSecondsLeft(0);
    }
  }, [isResting, currentIndex, drills, clearTimer]);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  // Track which drills have been completed for history recording
  const getCompletedDrills = useCallback(() => completedDrillsRef.current, []);

  // Auto-pause when the tab is hidden so we don't drift while backgrounded.
  // We pause the visible timer but don't try to resume on focus — coaches
  // returning to the tab can hit play themselves.
  useEffect(() => {
    if (!isRunning) return;
    const onVisibility = () => {
      if (document.hidden) {
        clearTimer();
        setIsRunning(false);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [isRunning, clearTimer]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (isResting) {
            // Rest period ended, advance to next drill
            playBeep(660);
            setIsResting(false);
            if (currentIndex < drills.length - 1) {
              const nextIdx = currentIndex + 1;
              setCurrentIndex(nextIdx);
              return drills[nextIdx].duration * 60;
            } else {
              clearTimer();
              setIsRunning(false);
              setIsComplete(true);
              return 0;
            }
          } else {
            // Drill ended
            playBeep(880);
            completedDrillsRef.current.add(drills[currentIndex].drillId);

            const restTime = drills[currentIndex].restAfter || 0;
            if (restTime > 0) {
              // Start rest period
              setIsResting(true);
              return restTime;
            } else if (currentIndex < drills.length - 1) {
              // No rest, advance directly
              setCurrentIndex((ci) => ci + 1);
              return drills[currentIndex + 1].duration * 60;
            } else {
              clearTimer();
              setIsRunning(false);
              setIsComplete(true);
              return 0;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, isResting, currentIndex, drills, clearTimer]);

  return {
    currentIndex,
    currentDrill,
    secondsLeft,
    isRunning,
    isComplete,
    isResting,
    progress,
    totalDrills: drills.length,
    start,
    pause,
    toggle,
    next,
    prev,
    reset,
    skipRest,
    goToIndex,
    getCompletedDrills,
  };
}
