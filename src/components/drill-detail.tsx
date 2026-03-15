"use client";

import { Clock, Users, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Drill } from "@/types/drill";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/constants";
import { PitchDiagram } from "./pitch-diagram";
import { FavoriteButton } from "./favorite-button";
import { cn } from "@/lib/utils";

interface Props {
  drill: Drill;
}

export function DrillDetail({ drill }: Props) {
  const catMeta = CATEGORY_META[drill.category];
  const diffMeta = DIFFICULTY_META[drill.difficulty];

  return (
    <div className="space-y-8">
      <div className="glass rounded-xl p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              style={{ backgroundColor: catMeta.color + "20", color: catMeta.color }}
            >
              {catMeta.label}
            </Badge>
            <Badge variant="outline" className={cn(diffMeta.bgClass)}>
              {diffMeta.label}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{drill.title}</h1>
          <div className="flex items-center gap-6 text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {drill.duration} min
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {drill.playerCountMin === drill.playerCountMax
                ? `${drill.playerCountMin} players`
                : `${drill.playerCountMin}-${drill.playerCountMax} players`}
            </span>
            <span className="flex items-center gap-1.5">
              <Dumbbell className="h-4 w-4" />
              {drill.equipment.join(", ")}
            </span>
          </div>
        </div>
        <FavoriteButton drillId={drill.id} size="default" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PitchDiagram elements={drill.pitchElements} className="lg:sticky lg:top-24" />

        <Tabs defaultValue="instructions" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="instructions" className="flex-1">
              Instructions
            </TabsTrigger>
            <TabsTrigger value="coaching" className="flex-1">
              Coaching Points
            </TabsTrigger>
            <TabsTrigger value="variations" className="flex-1">
              Variations
            </TabsTrigger>
          </TabsList>
          <TabsContent value="instructions" className="mt-4">
            <ol className="space-y-3 list-decimal list-inside">
              {drill.instructions.map((step, i) => (
                <li key={i} className="text-base leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>
          </TabsContent>
          <TabsContent value="coaching" className="mt-4">
            <ul className="space-y-3">
              {drill.coachingPoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-base leading-relaxed">
                  <span className="text-primary font-bold shrink-0">-</span>
                  {point}
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="variations" className="mt-4">
            <ul className="space-y-3">
              {drill.variations.map((v, i) => (
                <li key={i} className="flex gap-2 text-base leading-relaxed">
                  <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                  {v}
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      <div className="flex flex-wrap gap-2">
        {drill.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="text-sm">
            #{tag}
          </Badge>
        ))}
      </div>
    </div>
  );
}
