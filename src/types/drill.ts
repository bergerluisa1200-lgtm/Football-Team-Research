export type Category = "passing" | "shooting" | "dribbling" | "defending" | "fitness";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface PitchElement {
  type: "player" | "ball" | "cone" | "arrow" | "run-path";
  x: number; // 0-100%
  y: number; // 0-100%
  toX?: number; // for arrows/run-paths
  toY?: number;
  label?: string;
  color?: string;
  dashed?: boolean;
}

export interface Drill {
  id: string;
  slug: string;
  title: string;
  category: Category;
  difficulty: Difficulty;
  duration: number; // minutes
  playerCountMin: number;
  playerCountMax: number;
  equipment: string[];
  instructions: string[];
  coachingPoints: string[];
  variations: string[];
  pitchElements: PitchElement[];
  tags: string[];
}

export interface SessionDrill {
  drillId: string;
  duration: number; // minutes (can be adjusted from default)
  order: number;
}

export interface Session {
  id: string;
  name: string;
  drills: SessionDrill[];
  createdAt: string;
}

export type Mood = "great" | "good" | "okay" | "tired" | "rough";

export interface TrainingLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  categories: Category[];
  duration: number; // minutes
  rating: number; // 1-10
  mood: Mood;
  practiced: string;
  improvements: string;
  notes: string;
  createdAt: string;
}
