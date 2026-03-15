"use client";

import { useFavorites } from "@/hooks/use-favorites";
import { useAllDrills } from "@/hooks/use-all-drills";
import { DrillGrid } from "@/components/drill-grid";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const { favorites } = useFavorites();
  const { getDrillById } = useAllDrills();
  const drills = favorites
    .map((id) => getDrillById(id))
    .filter((d) => d !== undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
        <p className="text-muted-foreground mt-1">
          {drills.length} saved drill{drills.length !== 1 ? "s" : ""}
        </p>
      </div>

      {drills.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-lg font-medium text-muted-foreground">
            No favorites yet
          </p>
          <p className="text-sm text-muted-foreground">
            Click the heart icon on any drill to save it here.
          </p>
          <Link href="/drills">
            <Button variant="outline">Browse Drills</Button>
          </Link>
        </div>
      ) : (
        <DrillGrid drills={drills} />
      )}
    </div>
  );
}
