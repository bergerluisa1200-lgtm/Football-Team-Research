"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { User, Mail, Crown, Calendar, Save, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { useTrainingLog } from "@/hooks/use-training-log";
import { computeStreak } from "@/lib/streak";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function ProfilePage() {
  const { user, userData, loading } = useAuth();
  const { entries } = useTrainingLog();
  const streak = computeStreak(entries);
  const router = useRouter();
  const [name, setName] = useState("");
  const [nameInit, setNameInit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Initialize name from user once loaded
  if (user && !nameInit) {
    setName(user.displayName || "");
    setNameInit(true);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: name.trim() });
      await updateDoc(doc(db, "users", user.uid), {
        displayName: name.trim(),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  }

  const createdAt = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  const isPro = userData?.plan === "pro";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Profile Info */}
      <div className="glass rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
            <User className="h-8 w-8" />
          </div>
          <div>
            <p className="text-lg font-bold">{user.displayName || "User"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              Display Name
            </label>
            <div className="flex gap-2">
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Button
                onClick={handleSave}
                disabled={saving || name.trim() === (user.displayName || "")}
                className="gap-1.5 shrink-0"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : saved ? "Saved!" : "Save"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email
            </label>
            <Input value={user.email || ""} disabled />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed
            </p>
          </div>
        </div>
      </div>

      {/* Plan */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          Subscription
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              className={
                isPro
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
                  : ""
              }
              variant={isPro ? "default" : "secondary"}
            >
              {isPro ? "Pro" : "Free"} Plan
            </Badge>
            <span className="text-sm text-muted-foreground">
              {isPro
                ? "Unlimited drills & sessions"
                : "3 custom drills & 3 sessions"}
            </span>
          </div>
          <Link href="/upgrade">
            <Button variant="outline" size="sm" className="gap-1.5">
              {isPro ? "Manage" : "Upgrade"}
              <Zap className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Streak */}
      <div className="glass rounded-xl p-6 space-y-2">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Streak
        </h2>
        {streak > 0 ? (
          <p className="text-sm text-muted-foreground">
            <span className="text-2xl font-bold text-foreground tabular-nums">{streak}</span>{" "}
            day{streak === 1 ? "" : "s"} in a row — keep it going.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Log a session today to start a streak.
          </p>
        )}
      </div>

      {/* Account Info */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Account</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          Member since {createdAt}
        </div>
      </div>
    </div>
  );
}
