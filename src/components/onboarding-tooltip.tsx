"use client";

import { useState, useEffect } from "react";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "pitchlab-onboarded";

export function OnboardingTooltip() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onboarded = localStorage.getItem(STORAGE_KEY);
    if (!onboarded) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    setShow(false);
  }

  return (
    <div className="relative mx-auto max-w-lg mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="glass rounded-xl p-4 border-2 border-primary/30 shadow-lg shadow-primary/10">
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="font-semibold text-sm">Welcome to PitchLab!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start by browsing our drill library — pick drills, build a session, and
          run it with the built-in timer.
        </p>
        <div className="flex gap-2 mt-3">
          <Link href="/drills" onClick={dismiss}>
            <Button size="sm" className="gap-1.5">
              Browse Drills
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" onClick={dismiss}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
