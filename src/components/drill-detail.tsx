"use client";

import { useState } from "react";
import { Clock, Users, Dumbbell, Pencil, History, Trophy, ChevronRight, Share2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Drill } from "@/types/drill";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/constants";
import { PitchDiagram } from "./pitch-diagram";
import { FavoriteButton } from "./favorite-button";
import { useDrillNotes } from "@/hooks/use-drill-notes";
import { useDrillHistory } from "@/hooks/use-drill-history";
import { useMasteredDrills } from "@/hooks/use-mastered-drills";
import { getAllDrills } from "@/lib/drills";
import { cn } from "@/lib/utils";

interface Props {
  drill: Drill;
}

const DIFFICULTY_ORDER = ["beginner", "intermediate", "advanced"] as const;

export function DrillDetail({ drill }: Props) {
  const catMeta = CATEGORY_META[drill.category];
  const diffMeta = DIFFICULTY_META[drill.difficulty];
  const { getNote, setNote } = useDrillNotes();
  const { getHistory } = useDrillHistory();
  const { isMastered, toggleMastered } = useMasteredDrills();
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState(getNote(drill.id));

  const history = getHistory(drill.id);
  const mastered = isMastered(drill.id);

  // Progression suggestions
  const currentDiffIndex = DIFFICULTY_ORDER.indexOf(drill.difficulty);
  const nextDifficulties = DIFFICULTY_ORDER.slice(currentDiffIndex + 1);
  const suggestions = mastered && nextDifficulties.length > 0
    ? getAllDrills().filter(
        (d) =>
          d.category === drill.category &&
          nextDifficulties.includes(d.difficulty) &&
          d.id !== drill.id
      ).slice(0, 4)
    : [];

  function handleNoteSave() {
    setNote(drill.id, noteText);
    setNoteOpen(false);
  }

  function handleShare() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied to clipboard!");
    });
  }

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
            {mastered && (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 gap-1">
                <Trophy className="h-3 w-3" />
                Mastered
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{drill.title}</h1>
          <div className="flex items-center gap-6 text-muted-foreground flex-wrap">
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
            {history && (
              <span className="flex items-center gap-1.5">
                <History className="h-4 w-4" />
                Used {history.count}x &middot; Last{" "}
                {new Date(history.lastUsed).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={mastered ? "default" : "outline"}
            size="sm"
            className={cn("gap-1.5", mastered && "bg-amber-500 hover:bg-amber-600 text-white")}
            onClick={() => toggleMastered(drill.id)}
          >
            <Trophy className="h-4 w-4" />
            {mastered ? "Mastered" : "Mark Mastered"}
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <FavoriteButton drillId={drill.id} size="default" />
        </div>
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

      {/* Player Notes */}
      <div className="glass rounded-xl p-4">
        <button
          onClick={() => { setNoteOpen(!noteOpen); setNoteText(getNote(drill.id)); }}
          className="flex items-center gap-2 w-full text-left"
        >
          <Pencil className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">My Notes</span>
          {getNote(drill.id) && !noteOpen && (
            <span className="text-sm text-muted-foreground truncate flex-1">
              — {getNote(drill.id)}
            </span>
          )}
        </button>
        {noteOpen && (
          <div className="mt-3 space-y-2">
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Add personal notes for this drill (e.g., focus on weak foot next time)..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setNoteOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleNoteSave}>
                Save Note
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Progression Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-primary" />
            Next Steps — Try These Harder Drills
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((s) => {
              const sMeta = CATEGORY_META[s.category];
              const sDiff = DIFFICULTY_META[s.difficulty];
              return (
                <Link key={s.id} href={`/drills/${s.slug}`}>
                  <div className="glass rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={cn("text-xs", sDiff.bgClass)}>
                          {sDiff.label}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm mt-1 truncate">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.duration} min</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
