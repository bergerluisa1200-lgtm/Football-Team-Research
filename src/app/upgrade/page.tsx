"use client";

import { useState } from "react";
import { Check, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
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

export default function UpgradePage() {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);

  const isPro = userData?.plan === "pro";

  async function handleUpgrade() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to create checkout session:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleManageSubscription() {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Failed to create portal session:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900 px-4 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-200">
          <Crown className="h-4 w-4" />
          Upgrade to Pro
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Unlock Unlimited Training
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Create unlimited custom drills, save unlimited sessions, and take your
          coaching to the next level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div className="glass rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-xl font-bold">Free</h3>
            <p className="text-3xl font-bold mt-2">
              $0<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
          </div>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f.name} className="flex items-center gap-2 text-sm">
                {f.free ? (
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                )}
                <span className={cn(!f.free && "text-muted-foreground")}>
                  {f.name}
                  {typeof f.free === "string" && (
                    <span className="text-muted-foreground ml-1">({f.free})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {!isPro && (
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
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
              $9.99<span className="text-base font-normal text-muted-foreground">/month</span>
            </p>
          </div>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f.name} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 shrink-0" />
                <span>
                  {f.name}
                  {typeof f.pro === "string" && (
                    <span className="text-primary font-medium ml-1">({f.pro})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {isPro ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleManageSubscription}
              disabled={loading}
            >
              {loading ? "Loading..." : "Manage Subscription"}
            </Button>
          ) : (
            <Button
              className="w-full gap-2 shadow-lg shadow-primary/20"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? "Loading..." : "Upgrade to Pro"}
              <Zap className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
