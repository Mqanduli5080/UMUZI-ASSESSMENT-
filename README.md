import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BrewFormDialog } from "@/components/brew/BrewFormDialog";
import { BrewListItem } from "@/components/brew/BrewListItem";
import { MethodFilter } from "@/components/brew/MethodFilter";
import {
  createBrew,
  deleteBrew,
  fetchBrews,
  updateBrew,
  type Brew,
  type BrewInput,
} from "@/lib/brews";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Brew log — micro-roastery coffee journal" },
      {
        name: "description",
        content:
          "Log every pour-over, Aeropress and espresso: beans, ratios, rating and tasting notes in one tidy brew log.",
      },
      { property: "og:title", content: "Brew log — micro-roastery coffee journal" },
      {
        property: "og:description",
        content: "Log every brew: beans, ratios, rating and tasting notes.",
      },
    ],
  }),
  component: BrewLogPage,
});

function BrewLogPage() {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Brew | null>(null);

  const brewsQuery = useQuery({
    queryKey: ["brews", method],
    queryFn: () => fetchBrews(method),
  });
  const brews = brewsQuery.data ?? [];

  const allBrews = useQuery({ queryKey: ["brews", "all"], queryFn: () => fetchBrews("all") });
  const brewCount = allBrews.data?.length ?? 0;

  useEffect(() => {
    document.title = `Brews: ${brewCount}`;
  }, [brewCount]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["brews"] });

  const saveMutation = useMutation({
    mutationFn: (values: BrewInput) =>
      editing ? updateBrew(editing.id, values) : createBrew(values),
    onSuccess: async () => {
      await invalidate();
      setDialogOpen(false);
      toast.success(editing ? "Brew updated" : "Brew logged");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (brew: Brew) => deleteBrew(brew.id),
    onSuccess: async () => {
      await invalidate();
      setDialogOpen(false);
      toast.success("Brew deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const pending = saveMutation.isPending || deleteMutation.isPending;

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-5 py-10 sm:px-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Micro-roastery
          </p>
          <h1 className="truncate font-display text-5xl leading-tight text-foreground">
            Brew log
          </h1>
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

      <p className="mt-2 text-sm text-muted-foreground">
        {brewCount} {brewCount === 1 ? "brew" : "brews"} logged
      </p>

      <div className="mt-6">
        <MethodFilter value={method} onChange={setMethod} />
      </div>

      {brewsQuery.isLoading ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Loading brews…</p>
      ) : brewsQuery.isError ? (
        <p className="mt-10 text-center text-sm text-destructive">
          Couldn&apos;t load your brews. Try refreshing.
        </p>
      ) : brews.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">
          No brews here yet — pull a shot and log it.
        </p>
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
        onSubmit={(values) => saveMutation.mutate(values)}
        onDelete={(brew) => deleteMutation.mutate(brew)}
      />
    </main>
  );
  export const BREW_METHODS = [
  "Aeropress",
  "V60",
  "Drip coffee",
  "French press",
  "Espresso",
  "Moka pot",
  "Cold brew",
  "Chemex",
] as const;

export type Brew = {
  id: string;
  beans: string;
  method: string;
  coffee_grams: number;
  water_grams: number;
  rating: number;
  tasting_notes: string;
  created_at: string;
  updated_at: string;
};

export type BrewInput = Omit<Brew, "id" | "created_at" | "updated_at">;

async function handle(res: Response) {
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((body && (body.error as string)) || "Something went wrong");
  }
  return body;
}

export async function fetchBrews(method: string): Promise<Brew[]> {
  const qs = method && method !== "all" ? `?method=${encodeURIComponent(method)}` : "";
  return (await handle(await fetch(`/api/public/brews${qs}`))) as Brew[];
}

export async function createBrew(input: BrewInput): Promise<Brew> {
  return (await handle(
    await fetch("/api/public/brews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )) as Brew;
}

export async function updateBrew(id: string, input: BrewInput): Promise<Brew> {
  return (await handle(
    await fetch(`/api/public/brews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )) as Brew;
}

export async function deleteBrew(id: string): Promise<void> {
  await handle(await fetch(`/api/public/brews/${id}`, { method: "DELETE" }));
}
export const BREW_METHODS = [
  "Aeropress",
  "V60",
  "Drip coffee",
  "French press",
  "Espresso",
  "Moka pot",
  "Cold brew",
  "Chemex",
] as const;

export type Brew = {
  id: string;
  beans: string;
  method: string;
  coffee_grams: number;
  water_grams: number;
  rating: number;
  tasting_notes: string;
  created_at: string;
  updated_at: string;
};

export type BrewInput = Omit<Brew, "id" | "created_at" | "updated_at">;

async function handle(res: Response) {
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((body && (body.error as string)) || "Something went wrong");
  }
  return body;
}

export async function fetchBrews(method: string): Promise<Brew[]> {
  const qs = method && method !== "all" ? `?method=${encodeURIComponent(method)}` : "";
  return (await handle(await fetch(`/api/public/brews${qs}`))) as Brew[];
}

export async function createBrew(input: BrewInput): Promise<Brew> {
  return (await handle(
    await fetch("/api/public/brews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )) as Brew;
}

export async function updateBrew(id: string, input: BrewInput): Promise<Brew> {
  return (await handle(
    await fetch(`/api/public/brews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  )) as Brew;
}

export async function deleteBrew(id: string): Promise<void> {
  await handle(await fetch(`/api/public/brews/${id}`, { method: "DELETE" }));
}
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { z } from "zod";

export function getServerSupabase() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const brewSchema = z.object({
  beans: z.string().trim().min(1, "Beans are required").max(120),
  method: z.string().trim().min(1, "Method is required").max(60),
  coffee_grams: z.coerce.number().positive("Coffee grams must be greater than 0").max(1000),
  water_grams: z.coerce.number().positive("Water grams must be greater than 0").max(5000),
  rating: z.coerce.number().int().min(1, "Rating must be between 1 and 5").max(5),
  tasting_notes: z.string().trim().min(1, "Tasting notes are required").max(500),
});

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function parseBrewBody(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { error: json({ error: "Invalid JSON body" }, 400) } as const;
  }
  const parsed = brewSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        422,
      ),
    } as const;
  }
  return { data: parsed.data } as const;
}
import { createFileRoute } from "@tanstack/react-router";
import { getServerSupabase, json, parseBrewBody } from "@/lib/brews.server";

export const Route = createFileRoute("/api/public/brews")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const method = new URL(request.url).searchParams.get("method");
        const supabase = getServerSupabase();
        let query = supabase.from("brews").select("*").order("created_at", { ascending: false });
        if (method && method !== "all") query = query.eq("method", method);
        const { data, error } = await query;
        if (error) return json({ error: error.message }, 500);
        return json(data ?? []);
      },
      POST: async ({ request }) => {
        const parsed = await parseBrewBody(request);
        if ("error" in parsed) return parsed.error;
        const supabase = getServerSupabase();
        const { data, error } = await supabase
          .from("brews")
          .insert(parsed.data)
          .select()
          .single();
        if (error) return json({ error: error.message }, 500);
        return json(data, 201);
      },
    },
  },
});
import { createFileRoute } from "@tanstack/react-router";
import { getServerSupabase, json, parseBrewBody } from "@/lib/brews.server";

