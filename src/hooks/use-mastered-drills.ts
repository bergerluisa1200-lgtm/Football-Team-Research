"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";

export function useMasteredDrills() {
  const { user } = useAuth();
  const [mastered, setMastered] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setMastered([]);
      return;
    }
    const colRef = collection(db, "users", user.uid, "masteredDrills");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      setMastered(snap.docs.map((d) => d.id));
    });
    return unsubscribe;
  }, [user]);

  const toggleMastered = useCallback(
    async (drillId: string) => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid, "masteredDrills", drillId);
      if (mastered.includes(drillId)) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { masteredAt: new Date().toISOString() });
      }
    },
    [user, mastered]
  );

  const isMastered = useCallback(
    (drillId: string) => mastered.includes(drillId),
    [mastered]
  );

  return { mastered, toggleMastered, isMastered };
}
