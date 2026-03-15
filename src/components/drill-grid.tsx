"use client";

import { Drill } from "@/types/drill";
import { DrillCard } from "./drill-card";

interface Props {
  drills: Drill[];
}

export function DrillGrid({ drills }: Props) {
  if (drills.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No drills found</p>
        <p className="text-sm mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {drills.map((drill) => (
        <DrillCard key={drill.id} drill={drill} />
      ))}
    </div>
  );
}