export const Route = createFileRoute("/api/public/brews/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const supabase = getServerSupabase();
        const { data, error } = await supabase
          .from("brews")
          .select("*")
          .eq("id", params.id)
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Brew not found" }, 404);
        return json(data);
      },
      PUT: async ({ request, params }) => {
        const parsed = await parseBrewBody(request);
        if ("error" in parsed) return parsed.error;
        const supabase = getServerSupabase();
        const { data, error } = await supabase
          .from("brews")
          .update(parsed.data)
          .eq("id", params.id)
          .select()
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Brew not found" }, 404);
        return json(data);
      },
      DELETE: async ({ params }) => {
        const supabase = getServerSupabase();
        const { data, error } = await supabase
          .from("brews")
          .delete()
          .eq("id", params.id)
          .select()
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        if (!data) return json({ error: "Brew not found" }, 404);
        return new Response(null, { status: 204 });
      },
    },
  },
});
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BREW_METHODS, type Brew, type BrewInput } from "@/lib/brews";

const formSchema = z.object({
  beans: z.string().trim().min(1, "Beans are required").max(120),
  method: z.string().min(1, "Pick a method"),
  coffee_grams: z.coerce.number({ invalid_type_error: "Required" }).positive("Must be above 0").max(1000),
  water_grams: z.coerce.number({ invalid_type_error: "Required" }).positive("Must be above 0").max(5000),
  rating: z.coerce.number({ invalid_type_error: "Required" }).int().min(1, "1 to 5").max(5, "1 to 5"),
  tasting_notes: z.string().trim().min(1, "Tasting notes are required").max(500),
});

