import { SessionDrill } from "@/types/drill";

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  icon: "warmup" | "shooting" | "full" | "fitness" | "passing";
  drills: SessionDrill[];
}

export const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    id: "pre-match-warmup",
    name: "Pre-Match Warm-Up",
    description: "Light fitness, passing patterns, and ball mastery to get match-ready.",
    icon: "warmup",
    drills: [
      { drillId: "20", duration: 5, order: 0, restAfter: 30 },  // Agility Box Footwork
      { drillId: "5", duration: 6, order: 1, restAfter: 30 },   // Shuttle Runs with Ball
      { drillId: "12", duration: 8, order: 2, restAfter: 30 },  // Give & Go Circuit
      { drillId: "1", duration: 8, order: 3, restAfter: 0 },    // Rondo 4v1
    ],
  },
  {
    id: "shooting-practice",
    name: "Shooting Practice",
    description: "Progressive shooting drills from easy finishes to advanced volleys.",
    icon: "shooting",
    drills: [
      { drillId: "14", duration: 8, order: 0, restAfter: 60 },  // Penalty Box Chaos
      { drillId: "2", duration: 10, order: 1, restAfter: 60 },  // Wall Pass & Shoot
      { drillId: "24", duration: 12, order: 2, restAfter: 60 }, // Power Shot Stations
      { drillId: "34", duration: 12, order: 3, restAfter: 60 }, // Near Post / Far Post
      { drillId: "13", duration: 10, order: 4, restAfter: 0 },  // Volley Finishing
    ],
  },
  {
    id: "full-training-day",
    name: "Full Training Day",
    description: "Complete 90-minute session covering warm-up, technical work, tactics, and fitness.",
    icon: "full",
    drills: [
      { drillId: "36", duration: 8, order: 0, restAfter: 30 },  // Ladder & Footwork
      { drillId: "6", duration: 10, order: 1, restAfter: 60 },  // Triangular Passing
      { drillId: "8", duration: 8, order: 2, restAfter: 60 },   // Skill Dribble Course
      { drillId: "1", duration: 10, order: 3, restAfter: 60 },  // Rondo 4v1
      { drillId: "26", duration: 12, order: 4, restAfter: 90 }, // Counter-Press 3v3
      { drillId: "2", duration: 12, order: 5, restAfter: 60 },  // Wall Pass & Shoot
      { drillId: "7", duration: 15, order: 6, restAfter: 60 },  // Finishing from Crosses
      { drillId: "19", duration: 10, order: 7, restAfter: 0 },  // Sprint Interval Ladders
    ],
  },
  {
    id: "passing-masterclass",
    name: "Passing Masterclass",
    description: "Short and long passing patterns to sharpen distribution.",
    icon: "passing",
    drills: [
      { drillId: "12", duration: 8, order: 0, restAfter: 30 },  // Give & Go Circuit
      { drillId: "6", duration: 10, order: 1, restAfter: 45 },  // Triangular Passing
      { drillId: "1", duration: 10, order: 2, restAfter: 60 },  // Rondo 4v1
      { drillId: "32", duration: 12, order: 3, restAfter: 60 }, // Long Ball Switching
      { drillId: "28", duration: 15, order: 4, restAfter: 0 },  // Third Man Run
    ],
  },
  {
    id: "fitness-blast",
    name: "Fitness Blast",
    description: "High-intensity fitness circuit with ball work to build match endurance.",
    icon: "fitness",
    drills: [
      { drillId: "36", duration: 8, order: 0, restAfter: 45 },  // Ladder & Footwork
      { drillId: "5", duration: 8, order: 1, restAfter: 60 },   // Shuttle Runs with Ball
      { drillId: "10", duration: 15, order: 2, restAfter: 90 }, // HIIT Ball Mastery
      { drillId: "31", duration: 15, order: 3, restAfter: 60 }, // Box-to-Box Intervals
      { drillId: "27", duration: 15, order: 4, restAfter: 0 },  // Yo-Yo Endurance
    ],
  },
];
