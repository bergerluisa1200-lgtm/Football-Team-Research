"use client";

import { useMemo } from "react";
import { Drill } from "@/types/drill";
import { getAllDrills, getDrillById as getSeedDrillById } from "@/lib/drills";
import { useCustomDrills } from "./use-custom-drills";

export function useAllDrills() {
  const { customDrills } = useCustomDrills();

  const allDrills = useMemo(
    () => [...getAllDrills(), ...customDrills],
    [customDrills]
  );

  const getDrillById = useMemo(() => {
    const map = new Map<string, Drill>();
    for (const d of allDrills) map.set(d.id, d);
    return (id: string) => map.get(id);
  }, [allDrills]);

  return { allDrills, getDrillById };
}
