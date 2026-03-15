"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

interface Props {
  drillId: string;
  size?: "sm" | "default";
}

export function FavoriteButton({ drillId, size = "sm" }: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(drillId);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "shrink-0",
        size === "sm" ? "h-8 w-8" : "h-10 w-10"
      )}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(drillId);
      }}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={cn(
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          "transition-colors",
          fav && "fill-red-500 text-red-500"
        )}
      />
    </Button>
  );
}
