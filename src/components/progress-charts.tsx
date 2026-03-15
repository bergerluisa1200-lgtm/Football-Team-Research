"use client";

import { useMemo } from "react";
import { TrainingLogEntry, Category, Mood } from "@/types/drill";
import { CATEGORY_META } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeekData {
  label: string;
  avgRating: number;
  totalMinutes: number;
  entryCount: number;
  moodScore: number;
}

const MOOD_SCORES: Record<Mood, number> = {
  great: 5,
  good: 4,
  okay: 3,
  tired: 2,
  rough: 1,
};

const MOOD_LABELS: Record<number, string> = {
  1: "Rough",
  2: "Tired",
  3: "Okay",
  4: "Good",
  5: "Great",
};

function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  return `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

function groupByWeek(entries: TrainingLogEntry[]): WeekData[] {
  const weekMap = new Map<string, { entries: TrainingLogEntry[]; label: string }>();

  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const entry of sorted) {
    const key = getWeekKey(entry.date);
    if (!weekMap.has(key)) {
      weekMap.set(key, { entries: [], label: getWeekLabel(entry.date) });
    }
    weekMap.get(key)!.entries.push(entry);
  }

  return Array.from(weekMap.values()).map(({ entries: weekEntries, label }) => ({
    label,
    avgRating: weekEntries.reduce((s, e) => s + e.rating, 0) / weekEntries.length,
    totalMinutes: weekEntries.reduce((s, e) => s + e.duration, 0),
    entryCount: weekEntries.length,
    moodScore:
      weekEntries.reduce((s, e) => s + MOOD_SCORES[e.mood], 0) / weekEntries.length,
  }));
}

function SVGLineChart({
  data,
  yKey,
  yMax,
  yMin = 0,
  color,
  yLabels,
  unit = "",
}: {
  data: WeekData[];
  yKey: keyof WeekData;
  yMax: number;
  yMin?: number;
  color: string;
  yLabels?: Record<number, string>;
  unit?: string;
}) {
  if (data.length === 0) return null;

  const W = 600;
  const H = 200;
  const PAD_L = 40;
  const PAD_R = 16;
  const PAD_T = 16;
  const PAD_B = 32;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const range = yMax - yMin || 1;

  const points = data.map((d, i) => {
    const x = PAD_L + (data.length === 1 ? chartW / 2 : (i / (data.length - 1)) * chartW);
    const y = PAD_T + chartH - ((Number(d[yKey]) - yMin) / range) * chartH;
    return { x, y, value: Number(d[yKey]), label: d.label };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD_T + chartH} L${points[0].x},${PAD_T + chartH} Z`;

  const yTicks = 5;
  const yTickValues = Array.from({ length: yTicks }, (_, i) => yMin + (range / (yTicks - 1)) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid lines */}
      {yTickValues.map((v) => {
        const y = PAD_T + chartH - ((v - yMin) / range) * chartH;
        return (
          <g key={v}>
            <line
              x1={PAD_L}
              y1={y}
              x2={W - PAD_R}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
            <text
              x={PAD_L - 6}
              y={y + 4}
              textAnchor="end"
              className="fill-muted-foreground"
              fontSize={10}
            >
              {yLabels ? yLabels[Math.round(v)] ?? Math.round(v) : Math.round(v)}{unit}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaPath} fill={color} opacity={0.1} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill={color} stroke="white" strokeWidth={2} />
          {/* X-axis label */}
          <text
            x={p.x}
            y={H - 6}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={9}
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function CategoryBreakdown({ entries }: { entries: TrainingLogEntry[] }) {
  const counts = useMemo(() => {
    const map = new Map<Category, number>();
    for (const entry of entries) {
      for (const cat of entry.categories) {
        map.set(cat, (map.get(cat) || 0) + 1);
      }
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1]);
  }, [entries]);

  if (counts.length === 0) return null;
  const max = counts[0][1];

  return (
    <div className="space-y-3">
      {counts.map(([cat, count]) => (
        <div key={cat} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{CATEGORY_META[cat].label}</span>
            <span className="text-muted-foreground">{count} session{count !== 1 ? "s" : ""}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(count / max) * 100}%`,
                backgroundColor: CATEGORY_META[cat].color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProgressCharts({ entries }: { entries: TrainingLogEntry[] }) {
  const weeklyData = useMemo(() => groupByWeek(entries), [entries]);

  if (entries.length === 0) {
    return null;
  }

  const maxMinutes = Math.max(...weeklyData.map((w) => w.totalMinutes), 60);
  const totalSessions = entries.length;
  const totalMinutes = entries.reduce((s, e) => s + e.duration, 0);
  const avgRating = entries.reduce((s, e) => s + e.rating, 0) / entries.length;

  return (
    <div className="space-y-6">
      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Sessions", value: totalSessions },
          { label: "Total Minutes", value: totalMinutes },
          { label: "Avg Rating", value: avgRating.toFixed(1) + "/10" },
          { label: "This Week", value: weeklyData.length > 0 ? weeklyData[weeklyData.length - 1].entryCount + " sessions" : "0" },
        ].map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent className="pt-1">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rating chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <SVGLineChart
            data={weeklyData}
            yKey="avgRating"
            yMax={10}
            yMin={0}
            color="#2563eb"
          />
        </CardContent>
      </Card>

      {/* Mood chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Mood</CardTitle>
        </CardHeader>
        <CardContent>
          <SVGLineChart
            data={weeklyData}
            yKey="moodScore"
            yMax={5}
            yMin={1}
            color="#10b981"
            yLabels={MOOD_LABELS}
          />
        </CardContent>
      </Card>

      {/* Training volume chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Training Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <SVGLineChart
            data={weeklyData}
            yKey="totalMinutes"
            yMax={Math.ceil(maxMinutes / 30) * 30}
            color="#f59e0b"
            unit="m"
          />
        </CardContent>
      </Card>

      {/* Category breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBreakdown entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
