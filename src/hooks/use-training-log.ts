"use client";

import { useSyncExternalStore, useCallback } from "react";
import { TrainingLogEntry } from "@/types/drill";

const STORAGE_KEY = "pitchlab-training-log";

let listeners: (() => void)[] = [];
let cachedSnapshot: TrainingLogEntry[] = [];
let cachedRaw: string | null = null;
const EMPTY: TrainingLogEntry[] = [];

function emitChange() {
  cachedRaw = null;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): TrainingLogEntry[] {
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

function getServerSnapshot(): TrainingLogEntry[] {
  return EMPTY;
}

export function useTrainingLog() {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addEntry = useCallback(
    (draft: Omit<TrainingLogEntry, "id" | "createdAt">): TrainingLogEntry => {
      const id = "log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      const entry: TrainingLogEntry = { ...draft, id, createdAt: new Date().toISOString() };
      const current = getSnapshot();
      localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...current]));
      emitChange();
      return entry;
    },
    []
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<Omit<TrainingLogEntry, "id" | "createdAt">>): TrainingLogEntry | null => {
      const current = getSnapshot();
      const index = current.findIndex((e) => e.id === id);
      if (index === -1) return null;
      const updated = { ...current[index], ...updates };
      const next = [...current];
      next[index] = updated;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      emitChange();
      return updated;
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    const current = getSnapshot();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter((e) => e.id !== id)));
    emitChange();
  }, []);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return { entries: sortedEntries, addEntry, updateEntry, deleteEntry };
}
