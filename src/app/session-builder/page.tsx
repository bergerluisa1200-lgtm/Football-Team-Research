"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
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
  Coffee,
  Share2,
  Copy,
  Printer,
  Dumbbell,
  Target,
  Flame,
  ArrowRightLeft,
  Zap,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "@/hooks/use-session";
import { useAllDrills } from "@/hooks/use-all-drills";
import { CATEGORY_META, DIFFICULTY_META } from "@/lib/constants";
import { SESSION_TEMPLATES, SessionTemplate } from "@/data/session-templates";
import { Drill, SessionDrill } from "@/types/drill";
import { cn } from "@/lib/utils";
import { SessionPrintSheet } from "@/components/session-print-sheet";

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  warmup: <Flame className="h-5 w-5" />,
  shooting: <Target className="h-5 w-5" />,
  full: <Dumbbell className="h-5 w-5" />,
  fitness: <Zap className="h-5 w-5" />,
  passing: <ArrowRightLeft className="h-5 w-5" />,
};

function SortableDrillItem({
  sessionDrill,
  index,
  isLast,
  onRemove,
  onDurationChange,
  onRestChange,
  getDrillById,
}: {
  sessionDrill: SessionDrill;
  index: number;
  isLast: boolean;
  onRemove: () => void;
  onDurationChange: (duration: number) => void;
  onRestChange: (rest: number) => void;
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
  const restMinutes = Math.floor((sessionDrill.restAfter || 0) / 60);
  const restSeconds = (sessionDrill.restAfter || 0) % 60;

  return (
    <div>
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
      {/* Rest period between drills */}
      {!isLast && (
        <div className="flex items-center gap-2 py-1.5 px-4 ml-8">
          <Coffee className="h-3 w-3 text-muted-foreground shrink-0" />
          <Slider
            value={[sessionDrill.restAfter || 0]}
            onValueChange={(val) => onRestChange(Array.isArray(val) ? val[0] : val)}
            min={0}
            max={300}
            step={15}
            className="flex-1 max-w-[200px]"
          />
          <span className="text-xs text-muted-foreground w-16 shrink-0">
            {(sessionDrill.restAfter || 0) === 0
              ? "No rest"
              : `${restMinutes > 0 ? `${restMinutes}m ` : ""}${restSeconds > 0 ? `${restSeconds}s` : ""} rest`}
          </span>
        </div>
      )}
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

function SessionBuilderContent() {
  const {
    session,
    addDrill,
    removeDrill,
    reorderDrills,
    updateDrillDuration,
    updateRestPeriod,
    setDefaultRest,
    updateName,
    clearSession,
    loadTemplate,
    totalDuration,
    totalRestSeconds,
  } = useSession();

  const { allDrills: allAvailableDrills, getDrillById } = useAllDrills();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const sharedParam = searchParams.get("shared");

  // Load a shared session when ?shared={id} is in the URL.
  useEffect(() => {
    if (!sharedParam) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "sharedSessions", sharedParam));
        if (!cancelled && snap.exists()) {
          const data = snap.data() as { name: string; drills: SessionDrill[] };
          loadTemplate({ name: data.name, drills: data.drills });
        }
      } catch (err) {
        console.error("Failed to load shared session:", err);
      } finally {
        if (!cancelled) {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("shared");
          router.replace(`/session-builder${params.toString() ? `?${params}` : ""}`);
        }
      }
    })();
    return () => { cancelled = true; };
    // We only want this to run when the param first appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharedParam]);

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

  function handleLoadTemplate(template: SessionTemplate) {
    loadTemplate({ name: template.name, drills: template.drills });
    setTemplateDialogOpen(false);
  }

  async function handleCopyLink() {
    if (sharing) return;
    setSharing(true);
    try {
      const shareId = `share-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await setDoc(doc(db, "sharedSessions", shareId), {
        name: session.name,
        drills: session.drills,
        ownerUid: user?.uid ?? null,
        createdAt: new Date().toISOString(),
      });
      const url = `${window.location.origin}/session-builder?shared=${shareId}`;
      await navigator.clipboard.writeText(url);
      setShareUrl(url);
    } catch (err) {
      console.error("Failed to share session:", err);
      alert("Failed to create share link. Please try again.");
    } finally {
      setSharing(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const sidebarContent = <DrillSidebar onAdd={handleAddDrill} addedIds={addedIds} allDrills={allAvailableDrills} />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <SessionPrintSheet session={session} getDrillById={getDrillById} />
      <div className="print-hide flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Session Builder</h1>
          <p className="text-muted-foreground mt-1">
            Drag and drop drills to build your training session
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Templates */}
          <Button variant="outline" className="gap-2" onClick={() => setTemplateDialogOpen(true)}>
            <Dumbbell className="h-4 w-4" />
            <span className="hidden sm:inline">Templates</span>
          </Button>
          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Session Templates</DialogTitle>
                <DialogDescription>
                  Load a pre-built session. This will replace your current session.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto">
                {SESSION_TEMPLATES.map((t) => {
                  const drillDuration = t.drills.reduce((s, d) => s + d.duration, 0);
                  const restDuration = t.drills.reduce((s, d) => s + (d.restAfter || 0), 0);
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleLoadTemplate(t)}
                      className="w-full text-left rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-lg p-2 bg-primary/10 text-primary">
                          {TEMPLATE_ICONS[t.icon]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{t.name}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {t.description}
                          </p>
                          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                            <span>{t.drills.length} drills</span>
                            <span>{drillDuration} min</span>
                            {restDuration > 0 && (
                              <span>+{Math.ceil(restDuration / 60)} min rest</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          {session.drills.length > 0 && (
            <>
              {/* Share */}
              <Button variant="outline" size="icon" onClick={() => setShareDialogOpen(true)}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Dialog
                open={shareDialogOpen}
                onOpenChange={(open) => {
                  setShareDialogOpen(open);
                  if (!open) setShareUrl(null);
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Session</DialogTitle>
                    <DialogDescription>
                      Share your session via link or export as PDF.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-2">
                    <Button
                      className="w-full gap-2"
                      onClick={handleCopyLink}
                      disabled={sharing}
                    >
                      <Copy className="h-4 w-4" />
                      {sharing ? "Creating link…" : "Copy Share Link"}
                    </Button>
                    {shareUrl && (
                      <div className="rounded-md bg-muted p-2 text-xs break-all">
                        Copied to clipboard:{" "}
                        <span className="font-mono">{shareUrl}</span>
                      </div>
                    )}
                    <Button variant="outline" className="w-full gap-2" onClick={handlePrint}>
                      <Printer className="h-4 w-4" />
                      Export as PDF (Print)
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Link href="/timer">
                <Button className="gap-2">
                  <Timer className="h-4 w-4" />
                  Start Timer
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="print-hide grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                {totalRestSeconds > 0 && (
                  <span className="text-muted-foreground">
                    +{Math.ceil(totalRestSeconds / 60)}m rest
                  </span>
                )}
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
                <>
                  <select
                    className="text-xs border rounded px-2 py-1 bg-background"
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setDefaultRest(parseInt(e.target.value));
                        e.target.value = "";
                      }
                    }}
                  >
                    <option value="" disabled>Set all rest...</option>
                    <option value="0">No rest</option>
                    <option value="30">30s rest</option>
                    <option value="60">1m rest</option>
                    <option value="90">1m 30s rest</option>
                    <option value="120">2m rest</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={clearSession}
                  >
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>

          <Separator />

          {session.drills.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground space-y-4">
              <p className="text-lg font-medium">No drills added yet</p>
              <p className="text-sm">
                Add drills from the sidebar or load a template to get started.
              </p>
              <Button variant="outline" className="gap-2" onClick={() => setTemplateDialogOpen(true)}>
                <Dumbbell className="h-4 w-4" />
                Browse Templates
              </Button>
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
                <div className="space-y-1">
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
                          index={i}
                          isLast={i === session.drills.length - 1}
                          onRemove={() => removeDrill(sd.drillId)}
                          onDurationChange={(d) =>
                            updateDrillDuration(sd.drillId, d)
                          }
                          onRestChange={(r) =>
                            updateRestPeriod(sd.drillId, r)
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

export default function SessionBuilderPage() {
  return (
    <Suspense>
      <SessionBuilderContent />
    </Suspense>
  );
}
