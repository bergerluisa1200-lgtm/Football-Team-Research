"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "pitchlab-drill-notes";

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

let cachedSnapshot: Record<string, string> = {};
let cachedRaw: string | null = null;

function getSnapshot(): Record<string, string> {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSnapshot = raw ? JSON.parse(raw) : {};
    }
    return cachedSnapshot;
  } catch {
    return EMPTY;
  }
}

const EMPTY: Record<string, string> = {};
function getServerSnapshot(): Record<string, string> {
  return EMPTY;
}

export function useDrillNotes() {
  const notes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setNote = useCallback((drillId: string, note: string) => {
    const current = getSnapshot();
    const next = { ...current };
    if (note.trim()) {
      next[drillId] = note;
    } else {
      delete next[drillId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = null;
    emitChange();
  }, []);

  const getNote = useCallback(
    (drillId: string) => notes[drillId] || "",
    [notes]
  );

  return { notes, setNote, getNote };
}
