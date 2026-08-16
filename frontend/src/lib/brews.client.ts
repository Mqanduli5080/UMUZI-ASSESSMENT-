async function handle(res: Response) {
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((body && (body.error as string)) || "Something went wrong");
  }
  return body;
}

import type { Brew, BrewInput } from "../../shared/types/brew";

export async function fetchBrews(method: string): Promise<Brew[]> {
  const qs = method && method !== "all" ? `?method=${encodeURIComponent(method)}` : "";
  const res = await fetch(`/api/public/brews${qs}`);
  return (await handle(res)) as Brew[];
}

export async function createBrew(input: BrewInput): Promise<Brew> {
  const res = await fetch("/api/public/brews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await handle(res)) as Brew;
}

export async function updateBrew(id: string, input: BrewInput): Promise<Brew> {
  const res = await fetch(`/api/public/brews/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await handle(res)) as Brew;
}

export async function deleteBrew(id: string): Promise<void> {
  await handle(await fetch(`/api/public/brews/${id}`, { method: "DELETE" }));
}