type FormValues = z.input<typeof formSchema>;

const emptyValues = {
  beans: "",
  method: "",
  coffee_grams: "",
  water_grams: "",
  rating: "",
  tasting_notes: "",
} as unknown as FormValues;

export function BrewFormDialog({
  open,
  onOpenChange,
  brew,
  onSubmit,
  onDelete,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brew: Brew | null;
  onSubmit: (values: BrewInput) => void;
  onDelete: (brew: Brew) => void;
  pending: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: emptyValues,
  });

  const { register, handleSubmit, reset, setValue, watch, formState } = form;
  const method = watch("method");

  useEffect(() => {
    if (!open) return;
    reset(
      brew
        ? ({
            beans: brew.beans,
            method: brew.method,
            coffee_grams: String(brew.coffee_grams),
            water_grams: String(brew.water_grams),
            rating: String(brew.rating),
            tasting_notes: brew.tasting_notes,
          } as unknown as FormValues)
        : emptyValues,
    );
  }, [open, brew, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl font-normal">
            {brew ? "Edit a brew" : "Add a brew"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            All fields are required before saving.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => onSubmit(formSchema.parse(values) as BrewInput))}
        >
          <div className="space-y-1.5">
            <Label htmlFor="beans">Beans</Label>
            <Input id="beans" placeholder="Zimbabwean highlands" {...register("beans")} />
            <FieldError message={formState.errors.beans?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="method">Method</Label>
            <Select
              value={method || ""}
              onValueChange={(v) => setValue("method", v, { shouldValidate: true })}
            >
              <SelectTrigger id="method">
                <SelectValue placeholder="Select a method" />
              </SelectTrigger>
              <SelectContent>
                {BREW_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={formState.errors.method?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="coffee_grams">Coffee grams</Label>
              <Input id="coffee_grams" type="number" step="0.1" {...register("coffee_grams")} />
              <FieldError message={formState.errors.coffee_grams?.message} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="water_grams">Water grams</Label>
              <Input id="water_grams" type="number" step="1" {...register("water_grams")} />
              <FieldError message={formState.errors.water_grams?.message} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rating">Rating (out of 5)</Label>
            <Input id="rating" type="number" min={1} max={5} {...register("rating")} />
            <FieldError message={formState.errors.rating?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tasting_notes">Tasting notes</Label>
            <Textarea
              id="tasting_notes"
              rows={2}
              placeholder="Heavy body, soft finish, nutty"
              {...register("tasting_notes")}
            />
            <FieldError message={formState.errors.tasting_notes?.message} />
          </div>

          <div className="flex gap-3 pt-2">
            {brew ? (
              <Button
                type="button"
                variant="destructive"
                className="flex-1 rounded-full"
                disabled={pending}
                onClick={() => onDelete(brew)}
              >
                Delete
              </Button>
            ) : null}
            <Button
              type="submit"
              className="flex-1 rounded-full"
              disabled={pending || !formState.isValid}
            >
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="text-xs font-medium text-destructive">{message}</p>;
}
import { Droplet, Coffee, SquarePen } from "lucide-react";
import type { Brew } from "@/lib/brews";
import { RatingDot } from "./RatingDot";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
      {children}
    </span>
  );
}

export function BrewListItem({ brew, onEdit }: { brew: Brew; onEdit: (brew: Brew) => void }) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border py-4">
      <RatingDot rating={brew.rating} />
      <div className="min-w-0">
        <h2 className="truncate font-sans text-base font-bold text-foreground">{brew.beans}</h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Chip>{brew.method}</Chip>
          <Chip>
            <Coffee className="size-3 text-accent" aria-hidden /> {brew.coffee_grams}g
          </Chip>
          <Chip>
            <Droplet className="size-3 text-accent" aria-hidden /> {brew.water_grams}g
          </Chip>
        </div>
        {brew.tasting_notes ? (
          <p className="mt-1.5 truncate text-xs italic text-muted-foreground">
            {brew.tasting_notes}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onEdit(brew)}
        aria-label={`Edit ${brew.beans}`}
        className="rounded-md p-2 text-foreground transition-colors hover:bg-secondary"
      >
        <SquarePen className="size-5" />
      </button>
    </li>
  );
}
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BREW_METHODS } from "@/lib/brews";

