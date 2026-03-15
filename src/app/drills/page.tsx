"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrillFilters } from "@/components/drill-filters";
import { DrillGrid } from "@/components/drill-grid";
import { filterDrills } from "@/lib/drills";
import { useCustomDrills } from "@/hooks/use-custom-drills";
import { Category, Difficulty, Drill } from "@/types/drill";

function DrillsContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || undefined;
  const category = (searchParams.get("category") as Category) || undefined;
  const difficulty = (searchParams.get("difficulty") as Difficulty) || undefined;

  const seedDrills = filterDrills({ search, category, difficulty });
  const { customDrills } = useCustomDrills();

  // Apply same filters to custom drills
  let filteredCustom: Drill[] = customDrills;
  if (category) {
    filteredCustom = filteredCustom.filter((d) => d.category === category);
  }
  if (difficulty) {
    filteredCustom = filteredCustom.filter((d) => d.difficulty === difficulty);
  }
  if (search) {
    const q = search.toLowerCase();
    filteredCustom = filteredCustom.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.category.toLowerCase().includes(q)
    );
  }

  const allDrills = [...seedDrills, ...filteredCustom];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drill Library</h1>
          <p className="text-muted-foreground mt-1">
            {allDrills.length} drill{allDrills.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <Link href="/drills/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Drill
          </Button>
        </Link>
      </div>
      <DrillFilters />
      <DrillGrid drills={allDrills} />
    </div>
  );
}

export default function DrillsPage() {
  return (
    <Suspense>
      <DrillsContent />
    </Suspense>
  );
}
