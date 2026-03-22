"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { TrainingLogEntry } from "@/types/drill";

export function useTrainingLog() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<TrainingLogEntry[]>([]);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }
    const colRef = collection(db, "users", user.uid, "trainingLog");
    const q = query(colRef, orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => d.data() as TrainingLogEntry));
    });
    return unsubscribe;
  }, [user]);

  const addEntry = useCallback(
    async (
      draft: Omit<TrainingLogEntry, "id" | "createdAt">
    ): Promise<TrainingLogEntry> => {
      const id =
        "log-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
      const entry: TrainingLogEntry = {
        ...draft,
        id,
        createdAt: new Date().toISOString(),
      };
      if (user) {
        await setDoc(doc(db, "users", user.uid, "trainingLog", id), entry);
      }
      return entry;
    },
    [user]
  );

  const updateEntry = useCallback(
    async (
      id: string,
      updates: Partial<Omit<TrainingLogEntry, "id" | "createdAt">>
    ): Promise<TrainingLogEntry | null> => {
      if (!user) return null;
      const docRef = doc(db, "users", user.uid, "trainingLog", id);
      await updateDoc(docRef, updates);
      const existing = entries.find((e) => e.id === id);
      return existing ? { ...existing, ...updates } : null;
    },
    [user, entries]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "trainingLog", id));
    },
    [user]
  );

  return { entries, addEntry, updateEntry, deleteEntry };
}
