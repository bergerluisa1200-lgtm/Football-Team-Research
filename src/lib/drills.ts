import { Drill, Category, Difficulty } from "@/types/drill";
import drillsData from "@/data/drills.json";

const drills: Drill[] = drillsData as Drill[];

export function getAllDrills(): Drill[] {
  return drills;
}

export function getDrillBySlug(slug: string): Drill | undefined {
  return drills.find((d) => d.slug === slug);
}

export function getDrillById(id: string): Drill | undefined {
  return drills.find((d) => d.id === id);
}

export function getDrillsByCategory(category: Category): Drill[] {
  return drills.filter((d) => d.category === category);
}

export function getFeaturedDrills(): Drill[] {
  return [drills[0], drills[1], drills[3], drills[9]];
}

export function filterDrills(options: {
  search?: string;
  category?: Category;
  difficulty?: Difficulty;
}): Drill[] {
  let result = drills;

  if (options.category) {
    result = result.filter((d) => d.category === options.category);
  }

  if (options.difficulty) {
    result = result.filter((d) => d.difficulty === options.difficulty);
  }

  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.category.toLowerCase().includes(q)
    );
  }

  return result;
}
