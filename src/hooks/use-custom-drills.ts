"use client";

import { useSyncExternalStore, useCallback } from "react";
import { Drill } from "@/types/drill";

const STORAGE_KEY = "pitchlab-custom-drills";

let listeners: (() => void)[] = [];
let cachedSnapshot: Drill[] = [];
let cachedRaw: string | null = null;
const EMPTY: Drill[] = [];

function emitChange() {
  cachedRaw = null; // invalidate cache
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getSnapshot(): Drill[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedSnapshot = raw ? JSON.parse(raw) : [];
    }
    return cachedSnapshot;
  } catch {
    return EMPTY;
  }
}

function getServerSnapshot(): Drill[] {
  return EMPTY;
}

function generateId(): string {
  return "custom-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    || "drill";
}

export function useCustomDrills() {
  const drills = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addDrill = useCallback((draft: Omit<Drill, "id" | "slug">): Drill => {
    const id = generateId();
    const slug = slugify(draft.title) + "-" + id.slice(-6);
    const drill: Drill = { ...draft, id, slug };
    const current = getSnapshot();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, drill]));
    emitChange();
    return drill;
  }, []);

  const updateDrill = useCallback((id: string, updates: Partial<Omit<Drill, "id" | "slug">>): Drill | null => {
    const current = getSnapshot();
    const index = current.findIndex((d) => d.id === id);
    if (index === -1) return null;
    const updated = { ...current[index], ...updates };
    const next = [...current];
    next[index] = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitChange();
    return updated;
  }, []);

  const deleteDrill = useCallback((id: string) => {
    const current = getSnapshot();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(current.filter((d) => d.id !== id))
    );
    emitChange();
  }, []);

  const getCustomDrill = useCallback(
    (slug: string) => drills.find((d) => d.slug === slug),
    [drills]
  );

  return { customDrills: drills, addDrill, updateDrill, deleteDrill, getCustomDrill };
}
