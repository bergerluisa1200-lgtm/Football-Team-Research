"use client";

import { useState } from "react";
import { useTrainingLog } from "@/hooks/use-training-log";
import { TrainingLogForm } from "@/components/training-log-form";
import { TrainingLogEntryCard } from "@/components/training-log-entry";
import { ProgressCharts } from "@/components/progress-charts";
import { TrainingLogEntry } from "@/types/drill";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3, ClipboardList, X } from "lucide-react";

export default function TrainingLogPage() {
  const { entries, addEntry, updateEntry, deleteEntry } = useTrainingLog();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TrainingLogEntry | null>(null);

  function handleSubmit(data: Omit<TrainingLogEntry, "id" | "createdAt">) {
    if (editingEntry) {
      updateEntry(editingEntry.id, data);
      setEditingEntry(null);
    } else {
      addEntry(data);
    }
    setShowForm(false);
  }

  function handleEdit(entry: TrainingLogEntry) {
    setEditingEntry(entry);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    deleteEntry(id);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingEntry(null);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Training Log</h1>
          <p className="text-muted-foreground mt-1">
            Track your sessions, monitor progress, and see how you improve over time.
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            Log Session
          </Button>
        )}
        {showForm && (
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <TrainingLogForm
          onSubmit={handleSubmit}
          initialData={editingEntry ?? undefined}
          onCancel={handleCancel}
        />
      )}

      {/* Tabs: Progress / Entries */}
      {entries.length > 0 ? (
        <Tabs defaultValue="progress">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="progress" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="entries" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              Entries ({entries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <ProgressCharts entries={entries} />
          </TabsContent>

          <TabsContent value="entries">
            <div className="space-y-4">
              {entries.map((entry) => (
                <TrainingLogEntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        !showForm && (
          <div className="text-center py-16 space-y-4">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              No training sessions logged yet
            </p>
            <p className="text-sm text-muted-foreground">
              Start logging your sessions to track your progress over time.
            </p>
            <Button onClick={() => setShowForm(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Log Your First Session
            </Button>
          </div>
        )
      )}
    </div>
  );
}
