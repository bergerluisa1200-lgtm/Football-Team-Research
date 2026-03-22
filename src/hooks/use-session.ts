"use client";

import { useState, useCallback, useEffect } from "react";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Session, SessionDrill } from "@/types/drill";
import { canCreateSession } from "@/lib/plans";

const DEFAULT_SESSION: Session = {
  id: "default",
  name: "My Session",
  drills: [],
  createdAt: new Date().toISOString(),
};

export function useSession() {
  const { user, userData } = useAuth();
  const [session, setSession] = useState<Session>(DEFAULT_SESSION);
  const [loaded, setLoaded] = useState(false);

  // Load current session from Firestore on mount
  useEffect(() => {
    if (!user) {
      setSession(DEFAULT_SESSION);
      setLoaded(false);
      return;
    }
    const docRef = doc(db, "users", user.uid, "currentSession", "active");
    getDoc(docRef).then((snap) => {
      if (snap.exists()) {
        setSession(snap.data() as Session);
      }
      setLoaded(true);
    });
  }, [user]);

  // Persist current session to Firestore
  useEffect(() => {
    if (!user || !loaded) return;
    const docRef = doc(db, "users", user.uid, "currentSession", "active");
    setDoc(docRef, session);
  }, [session, user, loaded]);

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

  // Save the current session as a named session (for plan limit tracking)
  const saveSession = useCallback(
    async (): Promise<boolean> => {
      if (!user || !userData) return false;
      const colRef = collection(db, "users", user.uid, "sessions");
      const snap = await getDocs(colRef);
      if (!canCreateSession(userData.plan, snap.size)) {
        return false; // limit reached
      }
      const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      await setDoc(doc(db, "users", user.uid, "sessions", id), {
        ...session,
        id,
        createdAt: new Date().toISOString(),
      });
      return true;
    },
    [user, userData, session]
  );

  // Get count of saved sessions (for plan limit checks)
  const getSavedSessionCount = useCallback(async (): Promise<number> => {
    if (!user) return 0;
    const colRef = collection(db, "users", user.uid, "sessions");
    const snap = await getDocs(colRef);
    return snap.size;
  }, [user]);

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
    saveSession,
    getSavedSessionCount,
    totalDuration,
    totalRestSeconds,
  };
}
