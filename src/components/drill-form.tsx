"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PitchEditor } from "@/components/pitch-editor";
import {
  ALL_CATEGORIES,
  ALL_DIFFICULTIES,
  CATEGORY_META,
  DIFFICULTY_META,
} from "@/lib/constants";
import { Category, Difficulty, Drill, PitchElement } from "@/types/drill";

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {items.length > 0 && (
        <ol className="space-y-1">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-start justify-between gap-2 rounded-md border px-3 py-1.5 text-sm"
            >
              <span>
                {i + 1}. {item}
              </span>
              <button
                type="button"
                className="shrink-0 text-muted-foreground hover:text-destructive mt-0.5"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function TagEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Tags</span>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. warm-up"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="gap-1 cursor-pointer hover:bg-destructive/10"
              onClick={() => onChange(tags.filter((t) => t !== tag))}
            >
              #{tag}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export interface DrillFormData {
  title: string;
  category: Category;
  difficulty: Difficulty;
  duration: number;
  playerCountMin: number;
  playerCountMax: number;
  equipment: string[];
  instructions: string[];
  coachingPoints: string[];
  variations: string[];
  tags: string[];
  pitchElements: PitchElement[];
}

interface DrillFormProps {
  initialData?: DrillFormData;
  onSubmit: (data: DrillFormData) => void;
  submitLabel: string;
  cancelHref: string;
}

export function DrillForm({
  initialData,
  onSubmit,
  submitLabel,
  cancelHref,
}: DrillFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [category, setCategory] = useState<Category>(initialData?.category ?? "passing");
  const [difficulty, setDifficulty] = useState<Difficulty>(initialData?.difficulty ?? "beginner");
  const [duration, setDuration] = useState(initialData?.duration ?? 10);
  const [playerCountMin, setPlayerCountMin] = useState(initialData?.playerCountMin ?? 2);
  const [playerCountMax, setPlayerCountMax] = useState(initialData?.playerCountMax ?? 10);
  const [equipment, setEquipment] = useState<string[]>(initialData?.equipment ?? ["balls"]);
  const [instructions, setInstructions] = useState<string[]>(initialData?.instructions ?? []);
  const [coachingPoints, setCoachingPoints] = useState<string[]>(initialData?.coachingPoints ?? []);
  const [variations, setVariations] = useState<string[]>(initialData?.variations ?? []);
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? []);
  const [pitchElements, setPitchElements] = useState<PitchElement[]>(initialData?.pitchElements ?? []);
  const [errors, setErrors] = useState<string[]>([]);

  function validate(): string[] {
    const errs: string[] = [];
    if (!title.trim()) errs.push("Title is required.");
    if (instructions.length === 0)
      errs.push("Add at least one instruction step.");
    if (playerCountMin > playerCountMax)
      errs.push("Min players cannot exceed max players.");
    if (duration < 1) errs.push("Duration must be at least 1 minute.");
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    onSubmit({
      title: title.trim(),
      category,
      difficulty,
      duration,
      playerCountMin,
      playerCountMax,
      equipment,
      instructions,
      coachingPoints,
      variations,
      tags,
      pitchElements,
    });
  }

  return (
    <>
      {errors.length > 0 && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-destructive">
              {err}
            </p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rondo 5v2"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={category}
                  onValueChange={(v) => v && setCategory(v as Category)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CATEGORY_META[c].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => v && setDifficulty(v as Difficulty)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DIFFICULTY_META[d].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (min)</label>
                <Input
                  type="number"
                  min={1}
                  max={120}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Min Players</label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={playerCountMin}
                  onChange={(e) => setPlayerCountMin(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Players</label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={playerCountMax}
                  onChange={(e) => setPlayerCountMax(Number(e.target.value))}
                />
              </div>
            </div>

            <ListEditor
              label="Equipment"
              items={equipment}
              onChange={setEquipment}
              placeholder="e.g. cones"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pitch Diagram</CardTitle>
          </CardHeader>
          <CardContent>
            <PitchEditor elements={pitchElements} onChange={setPitchElements} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drill Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ListEditor
              label="Instructions"
              items={instructions}
              onChange={setInstructions}
              placeholder="Add a step..."
            />
            <Separator />
            <ListEditor
              label="Coaching Points"
              items={coachingPoints}
              onChange={setCoachingPoints}
              placeholder="Add a coaching point..."
            />
            <Separator />
            <ListEditor
              label="Variations"
              items={variations}
              onChange={setVariations}
              placeholder="Add a variation..."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <TagEditor tags={tags} onChange={setTags} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <a href={cancelHref}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </a>
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </>
  );
}
