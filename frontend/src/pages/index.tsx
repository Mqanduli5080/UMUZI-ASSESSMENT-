import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { BrewFormDialog } from "../components/brew/BrewFormDialog";
import { BrewListItem } from "../components/brew/BrewListItem";
import { MethodFilter } from "../components/brew/MethodFilter";
import type { Brew, BrewInput } from "../../shared/src/types/brew";
import { fetchBrews, createBrew, updateBrew, deleteBrew } from "../lib/brews.client";

export default function HomePage() {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brew | null>(null);

  const brewsQuery = useQuery({ queryKey: ["brews", method], queryFn: () => fetchBrews(method) });
  const brews = brewsQuery.data ?? [];

  const allBrews = useQuery({ queryKey: ["brews", "all"], queryFn: () => fetchBrews("all") });
  const brewCount = allBrews.data?.length ?? 0;

  useEffect(() => {
    document.title = `Brews: ${brewCount}`;
  }, [brewCount]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["brews"] });

  const saveMutation = useMutation({
    mutationFn: (values: BrewInput) => (editing ? updateBrew(editing.id, values) : createBrew(values)),
    onSuccess: async () => {
      await invalidate();
      setDialogOpen(false);
      toast.success(editing ? "Brew updated" : "Brew logged");
    },
    onError: (error: any) => toast.error(error?.message || String(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (brew: Brew) => deleteBrew(brew.id),
    onSuccess: async () => {
      await invalidate();
      setDialogOpen(false);
      toast.success("Brew deleted");
    },
    onError: (error: any) => toast.error(error?.message || String(error)),
  });

  const pending = (saveMutation as any).isLoading || (deleteMutation as any).isLoading;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-10 sm:px-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Micro-roastery</p>
          <h1 className="truncate font-display text-5xl leading-tight text-foreground">Brew log</h1>
        </div>
        <Button
          className="shrink-0 rounded-full px-6"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" /> Add
        </Button>
      </header>

      <p className="mt-2 text-sm text-muted-foreground">{brewCount} {brewCount === 1 ? "brew" : "brews"} logged</p>

      <div className="mt-6">
        <MethodFilter value={method} onChange={setMethod} />
      </div>

      {brewsQuery.isLoading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Loading brews…</p>
      ) : brewsQuery.isError ? (
        <p className="mt-10 text-center text-sm text-destructive">Couldn't load your brews. Try refreshing.</p>
      ) : brews.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">No brews here yet — pull a shot and log it.</p>
      ) : (
        <ul className="mt-4 border-t border-border">
          {brews.map((brew) => (
            <BrewListItem
              key={brew.id}
              brew={brew}
              onEdit={(b) => {
                setEditing(b);
                setDialogOpen(true);
              }}
            />
          ))}
        </ul>
      )}

      <BrewFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        brew={editing}
        pending={pending}
        onSubmit={(values) => (saveMutation as any).mutate(values)}
        onDelete={(brew) => (deleteMutation as any).mutate(brew)}
      />
    </main>
  );
}
