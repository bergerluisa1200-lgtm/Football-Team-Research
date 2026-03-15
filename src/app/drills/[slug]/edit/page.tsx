"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DrillForm, DrillFormData } from "@/components/drill-form";
import { useCustomDrills } from "@/hooks/use-custom-drills";

interface Props {
  params: Promise<{ slug: string }>;
}

export default function EditDrillPage({ params }: Props) {
  const { slug } = use(params);
  const router = useRouter();
  const { getCustomDrill, updateDrill } = useCustomDrills();

  const drill = getCustomDrill(slug);

  if (!drill) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <Link href="/drills">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Drills
          </Button>
        </Link>
        <div className="text-center py-16 space-y-2">
          <h1 className="text-2xl font-bold">Drill not found</h1>
          <p className="text-muted-foreground">
            This drill doesn&apos;t exist, may have been deleted, or is a built-in drill that cannot be edited.
          </p>
        </div>
      </div>
    );
  }

  function handleSubmit(data: DrillFormData) {
    updateDrill(drill!.id, data);
    router.push(`/drills/${drill!.slug}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      <Link href={`/drills/${slug}`}>
        <Button variant="ghost" size="sm" className="gap-1">
          <ArrowLeft className="h-4 w-4" />
          Back to Drill
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Drill</h1>
        <p className="text-muted-foreground mt-1">
          Update your drill details and pitch diagram.
        </p>
      </div>

      <DrillForm
        initialData={drill}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        cancelHref={`/drills/${slug}`}
      />
    </div>
  );
}
