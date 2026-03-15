"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "pitchlab-favorites";

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

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleFavorite = useCallback((drillId: string) => {
    const current = getSnapshot();
    const next = current.includes(drillId)
      ? current.filter((id) => id !== drillId)
      : [...current, drillId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitChange();
  }, []);

  const isFavorite = useCallback(
    (drillId: string) => favorites.includes(drillId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
