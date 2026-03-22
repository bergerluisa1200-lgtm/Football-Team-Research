export type Plan = "free" | "pro";

export const PLAN_LIMITS = {
  free: { maxCustomDrills: 3, maxSessions: 3 },
  pro: { maxCustomDrills: Infinity, maxSessions: Infinity },
} as const;

export function canCreateDrill(plan: Plan, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan].maxCustomDrills;
}

export function canCreateSession(plan: Plan, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan].maxSessions;
}
