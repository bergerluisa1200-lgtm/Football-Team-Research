"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DrillForm, DrillFormData } from "@/components/drill-form";
import { useCustomDrills } from "@/hooks/use-custom-drills";
import { useAuth } from "@/contexts/auth-context";
import { UpgradePrompt } from "@/components/upgrade-prompt";
import { PLAN_LIMITS } from "@/lib/plans";

export default function NewDrillPage() {
  const router = useRouter();
  const { addDrill } = useCustomDrills();
  const { userData } = useAuth();
  const [limitReached, setLimitReached] = useState(false);

  async function handleSubmit(data: DrillFormData) {
    const drill = await addDrill(data);
    if (!drill) {
      setLimitReached(true);
      return;
    }
    router.push(`/drills/${drill.slug}`);
  }

  if (limitReached) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Link href="/drills">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Drills
          </Button>
        </Link>
        <UpgradePrompt
          feature="custom drills"
          limit={PLAN_LIMITS[userData?.plan || "free"].maxCustomDrills}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Link href="/drills">
        <Button variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Drills
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Drill</h1>
        <p className="text-muted-foreground mt-1">
          Design your own drill with an interactive pitch diagram.
        </p>
      </div>

      <DrillForm
        onSubmit={handleSubmit}
        submitLabel="Create Drill"
        cancelHref="/drills"
      />
    </div>
  );
}
