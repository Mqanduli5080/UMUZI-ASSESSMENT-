import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSupabase, json, parseBrewBody } from "../../lib/brews.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getServerSupabase();

  if (req.method === "GET") {
    const method = (req.query.method as string) || null;
    let query = supabase.from("brews").select("*").order("created_at", { ascending: false });
    if (method && method !== "all") query = query.eq("method", method);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data ?? []);
  }

  if (req.method === "POST") {
    const parsed = await parseBrewBody(req as any);
    if ("error" in parsed) {
      const errResp = await parsed.error.text();
      const errJson = JSON.parse(errResp);
      return res.status(errJson?.status || 422).json(JSON.parse(errResp));
    }
    const { data, error } = await supabase.from("brews").insert(parsed.data).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end("Method Not Allowed");
}
