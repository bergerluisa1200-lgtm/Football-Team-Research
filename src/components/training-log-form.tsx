"use client";

import { useState } from "react";
import { Category, Mood, TrainingLogEntry } from "@/types/drill";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Smile, Meh, Frown, Zap, Battery } from "lucide-react";
import { cn } from "@/lib/utils";

const MOODS: { value: Mood; label: string; icon: React.ElementType; color: string }[] = [
  { value: "great", label: "Great", icon: Zap, color: "text-green-500" },
  { value: "good", label: "Good", icon: Smile, color: "text-blue-500" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-amber-500" },
  { value: "tired", label: "Tired", icon: Battery, color: "text-orange-500" },
  { value: "rough", label: "Rough", icon: Frown, color: "text-red-500" },
];

interface TrainingLogFormProps {
  onSubmit: (entry: Omit<TrainingLogEntry, "id" | "createdAt">) => void;
  initialData?: TrainingLogEntry;
  onCancel?: () => void;
}

export function TrainingLogForm({ onSubmit, initialData, onCancel }: TrainingLogFormProps) {
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().split("T")[0]);
  const [categories, setCategories] = useState<Category[]>(initialData?.categories ?? []);
  const [duration, setDuration] = useState(initialData?.duration ?? 60);
  const [rating, setRating] = useState(initialData?.rating ?? 7);
  const [mood, setMood] = useState<Mood>(initialData?.mood ?? "good");
  const [practiced, setPracticed] = useState(initialData?.practiced ?? "");
  const [improvements, setImprovements] = useState(initialData?.improvements ?? "");
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  function toggleCategory(cat: Category) {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!date) errs.push("Date is required");
    if (categories.length === 0) errs.push("Select at least one category");
    if (!practiced.trim()) errs.push("Describe what you practiced");
    if (duration < 1) errs.push("Duration must be at least 1 minute");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({
      date,
      categories,
      duration,
      rating,
      mood,
      practiced: practiced.trim(),
      improvements: improvements.trim(),
      notes: notes.trim(),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Entry" : "Log Training Session"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.length > 0 && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive space-y-1">
              {errors.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          )}

          {/* Date & Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (min)</label>
              <Input
                type="number"
                min={1}
                max={300}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What did you work on?</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium border transition-all",
                    categories.includes(cat)
                      ? "border-transparent text-white"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                  style={
                    categories.includes(cat)
                      ? { backgroundColor: CATEGORY_META[cat].color }
                      : undefined
                  }
                >
                  {CATEGORY_META[cat].label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              How would you rate your performance? <span className="text-muted-foreground">({rating}/10)</span>
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={cn(
                    "flex-1 h-9 rounded-md text-sm font-medium transition-all",
                    n <= rating
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="space-y-2">
            <label className="text-sm font-medium">How did you feel?</label>
            <div className="flex gap-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 rounded-lg p-2 border transition-all text-xs",
                    mood === m.value
                      ? "border-primary bg-primary/10 font-semibold"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <m.icon className={cn("h-5 w-5", mood === m.value ? m.color : "text-muted-foreground")} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Text fields */}
          <div className="space-y-2">
            <label className="text-sm font-medium">What did you practice?</label>
            <textarea
              value={practiced}
              onChange={(e) => setPracticed(e.target.value)}
              placeholder="e.g. Short passing combinations, 1v1 finishing drills..."
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-ring/10 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">What improved?</label>
            <textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="e.g. First touch under pressure, shot accuracy..."
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-ring/10 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other thoughts about the session..."
              rows={2}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-ring/10 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit">
              {initialData ? "Save Changes" : "Log Session"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
