"use client";

import Link from "next/link";
import { Clock, Users, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drill } from "@/types/drill";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/constants";
import { FavoriteButton } from "./favorite-button";
import { PitchDiagram } from "./pitch-diagram";
import { useMasteredDrills } from "@/hooks/use-mastered-drills";
import { cn } from "@/lib/utils";

interface Props {
  drill: Drill;
}

export function DrillCard({ drill }: Props) {
  const catMeta = CATEGORY_META[drill.category];
  const diffMeta = DIFFICULTY_META[drill.difficulty];
  const { isMastered } = useMasteredDrills();
  const mastered = isMastered(drill.id);

  return (
    <Link href={`/drills/${drill.slug}`}>
      <Card className={cn(
        "group h-full glass transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer",
        mastered && "ring-2 ring-amber-400/50"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  style={{ backgroundColor: catMeta.color + "20", color: catMeta.color }}
                >
                  {catMeta.label}
                </Badge>
                <Badge variant="outline" className={cn("text-xs", diffMeta.bgClass)}>
                  {diffMeta.label}
                </Badge>
                {mastered && (
                  <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 gap-0.5">
                    <Trophy className="h-3 w-3" />
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                {drill.title}
              </CardTitle>
            </div>
            <FavoriteButton drillId={drill.id} />
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <PitchDiagram
            elements={drill.pitchElements}
            className="w-full"
          />
          <div className="flex items-center gap-4 text-base text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {drill.duration} min
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {drill.playerCountMin === drill.playerCountMax
                ? drill.playerCountMin
                : `${drill.playerCountMin}-${drill.playerCountMax}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
