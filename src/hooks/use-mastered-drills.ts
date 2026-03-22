"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "pitchlab-mastered";

let listeners: (() => void)[] = [];

function emitChange() {
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

let cachedSnapshot: string[] = [];
let cachedRaw: string | null = null;

function getSnapshot(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSnapshot = raw ? JSON.parse(raw) : [];
    }
    return cachedSnapshot;
  } catch {
    return EMPTY;
  }
}

const EMPTY: string[] = [];
function getServerSnapshot(): string[] {
  return EMPTY;
}

export function useMasteredDrills() {
  const mastered = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleMastered = useCallback((drillId: string) => {
    const current = getSnapshot();
    const next = current.includes(drillId)
      ? current.filter((id) => id !== drillId)
      : [...current, drillId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = null;
    emitChange();
  }, []);

  const isMastered = useCallback(
    (drillId: string) => mastered.includes(drillId),
    [mastered]
  );

  return { mastered, toggleMastered, isMastered };
}
