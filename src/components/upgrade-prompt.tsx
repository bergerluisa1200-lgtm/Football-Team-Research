"use client";

import Link from "next/link";
import { Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  feature: string;
  limit: number;
}

export function UpgradePrompt({ feature, limit }: Props) {
  return (
    <div className="glass rounded-xl p-6 text-center space-y-4">
      <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 mx-auto">
        <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
      </div>
      <div className="space-y-1">
        <h3 className="text-lg font-bold">Free Plan Limit Reached</h3>
        <p className="text-sm text-muted-foreground">
          You&apos;ve used all {limit} {feature} available on the free plan.
          Upgrade to Pro for unlimited access.
        </p>
      </div>
      <Link href="/upgrade">
        <Button className="gap-2 shadow-lg shadow-primary/20">
          Upgrade to Pro
          <Zap className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
