import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSupabase, json, parseBrewBody } from "../../../lib/brews.server";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query as { id: string };
  const supabase = getServerSupabase();

  if (req.method === "GET") {
    const { data, error } = await supabase.from("brews").select("*").eq("id", id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Brew not found" });
    return res.status(200).json(data);
  }

  if (req.method === "PUT") {
    const parsed = await parseBrewBody(req as any);
    if ("error" in parsed) {
      const errResp = await parsed.error.text();
      return res.status(422).json(JSON.parse(errResp));
    }
    const { data, error } = await supabase
      .from("brews")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Brew not found" });
    return res.status(200).json(data);
  }

  if (req.method === "DELETE") {
    const { data, error } = await supabase.from("brews").delete().eq("id", id).select().maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: "Brew not found" });
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).end("Method Not Allowed");
}