export function MethodFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-12 w-full rounded-full border-border bg-card px-5" aria-label="Filter by method">
        <SelectValue placeholder="Filter by method" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All methods</SelectItem>
        {BREW_METHODS.map((m) => (
          <SelectItem key={m} value={m}>
            {m}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
import { cn } from "@/lib/utils";

export function RatingDot({ rating }: { rating: number }) {
  return (
    <span
      aria-label={`Rating ${rating} out of 5`}
      className={cn(
        "grid size-10 shrink-0 place-items-center rounded-full text-base font-bold text-primary shadow-sm",
        rating >= 4 && "bg-rating-good",
        rating === 3 && "bg-rating-mid",
        rating <= 2 && "bg-rating-bad",
      )}
    >
      {rating}
    </span>
  );
}
@import "tailwindcss" source(none);
@source "../src";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-ring-offset-background: var(--background);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-rating-good: var(--rating-good);
  --color-rating-mid: var(--rating-mid);
  --color-rating-bad: var(--rating-bad);
  --font-display: var(--font-display);
  --font-sans: var(--font-body);
}

:root {
  --radius: 0.875rem;
  --background: oklch(0.973 0.014 84.5);
  --foreground: oklch(0.24 0.032 45);
  --card: oklch(0.992 0.008 90);
  --card-foreground: oklch(0.24 0.032 45);
  --popover: oklch(0.992 0.008 90);
  --popover-foreground: oklch(0.24 0.032 45);
  --primary: oklch(0.28 0.045 42);
  --primary-foreground: oklch(0.973 0.014 84.5);
  --secondary: oklch(0.93 0.024 82);
  --secondary-foreground: oklch(0.28 0.045 42);
  --muted: oklch(0.94 0.018 84);
  --muted-foreground: oklch(0.52 0.028 55);
  --accent: oklch(0.68 0.15 48);
  --accent-foreground: oklch(0.99 0.01 90);
  --destructive: oklch(0.52 0.19 27);
  --destructive-foreground: oklch(0.98 0.01 90);
  --border: oklch(0.88 0.02 80);
  --input: oklch(0.88 0.02 80);
  --ring: oklch(0.68 0.15 48);
  --rating-good: oklch(0.7 0.15 145);
  --rating-mid: oklch(0.78 0.15 70);
  --rating-bad: oklch(0.68 0.17 25);
  --font-display: "Instrument Serif", Georgia, serif;
  --font-body: "DM Sans", system-ui, sans-serif;
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.984 0.003 247.858);
  --sidebar-foreground: oklch(0.129 0.042 264.695);
  --sidebar-primary: oklch(0.208 0.042 265.755);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.968 0.007 247.896);
  --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
  --sidebar-border: oklch(0.929 0.013 255.508);
  --sidebar-ring: oklch(0.704 0.04 256.788);
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --card: oklch(0.208 0.042 265.755);
  --card-foreground: oklch(0.984 0.003 247.858);
  --popover: oklch(0.208 0.042 265.755);
  --popover-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.929 0.013 255.508);
  --primary-foreground: oklch(0.208 0.042 265.755);
  --secondary: oklch(0.279 0.041 260.031);
  --secondary-foreground: oklch(0.984 0.003 247.858);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --accent: oklch(0.279 0.041 260.031);
  --accent-foreground: oklch(0.984 0.003 247.858);
  --destructive: oklch(0.704 0.191 22.216);
  --destructive-foreground: oklch(0.984 0.003 247.858);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.551 0.027 264.364);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.208 0.042 265.755);
  --sidebar-foreground: oklch(0.984 0.003 247.858);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.279 0.041 260.031);
  --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.551 0.027 264.364);
}

@layer base {
  * {
    border-color: var(--color-border);
  }

  body {
    background-color: var(--color-background);
    color: var(--color-foreground);
    font-family: var(--font-body);
    background-image: radial-gradient(
      oklch(0.28 0.045 42 / 0.05) 1px,
      transparent 1px
    );
    background-size: 22px 22px;
  }

  h1,
  h2 {
    font-family: var(--font-display);
    font-weight: 400;
  }
}

}

