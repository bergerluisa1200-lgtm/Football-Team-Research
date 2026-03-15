"use client";

import { TrainingLogEntry as EntryType, Mood } from "@/types/drill";
import { CATEGORY_META } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Clock, Smile, Meh, Frown, Zap, Battery } from "lucide-react";
import { cn } from "@/lib/utils";

const MOOD_CONFIG: Record<Mood, { icon: React.ElementType; label: string; color: string }> = {
  great: { icon: Zap, label: "Great", color: "text-green-500" },
  good: { icon: Smile, label: "Good", color: "text-blue-500" },
  okay: { icon: Meh, label: "Okay", color: "text-amber-500" },
  tired: { icon: Battery, label: "Tired", color: "text-orange-500" },
  rough: { icon: Frown, label: "Rough", color: "text-red-500" },
};

interface Props {
  entry: EntryType;
  onEdit: (entry: EntryType) => void;
  onDelete: (id: string) => void;
}

export function TrainingLogEntryCard({ entry, onEdit, onDelete }: Props) {
  const moodInfo = MOOD_CONFIG[entry.mood];
  const MoodIcon = moodInfo.icon;
  const formattedDate = new Date(entry.date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <Card className="group transition-all hover:ring-2 hover:ring-primary/20">
      <CardContent className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-semibold text-base">{formattedDate}</p>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {entry.duration}min
              </span>
              <span className={cn("flex items-center gap-1", moodInfo.color)}>
                <MoodIcon className="h-3.5 w-3.5" />
                {moodInfo.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Rating badge */}
            <div
              className={cn(
                "flex items-center justify-center rounded-lg px-2.5 py-1 text-sm font-bold",
                entry.rating >= 8
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                  : entry.rating >= 5
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
              )}
            >
              {entry.rating}/10
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onEdit(entry)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onDelete(entry.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          {entry.categories.map((cat) => (
            <Badge
              key={cat}
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: CATEGORY_META[cat].color + "20", color: CATEGORY_META[cat].color }}
            >
              {CATEGORY_META[cat].label}
            </Badge>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Practiced: </span>
            <span className="text-muted-foreground">{entry.practiced}</span>
          </div>
          {entry.improvements && (
            <div>
              <span className="font-medium">Improved: </span>
              <span className="text-muted-foreground">{entry.improvements}</span>
            </div>
          )}
          {entry.notes && (
            <div>
              <span className="font-medium">Notes: </span>
              <span className="text-muted-foreground">{entry.notes}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
