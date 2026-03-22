"use client";

import { useSyncExternalStore, useCallback } from "react";

const STORAGE_KEY = "pitchlab-planner";

export interface PlannedSession {
  id: string;
  name: string;
  drillIds: string[];
  totalDuration: number;
  recurring?: boolean; // marks sessions that were auto-repeated
}

export interface RecurringWeek {
  // day index 0=Mon, 6=Sun -> sessions to repeat
  [dayIndex: number]: PlannedSession[];
}

const RECURRING_KEY = "pitchlab-planner-recurring";

// date string (YYYY-MM-DD) -> planned sessions
type PlannerData = Record<string, PlannedSession[]>;

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

let cachedSnapshot: PlannerData = {};
let cachedRaw: string | null = null;

function getSnapshot(): PlannerData {
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

const EMPTY: PlannerData = {};
function getServerSnapshot(): PlannerData {
  return EMPTY;
}

export function usePlanner() {
  const planner = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addSession = useCallback((date: string, session: PlannedSession) => {
    const current = getSnapshot();
    const daySessions = current[date] || [];
    const next = {
      ...current,
      [date]: [...daySessions, session],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = null;
    emitChange();
  }, []);

  const removeSession = useCallback((date: string, sessionId: string) => {
    const current = getSnapshot();
    const daySessions = (current[date] || []).filter((s) => s.id !== sessionId);
    const next = { ...current };
    if (daySessions.length === 0) {
      delete next[date];
    } else {
      next[date] = daySessions;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    cachedRaw = null;
    emitChange();
  }, []);

  const getSessionsForDate = useCallback(
    (date: string): PlannedSession[] => planner[date] || [],
    [planner]
  );

  const getSessionsForWeek = useCallback(
    (startDate: Date): Record<string, PlannedSession[]> => {
      const result: Record<string, PlannedSession[]> = {};
      for (let i = 0; i < 7; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split("T")[0];
        result[key] = planner[key] || [];
      }
      return result;
    },
    [planner]
  );

  // Save the current week as a recurring template
  const setRecurringWeek = useCallback((weekStartDate: Date) => {
    const current = getSnapshot();
    const recurring: RecurringWeek = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      const sessions = current[key] || [];
      if (sessions.length > 0) {
        recurring[i] = sessions.map((s) => ({
          ...s,
          recurring: true,
        }));
      }
    }
    localStorage.setItem(RECURRING_KEY, JSON.stringify(recurring));
    cachedRaw = null;
    emitChange();
  }, []);

  // Clear recurring week
  const clearRecurringWeek = useCallback(() => {
    localStorage.removeItem(RECURRING_KEY);
    cachedRaw = null;
    emitChange();
  }, []);

  // Check if recurring is set
  const getRecurringWeek = useCallback((): RecurringWeek | null => {
    try {
      const raw = localStorage.getItem(RECURRING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  // Apply recurring sessions to a specific week (fills in days that have no sessions)
  const applyRecurringToWeek = useCallback((weekStartDate: Date) => {
    const recurring = getRecurringWeek();
    if (!recurring) return;
    const current = getSnapshot();
    const next = { ...current };
    let changed = false;

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      const existing = next[key] || [];
      const template = recurring[i];

      if (template && existing.length === 0) {
        // Add recurring sessions with fresh IDs
        next[key] = template.map((s) => ({
          ...s,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          recurring: true,
        }));
        changed = true;
      }
    }

    if (changed) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      cachedRaw = null;
      emitChange();
    }
  }, [getRecurringWeek]);

  return {
    planner,
    addSession,
    removeSession,
    getSessionsForDate,
    getSessionsForWeek,
    setRecurringWeek,
    clearRecurringWeek,
    getRecurringWeek,
    applyRecurringToWeek,
  };
}
