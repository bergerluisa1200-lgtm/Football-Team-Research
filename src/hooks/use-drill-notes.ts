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

export function useDrillNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      setNotes({});
      return;
    }
    const colRef = collection(db, "users", user.uid, "drillNotes");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      const result: Record<string, string> = {};
      snap.docs.forEach((d) => {
        result[d.id] = d.data().note || "";
      });
      setNotes(result);
    });
    return unsubscribe;
  }, [user]);

  const setNote = useCallback(
    async (drillId: string, note: string) => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid, "drillNotes", drillId);
      if (note.trim()) {
        await setDoc(docRef, { note, updatedAt: new Date().toISOString() });
      } else {
        await deleteDoc(docRef);
      }
    },
    [user]
  );

  const getNote = useCallback(
    (drillId: string) => notes[drillId] || "",
    [notes]
  );

  return { notes, setNote, getNote };
}
