"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ALL_CATEGORIES, ALL_DIFFICULTIES, CATEGORY_META, DIFFICULTY_META } from "@/lib/constants";
import { Category, Difficulty } from "@/types/drill";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

export function DrillFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const difficulty = searchParams.get("difficulty") || "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/drills?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search drills..."
          className="pl-10"
          defaultValue={search}
          onChange={(e) => updateParams("search", e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={category === cat ? "default" : "outline"}
              size="sm"
              onClick={() => updateParams("category", category === cat ? "" : cat)}
            >
              {CATEGORY_META[cat as Category].label}
            </Button>
          ))}
        </div>
        <Select
          value={difficulty || "all"}
          onValueChange={(val) => updateParams("difficulty", val === "all" ? "" : val ?? "")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {ALL_DIFFICULTIES.map((diff) => (
              <SelectItem key={diff} value={diff}>
                {DIFFICULTY_META[diff as Difficulty].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
