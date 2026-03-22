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

export function useFavorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    const colRef = collection(db, "users", user.uid, "favorites");
    const unsubscribe = onSnapshot(colRef, (snap) => {
      setFavorites(snap.docs.map((d) => d.id));
    });
    return unsubscribe;
  }, [user]);

  const toggleFavorite = useCallback(
    async (drillId: string) => {
      if (!user) return;
      const docRef = doc(db, "users", user.uid, "favorites", drillId);
      if (favorites.includes(drillId)) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { drillId, addedAt: new Date().toISOString() });
      }
    },
    [user, favorites]
  );

  const isFavorite = useCallback(
    (drillId: string) => favorites.includes(drillId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
