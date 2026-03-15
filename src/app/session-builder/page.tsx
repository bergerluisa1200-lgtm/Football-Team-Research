"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  Clock,
  Timer,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSession } from "@/hooks/use-session";
import { useAllDrills } from "@/hooks/use-all-drills";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/constants";
import { Drill, SessionDrill } from "@/types/drill";
import { cn } from "@/lib/utils";

function SortableDrillItem({
  sessionDrill,
  onRemove,
  onDurationChange,
  getDrillById,
}: {
  sessionDrill: SessionDrill;
  onRemove: () => void;
  onDurationChange: (duration: number) => void;
  getDrillById: (id: string) => Drill | undefined;
}) {
  const drill = getDrillById(sessionDrill.drillId);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: sessionDrill.drillId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (!drill) return null;
  const catMeta = CATEGORY_META[drill.category];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg glass p-3 transition-shadow",
        isDragging && "shadow-xl z-50 opacity-90"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-xs shrink-0"
            style={{ backgroundColor: catMeta.color + "20", color: catMeta.color }}
          >
            {catMeta.label}
          </Badge>
          <span className="font-medium text-sm truncate">{drill.title}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Slider
            value={[sessionDrill.duration]}
            onValueChange={(val) => onDurationChange(Array.isArray(val) ? val[0] : val)}
            min={1}
            max={60}
            step={1}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-12 text-right shrink-0">
            {sessionDrill.duration} min
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-destructive"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function DrillSidebar({
  onAdd,
  addedIds,
  allDrills,
}: {
  onAdd: (id: string) => void;
  addedIds: Set<string>;
  allDrills: Drill[];
}) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? allDrills.filter(
        (d) =>
          d.title.toLowerCase().includes(search.toLowerCase()) ||
          d.category.includes(search.toLowerCase())
      )
    : allDrills;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search drills..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filtered.map((drill) => {
          const added = addedIds.has(drill.id);
          const catMeta = CATEGORY_META[drill.category];
          return (
            <div
              key={drill.id}
              className="flex items-center justify-between gap-2 rounded-md border p-2.5"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className="text-[10px] shrink-0"
                    style={{ backgroundColor: catMeta.color + "20", color: catMeta.color }}
                  >
                    {catMeta.label}
                  </Badge>
                  <span className="text-sm font-medium truncate">
                    {drill.title}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {drill.duration} min
                </span>
              </div>
              <Button
                variant={added ? "secondary" : "outline"}
                size="icon"
                className="shrink-0 h-8 w-8"
                disabled={added}
                onClick={() => onAdd(drill.id)}
              >
                {added ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SessionBuilderPage() {
  const {
    session,
    addDrill,
    removeDrill,
    reorderDrills,
    updateDrillDuration,
    updateName,
    clearSession,
    totalDuration,
  } = useSession();

  const { allDrills: allAvailableDrills, getDrillById } = useAllDrills();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const addedIds = new Set(session.drills.map((d) => d.drillId));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = session.drills.findIndex((d) => d.drillId === active.id);
      const newIndex = session.drills.findIndex((d) => d.drillId === over.id);
      reorderDrills(arrayMove(session.drills, oldIndex, newIndex));
    }
  }

  const handleAddDrill = (id: string) => {
    const drill = getDrillById(id);
    addDrill(id, drill?.duration ?? 10);
  };

  const sidebarContent = <DrillSidebar onAdd={handleAddDrill} addedIds={addedIds} allDrills={allAvailableDrills} />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session Builder</h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop drills to build your training session
          </p>
        </div>
        <div className="flex items-center gap-2">
          {session.drills.length > 0 && (
            <Link href="/timer">
              <Button className="gap-2">
                <Timer className="h-4 w-4" />
                Start Timer
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - desktop */}
        <div className="hidden lg:block">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Drills</CardTitle>
            </CardHeader>
            <CardContent>{sidebarContent}</CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                value={session.name}
                onChange={(e) => updateName(e.target.value)}
                className="text-lg font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0"
                style={{ width: `${Math.max(session.name.length, 10)}ch` }}
              />
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {totalDuration} min
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {/* Mobile sidebar trigger */}
              <Sheet>
                <SheetTrigger className="lg:hidden inline-flex items-center justify-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground">
                  <Plus className="h-4 w-4" />
                  Add Drill
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Available Drills</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">{sidebarContent}</div>
                </SheetContent>
              </Sheet>
              {session.drills.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={clearSession}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {session.drills.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-2">
              <p className="text-lg font-medium">No drills added yet</p>
              <p className="text-sm">
                Add drills from the sidebar to build your session
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={session.drills.map((d) => d.drillId)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {session.drills.map((sd, i) => (
                    <div key={sd.drillId} className="flex items-start gap-3">
                      <div className="flex flex-col items-center pt-4">
                        <span className="text-xs font-medium text-muted-foreground w-6 text-center">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <SortableDrillItem
                          sessionDrill={sd}
                          onRemove={() => removeDrill(sd.drillId)}
                          onDurationChange={(d) =>
                            updateDrillDuration(sd.drillId, d)
                          }
                          getDrillById={getDrillById}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>
    </div>
  );
}
