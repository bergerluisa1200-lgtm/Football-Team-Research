"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DrillDetail } from "@/components/drill-detail";
import { getDrillBySlug } from "@/lib/drills";
import { useCustomDrills } from "@/hooks/use-custom-drills";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function DrillPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { getCustomDrill, deleteDrill } = useCustomDrills();

  const seedDrill = getDrillBySlug(slug);
  const customDrill = getCustomDrill(slug);
  const drill = seedDrill || customDrill;
  const isCustom = !!customDrill;

  if (!drill) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <Link href="/drills">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Drills
          </Button>
        </Link>
        <div className="text-center py-16 space-y-2">
          <h1 className="text-2xl font-bold">Drill not found</h1>
          <p className="text-muted-foreground">
            This drill doesn&apos;t exist or may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  function handleDelete() {
    if (!customDrill) return;
    if (!window.confirm("Are you sure you want to delete this drill?")) return;
    deleteDrill(customDrill.id);
    router.push("/drills");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/drills">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Drills
          </Button>
        </Link>
        {isCustom && (
          <div className="flex items-center gap-2">
            <Link href={`/drills/${slug}/edit`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>
      <DrillDetail drill={drill} />
    </div>
  );
}
