"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";

interface DrillHistoryEntry {
  count: number;
  lastUsed: string;
}

export function useDrillHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<Record<string, DrillHistoryEntry>>({});

  useEffect(() => {
    if (!user) {
      setHistory({});
      return;
    }
    const colRef = collection(db, "users", user.uid, "drillHistory");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      const result: Record<string, DrillHistoryEntry> = {};
      snap.docs.forEach((d) => {
        const data = d.data();
        result[d.id] = { count: data.count || 0, lastUsed: data.lastUsed || "" };
      });
      setHistory(result);
    });
    return unsubscribe;
  }, [user]);

  const recordUsage = useCallback(
    async (drillId: string) => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid, "drillHistory", drillId);
      const snap = await getDoc(docRef);
      const existing = snap.exists() ? snap.data() : null;
      await setDoc(docRef, {
        count: (existing?.count || 0) + 1,
        lastUsed: new Date().toISOString(),
      });
    },
    [user]
  );

  const getHistory = useCallback(
    (drillId: string): DrillHistoryEntry | null => history[drillId] || null,
    [history]
  );

  return { history, recordUsage, getHistory };
}
