"use client";

import { useState, useEffect, useCallback } from "react";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Drill } from "@/types/drill";
import { canCreateDrill } from "@/lib/plans";

function generateId(): string {
  return "custom-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "drill"
  );
}

export function useCustomDrills() {
  const { user, userData } = useAuth();
  const [customDrills, setCustomDrills] = useState<Drill[]>([]);

  useEffect(() => {
    if (!user) {
      setCustomDrills([]);
      return;
    }
    const colRef = collection(db, "users", user.uid, "customDrills");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      setCustomDrills(snap.docs.map((d) => d.data() as Drill));
    });
    return unsubscribe;
  }, [user]);

  const addDrill = useCallback(
    async (draft: Omit<Drill, "id" | "slug">): Promise<Drill | null> => {
      if (!user || !userData) return null;

      // Check plan limits
      const colRef = collection(db, "users", user.uid, "customDrills");
      const snap = await getDocs(colRef);
      if (!canCreateDrill(userData.plan, snap.size)) {
        return null; // limit reached
      }

      const id = generateId();
      const slug = slugify(draft.title) + "-" + id.slice(-6);
      const drill: Drill = { ...draft, id, slug };
      await setDoc(doc(db, "users", user.uid, "customDrills", id), drill);
      return drill;
    },
    [user, userData]
  );

  const updateDrill = useCallback(
    async (
      id: string,
      updates: Partial<Omit<Drill, "id" | "slug">>
    ): Promise<Drill | null> => {
      if (!user) return null;
      const docRef = doc(db, "users", user.uid, "customDrills", id);
      await updateDoc(docRef, updates);
      const existing = customDrills.find((d) => d.id === id);
      return existing ? { ...existing, ...updates } : null;
    },
    [user, customDrills]
  );

  const deleteDrill = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.uid, "customDrills", id));
    },
    [user]
  );

  const getCustomDrill = useCallback(
    (slug: string) => customDrills.find((d) => d.slug === slug),
    [customDrills]
  );

  return { customDrills, addDrill, updateDrill, deleteDrill, getCustomDrill };
}
