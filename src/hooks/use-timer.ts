"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { SessionDrill } from "@/types/drill";

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentDrill = drills[currentIndex] || null;
  const totalSeconds = currentDrill ? currentDrill.duration * 60 : 0;
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
    goToIndex(0);
  }, [goToIndex]);

  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          playBeep();
          // auto-advance
          if (currentIndex < drills.length - 1) {
            setCurrentIndex((ci) => {
              const next = ci + 1;
              setSecondsLeft(drills[next].duration * 60);
              return next;
            });
            return drills[currentIndex + 1].duration * 60;
          } else {
            clearTimer();
            setIsRunning(false);
            setIsComplete(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, currentIndex, drills, clearTimer]);

  return {
    currentIndex,
    currentDrill,
    secondsLeft,
    isRunning,
    isComplete,
    progress,
    totalDrills: drills.length,
    start,
    pause,
    toggle,
    next,
    prev,
    reset,
    goToIndex,
  };
}
