import { Drill } from "@/types/drill";

// Deterministic "random" pick based on date string
function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function getDrillOfTheDay(drills: Drill[]): Drill {
  if (drills.length === 0) return drills[0];
  const today = new Date().toISOString().split("T")[0];
  const index = hashDate(today) % drills.length;
  return drills[index];
}
