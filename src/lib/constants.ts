import { Category, Difficulty } from "@/types/drill";

export const CATEGORY_META: Record<
  Category,
  { label: string; icon: string; color: string }
> = {
  passing: { label: "Passing", icon: "ArrowRightLeft", color: "#2563eb" },
  shooting: { label: "Shooting", icon: "Target", color: "#dc2626" },
  dribbling: { label: "Dribbling", icon: "Zap", color: "#f59e0b" },
  defending: { label: "Defending", icon: "Shield", color: "#7c3aed" },
  fitness: { label: "Fitness", icon: "Timer", color: "#10b981" },
};

export const DIFFICULTY_META: Record<
  Difficulty,
  { label: string; color: string; bgClass: string }
> = {
  beginner: {
    label: "Beginner",
    color: "#16a34a",
    bgClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  intermediate: {
    label: "Intermediate",
    color: "#d97706",
    bgClass: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  },
  advanced: {
    label: "Advanced",
    color: "#dc2626",
    bgClass: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
};

export const ALL_CATEGORIES: Category[] = [
  "passing",
  "shooting",
  "dribbling",
  "defending",
  "fitness",
];

export const ALL_DIFFICULTIES: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];
