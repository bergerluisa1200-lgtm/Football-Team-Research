"use client";

import { useState, useCallback, useEffect } from "react";
import { Session, SessionDrill } from "@/types/drill";

const STORAGE_KEY = "pitchlab-session";

function loadSession(): Session {
  if (typeof window === "undefined") {
    return { id: "default", name: "My Session", drills: [], createdAt: new Date().toISOString() };
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { id: "default", name: "My Session", drills: [], createdAt: new Date().toISOString() };
}

export function useSession() {
  const [session, setSession] = useState<Session>(loadSession);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const addDrill = useCallback((drillId: string, defaultDuration: number = 10) => {
    setSession((prev) => {
      const exists = prev.drills.some((d) => d.drillId === drillId);
      if (exists) return prev;
      return {
        ...prev,
        drills: [
          ...prev.drills,
          { drillId, duration: defaultDuration, order: prev.drills.length, restAfter: 0 },
        ],
      };
    });
  }, []);

  const removeDrill = useCallback((drillId: string) => {
    setSession((prev) => ({
      ...prev,
      drills: prev.drills
        .filter((d) => d.drillId !== drillId)
        .map((d, i) => ({ ...d, order: i })),
    }));
  }, []);

  const reorderDrills = useCallback((drills: SessionDrill[]) => {
    setSession((prev) => ({
      ...prev,
      drills: drills.map((d, i) => ({ ...d, order: i })),
    }));
  }, []);

  const updateDrillDuration = useCallback((drillId: string, duration: number) => {
    setSession((prev) => ({
      ...prev,
      drills: prev.drills.map((d) =>
        d.drillId === drillId ? { ...d, duration } : d
      ),
    }));
  }, []);

  const updateRestPeriod = useCallback((drillId: string, restAfter: number) => {
    setSession((prev) => ({
      ...prev,
      drills: prev.drills.map((d) =>
        d.drillId === drillId ? { ...d, restAfter } : d
      ),
    }));
  }, []);

  const setDefaultRest = useCallback((seconds: number) => {
    setSession((prev) => ({
      ...prev,
      drills: prev.drills.map((d) => ({ ...d, restAfter: seconds })),
    }));
  }, []);

  const updateName = useCallback((name: string) => {
    setSession((prev) => ({ ...prev, name }));
  }, []);

  const clearSession = useCallback(() => {
    setSession({
      id: "default",
      name: "My Session",
      drills: [],
      createdAt: new Date().toISOString(),
    });
  }, []);

  const loadTemplate = useCallback((template: { name: string; drills: SessionDrill[] }) => {
    setSession({
      id: "default",
      name: template.name,
      drills: template.drills.map((d, i) => ({ ...d, order: i })),
      createdAt: new Date().toISOString(),
    });
  }, []);

  const totalDuration = session.drills.reduce((sum, d) => sum + d.duration, 0);
  const totalRestSeconds = session.drills.reduce((sum, d) => sum + (d.restAfter || 0), 0);

  return {
    session,
    addDrill,
    removeDrill,
    reorderDrills,
    updateDrillDuration,
    updateRestPeriod,
    setDefaultRest,
    updateName,
    clearSession,
    loadTemplate,
    totalDuration,
    totalRestSeconds,
  };
}
