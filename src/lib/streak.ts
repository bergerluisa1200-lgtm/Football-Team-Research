import { TrainingLogEntry } from "@/types/drill";

function toDayKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

/**
 * Consecutive-day streak ending today or yesterday.
 * Returns 0 if the most recent entry is older than yesterday.
 */
export function computeStreak(entries: Pick<TrainingLogEntry, "date">[]): number {
  if (entries.length === 0) return 0;

  const days = new Set(entries.map((e) => e.date));

  const today = new Date();
  const todayKey = toDayKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayKey = toDayKey(yesterday);

  // Streak only counts if there's an entry today or yesterday.
  let cursor: Date;
  if (days.has(todayKey)) {
    cursor = today;
  } else if (days.has(yesterdayKey)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let count = 0;
  while (days.has(toDayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
