"use client";

import Link from "next/link";
import { Check, Crown, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FEATURES = [
  { name: "Browse all drills", free: true, pro: true },
  { name: "Interactive pitch diagrams", free: true, pro: true },
  { name: "Session timer", free: true, pro: true },
  { name: "Custom drills", free: "Up to 3", pro: "Unlimited" },
  { name: "Saved sessions", free: "Up to 3", pro: "Unlimited" },
  { name: "Weekly planner", free: true, pro: true },
  { name: "Training log", free: true, pro: true },
  { name: "Drill notes & history", free: true, pro: true },
  { name: "Priority support", free: false, pro: true },
];

interface PricingPlansProps {
  currentPlan?: "free" | "pro" | null;
  onUpgrade?: () => void;
  onManage?: () => void;
  loading?: boolean;
  showCta?: boolean;
}

export function PricingPlans({
  currentPlan,
  onUpgrade,
  onManage,
  loading,
  showCta = true,
}: PricingPlansProps) {
  const isPro = currentPlan === "pro";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Free Plan */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold">Free</h3>
          <p className="text-3xl font-bold mt-2">
            $0
            <span className="text-base font-normal text-muted-foreground">
              /month
            </span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Get started with the basics
          </p>
        </div>
        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <li key={f.name} className="flex items-center gap-2 text-sm">
              {f.free ? (
                <Check className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
              )}
              <span className={cn(!f.free && "text-muted-foreground")}>
                {f.name}
                {typeof f.free === "string" && (
                  <span className="text-amber-600 dark:text-amber-400 font-medium ml-1">
                    ({f.free})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        {showCta && (
          <>
            {!isPro && currentPlan === "free" ? (
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            ) : !currentPlan ? (
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            ) : null}
          </>
        )}
      </div>

      {/* Pro Plan */}
      <div className="glass rounded-xl p-6 space-y-6 ring-2 ring-primary">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">Pro</h3>
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-bold mt-2">
            $9.99
            <span className="text-base font-normal text-muted-foreground">
              /month
            </span>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Unlimited everything for serious coaches
          </p>
        </div>
        <ul className="space-y-3">
          {FEATURES.map((f) => (
            <li key={f.name} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 shrink-0" />
              <span>
                {f.name}
                {typeof f.pro === "string" && (
                  <span className="text-primary font-medium ml-1">
                    ({f.pro})
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
        {showCta && (
          <>
            {isPro ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={onManage}
                disabled={loading}
              >
                {loading ? "Loading..." : "Manage Subscription"}
              </Button>
            ) : currentPlan === "free" ? (
              <Button
                className="w-full gap-2 shadow-lg shadow-primary/20"
                onClick={onUpgrade}
                disabled={loading}
              >
                {loading ? "Loading..." : "Upgrade to Pro"}
                <Zap className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/signup">
                <Button className="w-full gap-2 shadow-lg shadow-primary/20">
                  Start Free, Upgrade Anytime
                  <Zap className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
