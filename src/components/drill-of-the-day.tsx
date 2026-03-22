"use client";

import Link from "next/link";
import { Sparkles, Clock, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAllDrills } from "@/lib/drills";
import { getDrillOfTheDay } from "@/lib/drill-of-the-day";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/constants";
import { PitchDiagram } from "./pitch-diagram";
import { cn } from "@/lib/utils";

export function DrillOfTheDay() {
  const drills = getAllDrills();
  const drill = getDrillOfTheDay(drills);
  if (!drill) return null;

  const catMeta = CATEGORY_META[drill.category];
  const diffMeta = DIFFICULTY_META[drill.difficulty];

  return (
    <section className="mx-auto max-w-7xl px-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-2xl font-bold">Drill of the Day</h2>
      </div>
      <Link href={`/drills/${drill.slug}`}>
        <div className="glass rounded-xl p-6 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 gap-1">
                  <Sparkles className="h-3 w-3" />
                  Today&apos;s Pick
                </Badge>
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: catMeta.color + "20", color: catMeta.color }}
                >
                  {catMeta.label}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", diffMeta.bgClass)}>
                  {diffMeta.label}
                </Badge>
              </div>
              <h3 className="text-xl font-bold">{drill.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {drill.instructions[0]}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {drill.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {drill.playerCountMin === drill.playerCountMax
                    ? `${drill.playerCountMin}`
                    : `${drill.playerCountMin}-${drill.playerCountMax}`}{" "}
                  players
                </span>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 mt-2">
                View Drill
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
            <PitchDiagram elements={drill.pitchElements} className="w-full" />
          </div>
        </div>
      </Link>
    </section>
  );
}
