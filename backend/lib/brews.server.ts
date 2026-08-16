import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types";
import { z } from "zod";

export function getServerSupabase() {
  const key = process.env["SUPABASE_SERVICE_ROLE"]!;
  return createClient(process.env["SUPABASE_URL"]!, key, {
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
