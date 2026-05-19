"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  BarChart3,
  Clock,
  Flame,
  ListChecks,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTrainingLog } from "@/hooks/use-training-log";
import { useMasteredDrills } from "@/hooks/use-mastered-drills";
import { ALL_CATEGORIES, CATEGORY_META } from "@/lib/constants";
import { computeStreak } from "@/lib/streak";
import { Category } from "@/types/drill";

function lastNDays(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}

export default function StatsPage() {
  const { entries } = useTrainingLog();
  const { mastered } = useMasteredDrills();

  const stats = useMemo(() => {
    const totalMinutes = entries.reduce((s, e) => s + e.duration, 0);
    const totalSessions = entries.length;
    const streak = computeStreak(entries);

    // Last 30 days sessions
    const last30 = lastNDays(30);
    const last30Set = new Set(last30);
    const last30Entries = entries.filter((e) => last30Set.has(e.date));
    const last30Minutes = last30Entries.reduce((s, e) => s + e.duration, 0);
    const last30Sessions = last30Entries.length;

    // Category mix (across all entries)
    const catCounts: Record<Category, number> = {
      passing: 0,
      shooting: 0,
      dribbling: 0,
      defending: 0,
      fitness: 0,
    };
    for (const e of entries) {
      for (const c of e.categories) catCounts[c] += 1;
    }
    const catTotal = Object.values(catCounts).reduce((s, n) => s + n, 0);

    // Last 7 days bar
    const last7 = lastNDays(7);
    const minutesByDay = last7.map((day) => {
      const dayEntries = entries.filter((e) => e.date === day);
      return {
        day,
        label: new Date(day + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "short",
        }),
        minutes: dayEntries.reduce((s, e) => s + e.duration, 0),
      };
    });
    const maxDayMinutes = Math.max(1, ...minutesByDay.map((d) => d.minutes));

    return {
      totalMinutes,
      totalSessions,
      streak,
      last30Minutes,
      last30Sessions,
      catCounts,
      catTotal,
      minutesByDay,
      maxDayMinutes,
    };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center space-y-4">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="text-2xl font-bold">No stats yet</h1>
        <p className="text-muted-foreground">
          Log a training session to start tracking your progress.
        </p>
        <Link href="/training-log">
          <Button>Go to Training Log</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Stats</h1>
        <p className="text-muted-foreground mt-1">
          Your training at a glance.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="h-5 w-5 text-primary" />}
          label="Total minutes"
          value={stats.totalMinutes.toLocaleString()}
          sub={`${(stats.totalMinutes / 60).toFixed(1)} hours`}
        />
        <StatCard
          icon={<ListChecks className="h-5 w-5 text-primary" />}
          label="Sessions logged"
          value={stats.totalSessions.toString()}
          sub={`${stats.last30Sessions} in last 30 days`}
        />
        <StatCard
          icon={<Flame className="h-5 w-5 text-orange-500" />}
          label="Current streak"
          value={`${stats.streak}d`}
          sub={stats.streak > 0 ? "Keep it going" : "Log today to start"}
        />
        <StatCard
          icon={<Trophy className="h-5 w-5 text-amber-500" />}
          label="Mastered drills"
          value={mastered.length.toString()}
          sub="across all categories"
        />
      </div>

      {/* Last 7 days bar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Last 7 days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-2 h-40">
            {stats.minutesByDay.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-muted-foreground tabular-nums">
                  {d.minutes || ""}
                </div>
                <div
                  className="w-full rounded-t bg-primary/80 transition-all"
                  style={{
                    height: `${(d.minutes / stats.maxDayMinutes) * 100}%`,
                    minHeight: d.minutes > 0 ? "4px" : "0",
                  }}
                />
                <div className="text-xs text-muted-foreground">{d.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category mix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category mix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ALL_CATEGORIES.map((cat) => {
            const count = stats.catCounts[cat as Category];
            const pct = stats.catTotal > 0 ? (count / stats.catTotal) * 100 : 0;
            const meta = CATEGORY_META[cat as Category];
            return (
              <div key={cat} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{meta.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {count} ({pct.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: meta.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="glass rounded-xl p-4 space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
