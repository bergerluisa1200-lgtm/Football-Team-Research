"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "pitchlab-drill-history";

interface DrillHistoryEntry {
  count: number;
  lastUsed: string; // ISO date string
}

type DrillHistoryMap = Record<string, DrillHistoryEntry>;

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

let cachedSnapshot: DrillHistoryMap = {};
let cachedRaw: string | null = null;

function getSnapshot(): DrillHistoryMap {
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

const EMPTY: DrillHistoryMap = {};
function getServerSnapshot(): DrillHistoryMap {
  return EMPTY;
}

export function useDrillHistory() {
  const history = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const recordUsage = useCallback((drillId: string) => {
    const current = getSnapshot();
    const entry = current[drillId];
    const next = {
      ...current,
      [drillId]: {
        count: (entry?.count || 0) + 1,
        lastUsed: new Date().toISOString(),
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = null;
    emitChange();
  }, []);

  const getHistory = useCallback(
    (drillId: string): DrillHistoryEntry | null => history[drillId] || null,
    [history]
  );

  return { history, recordUsage, getHistory };
}
