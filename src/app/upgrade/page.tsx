"use client";

import { useState, useEffect } from "react";
import { Crown, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { PricingPlans } from "@/components/pricing-plans";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface SubscriptionInfo {
  plan: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  subscriptionStatus?: string;
  cancelAtPeriodEnd?: boolean;
  currentPeriodEnd?: string;
}

export default function UpgradePage() {
  const { user, userData, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);

  // Listen to user doc for real-time subscription updates
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) {
        setSubInfo(snap.data() as SubscriptionInfo);
      }
    });
    return unsubscribe;
  }, [user]);

  // Refresh user data when returning from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      refreshUserData();
    }
  }, [refreshUserData]);

  const isPro = subInfo?.plan === "pro" || userData?.plan === "pro";
  const isCanceled = subInfo?.cancelAtPeriodEnd === true;

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
          {isPro ? "Your Subscription" : "Upgrade to Pro"}
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          {isPro ? "Manage Your Plan" : "Unlock Unlimited Training"}
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          {isPro
            ? "You're on the Pro plan. Manage your subscription below."
            : "Create unlimited custom drills, save unlimited sessions, and take your coaching to the next level."}
        </p>
      </div>

      {/* Subscription Status Banner */}
      {user && (
        <div className="space-y-3">
          {/* Success banner after checkout */}
          {typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("success") ===
              "true" && (
              <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Payment successful!
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Your Pro plan is now active. It may take a moment to update.
                  </p>
                </div>
              </div>
            )}

          {/* Canceled banner */}
          {typeof window !== "undefined" &&
            new URLSearchParams(window.location.search).get("canceled") ===
              "true" && (
              <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 p-4">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Checkout was canceled. You can try again anytime.
                </p>
              </div>
            )}

          {/* Current subscription status */}
          <div className="glass rounded-xl p-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Current Plan:</span>
                <Badge
                  className={
                    isPro
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                      : ""
                  }
                  variant={isPro ? "default" : "secondary"}
                >
                  {isPro ? "Pro" : "Free"}
                </Badge>

                {isPro && isCanceled && (
                  <Badge
                    variant="outline"
                    className="border-red-300 text-red-600 dark:border-red-700 dark:text-red-400 gap-1"
                  >
                    <XCircle className="h-3 w-3" />
                    Cancels at period end
                  </Badge>
                )}

                {isPro && !isCanceled && (
                  <Badge
                    variant="outline"
                    className="border-green-300 text-green-600 dark:border-green-700 dark:text-green-400 gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>

              <div className="text-xs text-muted-foreground">
                {!isPro && "3 custom drills & 3 sessions included"}
                {isPro && !isCanceled && "Unlimited drills & sessions"}
                {isPro &&
                  isCanceled &&
                  subInfo?.currentPeriodEnd &&
                  `Access until ${new Date(subInfo.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
              </div>
            </div>

            {isPro && isCanceled && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950 p-3">
                <Clock className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Subscription canceled
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-xs mt-0.5">
                    Your Pro features will remain active until the end of your
                    current billing period. After that, you&apos;ll be
                    downgraded to the Free plan (3 custom drills, 3 sessions).
                    You can resubscribe anytime.
                  </p>
                </div>
              </div>
            )}

            {!isPro && (
              <p className="mt-3 text-xs text-muted-foreground">
                On the free plan, you can create up to 3 custom drills and save
                up to 3 sessions. All other features including the drill
                library, timer, planner, and training log are fully available.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <PricingPlans
        currentPlan={isPro ? "pro" : userData ? "free" : null}
        onUpgrade={handleUpgrade}
        onManage={handleManageSubscription}
        loading={loading}
      />
    </div>
  );
}
