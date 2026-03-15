"use client";

import { useState, useRef } from "react";
import {
  CircleUser,
  Circle,
  Triangle,
  ArrowRight,
  Route,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PitchElement } from "@/types/drill";
import { PitchSvg } from "./pitch-svg";
import { PitchElementComponent } from "./pitch-element";
import { cn } from "@/lib/utils";

type PlacementMode =
  | "player"
  | "ball"
  | "cone"
  | "arrow"
  | "run-path"
  | null;

const TOOL_BUTTONS: {
  mode: PlacementMode;
  icon: React.ReactNode;
  label: string;
}[] = [
  { mode: "player", icon: <CircleUser className="h-4 w-4" />, label: "Player" },
  { mode: "ball", icon: <Circle className="h-4 w-4" />, label: "Ball" },
  { mode: "cone", icon: <Triangle className="h-4 w-4" />, label: "Cone" },
  { mode: "arrow", icon: <ArrowRight className="h-4 w-4" />, label: "Arrow" },
  { mode: "run-path", icon: <Route className="h-4 w-4" />, label: "Run Path" },
];

const COLORS = ["#2563eb", "#dc2626", "#f59e0b", "#10b981", "#7c3aed", "#ffffff"];

interface Props {
  elements: PitchElement[];
  onChange: (elements: PitchElement[]) => void;
}

export function PitchEditor({ elements, onChange }: Props) {
  const [mode, setMode] = useState<PlacementMode>(null);
  const [selectedColor, setSelectedColor] = useState("#2563eb");
  const [label, setLabel] = useState("");
  const [dashed, setDashed] = useState(false);
  const [pendingStart, setPendingStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function getSvgCoords(e: React.MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return {
      x: Math.round(Math.max(0, Math.min(100, x))),
      y: Math.round(Math.max(0, Math.min(100, y))),
    };
  }

  function handleSvgClick(e: React.MouseEvent<SVGSVGElement>) {
    if (!mode) {
      setSelectedIndex(null);
      return;
    }

    const { x, y } = getSvgCoords(e);

    if (mode === "arrow" || mode === "run-path") {
      if (!pendingStart) {
        setPendingStart({ x, y });
        return;
      }
      const newEl: PitchElement = {
        type: mode,
        x: pendingStart.x,
        y: pendingStart.y,
        toX: x,
        toY: y,
        color: selectedColor,
        dashed: mode === "run-path" ? true : dashed,
      };
      onChange([...elements, newEl]);
      setPendingStart(null);
      return;
    }

    const newEl: PitchElement = {
      type: mode,
      x,
      y,
      color: selectedColor,
      ...(label && { label }),
    };
    onChange([...elements, newEl]);
  }

  function removeElement(index: number) {
    onChange(elements.filter((_, i) => i !== index));
    setSelectedIndex(null);
  }

  function removeAll() {
    onChange([]);
    setSelectedIndex(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Pitch Diagram</span>
        {elements.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-destructive"
            onClick={removeAll}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Tool bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        {TOOL_BUTTONS.map((tool) => (
          <Button
            key={tool.mode}
            variant={mode === tool.mode ? "default" : "outline"}
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => {
              setMode(mode === tool.mode ? null : tool.mode);
              setPendingStart(null);
              setSelectedIndex(null);
            }}
          >
            {tool.icon}
            {tool.label}
          </Button>
        ))}
      </div>

      {/* Options row */}
      {mode && (
        <div className="flex flex-wrap items-center gap-3 rounded-md border p-2.5 bg-muted/30">
          {(mode === "player" || mode === "cone") && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Label:</span>
              <Input
                className="h-7 w-16 text-xs"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="A"
                maxLength={4}
              />
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Color:</span>
            <div className="flex gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  className={cn(
                    "h-5 w-5 rounded-full border-2 transition-transform",
                    selectedColor === c
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
          </div>
          {mode === "arrow" && (
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={dashed}
                onChange={(e) => setDashed(e.target.checked)}
                className="rounded"
              />
              Dashed
            </label>
          )}
          {(mode === "arrow" || mode === "run-path") && pendingStart && (
            <Badge variant="secondary" className="text-xs">
              Click endpoint to finish
            </Badge>
          )}
          {(mode === "arrow" || mode === "run-path") && !pendingStart && (
            <span className="text-xs text-muted-foreground">
              Click start point, then end point
            </span>
          )}
        </div>
      )}

      {/* SVG canvas */}
      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        className={cn(
          "w-full rounded-lg shadow-lg border border-border overflow-hidden",
          mode ? "cursor-crosshair" : "cursor-default"
        )}
        style={{ aspectRatio: "1 / 1" }}
        onClick={handleSvgClick}
      >
        <PitchSvg />
        {elements.map((el, i) => (
          <g
            key={i}
            onClick={(e) => {
              if (!mode) {
                e.stopPropagation();
                setSelectedIndex(selectedIndex === i ? null : i);
              }
            }}
            className={!mode ? "cursor-pointer" : undefined}
          >
            <PitchElementComponent element={el} />
            {selectedIndex === i && (
              <circle
                cx={el.x}
                cy={el.y}
                r="4.5"
                fill="none"
                stroke="#fff"
                strokeWidth="0.5"
                strokeDasharray="1.5 1"
                opacity={0.8}
              />
            )}
          </g>
        ))}
        {/* Pending start point indicator */}
        {pendingStart && (
          <circle
            cx={pendingStart.x}
            cy={pendingStart.y}
            r="1.5"
            fill={selectedColor}
            opacity={0.6}
          />
        )}
      </svg>

      {/* Selected element actions */}
      {selectedIndex !== null && (
        <div className="flex items-center justify-between rounded-md border p-2 bg-muted/30">
          <span className="text-xs text-muted-foreground">
            Selected: {elements[selectedIndex].type}
            {elements[selectedIndex].label
              ? ` "${elements[selectedIndex].label}"`
              : ""}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-destructive hover:text-destructive"
            onClick={() => removeElement(selectedIndex)}
          >
            <Trash2 className="h-3 w-3" />
            Remove
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {mode
          ? "Click on the pitch to place elements."
          : "Select a tool above, then click on the pitch to add elements. Click existing elements to select them."}
      </p>
    </div>
  );
}
