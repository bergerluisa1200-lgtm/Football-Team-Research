"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";

export interface PlannedSession {
  id: string;
  name: string;
  drillIds: string[];
  totalDuration: number;
  recurring?: boolean;
}

export interface RecurringWeek {
  [dayIndex: number]: PlannedSession[];
}

export function usePlanner() {
  const { user } = useAuth();
  const [planner, setPlanner] = useState<Record<string, PlannedSession[]>>({});
  const [recurringWeek, setRecurringWeekState] = useState<RecurringWeek | null>(null);

  // Listen to planner collection
  useEffect(() => {
    if (!user) {
      setPlanner({});
      return;
    }
    const colRef = collection(db, "users", user.uid, "planner");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      const result: Record<string, PlannedSession[]> = {};
      snap.docs.forEach((d) => {
        result[d.id] = d.data().sessions || [];
      });
      setPlanner(result);
    });
    return unsubscribe;
  }, [user]);

  // Listen to recurring week
  useEffect(() => {
    if (!user) {
      setRecurringWeekState(null);
      return;
    }
    const colRef = collection(db, "users", user.uid, "plannerRecurring");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      if (snap.empty) {
        setRecurringWeekState(null);
        return;
      }
      const result: RecurringWeek = {};
      snap.docs.forEach((d) => {
        result[parseInt(d.id)] = d.data().sessions || [];
      });
      setRecurringWeekState(result);
    });
    return unsubscribe;
  }, [user]);

  const addSession = useCallback(
    async (date: string, session: PlannedSession) => {
      if (!user) return;
      const existing = planner[date] || [];
      await setDoc(doc(db, "users", user.uid, "planner", date), {
        sessions: [...existing, session],
      });
    },
    [user, planner]
  );

  const removeSession = useCallback(
    async (date: string, sessionId: string) => {
      if (!user) return;
      const existing = (planner[date] || []).filter((s) => s.id !== sessionId);
      if (existing.length === 0) {
        await deleteDoc(doc(db, "users", user.uid, "planner", date));
      } else {
        await setDoc(doc(db, "users", user.uid, "planner", date), {
          sessions: existing,
        });
      }
    },
    [user, planner]
  );

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

  const setRecurringWeek = useCallback(
    async (weekStartDate: Date) => {
      if (!user) return;
      const batch = writeBatch(db);

      // Clear old recurring
      const colRef = collection(db, "users", user.uid, "plannerRecurring");
      const existingSnap = await getDocs(colRef);
      existingSnap.docs.forEach((d) => batch.delete(d.ref));

      // Set new recurring from current week
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split("T")[0];
        const sessions = planner[key] || [];
        if (sessions.length > 0) {
          batch.set(
            doc(db, "users", user.uid, "plannerRecurring", String(i)),
            {
              sessions: sessions.map((s) => ({ ...s, recurring: true })),
            }
          );
        }
      }

      await batch.commit();
    },
    [user, planner]
  );

  const clearRecurringWeek = useCallback(async () => {
    if (!user) return;
    const colRef = collection(db, "users", user.uid, "plannerRecurring");
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }, [user]);

  const getRecurringWeek = useCallback(
    (): RecurringWeek | null => recurringWeek,
    [recurringWeek]
  );

  const applyRecurringToWeek = useCallback(
    async (weekStartDate: Date) => {
      if (!user || !recurringWeek) return;
      const batch = writeBatch(db);
      let changed = false;

      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStartDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().split("T")[0];
        const existing = planner[key] || [];
        const template = recurringWeek[i];

        if (template && existing.length === 0) {
          batch.set(doc(db, "users", user.uid, "planner", key), {
            sessions: template.map((s) => ({
              ...s,
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              recurring: true,
            })),
          });
          changed = true;
        }
      }

      if (changed) {
        await batch.commit();
      }
    },
    [user, planner, recurringWeek]
  );

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
