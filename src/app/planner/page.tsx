"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Dumbbell,
  Repeat,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { usePlanner, PlannedSession } from "@/hooks/use-planner";
import { useAllDrills } from "@/hooks/use-all-drills";
import { SESSION_TEMPLATES } from "@/data/session-templates";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PlannerPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getMonday(new Date()));
  const {
    getSessionsForWeek,
    addSession,
    removeSession,
    setRecurringWeek,
    clearRecurringWeek,
    getRecurringWeek,
    applyRecurringToWeek,
  } = usePlanner();
  const { getDrillById } = useAllDrills();
  const [addDialogDate, setAddDialogDate] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  // Check if recurring is active on mount
  useEffect(() => {
    setIsRecurring(!!getRecurringWeek());
  }, [getRecurringWeek]);

  // Auto-apply recurring sessions when navigating to a new week
  useEffect(() => {
    if (isRecurring) {
      applyRecurringToWeek(currentWeekStart);
    }
  }, [currentWeekStart, isRecurring, applyRecurringToWeek]);

  const weekData = useMemo(
    () => getSessionsForWeek(currentWeekStart),
    [getSessionsForWeek, currentWeekStart]
  );

  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentWeekStart]);

  const today = formatDate(new Date());

  function handlePrevWeek() {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  function handleNextWeek() {
    setCurrentWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }

  function handleToday() {
    setCurrentWeekStart(getMonday(new Date()));
  }

  function handleAddTemplate(templateId: string) {
    if (!addDialogDate) return;
    const template = SESSION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const session: PlannedSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: template.name,
      drillIds: template.drills.map((d) => d.drillId),
      totalDuration: template.drills.reduce((s, d) => s + d.duration, 0),
    };
    addSession(addDialogDate, session);
    setAddDialogDate(null);
  }

  function handleAddCustom() {
    if (!addDialogDate || !customName.trim()) return;
    const session: PlannedSession = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: customName.trim(),
      drillIds: [],
      totalDuration: 0,
    };
    addSession(addDialogDate, session);
    setCustomName("");
    setAddDialogDate(null);
  }

  const weekLabel = `${formatDateShort(weekDates[0])} — ${formatDateShort(weekDates[6])}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Planner</h1>
          <p className="text-muted-foreground mt-1">
            Plan your training sessions across the week
          </p>
        </div>
      </div>

      {/* Week navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={handleToday}>
            Today
          </Button>
          <span className="font-medium text-sm">{weekLabel}</span>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Repeat Every Week */}
        {isRecurring ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 border-primary/50 text-primary"
            onClick={() => {
              clearRecurringWeek();
              setIsRecurring(false);
            }}
          >
            <Repeat className="h-3.5 w-3.5" />
            Repeating Weekly
            <X className="h-3.5 w-3.5 ml-1 text-muted-foreground hover:text-destructive" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              const hasAnySessions = Object.values(weekData).some((s) => s.length > 0);
              if (!hasAnySessions) {
                alert("Add sessions to this week first, then repeat.");
                return;
              }
              setRecurringWeek(currentWeekStart);
              setIsRecurring(true);
            }}
          >
            <Repeat className="h-3.5 w-3.5" />
            Repeat Every Week
          </Button>
        )}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {weekDates.map((date, i) => {
          const dateStr = formatDate(date);
          const sessions = weekData[dateStr] || [];
          const isToday = dateStr === today;
          const totalMin = sessions.reduce((s, sess) => s + sess.totalDuration, 0);

          return (
            <div
              key={dateStr}
              className={cn(
                "glass rounded-xl p-3 min-h-[160px] flex flex-col",
                isToday && "ring-2 ring-primary"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className={cn(
                    "text-xs font-medium",
                    isToday ? "text-primary" : "text-muted-foreground"
                  )}>
                    {DAY_NAMES[i]}
                  </span>
                  <p className={cn(
                    "text-lg font-bold",
                    isToday && "text-primary"
                  )}>
                    {date.getDate()}
                  </p>
                </div>
                {totalMin > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {totalMin}m
                  </Badge>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="group flex items-start justify-between gap-1 rounded-md bg-primary/10 px-2 py-1.5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-medium truncate">{sess.name}</p>
                        {sess.recurring && (
                          <Repeat className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      {sess.totalDuration > 0 && (
                        <p className="text-[10px] text-muted-foreground">
                          {sess.drillIds.length} drills &middot; {sess.totalDuration}m
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeSession(dateStr, sess.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setAddDialogDate(dateStr)}
                className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add session
              </button>
            </div>
          );
        })}
      </div>

      {/* Add session dialog */}
      <Dialog open={!!addDialogDate} onOpenChange={(open) => !open && setAddDialogDate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Session</DialogTitle>
            <DialogDescription>
              Plan a session for{" "}
              {addDialogDate && new Date(addDialogDate + "T12:00:00").toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <p className="text-sm font-medium mb-2">From Templates</p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {SESSION_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleAddTemplate(t.id)}
                    className="w-full text-left rounded-md border p-2.5 hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.drills.length} drills &middot;{" "}
                        {t.drills.reduce((s, d) => s + d.duration, 0)} min
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Custom Session</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Session name..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                />
                <Button onClick={handleAddCustom} disabled={!customName.trim()}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
